"use client";

import { useEffect, useState, MouseEvent as ReactMouseEvent } from "react";
import { Generation } from "@/lib/types";
import { fetchGenerations, deleteGeneration, isApiError } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import { Trash2, Info } from "lucide-react";
import { ConfirmationModal } from "./ui/ConfirmationModal";
import { GenerationDetailsModal } from "./GenerationDetailsModal";

interface GenerationsListProps {
  selectedId?: string | null;
  onSelect: (generation: Generation) => void;
  onDelete?: (id: string) => void;
  refreshTrigger?: number;
}

export const GenerationsList: React.FC<GenerationsListProps> = ({
  selectedId,
  onSelect,
  onDelete,
  refreshTrigger,
}) => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [detailsModalItem, setDetailsModalItem] = useState<Generation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleDelete = async (e: ReactMouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;

    setIsDeleting(true);
    try {
      const result = await deleteGeneration(deleteConfirmId);
      if (isApiError(result)) {
        alert(result.error.message);
      } else {
        const deletedId = deleteConfirmId;
        setDeleteConfirmId(null);
        if (onDelete) {
          onDelete(deletedId);
        }
        loadGenerations();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete generation");
    } finally {
      setIsDeleting(false);
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
      <div
        onClick={() => onSelect({ id: 'all', title: t("generations.all") } as Generation)}
        className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 relative group shadow-sm mb-4 ${selectedId === 'all'
          ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500/10"
          : "border-gray-200 bg-slate-50/50 hover:border-gray-300 hover:bg-slate-100/80"
          }`}
      >
        <div className="text-sm font-medium text-gray-900 uppercase">
          {t("generations.all")}
        </div>
      </div>

      {generations.map((generation) => (
        <div
          key={generation.id}
          onClick={() => onSelect(generation)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors relative group ${selectedId === generation.id
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            }`}
        >
          <div className="absolute top-2 right-2 flex items-center gap-0.5">
            {/* Info Icon - Triggers Modal */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDetailsModalItem(generation);
              }}
              className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors opacity-0 group-hover:opacity-100"
              title={t("generations.details")}
            >
              <Info className="h-4 w-4" />
            </button>

            {/* Delete Icon */}
            <button
              onClick={(e) => handleDelete(e, generation.id)}
              className="p-1.5 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
              title={t("ui.delete")}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="text-sm font-medium text-gray-900 mb-1 pr-12 uppercase">
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

      <GenerationDetailsModal
        isOpen={Boolean(detailsModalItem)}
        onClose={() => setDetailsModalItem(null)}
        generation={detailsModalItem}
      />

      <ConfirmationModal
        isOpen={Boolean(deleteConfirmId)}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title={t("ui.delete")}
        message={t("generations.delete.confirm")}
        confirmLabel={t("ui.delete")}
        isLoading={isDeleting}
      />
    </div>
  );
};
