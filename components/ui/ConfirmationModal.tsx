"use client";

import React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { useI18n } from "@/lib/i18n";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "danger" | "warning" | "info";
    isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel,
    cancelLabel,
    variant = "danger",
    isLoading = false,
}) => {
    const { t } = useI18n();

    const confirmBtnStyles = {
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        warning: "bg-yellow-600 hover:bg-yellow-700 text-white focus:ring-yellow-500",
        info: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="small">
            <div className="space-y-4">
                <p className="text-gray-600">{message}</p>
                <div className="flex justify-end gap-3 pt-2">
                    <Button variant="secondary" onClick={onClose} disabled={isLoading}>
                        {cancelLabel || t("modal.cancel")}
                    </Button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${confirmBtnStyles[variant]}`}
                    >
                        {isLoading ? t("modal.processing") || "..." : confirmLabel || t("ui.confirm")}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
