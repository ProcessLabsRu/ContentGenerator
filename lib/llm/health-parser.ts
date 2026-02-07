import { createLLMClient } from './index';

export interface ScrapedHealthEvent {
    month: string;
    date: string;
    eventName: string;
    description: string;
}

export interface CleanedHealthEvent {
    eventName: string;
    description: string;
    date: string;
    month: string;
}

const PARSER_SYSTEM_PROMPT = `
You are a expert Brazilian health data specialist. You will receive a JSON array of scraped health awareness events from the Brazilian Ministry of Health website.
The data is messy: it contains HTML, raw links, and incomplete descriptions.

Your mission is to perform high-quality normalization:
1. Strip ALL HTML (tags like <a>, <span>, etc.) and entities (&nbsp;).
2. Fix event names: Extract the core name (e.g., from a link text).
3. Enhance descriptions: If the description is empty but the event is well-known (like "Setembro Amarelo"), provide a concise 1-sentence description in Portuguese.
4. Language: Everything MUST be in Brazilian Portuguese.
5. Format the date: Keep it as originally provided (e.g. "01/09" or "August").
6. Month: Maintain the original month name.

Output MUST be a valid JSON array of objects with fields: "eventName", "description", "originalDate", "month".
Do not include any notes, markdown, or text outside the JSON.
`;

export async function parseHealthEventsAI(events: ScrapedHealthEvent[]): Promise<CleanedHealthEvent[]> {
    if (events.length === 0) return [];

    try {
        const client = createLLMClient();

        // Process in batches if too many, but for now we expect small chunks (per month or full)
        // If > 20, we might hit limits or degrade quality, but let's try 
        const prompt = `Clean and normalize these Brazilian health events: ${JSON.stringify(events)}`;

        const response = await client.generate([
            { role: 'system', content: PARSER_SYSTEM_PROMPT },
            { role: 'user', content: prompt }
        ]);

        const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(cleanContent);

        if (Array.isArray(parsed)) {
            return parsed.map(item => ({
                eventName: item.eventName || '',
                description: item.description || '',
                date: item.originalDate || '',
                month: item.month || ''
            }));
        }

        throw new Error('LLM did not return an array');
    } catch (error) {
        console.error('AI Health Parsing error:', error);
        // Fallback to basic cleaning
        return events.map(e => ({
            eventName: e.eventName.replace(/<[^>]*>/g, '').replace(/&[a-z0-9]+;/gi, ' ').trim(),
            description: e.description.replace(/<[^>]*>/g, '').replace(/&[a-z0-9]+;/gi, ' ').trim(),
            date: e.date,
            month: e.month
        }));
    }
}
