"use client";

import { useState, useEffect } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { HealthCalendarEvent, MonthOption } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface HealthCalendarEventModalProps {
    event: HealthCalendarEvent | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: any) => Promise<void>;
    months: { id: string, name: string }[];
}

export const HealthCalendarEventModal: React.FC<HealthCalendarEventModalProps> = ({
    event,
    isOpen,
    onClose,
    onSave,
    months
}) => {
    const { t } = useI18n();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        eventName: "",
        description: "",
        monthId: "",
        date: "",
        year: new Date().getFullYear(),
        color: "",
        notes: "",
        source: 'manual' as 'manual' | 'official'
    });

    useEffect(() => {
        if (event) {
            setFormData({
                eventName: event.eventName || "",
                description: event.description || "",
                monthId: event.monthId || "",
                date: event.date || "",
                year: event.year || new Date().getFullYear(),
                color: event.color || "",
                notes: event.notes || "",
                source: event.source || 'manual'
            });
        } else {
            setFormData({
                eventName: "",
                description: "",
                monthId: months.length > 0 ? months[0].id : "",
                date: "",
                year: new Date().getFullYear(),
                color: "",
                notes: "",
                source: 'manual'
            });
        }
    }, [event, months, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
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
                    placeholder="e.g. Outubro Rosa"
                    required
                />

                <div className="grid grid-cols-2 gap-4">
                    <Select
                        label={t("health.calendar.month")}
                        options={monthOptions}
                        value={formData.monthId}
                        onValueChange={(val) => setFormData(prev => ({ ...prev, monthId: val }))}
                    />
                    <Input
                        label={t("health.calendar.date")}
                        value={formData.date}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        placeholder="e.g. 01/10 or Outubro"
                    />
                </div>

                <Textarea
                    label={t("health.calendar.description")}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Short description of the importance..."
                    rows={2}
                />

                <Textarea
                    label={t("health.calendar.notes")}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder={t("health.calendar.notesPlaceholder")}
                    rows={4}
                />

                <div className="flex justify-end gap-3 pt-4">
                    <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                        {t("health.calendar.cancel")}
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        disabled={isSaving || !formData.eventName || !formData.monthId}
                    >
                        {isSaving ? t("modal.saving") : t("health.calendar.save")}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
