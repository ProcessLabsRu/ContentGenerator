/**
 * Utility to scrape health calendar events from the Brazilian Ministry of Health website
 */

export interface ScrapedEvent {
    month: string;
    eventName: string;
    date: string;
    description: string;
}

export async function scrapeHealthCalendar(): Promise<ScrapedEvent[]> {
    const url = 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/c/calendario/saude';

    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch health calendar: ${response.status} ${response.statusText}`);
        }

        const html = await response.text();
        const events: ScrapedEvent[] = [];
        const months = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        // Split HTML by toggle blocks
        // The structure is roughly: <a class="toggle ...">Month</a> <div class="conteudo">...</div>
        const parts = html.split(/<a[^>]+class="toggle[^"]*"[^>]*>/i);

        // Skip the first part (pre-month content)
        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];

            // Extract month name (usually the text before </a>)
            const monthHeaderMatch = part.match(/^([^<]+)<\/a>/i);
            if (!monthHeaderMatch) continue;

            const monthName = monthHeaderMatch[1].trim();
            if (!months.includes(monthName)) continue;

            // Find the corresponding content div
            const contentMatch = part.match(/<div[^>]+class="conteudo"[^>]*>([\s\S]*?)<\/div>/i);
            if (!contentMatch) continue;

            const content = contentMatch[1];

            // 1. Parse List Items (Specific Dates)
            const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
            let liMatch;
            while ((liMatch = liRegex.exec(content)) !== null) {
                const liHtml = liMatch[1];
                const rawText = liHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

                // Format: "29/01 - Dia Nacional..."
                const separatorIndex = rawText.indexOf(' - ');
                if (separatorIndex !== -1) {
                    const datePart = rawText.substring(0, separatorIndex).trim();
                    const restPart = rawText.substring(separatorIndex + 3).trim();

                    // Further split restPart into name and description if description exists (often in parentheses)
                    const descMatch = restPart.match(/^(.*?)\((.*?)\)$/);
                    let eventName = restPart;
                    let description = '';

                    if (descMatch) {
                        eventName = descMatch[1].trim();
                        description = descMatch[2].trim();
                    }

                    // Final cleanup for eventName (remove any overlooked HTML entities or artifacts)
                    eventName = eventName.replace(/&[a-z0-9]+;/gi, ' ');

                    events.push({
                        month: monthName,
                        date: datePart,
                        eventName: eventName,
                        description: description
                    });
                }
            }

            // 2. Parse Campaigns (Special campaigns often start with * and use bold)
            // e.g. *Janeiro roxo -&nbsp;<b>Hanseníase</b>
            const starRegex = /\*(.*?)\s*[-–]\s*([\s\S]*?)(?=<br|$|<p|<div|<\/div)/gi;
            let starMatch;
            while ((starMatch = starRegex.exec(content)) !== null) {
                const dateOrCampaign = starMatch[1].replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
                const eventInfoHtml = starMatch[2];
                const eventInfo = eventInfoHtml.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

                // Avoid duplicates from LI if they exist
                if (!events.some(e => e.month === monthName && e.eventName === eventInfo)) {
                    events.push({
                        month: monthName,
                        date: dateOrCampaign,
                        eventName: eventInfo,
                        description: ''
                    });
                }
            }
        }

        return events;
    } catch (error) {
        console.error('Error scraping health calendar:', error);
        throw error;
    }
}
