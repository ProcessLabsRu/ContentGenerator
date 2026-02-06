"use client";

import { useState, useCallback } from "react";
import { MedicalGenerationModal } from "@/components/MedicalGenerationModal";
import { GenerationsList } from "@/components/GenerationsList";
import { PostsList } from "@/components/PostsList";
import { Button } from "@/components/ui/Button";
import { Generation, MedicalContentFormData } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { t } = useI18n();

  const handleSelectGeneration = (generation: Generation) => {
    setSelectedGeneration(generation);
  };

  const handleGenerationCreated = (planData: MedicalContentFormData) => {
    // Trigger refresh of generations list
    setRefreshTrigger((prev) => prev + 1);
    console.log("Plano criado:", planData);
    // TODO: Aqui você pode salvar o plano no banco de dados
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header with button */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("medical.app.title")}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {t("medical.app.subtitle")}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => setIsModalOpen(true)}
            >
              ✨ {t("medical.app.createPlan")}
            </Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left column - Generations List */}
          <div className="w-80 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                {t("medical.app.generatedPlans")}
              </h2>
              <GenerationsList
                selectedId={selectedGeneration?.id || null}
                onSelect={handleSelectGeneration}
                refreshTrigger={refreshTrigger}
              />
            </div>
          </div>

          {/* Right column - Posts List */}
          <div className="flex-1 overflow-y-auto bg-white">
            <div className="p-4 sm:p-6 lg:p-8">
              <PostsList generation={selectedGeneration} />
            </div>
          </div>
        </div>

        {/* Modal */}
        <MedicalGenerationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleGenerationCreated}
        />
      </div>
    </ProtectedRoute>
  );
}
