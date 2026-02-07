"use client";

import { Modal } from "./ui/Modal";
import { Generation } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import {
    Info,
    Calendar,
    Target,
    Layout,
    AlignLeft,
    ShieldCheck,
    FileText,
    CheckCircle2,
    XCircle
} from "lucide-react";

interface GenerationDetailsModalProps {
    generation: Generation | null;
    isOpen: boolean;
    onClose: () => void;
}

export const GenerationDetailsModal: React.FC<GenerationDetailsModalProps> = ({
    generation,
    isOpen,
    onClose,
}) => {
    const { t } = useI18n();

    if (!generation) return null;

    const metadata = (generation.metadata as any) || {};
    const goals = Array.isArray(metadata.goals) ? (metadata.goals as string[]) : [];
    const formatCounts = (metadata.formatCounts as Record<string, number>) || {};
    const hasFormats = Object.values(formatCounts).some(c => Number(c) > 0);
    const useHealthCalendar = metadata.useHealthCalendar === true || metadata.useHealthCalendar === "true";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={t("generations.details")}
            size="medium"
        >
            <div className="space-y-6 py-2 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                {/* ID & Title Header */}
                <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 text-gray-400">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-mono uppercase tracking-widest">ID: {generation.id}</span>
                    </div>
                    <h2 className="text-xl font-black text-gray-900 leading-tight">
                        {generation.title || `${generation.specialization} Plan`}
                    </h2>
                </div>

                {/* Main Parameters Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Specialization */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-blue-600">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                {t("medical.form.specialization")}
                            </span>
                            <p className="text-sm font-bold text-gray-900">
                                {generation.specialization}
                            </p>
                        </div>
                    </div>

                    {/* Month */}
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
                        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 text-amber-600">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
                                {t("medical.form.month")}
                            </span>
                            <p className="text-sm font-bold text-gray-900">
                                {metadata.month || "—"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Goals & Health Calendar Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Goals Priority */}
                    <div className="md:col-span-2 p-5 bg-blue-50/40 rounded-3xl border border-blue-100/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">
                                {t("medical.form.goals")}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {goals.length > 0 ? goals.map((goal, idx) => (
                                <div
                                    key={idx}
                                    className="px-3.5 py-1.5 bg-white text-blue-800 text-xs font-bold rounded-xl border border-blue-100 shadow-sm flex items-center gap-2"
                                >
                                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-[10px] text-white font-black">
                                        {idx + 1}
                                    </span>
                                    {goal}
                                </div>
                            )) : (
                                <span className="text-xs text-blue-400/60 italic">Nenhum objetivo definido</span>
                            )}
                        </div>
                    </div>

                    {/* Health Calendar Toggle */}
                    <div className={`p-5 rounded-3xl border flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden ${useHealthCalendar ? 'bg-emerald-50 border-emerald-100' : 'bg-gray-50/50 border-gray-100'}`}>
                        {useHealthCalendar && (
                            <div className="absolute top-0 right-0 p-2 text-emerald-100">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3 relative z-10">
                            Calendário
                        </span>
                        <div className="relative z-10 flex flex-col items-center gap-2">
                            {useHealthCalendar ? (
                                <>
                                    <div className="p-2 bg-white rounded-full text-emerald-500 shadow-sm">
                                        <CheckCircle2 className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black text-emerald-700">ATUS ATIVADO</span>
                                </>
                            ) : (
                                <>
                                    <div className="p-2 bg-white rounded-full text-gray-300 shadow-sm">
                                        <XCircle className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-black text-gray-400">DESATIVADO</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Formats Distribution Breakdown */}
                {hasFormats && (
                    <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Layout className="h-4 w-4 text-gray-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                    {t("medical.form.formatsAndQuantity")}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">{t("medical.form.totalPublications")}:</span>
                                <span className="text-xs font-black text-gray-900">{generation.number_of_publications}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                            {Object.entries(formatCounts).map(([format, count]) => (
                                Number(count) > 0 && (
                                    <div key={format} className="group flex flex-col items-center p-4 bg-gray-50 hover:bg-white rounded-2xl border border-transparent hover:border-blue-100 hover:shadow-md transition-all duration-300">
                                        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mb-2 group-hover:text-blue-500 transition-colors">
                                            {format}
                                        </span>
                                        <span className="text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {count}
                                        </span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Contextual Instructions / Tone of Voice */}
                {generation.context && (
                    <div className="p-6 bg-gray-900 rounded-3xl relative overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                            <AlignLeft className="h-24 w-24 text-white" />
                        </div>
                        <div className="flex items-center gap-2 mb-4 text-gray-400">
                            <AlignLeft className="h-4 w-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">
                                {t("medical.form.additionalContext")}
                            </span>
                        </div>
                        <div className="relative z-10">
                            <p className="text-sm text-gray-100 leading-relaxed italic whitespace-pre-wrap selection:bg-blue-500 selection:text-white">
                                "{generation.context}"
                            </p>
                        </div>
                    </div>
                )}

                {/* Bottom Action Footer */}
                <div className="pt-4 flex justify-between items-center bg-gray-50 -mx-6 -mb-4 px-6 py-4 border-t border-gray-100 mt-2">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-1">
                            {t("medical.form.totalPublications")}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                            <span className="text-xs font-black text-gray-600">
                                {generation.number_of_publications} Postagens planejadas
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="px-10 py-3 bg-gray-900 text-white text-xs font-black rounded-2xl hover:bg-black transition-all shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-widest"
                    >
                        {t("ui.close")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
