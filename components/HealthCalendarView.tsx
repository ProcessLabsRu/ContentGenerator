"use client";

import { useState, useEffect, useCallback } from "react";
import {
    getHealthCalendarEvents,
    createHealthCalendarEvent,
    updateHealthCalendarEvent,
    deleteHealthCalendarEvent,
    getMonths
} from "@/lib/db/adapter";
import { HealthCalendarEvent } from "@/lib/types";
import { Button } from "./ui/Button";
import { HealthCalendarEventModal } from "./HealthCalendarEventModal";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { Alert, AlertDescription } from "./ui/alert";
import { useI18n } from "@/lib/i18n";
import { CalendarDays, Table as TableIcon, RefreshCw, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

export const HealthCalendarView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { t } = useI18n();
    const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
    const [events, setEvents] = useState<HealthCalendarEvent[]>([]);
    const [months, setMonths] = useState<{ id: string, name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<HealthCalendarEvent | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSyncConfirmOpen, setIsSyncConfirmOpen] = useState(false);
    const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
    const [syncSuccess, setSyncSuccess] = useState<number | null>(null);
    const [syncError, setSyncError] = useState<string | null>(null);

    // For Calendar View
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [eventsData, monthsData] = await Promise.all([
                getHealthCalendarEvents(),
                getMonths()
            ]);
            setEvents(eventsData);
            setMonths(monthsData.map(m => ({ id: m.id, name: m.name })));
        } catch (error) {
            console.error("Error fetching health calendar data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Clear success message after 5 seconds
    useEffect(() => {
        if (syncSuccess !== null || syncError !== null) {
            const timer = setTimeout(() => {
                setSyncSuccess(null);
                setSyncError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [syncSuccess, syncError]);

    const handleSync = async () => {
        setIsSyncConfirmOpen(false);
        setIsSyncing(true);
        setSyncSuccess(null);
        setSyncError(null);
        try {
            const response = await fetch('/api/health-calendar/sync', { method: 'POST' });
            const result = await response.json();
            if (result.success) {
                setSyncSuccess(result.addedCount);
                fetchData();
            } else {
                setSyncError(result.error);
            }
        } catch (error) {
            console.error("Sync error:", error);
            setSyncError("An error occurred during sync");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleSaveEvent = async (formData: any) => {
        if (selectedEvent) {
            await updateHealthCalendarEvent(selectedEvent.id!, formData);
        } else {
            await createHealthCalendarEvent(formData);
        }
        fetchData();
    };

    const performDelete = async () => {
        if (deleteEventId) {
            await deleteHealthCalendarEvent(deleteEventId);
            setDeleteEventId(null);
            fetchData();
        }
    };

    const handleDeleteEvent = (id: string) => {
        setDeleteEventId(id);
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "—";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString(t("nav.language") === "English" ? "en-US" : "pt-BR", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateStr;
        }
    };

    const filteredEvents = events.filter(e => {
        if (viewMode === 'calendar') {
            const monthName = months[currentMonthIndex]?.name;
            return e.month === monthName;
        }
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Sub-header */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onBack} className="p-2 -ml-2">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-bold text-gray-900">{t("health.calendar.title")}</h1>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-gray-100 rounded-lg p-1 mr-2">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title={t("health.calendar.table")}
                        >
                            <TableIcon className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title={t("health.calendar.calendar")}
                        >
                            <CalendarDays className="w-5 h-5" />
                        </button>
                    </div>

                    <Button
                        variant="secondary"
                        onClick={() => setIsSyncConfirmOpen(true)}
                        disabled={isSyncing}
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        {isSyncing ? t("health.calendar.syncing") : t("health.calendar.sync")}
                    </Button>

                    <Button
                        variant="primary"
                        onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        {t("health.calendar.addEvent")}
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-4 sm:p-6">
                {syncSuccess !== null && (
                    <Alert className="mb-6 border-green-200 bg-green-50 text-green-800">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                            <AlertDescription>
                                {t("health.calendar.syncSuccess", { count: syncSuccess })}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {syncError && (
                    <Alert variant="destructive" className="mb-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5" />
                            <AlertDescription>
                                {syncError}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.month")}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.date")}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.eventName")}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.source")}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.description")}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t("health.calendar.actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {events.map((event) => (
                                    <tr
                                        key={event.id}
                                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{event.month}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(event.date)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-700">{event.eventName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter ${event.source === 'official'
                                                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                                : 'bg-amber-100 text-amber-700 border border-amber-200'
                                                }`}>
                                                {event.source === 'official' ? t("health.calendar.source.official") : t("health.calendar.source.manual")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={event.description}>
                                            {event.description || "—"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id!); }}
                                                className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                title={t("health.calendar.deleteConfirm")}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                            <Button variant="ghost" onClick={() => setCurrentMonthIndex(prev => (prev > 0 ? prev - 1 : 11))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <h2 className="text-2xl font-bold text-indigo-900">{months[currentMonthIndex]?.name}</h2>
                            <Button variant="ghost" onClick={() => setCurrentMonthIndex(prev => (prev < 11 ? prev + 1 : 0))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        onClick={() => { setSelectedEvent(event); setIsModalOpen(true); }}
                                        className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border-l-4 border-l-indigo-500 cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{event.date || event.month}</span>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id!); }}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                    title={t("health.calendar.deleteConfirm")}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{event.eventName}</h3>
                                        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">{event.description || t("health.calendar.noDescription")}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500 font-medium">{t("health.calendar.noEvents")}</p>
                                    <Button variant="ghost" onClick={() => { setSelectedEvent(null); setIsModalOpen(true); }} className="mt-4 text-indigo-600">
                                        {t("health.calendar.addEvent")}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <HealthCalendarEventModal
                event={selectedEvent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                months={months}
            />

            <ConfirmationModal
                isOpen={isSyncConfirmOpen}
                onClose={() => setIsSyncConfirmOpen(false)}
                onConfirm={handleSync}
                title={t("health.calendar.syncTitle")}
                message={t("health.calendar.syncConfirm")}
                confirmLabel={t("health.calendar.confirmSync")}
                variant="info"
                isLoading={isSyncing}
            />

            <ConfirmationModal
                isOpen={!!deleteEventId}
                onClose={() => setDeleteEventId(null)}
                onConfirm={performDelete}
                title={t("health.calendar.deleteTitle")}
                message={t("health.calendar.deleteConfirm")}
                variant="danger"
            />
        </div>
    );
};
