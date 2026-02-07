"use client";

import { useState, useCallback, useEffect } from "react";
import { MedicalGenerationModal } from "@/components/MedicalGenerationModal";
import { GenerationsList } from "@/components/GenerationsList";
import { PostsList } from "@/components/PostsList";
import { HealthCalendarView } from "@/components/HealthCalendarView";
import { Button } from "@/components/ui/Button";
import { Generation, MedicalContentFormData } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CalendarDays } from "lucide-react";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGeneration, setSelectedGeneration] = useState<Generation | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [view, setView] = useState<'generations' | 'calendar'>('generations');
  const { t } = useI18n();

  const handleSelectGeneration = (generation: Generation) => {
    setSelectedGeneration(generation);
  };

  // Set default selection to "All Generations"
  useEffect(() => {
    if (!selectedGeneration && view === 'generations') {
      setSelectedGeneration({ id: 'all', title: t("generations.all") } as Generation);
    }
  }, [t, selectedGeneration, view]);

  const handleGenerationCreated = (planData: MedicalContentFormData) => {
    // Trigger refresh of generations list
    setRefreshTrigger((prev) => prev + 1);
    console.log("Plano criado:", planData);
  };

  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const handleDeleteGeneration = (id: string) => {
    if (selectedGeneration?.id === id) {
      setSelectedGeneration(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header with button */}
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600 mt-1">
                {t("medical.app.subtitle")}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => setView(view === 'calendar' ? 'generations' : 'calendar')}
                className="flex items-center gap-2"
                title={view === 'calendar' ? "Back to Generations" : "Health Calendar"}
              >
                <CalendarDays className="w-4 h-4" />
                {view === 'calendar' ? "Generations" : ""}
              </Button>
              <Button
                variant="primary"
                onClick={() => setIsModalOpen(true)}
              >
                ✨ {t("medical.app.createPlan")}
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic content area */}
        {view === 'calendar' ? (
          <div className="flex-1 overflow-hidden">
            <HealthCalendarView onBack={() => setView('generations')} />
          </div>
        ) : (
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
                  onDelete={handleDeleteGeneration}
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
        )}

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
