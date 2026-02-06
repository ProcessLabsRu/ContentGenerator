"use client";

import { useEffect, useState } from "react";
import { Generation } from "@/lib/types";
import { fetchGenerations, isApiError } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

interface GenerationsListProps {
  selectedId?: string | null;
  onSelect: (generation: Generation) => void;
  refreshTrigger?: number;
}

export const GenerationsList: React.FC<GenerationsListProps> = ({
  selectedId,
  onSelect,
  refreshTrigger,
}) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t, intlLocale } = useI18n();

  const loadGenerations = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetchGenerations();

      if (isApiError(result)) {
        setError(result.error.message);
        setGenerations([]);
      } else {
        setGenerations(result.data);
      }
    } catch (err: any) {
      setError(err.message || t("generations.loadError"));
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGenerations();
  }, []);

  // Refresh when refreshTrigger prop changes (number that increments)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadGenerations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(intlLocale, {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        {t("generations.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-red-600 text-sm mb-2">
          {t("generations.error", { error: error || "" })}
        </div>
        <button
          onClick={loadGenerations}
          className="text-blue-600 text-sm hover:underline"
        >
          {t("generations.retry")}
        </button>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>{t("generations.empty.title")}</p>
        <p className="text-sm mt-2">{t("generations.empty.subtitle")}</p>
      </div>
    );
  }

  const getPublicationsLabel = (count: number) =>
    t(
      count === 1
        ? "generations.publications.one"
        : "generations.publications.other",
      { count }
    );

  return (
    <div className="space-y-2">
      {generations.map((generation) => (
        <div
          key={generation.id}
          onClick={() => onSelect(generation)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedId === generation.id
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
        >
          <div className="text-sm font-medium text-gray-900 mb-1">
            {generation.title || `${generation.specialization} • ${generation.purpose}`}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {formatDate(generation.created_at)}
          </div>
          <div className="text-xs text-gray-600">
            {getPublicationsLabel(generation.number_of_publications)}
          </div>
        </div>
      ))}
    </div>
  );
};
