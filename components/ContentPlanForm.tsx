"use client";

import { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Textarea } from "./ui/Textarea";
import { generateMockContentPlan } from "@/lib/mockDataGenerator";
import { useI18n } from "@/lib/i18n";
import {
  GenerationFormData,
  ContentPlanItem,
  SpecializationOption,
  PurposeOption,
  ContentTypeOption,
} from "@/lib/types";

interface ContentPlanFormProps {
  onGenerate?: (formData: GenerationFormData, items: ContentPlanItem[]) => void | Promise<void>;
  onSubmit?: (formData: GenerationFormData) => void | Promise<void>;
}

export const ContentPlanForm: React.FC<ContentPlanFormProps> = ({
  onGenerate,
  onSubmit,
}) => {
  const { t } = useI18n();
  const [formData, setFormData] = useState<GenerationFormData>({
    title: "",
    specialization: "",
    purpose: "",
    contentType: "",
    numberOfPublications: 5,
    context: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof GenerationFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const specializationOptions: { value: SpecializationOption; label: string }[] =
    [
      { value: "Digital Marketing", label: t("options.specialization.digitalMarketing") },
      { value: "SaaS", label: t("options.specialization.saas") },
      { value: "E-commerce", label: t("options.specialization.ecommerce") },
      { value: "Healthcare", label: t("options.specialization.healthcare") },
      { value: "Education", label: t("options.specialization.education") },
      { value: "Finance", label: t("options.specialization.finance") },
      { value: "Technology", label: t("options.specialization.technology") },
      { value: "Real Estate", label: t("options.specialization.realEstate") },
    ];

  const purposeOptions: { value: PurposeOption; label: string }[] = [
    { value: "Lead Generation", label: t("options.purpose.leadGeneration") },
    { value: "Brand Awareness", label: t("options.purpose.brandAwareness") },
    { value: "Thought Leadership", label: t("options.purpose.thoughtLeadership") },
    { value: "Customer Education", label: t("options.purpose.customerEducation") },
    { value: "Product Launch", label: t("options.purpose.productLaunch") },
    { value: "Customer Retention", label: t("options.purpose.customerRetention") },
    { value: "Community Building", label: t("options.purpose.communityBuilding") },
  ];

  const contentTypeOptions: { value: ContentTypeOption; label: string }[] = [
    { value: "Educational", label: t("options.contentType.educational") },
    { value: "Promotional", label: t("options.contentType.promotional") },
    { value: "Entertainment", label: t("options.contentType.entertainment") },
    { value: "Case Study", label: t("options.contentType.caseStudy") },
    { value: "How-to Guide", label: t("options.contentType.howToGuide") },
    { value: "News & Updates", label: t("options.contentType.newsUpdates") },
    { value: "Comparison", label: t("options.contentType.comparison") },
    { value: "Review", label: t("options.contentType.review") },
  ];

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof GenerationFormData, string>> = {};

    if (!formData.title?.trim()) {
      newErrors.title = t("form.errors.titleRequired");
    }
    if (!formData.specialization) {
      newErrors.specialization = t("form.errors.specializationRequired");
    }
    if (!formData.purpose) {
      newErrors.purpose = t("form.errors.purposeRequired");
    }
    if (!formData.contentType) {
      newErrors.contentType = t("form.errors.contentTypeRequired");
    }
    if (
      !formData.numberOfPublications ||
      formData.numberOfPublications < 1 ||
      formData.numberOfPublications > 15
    ) {
      newErrors.numberOfPublications = t("form.errors.publicationsRange");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Generate mock items and call onGenerate
        const generatedItems = generateMockContentPlan(formData);
        if (onGenerate) {
          await onGenerate(formData, generatedItems);
        }
      }
    } catch (error) {
      console.error("Error in form submission:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label={t("form.labels.title")}
        placeholder={t("app.title")}
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label={t("form.labels.specialization")}
          options={specializationOptions}
          value={formData.specialization}
          onValueChange={(value) =>
            setFormData({ ...formData, specialization: value })
          }
          error={errors.specialization}
          required
        />

        <Select
          label={t("form.labels.purpose")}
          options={purposeOptions}
          value={formData.purpose}
          onValueChange={(value) =>
            setFormData({ ...formData, purpose: value })
          }
          error={errors.purpose}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label={t("form.labels.contentType")}
          options={contentTypeOptions}
          value={formData.contentType}
          onValueChange={(value) =>
            setFormData({ ...formData, contentType: value })
          }
          error={errors.contentType}
          required
        />

        <Input
          label={t("form.labels.numberOfPublications")}
          type="number"
          min={1}
          max={15}
          value={formData.numberOfPublications.toString()}
          onChange={(e) =>
            setFormData({
              ...formData,
              numberOfPublications: parseInt(e.target.value) || 0,
            })
          }
          error={errors.numberOfPublications}
          required
        />
      </div>

      <Textarea
        label={t("form.labels.context")}
        value={formData.context}
        onChange={(e) =>
          setFormData({ ...formData, context: e.target.value })
        }
        placeholder={t("form.placeholder.context")}
      />

      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="submit"
          variant="primary"
          className="w-full md:w-auto"
          disabled={isSubmitting}
        >
          {isSubmitting ? t("form.submit.generating") : t("form.submit.generate")}
        </Button>
      </div>
    </form>
  );
};
