"use client";

import { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { HealthCalendarEvent } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { Trash2 } from "lucide-react";

interface HealthCalendarEventModalProps {
    event: HealthCalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: any) => Promise<void>;
    onDelete?: (id: string) => void;
    months: { id: string, name: string }[];
}

export const HealthCalendarEventModal: React.FC<HealthCalendarEventModalProps> = ({
    event,
    isOpen,
    onClose,
    onSave,
    onDelete,
    months
}) => {
    const { t } = useI18n();
    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        monthId: "",
        date: "",
        color: "",
        notes: "",
        source: 'manual' as 'manual' | 'official',
        type: 'month' as 'day' | 'month',
        isRecurring: true
    });

    // Automatic AI generation for missing description
    useEffect(() => {
        const generateDescription = async () => {
            if (isOpen && formData.eventName && (!formData.description || formData.description === "-")) {
                setIsGenerating(true);
                try {
                    const response = await fetch('/api/health-calendar/description', {
                        method: 'POST',
                        body: JSON.stringify({ eventName: formData.eventName }),
                    });
                    const result = await response.json();
                    if (result.description) {
                        setFormData(prev => ({ ...prev, description: result.description }));
                    }
                } catch (error) {
                    console.error("AI Generation error:", error);
                } finally {
                    setIsGenerating(false);
                }
            }
        };

        // Delay it slightly to let formData initialize from event prop
        const timer = setTimeout(generateDescription, 500);
        return () => clearTimeout(timer);
    }, [isOpen, formData.eventName, formData.description]);

    // Helper to format date from ISO/PB to YYYY-MM-DD for input
    const formatForInput = (dateStr: string) => {
        if (!dateStr) return "";
        // If it's already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
        // If it's PB format YYYY-MM-DD HH:mm:ss.sssZ or similar
        const match = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
        if (match) return match[1];
        return dateStr;
    };

    useEffect(() => {
        if (event) {
            setFormData({
                eventName: event.eventName || "",
                description: event.description || "",
                monthId: event.monthId || "",
                date: formatForInput(event.date || ""),
                color: event.color || "",
                notes: event.notes || "",
                source: event.source || 'manual',
                type: event.type || 'month',
                isRecurring: event.isRecurring !== undefined ? event.isRecurring : true
            });
        } else {
            setFormData({
                eventName: "",
                description: "",
                monthId: months.length > 0 ? months[0].id : "",
                date: "",
                color: "",
                notes: "",
                source: 'manual',
                type: 'month',
                isRecurring: true
            });
        }
    }, [event, months, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // If it's a monthly campaign, we don't need a specific date
            const saveDate = formData.type === 'day'
                ? (formData.date.includes(' ') ? formData.date : `${formData.date} 00:00:00`)
                : "";

            await onSave({ ...formData, date: saveDate });
            onClose();
        } catch (error) {
            console.error("Error saving event:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const monthOptions = months.map(m => ({ value: m.id, label: m.name }));

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={event ? t("health.calendar.editEvent") : t("health.calendar.addEvent")}
            size="medium"
        >
            <div className="space-y-4">
                <Input
                    label={t("health.calendar.eventName")}
                    value={formData.eventName}
                    onChange={(e) => setFormData(prev => ({ ...prev, eventName: e.target.value }))}
                    placeholder={t("health.calendar.eventNamePlaceholder")}
                    required
                />

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">{t("health.calendar.type")}</label>
                    <div className="flex bg-gray-100 p-1 rounded-xl gap-1">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'day' }))}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.type === 'day' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t("health.calendar.type.day")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'month' }))}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${formData.type === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            {t("health.calendar.type.month")}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 items-end">
                    <Select
                        label={t("health.calendar.month")}
                        options={monthOptions}
                        value={formData.monthId}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, monthId: val }))}
                        className="h-[46px]"
                        placeholder={t("ui.selectOption")}
                    />
                    {formData.type === 'day' ? (
                        <Input
                            label={t("health.calendar.date")}
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                            className="h-[46px]"
                        />
                    ) : (
                        <div className="flex items-center h-[46px] px-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
                            {t("health.calendar.type.month")}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50">
                    <input
                        type="checkbox"
                        id="isRecurring"
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                        {t("health.calendar.isRecurring")}
                    </label>
                </div>

                <Textarea
                    label={t("health.calendar.description")}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder={isGenerating ? t("health.calendar.aiGenerating") : t("health.calendar.descriptionPlaceholder")}
                    rows={2}
                    disabled={isGenerating}
                />

                <Textarea
                    label={t("health.calendar.notes")}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t("health.calendar.notesPlaceholder")}
                    rows={4}
                />

                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div>
                        {event && onDelete && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onDelete(event.id!);
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-4 shadow-none hover:shadow-none"
                                type="button"
                            >
                                <Trash2 className="w-4 h-4" />
                                {t("health.calendar.delete")}
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={onClose} disabled={isSaving} type="button" className="shadow-none hover:shadow-none">
                            {t("health.calendar.cancel")}
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSave}
                            disabled={isSaving || !formData.eventName || !formData.monthId}
                            type="button"
                            className="shadow-none hover:shadow-none"
                        >
                            {isSaving ? t("modal.saving") : t("health.calendar.save")}
                        </Button>
                    </div>
                </div>
            </div>
        </Modal>
    );
};
