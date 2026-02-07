import { ContentPlanItem, MonthOption } from "../types";

const MONTH_MAP: Record<string, number> = {
    "Janeiro": 1,
    "Fevereiro": 2,
    "Março": 3,
    "Abril": 4,
    "Maio": 5,
    "Junho": 6,
    "Julho": 7,
    "Agosto": 8,
    "Setembro": 9,
    "Outubro": 10,
    "Novembro": 11,
    "Dezembro": 12,
};

/**
 * Normalizes the LLM response to ensure it matches our ContentPlanItem interface
 * and Has valid dates.
 */
export function normalizeLLMResponse(items: any[], requestedMonth: string): Partial<ContentPlanItem>[] {
    console.log(`[Normalization] Month: ${requestedMonth}, items: ${items?.length}`);
    if (!Array.isArray(items)) return [];

    const currentYear = new Date().getFullYear();
    const monthNum = MONTH_MAP[requestedMonth as MonthOption] || (new Date().getMonth() + 1);

    const result = items.map((item, index) => {
        // Handle common naming variations
        const title = item.title || item.headline || item.post_title || "Untitled Post";
        const format = item.format || item.post_format || "Post Estático";
        const painPoint = item.pain_point || item.painPoint || item.problem || "";
        const contentOutline = item.content_outline || item.contentOutline || item.outline || item.description || "";
        const cta = item.cta || item.call_to_action || "";

        // Normalize publish_date
        let rawDate = item.publish_date || item.publishDate || item.date || item.publication_date;
        let publishDate = rawDate || null;

        if (publishDate) {
            // Try to extract YYYY-MM-DD
            const dateMatch = String(publishDate).match(/(\d{4})-(\d{2})-(\d{2})/);
            if (dateMatch) {
                publishDate = dateMatch[0];
            } else {
                // If it's just a number (day of month), construct it
                const dayMatch = String(publishDate).match(/^\d{1,2}$/);
                if (dayMatch) {
                    const day = dayMatch[0].padStart(2, '0');
                    const monthStr = String(monthNum).padStart(2, '0');
                    publishDate = `${currentYear}-${monthStr}-${day}`;
                } else {
                    publishDate = null;
                }
            }
        }

        // If still null, generate fallback
        if (!publishDate) {
            const day = Math.min(1 + Math.floor(index * (28 / items.length)), 28);
            const dayStr = String(day).padStart(2, '0');
            const monthStr = String(monthNum).padStart(2, '0');
            publishDate = `${currentYear}-${monthStr}-${dayStr}`;
            console.log(`[Normalization] Set fallback date: ${publishDate} for "${title}"`);
        }

        return {
            format: format as any,
            title,
            pain_point: painPoint,
            content_outline: contentOutline,
            cta,
            status: "draft" as const,
            publish_date: publishDate,
        };
    });

    console.log(`[Normalization] Complete. First date: ${result[0]?.publish_date}`);
    return result as Partial<ContentPlanItem>[];
}
