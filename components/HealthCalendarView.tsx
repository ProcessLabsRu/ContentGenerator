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
import { CalendarDays, Table as TableIcon, RefreshCw, Plus, ChevronLeft, ChevronRight, Edit2, Trash2, CheckCircle2, AlertCircle, Search, X } from "lucide-react";

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
    const [searchQuery, setSearchQuery] = useState("");

    // For Calendar View
    const [currentMonthIndex, setCurrentMonthIndex] = useState(new Date().getMonth());

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [eventsData, monthsData] = await Promise.all([
                getHealthCalendarEvents(),
                getMonths()
            ]);

            // Sort events by date ascending
            const sortedEvents = [...eventsData].sort((a, b) => {
                const dateA = new Date(a.date || "").getTime();
                const dateB = new Date(b.date || "").getTime();
                return dateA - dateB;
            });

            setEvents(sortedEvents);
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

    // Scroll to today or next event in table view
    useEffect(() => {
        if (!isLoading && viewMode === 'table' && events.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find first event that is today or in the future
            const targetEvent = events.find(e => {
                const eventDate = new Date(e.date || "");
                return eventDate >= today;
            });

            if (targetEvent) {
                const element = document.getElementById(`event-row-${targetEvent.id}`);
                if (element) {
                    setTimeout(() => {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        element.classList.add('bg-indigo-50/50');
                        setTimeout(() => element.classList.remove('bg-indigo-50/50'), 3000);
                    }, 500);
                }
            }
        }
    }, [isLoading, viewMode, events]);

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
        setEvents([]); // Clear the list immediately so user doesn't see stale data
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
        const matchesSearch = searchQuery === "" ||
            [e.eventName, e.month, e.description, e.source, e.date]
                .some(field => field?.toString().toLowerCase().includes(searchQuery.toLowerCase()));

        if (viewMode === 'calendar') {
            const monthName = months[currentMonthIndex]?.name;
            return e.month === monthName && matchesSearch;
        }
        return matchesSearch;
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
                    <div className="relative w-64 mr-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-9 pr-8 py-1.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all shadow-sm"
                            placeholder={t("posts.search")}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute inset-y-0 right-0 pr-2 flex items-center hover:text-gray-700 transition-colors"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                    </div>

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
                        title={t("health.calendar.syncTooltip")}
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

                {isLoading || isSyncing ? (
                    <div className="flex items-center justify-center h-64 flex-col gap-4">
                        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                        {isSyncing && <p className="text-gray-500 animate-pulse">{t("health.calendar.syncing")}</p>}
                    </div>
                ) : viewMode === 'table' ? (
                    <div className="space-y-4">

                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.month")}</th>
                                        <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.date")}</th>
                                        <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.eventName")}</th>
                                        <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.source")}</th>
                                        <th className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.description")}</th>
                                        <th className="sticky top-0 px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 z-10">{t("health.calendar.actions")}</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredEvents.map((event) => (
                                        <tr
                                            key={event.id}
                                            id={`event-row-${event.id}`}
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
                                    {filteredEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500 font-medium">
                                                No events found for "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
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
                                            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{formatDate(event.date)}</span>
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
                onDelete={handleDeleteEvent}
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
