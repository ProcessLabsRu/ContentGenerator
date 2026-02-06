"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import {
    MedicalContentFormData,
    MedicalSpecialization,
    MonthOption,
    ContentGoal,
    FormatCounts,
} from "@/lib/types";
import { getHealthEvents, getUpcomingHealthEvents } from "@/lib/healthCalendar";
import {
    autoDistributeFormats,
    getTotalPublications,
} from "@/lib/formatDistribution";
import { useI18n } from "@/lib/i18n";

interface MedicalContentFormProps {
    onSubmit?: (formData: MedicalContentFormData) => void | Promise<void>;
}

export const MedicalContentForm: React.FC<MedicalContentFormProps> = ({
    onSubmit,
}) => {
    const { t } = useI18n();

    // Month options
    const monthOptions: { value: MonthOption; label: string }[] = [
        { value: "Janeiro", label: t("medical.month.january") },
        { value: "Fevereiro", label: t("medical.month.february") },
        { value: "Março", label: t("medical.month.march") },
        { value: "Abril", label: t("medical.month.april") },
        { value: "Maio", label: t("medical.month.may") },
        { value: "Junho", label: t("medical.month.june") },
        { value: "Julho", label: t("medical.month.july") },
        { value: "Agosto", label: t("medical.month.august") },
        { value: "Setembro", label: t("medical.month.september") },
        { value: "Outubro", label: t("medical.month.october") },
        { value: "Novembro", label: t("medical.month.november") },
        { value: "Dezembro", label: t("medical.month.december") },
    ];

    // Get next month as default
    const getNextMonth = (): MonthOption => {
        const now = new Date();
        const nextMonthIndex = (now.getMonth() + 1) % 12; // 0-11, next month
        return monthOptions[nextMonthIndex].value;
    };

    const [formData, setFormData] = useState<MedicalContentFormData>({
        title: "",
        specialization: "",
        month: getNextMonth(),
        goals: [],
        formatCounts: {
            reels: 0,
            carrossel: 0,
            postEstatico: 0,
            stories: 0,
            liveCollab: 0,
        },
        additionalContext: "",
        useHealthCalendar: false,
    });

    const [errors, setErrors] = useState<Partial<Record<keyof MedicalContentFormData, string>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showUpcomingDates, setShowUpcomingDates] = useState(false);

    // Specialization options
    const specializationOptions: { value: MedicalSpecialization; label: string }[] = [
        { value: "Mamografia/Mastologia", label: t("medical.specialization.mammography") },
        { value: "Odontologia", label: t("medical.specialization.dentistry") },
        { value: "Ginecologia e Obstetrícia", label: t("medical.specialization.gynecology") },
        { value: "Dermatologia", label: t("medical.specialization.dermatology") },
        { value: "Pediatria", label: t("medical.specialization.pediatrics") },
        { value: "Cardiologia", label: t("medical.specialization.cardiology") },
        { value: "Ortopedia", label: t("medical.specialization.orthopedics") },
        { value: "Oftalmologia", label: t("medical.specialization.ophthalmology") },
        { value: "Endocrinologia", label: t("medical.specialization.endocrinology") },
        { value: "Nutrologia/Nutrição", label: t("medical.specialization.nutrology") },
    ];

    // Goal options
    const goalOptions: { value: ContentGoal; label: string; description: string }[] = [
        { value: "Conversão", label: `1. ${t("medical.goal.conversion")}`, description: t("medical.goal.conversion.desc") },
        { value: "Autoridade", label: `2. ${t("medical.goal.authority")}`, description: t("medical.goal.authority.desc") },
        { value: "Crescimento", label: `3. ${t("medical.goal.growth")}`, description: t("medical.goal.growth.desc") },
        { value: "Educação", label: `4. ${t("medical.goal.education")}`, description: t("medical.goal.education.desc") },
        { value: "Engajamento", label: `5. ${t("medical.goal.engagement")}`, description: t("medical.goal.engagement.desc") },
    ];

    // Dynamic placeholder for context
    const getContextPlaceholder = (): string => {
        if (!formData.specialization) {
            return t("medical.context.default");
        }

        const placeholderMap: Record<MedicalSpecialization, string> = {
            "Odontologia": t("medical.context.dentistry"),
            "Mamografia/Mastologia": t("medical.context.mammography"),
            "Ginecologia e Obstetrícia": t("medical.context.gynecology"),
            "Dermatologia": t("medical.context.dermatology"),
            "Pediatria": t("medical.context.pediatrics"),
            "Cardiologia": t("medical.context.cardiology"),
            "Ortopedia": t("medical.context.orthopedics"),
            "Oftalmologia": t("medical.context.ophthalmology"),
            "Endocrinologia": t("medical.context.endocrinology"),
            "Nutrologia/Nutrição": t("medical.context.nutrology"),
        };

        return placeholderMap[formData.specialization];
    };

    // Goal toggle handler
    const handleGoalToggle = (goal: ContentGoal) => {
        setFormData((prev) => {
            const isSelected = prev.goals.includes(goal);
            const newGoals = isSelected
                ? prev.goals.filter((g) => g !== goal)
                : [...prev.goals, goal];
            return { ...prev, goals: newGoals };
        });
    };

    // Move goal up in priority
    const moveGoalUp = (index: number) => {
        if (index === 0) return;
        setFormData((prev) => {
            const newGoals = [...prev.goals];
            [newGoals[index - 1], newGoals[index]] = [newGoals[index], newGoals[index - 1]];
            return { ...prev, goals: newGoals };
        });
    };

    // Move goal down in priority
    const moveGoalDown = (index: number) => {
        if (index === formData.goals.length - 1) return;
        setFormData((prev) => {
            const newGoals = [...prev.goals];
            [newGoals[index], newGoals[index + 1]] = [newGoals[index + 1], newGoals[index]];
            return { ...prev, goals: newGoals };
        });
    };

    // Auto-distribute formats
    const handleAutoDistribute = () => {
        if (formData.goals.length === 0) {
            alert(t("medical.error.goalsRequired"));
            return;
        }

        const distributed = autoDistributeFormats(formData.goals);
        setFormData((prev) => ({ ...prev, formatCounts: distributed }));
    };

    // Update format count
    const handleFormatCountChange = (format: keyof FormatCounts, value: number) => {
        setFormData((prev) => ({
            ...prev,
            formatCounts: {
                ...prev.formatCounts,
                [format]: Math.max(0, value),
            },
        }));
    };

    // Reset form
    const handleReset = () => {
        setFormData({
            title: "",
            specialization: "",
            month: getNextMonth(),
            goals: [],
            formatCounts: {
                reels: 0,
                carrossel: 0,
                postEstatico: 0,
                stories: 0,
                liveCollab: 0,
            },
            additionalContext: "",
            useHealthCalendar: false,
        });
        setErrors({});
        setShowUpcomingDates(false);
    };

    // Validate form
    const validate = (): boolean => {
        const newErrors: Partial<Record<keyof MedicalContentFormData, string>> = {};

        if (!formData.title?.trim()) {
            newErrors.title = t("medical.error.titleRequired");
        }
        if (!formData.specialization) {
            newErrors.specialization = t("medical.error.specializationRequired");
        }
        if (!formData.month) {
            newErrors.month = t("medical.error.monthRequired");
        }
        if (formData.goals.length === 0) {
            newErrors.goals = t("medical.error.goalsRequired");
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if generate button should be enabled
    const isGenerateEnabled = (): boolean => {
        return !!(
            formData.title?.trim() &&
            formData.specialization &&
            formData.month &&
            formData.goals.length > 0
        );
    };

    // Submit form
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setIsSubmitting(true);

        try {
            if (onSubmit) {
                await onSubmit(formData);
            }
        } catch (error) {
            console.error("Erro ao gerar plano:", error);
            alert("Erro ao gerar plano de conteúdo. Tente novamente.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show upcoming dates when health calendar is enabled
    useEffect(() => {
        if (formData.useHealthCalendar && formData.month) {
            setShowUpcomingDates(true);
        } else {
            setShowUpcomingDates(false);
        }
    }, [formData.useHealthCalendar, formData.month]);

    // Get health calendar events
    const upcomingEvents = formData.month && formData.specialization
        ? getUpcomingHealthEvents(formData.month, formData.specialization, 3)
        : [];

    const currentMonthEvents = formData.month && formData.specialization
        ? getHealthEvents(formData.month, formData.specialization)
        : [];

    const totalPublications = getTotalPublications(formData.formatCounts);

    // Get format label and description from i18n
    const getFormatLabel = (format: keyof FormatCounts): string => {
        const labelMap: Record<keyof FormatCounts, string> = {
            reels: t("medical.format.reels"),
            carrossel: t("medical.format.carousel"),
            postEstatico: t("medical.format.staticPost"),
            stories: t("medical.format.stories"),
            liveCollab: t("medical.format.liveCollab"),
        };
        return labelMap[format];
    };

    const getFormatDescription = (format: keyof FormatCounts): string => {
        const descMap: Record<keyof FormatCounts, string> = {
            reels: t("medical.format.reels.desc"),
            carrossel: t("medical.format.carousel.desc"),
            postEstatico: t("medical.format.staticPost.desc"),
            stories: t("medical.format.stories.desc"),
            liveCollab: t("medical.format.liveCollab.desc"),
        };
        return descMap[format];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {t("medical.form.title")}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    {t("medical.form.poweredBy")}
                </p>
            </div>

            {/* Plan Title */}
            <div className="space-y-1">
                <Input
                    label={t("medical.form.planTitle")}
                    placeholder={t("medical.app.title")}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={errors.title}
                    required
                />
            </div>

            {/* Main Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label={t("medical.form.specialization")}
                    options={specializationOptions}
                    value={formData.specialization}
                    onValueChange={(value) =>
                        setFormData({ ...formData, specialization: value as MedicalSpecialization })
                    }
                    error={errors.specialization}
                    required
                />

                <Select
                    label={t("medical.form.month")}
                    options={monthOptions}
                    value={formData.month}
                    onValueChange={(value) =>
                        setFormData({ ...formData, month: value as MonthOption })
                    }
                    error={errors.month}
                    required
                />
            </div>

            {/* Goals (Draggable Multi-select) */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    {t("medical.form.goals")} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500">
                    {t("medical.form.goalsDescription")}
                </p>

                {/* Unselected goals */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {goalOptions
                        .filter((opt) => !formData.goals.includes(opt.value))
                        .map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => handleGoalToggle(opt.value)}
                                className="p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
                            >
                                <div className="font-medium text-sm text-gray-700">{opt.label}</div>
                                <div className="text-xs text-gray-500 mt-1">{opt.description}</div>
                            </button>
                        ))}
                </div>

                {/* Selected goals (with priority) */}
                {formData.goals.length > 0 && (
                    <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium text-gray-700">{t("medical.form.selectedGoals")}</div>
                        {formData.goals.map((goal, index) => {
                            const goalOption = goalOptions.find((opt) => opt.value === goal);
                            return (
                                <div
                                    key={goal}
                                    className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                >
                                    <div className="flex flex-col gap-1">
                                        <button
                                            type="button"
                                            onClick={() => moveGoalUp(index)}
                                            disabled={index === 0}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            title="Mover para cima"
                                        >
                                            ▲
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveGoalDown(index)}
                                            disabled={index === formData.goals.length - 1}
                                            className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                            title="Mover para baixo"
                                        >
                                            ▼
                                        </button>
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-gray-900">
                                            {index === 0 && <span className="text-blue-600 mr-1">★</span>}
                                            {goalOption?.label}
                                        </div>
                                        <div className="text-xs text-gray-600">{goalOption?.description}</div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleGoalToggle(goal)}
                                        className="text-red-500 hover:text-red-700 font-bold"
                                        title="Remover"
                                    >
                                        ✕
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {errors.goals && <p className="text-sm text-red-600">{errors.goals}</p>}
            </div>

            {/* Instagram Formats */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">
                            {t("medical.form.formatsAndQuantity")}
                        </label>
                        <p className="text-xs text-gray-500">
                            {t("medical.form.totalPublications")} <span className="font-semibold">{totalPublications}</span>
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleAutoDistribute}
                        disabled={formData.goals.length === 0}
                    >
                        🤖 {t("medical.form.autoDistribute")}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(formData.formatCounts) as Array<keyof FormatCounts>).map((format) => (
                        <div key={format} className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors bg-white">
                            <div className="flex items-start justify-between gap-3 mb-2">
                                <div className="flex-1 min-w-0">
                                    <label className="text-sm font-medium text-gray-900 block leading-tight">
                                        {getFormatLabel(format)}
                                    </label>
                                </div>
                                <input
                                    type="number"
                                    min={0}
                                    max={99}
                                    value={formData.formatCounts[format]}
                                    onChange={(e) =>
                                        handleFormatCountChange(format, parseInt(e.target.value) || 0)
                                    }
                                    className="border border-gray-300 rounded px-2 py-1 text-center text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    style={{ width: '48px', flexShrink: 0 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 leading-tight">{getFormatDescription(format)}</p>
                        </div>
                    ))}
                </div>

                {errors.formatCounts && <p className="text-sm text-red-600">{errors.formatCounts}</p>}
            </div>

            {/* Health Calendar */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="healthCalendar"
                        checked={formData.useHealthCalendar}
                        onChange={(e) =>
                            setFormData({ ...formData, useHealthCalendar: e.target.checked })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="healthCalendar" className="text-sm font-medium text-gray-700">
                        {t("medical.form.healthCalendar")}
                    </label>
                </div>

                {showUpcomingDates && currentMonthEvents.length > 0 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-green-800 mb-2">
                            📅 {formData.month}
                        </h4>
                        {currentMonthEvents.map((event, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                                <div className="text-sm font-medium text-green-900">{event.eventName}</div>
                                <div className="text-xs text-green-700">{event.description}</div>
                            </div>
                        ))}
                    </div>
                )}

                {showUpcomingDates && upcomingEvents.length > 0 && currentMonthEvents.length === 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-2">
                            📅 {t("medical.form.upcomingDates")}
                        </h4>
                        {upcomingEvents.map((event, idx) => (
                            <div key={idx} className="mb-2 last:mb-0">
                                <div className="text-sm font-medium text-blue-900">
                                    {event.month}: {event.eventName}
                                </div>
                                <div className="text-xs text-blue-700">{event.description}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Additional Context */}
            <Textarea
                label={t("medical.form.additionalContext")}
                value={formData.additionalContext}
                onChange={(e) =>
                    setFormData({ ...formData, additionalContext: e.target.value })
                }
                placeholder={getContextPlaceholder()}
                rows={4}
            />

            {/* Action Buttons */}
            <div className="pt-4 flex justify-between gap-3 border-t border-gray-200">
                <Button type="button" variant="secondary" onClick={handleReset}>
                    🔄 {t("medical.form.reset")}
                </Button>

                <Button
                    type="submit"
                    variant="primary"
                    disabled={!isGenerateEnabled() || isSubmitting}
                    className="px-8"
                >
                    {isSubmitting ? `⏳ ${t("medical.form.generating")}` : `✨ ${t("medical.form.generate")}`}
                </Button>
            </div>

            {!isGenerateEnabled() && (
                <p className="text-sm text-amber-600 text-center">
                    ⚠️ {t("medical.form.validationWarning")}
                </p>
            )}
        </form>
    );
};
