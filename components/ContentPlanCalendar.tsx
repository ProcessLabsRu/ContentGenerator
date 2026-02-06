"use client";

import { useMemo, useState } from "react";
import { ContentPlanItem } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type CalendarView = "month" | "week";

const pad = (value: number) => value.toString().padStart(2, "0");

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const parsePublishDate = (value?: string | null) => {
  if (!value) return null;
  const core = value.slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(core)) {
    const [year, month, day] = core.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const startOfWeek = (date: Date) => {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayIndex = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - dayIndex);
  return result;
};

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

interface ContentPlanCalendarProps {
  items: ContentPlanItem[];
  onItemClick?: (item: ContentPlanItem) => void;
  visibleFields?: {
    format?: boolean;
    status?: boolean;
    undatedSection?: boolean;
    painPoint?: boolean;
    cta?: boolean;
    contentOutline?: boolean;
  };
}

export const ContentPlanCalendar: React.FC<ContentPlanCalendarProps> = ({
  items,
  onItemClick,
  visibleFields,
}) => {
  const [view, setView] = useState<CalendarView>("month");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const { t, intlLocale, weekDays } = useI18n();
  const showFormat = visibleFields?.format ?? true;
  const showStatus = visibleFields?.status ?? false;
  const showUndatedSection = visibleFields?.undatedSection ?? true;
  const showPainPoint = visibleFields?.painPoint ?? false;
  const showCta = visibleFields?.cta ?? false;
  const showContentOutline = visibleFields?.contentOutline ?? false;
  const formatHeaderDate = (date: Date) =>
    new Intl.DateTimeFormat(intlLocale, {
      month: "long",
      year: "numeric",
    }).format(date);

  const formatCellDate = (date: Date) =>
    new Intl.DateTimeFormat(intlLocale, {
      day: "numeric",
      month: "short",
    }).format(date);

  const statusColors: Record<
    ContentPlanItem["status"],
    { bg: string; text: string }
  > = {
    draft: { bg: "bg-gray-100", text: "text-gray-700" },
    approved: { bg: "bg-blue-100", text: "text-blue-700" },
    generated: { bg: "bg-green-100", text: "text-green-700" },
  };
  const statusLabelKey = {
    draft: "status.draft",
    approved: "status.approved",
    generated: "status.generated",
  } as const;

  const { itemsByDate, undatedItems } = useMemo(() => {
    const map = new Map<string, ContentPlanItem[]>();
    const withoutDate: ContentPlanItem[] = [];

    items.filter((item) => item.status === "approved").forEach((item) => {
      const parsed = parsePublishDate(item.publish_date);
      if (!parsed) {
        withoutDate.push(item);
        return;
      }
      const key = toDateKey(parsed);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)?.push(item);
    });

    return { itemsByDate: map, undatedItems: withoutDate };
  }, [items]);

  const gridDates = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(currentDate);
      return Array.from({ length: 7 }, (_, idx) => addDays(start, idx));
    }

    const monthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const monthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );
    const gridStart = startOfWeek(monthStart);
    const gridEnd = addDays(startOfWeek(monthEnd), 6);
    const days: Date[] = [];
    for (
      let day = new Date(gridStart);
      day <= gridEnd;
      day = addDays(day, 1)
    ) {
      days.push(new Date(day));
    }
    return days;
  }, [currentDate, view]);

  const handlePrev = () => {
    setCurrentDate((prev) => {
      if (view === "week") {
        return addDays(prev, -7);
      }
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      if (view === "week") {
        return addDays(prev, 7);
      }
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });
  };

  const handleToday = () => setCurrentDate(new Date());

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800 flex items-center gap-2">
        <span className="text-lg">ℹ️</span>
        {t("calendar.onlyApproved")}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatHeaderDate(currentDate)}
          </h3>
          {view === "week" && (
            <p className="text-sm text-gray-500">
              {formatCellDate(gridDates[0])} —{" "}
              {formatCellDate(gridDates[gridDates.length - 1])}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={() => setView("month")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${view === "month"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t("calendar.view.month")}
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={`px-3 py-1 text-sm font-medium rounded-md ${view === "week"
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {t("calendar.view.week")}
            </button>
          </div>
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
            <button
              type="button"
              onClick={handlePrev}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ◀
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              {t("calendar.today")}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl overflow-hidden border border-gray-200 bg-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
        {gridDates.map((date) => {
          const key = toDateKey(date);
          const dayItems = itemsByDate.get(key) || [];
          const isCurrentMonth =
            view === "week" ||
            date.getMonth() === currentDate.getMonth();

          return (
            <div
              key={key}
              className={`min-h-[110px] bg-white p-2 ${isCurrentMonth ? "" : "text-gray-400 bg-gray-50"
                }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold">
                <span>{date.getDate()}</span>
                {dayItems.length > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                    {dayItems.length}
                  </span>
                )}
              </div>
              <div className="mt-2 space-y-1">
                {dayItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-md bg-blue-50 px-2 py-1 text-[11px] text-blue-900 leading-snug ${onItemClick ? "cursor-pointer hover:bg-blue-100" : ""
                      }`}
                    title={item.title}
                    role={onItemClick ? "button" : undefined}
                    onClick={() => onItemClick?.(item)}
                  >
                    <div className="font-semibold truncate">{item.title}</div>
                    {showFormat && (
                      <div className="text-[10px] text-blue-700 truncate">
                        {item.format}
                      </div>
                    )}
                    {showPainPoint && item.pain_point && (
                      <div className="text-[10px] text-blue-800 truncate">
                        {item.pain_point}
                      </div>
                    )}
                    {showContentOutline && item.content_outline && (
                      <div className="text-[10px] text-blue-800 truncate">
                        {item.content_outline}
                      </div>
                    )}
                    {showCta && item.cta && (
                      <div className="text-[10px] text-blue-800 truncate">
                        {item.cta}
                      </div>
                    )}
                    {showStatus && (
                      <span
                        className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[item.status].bg} ${statusColors[item.status].text}`}
                      >
                        {t(statusLabelKey[item.status])}
                      </span>
                    )}
                  </div>
                ))}
                {dayItems.length > 3 && (
                  <div className="text-[11px] text-gray-500">
                    {t("calendar.more", { count: dayItems.length - 3 })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showUndatedSection && undatedItems.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            {t("calendar.noPublishDate")}
          </h4>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {undatedItems.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border border-gray-200 bg-white p-3 text-sm text-gray-700 ${onItemClick ? "cursor-pointer hover:border-blue-300" : ""
                  }`}
                role={onItemClick ? "button" : undefined}
                onClick={() => onItemClick?.(item)}
              >
                <div className="font-medium text-gray-900">{item.title}</div>
                {showFormat && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.format}
                  </div>
                )}
                {showPainPoint && item.pain_point && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.pain_point}
                  </div>
                )}
                {showContentOutline && item.content_outline && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.content_outline}
                  </div>
                )}
                {showCta && item.cta && (
                  <div className="text-xs text-gray-500 mt-1">
                    {item.cta}
                  </div>
                )}
                {showStatus && (
                  <span
                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[item.status].bg} ${statusColors[item.status].text}`}
                  >
                    {t(statusLabelKey[item.status])}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
