"use client";

import { useEffect, useState } from "react";
import { Generation, ContentPlanItem, ContentPlanStatus } from "@/lib/types";
import { ContentPlanTable } from "./ContentPlanTable";
import { ContentPlanCalendar } from "./ContentPlanCalendar";
import { ContentPlanItemModal } from "./ContentPlanItemModal";
import {
  fetchGenerationItems,
  fetchAllContentItems,
  updateItemStatus,
  updateItem,
  deleteItem,
  isApiError,
} from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";

interface PostsListProps {
  generation: Generation | null;
}

export const PostsList: React.FC<PostsListProps> = ({ generation }) => {
  const [items, setItems] = useState<ContentPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "calendar">("table");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "approved" | "draft"
  >("all");
  const [showSettings, setShowSettings] = useState(false);
  const [activeItem, setActiveItem] = useState<ContentPlanItem | null>(null);
  const { t } = useI18n();
  const [tableColumns, setTableColumns] = useState({
    format: true,
    status: true,
    publishDate: true,
    painPoint: false,
    cta: false,
    contentOutline: false,
  });
  const [calendarFields, setCalendarFields] = useState({
    format: true,
    status: false,
    undatedSection: true,
    painPoint: false,
    cta: false,
    contentOutline: false,
  });

  useEffect(() => {
    if (!generation) {
      setItems([]);
      return;
    }

    const loadItems = async () => {
      setLoading(true);
      setError(null);

      try {
        let itemsData: ContentPlanItem[] = [];

        if (generation.id === "all") {
          const result = await fetchAllContentItems();
          if (isApiError(result)) {
            setError(result.error.message);
            setItems([]);
            return;
          }
          itemsData = result.data.items;
        } else {
          const result = await fetchGenerationItems(generation.id);
          if (isApiError(result)) {
            setError(result.error.message);
            setItems([]);
            return;
          }
          itemsData = result.data;
        }

        setItems(itemsData);
      } catch (err: any) {
        setError(err.message || t("posts.loadError"));
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [generation, t]);

  const handleSelectionChange = async (selectedIds: string[]) => {
    if (!generation) return;

    const previousItems = items;

    // Update items optimistically
    const updatedItems = items.map((item) =>
      selectedIds.includes(item.id)
        ? { ...item, status: "approved" as ContentPlanStatus }
        : item.status === "approved"
          ? { ...item, status: "draft" as ContentPlanStatus }
          : item
    );

    setItems(updatedItems);

    // Update status via API - only update items whose status changed
    try {
      const updates: Promise<any>[] = [];

      updatedItems.forEach((item) => {
        const previousItem = previousItems.find((p) => p.id === item.id);
        if (previousItem && previousItem.status !== item.status) {
          updates.push(updateItemStatus(generation.id, item.id, item.status));
        }
      });

      if (updates.length > 0) {
        await Promise.all(updates);
      }
    } catch (err: any) {
      console.error("Error updating item status:", err);
      // Revert on error
      setItems(previousItems);
      alert(t("posts.updateStatusError"));
    }
  };

  const handleItemClick = (item: ContentPlanItem) => {
    setActiveItem(item);
  };

  const handleItemSave = async (updatedItem: ContentPlanItem) => {
    if (!generation) return;
    const result = await updateItem(generation.id, {
      id: updatedItem.id,
      title: updatedItem.title,
      format: updatedItem.format,
      status: updatedItem.status,
      publish_date: updatedItem.publish_date ?? null,
      pain_point: updatedItem.pain_point,
      content_outline: updatedItem.content_outline,
      cta: updatedItem.cta,
    });

    if (isApiError(result)) {
      alert(t("posts.updateItemError", { error: result.error.message }));
      return;
    }

    const savedItem = result.data;
    setItems((prev) =>
      prev.map((item) => (item.id === savedItem.id ? savedItem : item))
    );
    setActiveItem(null);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!generation) return;
    const result = await deleteItem(generation.id, itemId);

    if (isApiError(result)) {
      alert(result.error.message);
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== itemId));
    setActiveItem(null);
  };

  if (!generation) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>{t("posts.selectGeneration")}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500">
        {t("posts.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-600 mb-2">
          {t("posts.error", { error: error || "" })}
        </div>
      </div>
    );
  }

  const getPostsLabel = (count: number) =>
    t(count === 1 ? "posts.count.one" : "posts.count.other", { count });

  const filteredItems =
    approvalFilter === "all"
      ? items
      : items.filter((item) =>
        approvalFilter === "approved"
          ? item.status === "approved"
          : item.status === "draft"
      );

  return (
    <div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            {generation.id === 'all'
              ? generation.title
              : `${generation.specialization} • ${generation.purpose}`}
          </h2>
          <p className="text-sm text-gray-600">
            {getPostsLabel(items.length)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === "table"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t("posts.view.table")}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("calendar")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t("posts.view.calendar")}
            </button>
          </div>
          {viewMode === "table" && (
            <div className="flex items-center gap-2">
              <label
                htmlFor="approval-filter"
                className="text-sm font-medium text-gray-600"
              >
                {t("table.filter.approval")}
              </label>
              <select
                id="approval-filter"
                value={approvalFilter}
                onChange={(e) =>
                  setApprovalFilter(
                    e.target.value as "all" | "approved" | "draft"
                  )
                }
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-sm text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">{t("table.filter.all")}</option>
                <option value="approved">{t("status.approved")}</option>
                <option value="draft">{t("status.draft")}</option>
              </select>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            {t("posts.settings")}
          </button>
        </div>
      </div>
      {showSettings && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("settings.tableView")}
              </h3>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={tableColumns.format}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      format: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.format")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={tableColumns.status}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      status: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.status")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={tableColumns.publishDate}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      publishDate: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.publishDate")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={tableColumns.painPoint}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      painPoint: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.painPoint")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={tableColumns.cta}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      cta: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.cta")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={tableColumns.contentOutline}
                  onChange={(e) =>
                    setTableColumns((prev) => ({
                      ...prev,
                      contentOutline: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.contentOutline")}
              </label>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                {t("settings.calendarView")}
              </h3>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={calendarFields.format}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      format: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.format")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={calendarFields.status}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      status: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.status")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={calendarFields.undatedSection}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      undatedSection: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("settings.undatedSection")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={calendarFields.painPoint}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      painPoint: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.painPoint")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={calendarFields.cta}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      cta: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.cta")}
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
                <input
                  type="checkbox"
                  checked={calendarFields.contentOutline}
                  onChange={(e) =>
                    setCalendarFields((prev) => ({
                      ...prev,
                      contentOutline: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600"
                />
                {t("table.columns.contentOutline")}
              </label>
            </div>
          </div>
        </div>
      )}
      {viewMode === "table" ? (
        <ContentPlanTable
          items={filteredItems}
          onSelectionChange={handleSelectionChange}
          visibleColumns={tableColumns}
          onItemClick={handleItemClick}
        />
      ) : (
        <ContentPlanCalendar
          items={items}
          visibleFields={calendarFields}
          onItemClick={handleItemClick}
        />
      )}
      <ContentPlanItemModal
        item={activeItem}
        isOpen={Boolean(activeItem)}
        onClose={() => setActiveItem(null)}
        onSave={handleItemSave}
        onDelete={handleDeleteItem}
      />
    </div>
  );
};
