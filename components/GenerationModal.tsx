"use client";

import { Modal } from "./ui/Modal";
import { ContentPlanForm } from "./ContentPlanForm";
import {
  GenerationFormData,
  ContentPlanItem,
  GenerationInput,
  ContentPlanItemInput,
} from "@/lib/types";
import { createGeneration } from "@/lib/api-client";
import { getApiDataOrThrow, isApiError } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

interface GenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (generationId: string) => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { t } = useI18n();
  const handleGenerate = async (
    formData: GenerationFormData,
    items: ContentPlanItem[]
  ) => {
    try {
      // Transform to API format
      const generationInput: GenerationInput = {
        title: formData.title,
        specialization: formData.specialization,
        purpose: formData.purpose,
        content_type: formData.contentType,
        number_of_publications: formData.numberOfPublications,
        context: formData.context || null,
      };

      const itemsInput: ContentPlanItemInput[] = items.map((item) => ({
        format: item.format,
        title: item.title,
        pain_point: item.pain_point,
        content_outline: item.content_outline,
        cta: item.cta,
        status: item.status,
        publish_date: item.publish_date || null,
        is_approved: item.is_approved ?? false,
      }));

      const result = await createGeneration(generationInput, itemsInput);

      if (isApiError(result)) {
        console.error("Error creating generation:", result.error);
        alert(t("generationModal.createError", { error: result.error.message }));
        return;
      }

      const created = getApiDataOrThrow(result);
      onClose();

      if (onSuccess) {
        onSuccess(created.id);
      }
    } catch (error: any) {
      console.error("Error in generation:", error);
      alert(
        t("generationModal.genericError", {
          error: error.message || t("generationModal.createErrorFallback"),
        })
      );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("generationModal.title")}>
      <ContentPlanForm onGenerate={handleGenerate} />
    </Modal>
  );
};
