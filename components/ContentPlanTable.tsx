"use client";

import { useState } from "react";
import { ContentPlanItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

interface ContentPlanTableProps {
  items: ContentPlanItem[];
  onSelectionChange?: (selectedIds: string[]) => void;
  onItemClick?: (item: ContentPlanItem) => void;
  visibleColumns?: {
    format?: boolean;
    status?: boolean;
    publishDate?: boolean;
    painPoint?: boolean;
    cta?: boolean;
    contentOutline?: boolean;
  };
}

const statusColors: Record<
  ContentPlanItem["status"],
  { bg: string; text: string }
> = {
  draft: { bg: "bg-gray-100", text: "text-gray-800" },
  approved: { bg: "bg-blue-100", text: "text-blue-800" },
  generated: { bg: "bg-green-100", text: "text-green-800" },
};

const formatBadgeColors: Record<string, { bg: string; text: string }> = {
  "Blog Post": { bg: "bg-purple-100", text: "text-purple-800" },
  Video: { bg: "bg-red-100", text: "text-red-800" },
  Infographic: { bg: "bg-yellow-100", text: "text-yellow-800" },
  "Case Study": { bg: "bg-indigo-100", text: "text-indigo-800" },
  "Social Media Post": { bg: "bg-pink-100", text: "text-pink-800" },
  Podcast: { bg: "bg-orange-100", text: "text-orange-800" },
  Webinar: { bg: "bg-teal-100", text: "text-teal-800" },
  "Email Newsletter": { bg: "bg-cyan-100", text: "text-cyan-800" },
  Whitepaper: { bg: "bg-slate-100", text: "text-slate-800" },
  "E-book": { bg: "bg-emerald-100", text: "text-emerald-800" },
};

const getFormatColors = (format: string) => {
  return (
    formatBadgeColors[format] || { bg: "bg-gray-100", text: "text-gray-800" }
  );
};

export const ContentPlanTable: React.FC<ContentPlanTableProps> = ({
  items,
  onSelectionChange,
  onItemClick,
  visibleColumns,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { t, intlLocale } = useI18n();
  const statusLabelKey = {
    draft: "status.draft",
    approved: "status.approved",
    generated: "status.generated",
  } as const;
  const formatPublishDate = (value?: string | null) => {
    if (!value) return "—";
    const core = value.slice(0, 10);
    let date: Date;
    if (/^\d{4}-\d{2}-\d{2}$/.test(core)) {
      const [year, month, day] = core.split("-").map(Number);
      date = new Date(year, month - 1, day);
    } else {
      const parsed = new Date(value);
      if (Number.isNaN(parsed.getTime())) return "—";
      date = parsed;
    }
    return new Intl.DateTimeFormat(intlLocale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };
  const showFormat = visibleColumns?.format ?? true;
  const showStatus = visibleColumns?.status ?? true;
  const showPublishDate = visibleColumns?.publishDate ?? true;
  const showPainPoint = visibleColumns?.painPoint ?? false;
  const showCta = visibleColumns?.cta ?? false;
  const showContentOutline = visibleColumns?.contentOutline ?? false;

  const handleCheckboxChange = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
    if (onSelectionChange) {
      onSelectionChange(Array.from(newSelected));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set(items.map((item) => item.id));
      setSelectedIds(allIds);
      if (onSelectionChange) {
        onSelectionChange(Array.from(allIds));
      }
    } else {
      setSelectedIds(new Set());
      if (onSelectionChange) {
        onSelectionChange([]);
      }
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{t("table.empty.title")}</p>
        <p className="mt-2 text-sm">
          {t("table.empty.subtitle")}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 sm:-mx-8 md:mx-0">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-12 px-4 sm:px-6 py-3 text-left">
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                aria-label={t("table.selectAll")}
              />
            </th>
            <th
              scope="col"
              className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {t("table.columns.title")}
            </th>
            {showFormat && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.format")}
              </th>
            )}
            {showStatus && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.status")}
              </th>
            )}
            {showPublishDate && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.publishDate")}
              </th>
            )}
            {showPainPoint && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.painPoint")}
              </th>
            )}
            {showCta && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.cta")}
              </th>
            )}
            {showContentOutline && (
              <th
                scope="col"
                className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {t("table.columns.contentOutline")}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const statusColor = statusColors[item.status];
            const formatColor = getFormatColors(item.format);
            return (
              <tr
                key={item.id}
                className={`hover:bg-gray-50 transition-colors ${onItemClick ? "cursor-pointer" : ""
                  }`}
                onClick={() => onItemClick?.(item)}
              >
                <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(item.id)}
                    onChange={(e) =>
                      handleCheckboxChange(item.id, e.target.checked)
                    }
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    aria-label={t("table.selectItem", { title: item.title })}
                  />
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="text-sm font-medium text-gray-900 max-w-xs sm:max-w-none truncate sm:truncate-none">
                    {item.title}
                  </div>
                </td>
                {showFormat && (
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${formatColor.bg} ${formatColor.text}`}
                    >
                      {item.format}
                    </span>
                  </td>
                )}
                {showStatus && (
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor.bg} ${statusColor.text}`}
                    >
                      {t(statusLabelKey[item.status])}
                    </span>
                  </td>
                )}
                {showPublishDate && (
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatPublishDate(item.publish_date)}
                  </td>
                )}
                {showPainPoint && (
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={item.pain_point}>
                      {item.pain_point || "—"}
                    </div>
                  </td>
                )}
                {showCta && (
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={item.cta}>
                      {item.cta || "—"}
                    </div>
                  </td>
                )}
                {showContentOutline && (
                  <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 max-w-xs">
                    <div className="truncate" title={item.content_outline}>
                      {item.content_outline || "—"}
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
