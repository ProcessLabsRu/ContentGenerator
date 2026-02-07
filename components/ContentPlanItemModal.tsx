"use client";

import { useEffect, useState } from "react";
import { Modal } from "./ui/Modal";
import { Input } from "./ui/Input";
import { Textarea } from "./ui/Textarea";
import { Select } from "./ui/Select";
import { Button } from "./ui/Button";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { ContentPlanItem, ContentPlanStatus } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface ContentPlanItemModalProps {
  item: ContentPlanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: ContentPlanItem) => Promise<void> | void;
  onDelete: (itemId: string) => Promise<void> | void;
}

export const ContentPlanItemModal: React.FC<ContentPlanItemModalProps> = ({
  item,
  isOpen,
  onClose,
  onSave,
  onDelete,
}) => {
  const { t } = useI18n();
  // ... (rest of the component state stays the same)
  const statusOptions: { value: ContentPlanStatus; label: string }[] = [
    { value: "draft", label: t("status.draft") },
    { value: "approved", label: t("status.approved") },
    { value: "generated", label: t("status.generated") },
  ];

  const formatOptions = [
    { value: "Reels", label: t("medical.format.reels") },
    { value: "Carrossel", label: t("medical.format.carousel") },
    { value: "Post Estático", label: t("medical.format.staticPost") },
    { value: "Stories", label: t("medical.format.stories") },
    { value: "Live/Collab", label: t("medical.format.liveCollab") },
  ];
  const [formState, setFormState] = useState({
    title: "",
    format: "" as 'Reels' | 'Carrossel' | 'Post Estático' | 'Stories' | 'Live/Collab',
    status: "draft" as ContentPlanStatus,
    publish_date: "",
    pain_point: "",
    content_outline: "",
    cta: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!item) return;
    setFormState({
      title: item.title || "",
      format: item.format || "",
      status: item.status,
      publish_date: item.publish_date ? item.publish_date.slice(0, 10) : "",
      pain_point: item.pain_point || "",
      content_outline: item.content_outline || "",
      cta: item.cta || "",
    });
  }, [item]);

  const handleSave = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await onSave({
        ...item,
        title: formState.title,
        format: formState.format,
        status: formState.status,
        publish_date: formState.publish_date || null,
        pain_point: formState.pain_point,
        content_outline: formState.content_outline,
        cta: formState.cta,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    setIsDeleting(true);
    try {
      await onDelete(item.id);
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("modal.title")}
      size="large"
    >
      <div className="space-y-4">
        {/* ... (form fields remain unchanged) */}
        <Input
          label={t("modal.labels.title")}
          value={formState.title}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, title: e.target.value }))
          }
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Select
            label={t("modal.labels.format")}
            options={formatOptions}
            value={formState.format}
            onValueChange={(value) =>
              setFormState((prev) => ({ ...prev, format: value as any }))
            }
          />
          <Select
            label={t("modal.labels.status")}
            options={statusOptions}
            value={formState.status}
            onValueChange={(value) =>
              setFormState((prev) => ({
                ...prev,
                status: value as ContentPlanStatus,
              }))
            }
          />
          <Input
            label={t("modal.labels.publishDate")}
            type="date"
            value={formState.publish_date}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                publish_date: e.target.value,
              }))
            }
          />
        </div>
        <Textarea
          label={t("modal.labels.painPoint")}
          value={formState.pain_point}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              pain_point: e.target.value,
            }))
          }
        />
        <Textarea
          label={t("modal.labels.contentOutline")}
          value={formState.content_outline}
          onChange={(e) =>
            setFormState((prev) => ({
              ...prev,
              content_outline: e.target.value,
            }))
          }
        />
        <Textarea
          label={t("modal.labels.cta")}
          value={formState.cta}
          onChange={(e) =>
            setFormState((prev) => ({ ...prev, cta: e.target.value }))
          }
        />
        <div className="flex justify-between items-center pt-2">
          <Button
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            disabled={isDeleting || isSaving}
          >
            {t("ui.delete")}
          </Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onClose}>
              {t("modal.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSaving || isDeleting || !formState.title || !formState.format}
            >
              {isSaving ? t("modal.saving") : t("modal.save")}
            </Button>
          </div>
        </div>
      </div>
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={t("ui.delete")}
        message={t("posts.delete.confirm")}
        confirmLabel={t("ui.delete")}
        isLoading={isDeleting}
      />
    </Modal>
  );
};
