import { MedicalContentFormData, MonthOption, MedicalSpecialization } from "@/lib/types";
import { getHealthEvents } from "@/lib/healthCalendar";

export const SYSTEM_PROMPT = `
You are an expert Social Media Manager specializing in medical content marketing. 
Your goal is to generate a comprehensive content plan for a medical professional or clinic.

The output must be a valid JSON array of objects, where each object represents a content piece.
Each object should have the following fields:
- format: "Reels", "Carrossel", "Post Estático", "Stories", or "Live/Collab"
- title: A catchy headline for the post
- pain_point: The patient's pain point or question being addressed
- content_outline: A brief outline of what to cover in the content (2-3 sentences)
- cta: Call to Action (e.g., "Schedule an appointment", "Share this post")
- status: "draft"
- publish_date: Suggest a specific date as "YYYY-MM-DD" (e.g. "2024-10-15")

Do not include any markdown formatting or explanations outside the JSON array. return ONLY the JSON.
`;

export function generateUserPrompt(data: MedicalContentFormData): string {
    const goalsList = data.goals.join(", ");
    const formatDistribution = Object.entries(data.formatCounts)
        .filter(([_, count]) => count > 0)
        .map(([format, count]) => `- ${format}: ${count} posts`)
        .join("\n");

    const currentYear = new Date().getFullYear();
    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const monthIndex = months.indexOf(data.month as string) + 1;

    let healthEventsContext = "";
    if (data.useHealthCalendar) {
        let eventsFound = false;

        if (data.month && data.specialization) {
            const events = getHealthEvents(
                data.month as MonthOption,
                data.specialization as MedicalSpecialization
            );

            if (events.length > 0) {
                eventsFound = true;
                const eventsList = events
                    .map(e => `- ${e.eventName}: ${e.description}`)
                    .join("\n");

                healthEventsContext = `
Relevant Health Awareness Events for ${data.month}:
${eventsList}
Please incorporate these themes into the content plan where appropriate and schedule posts near these dates.
`;
            }
        }

        if (!eventsFound) {
            healthEventsContext = `Please align content with relevant health awareness dates for ${data.month} in Brazil where applicable.`;
        }
    }

    return `
Generate a content plan for ${data.month} (month ${monthIndex} of ${currentYear}).

Details:
- Title: ${data.title}
- Specialization: ${data.specialization}
- Goals: ${goalsList}
- Target Audience Context: ${data.additionalContext || "General audience interested in this specialization"}
- Total Publications: ${data.totalPublications}

Format Distribution:
${formatDistribution}

${healthEventsContext}

Assign a specific publication date to each post in EXACTLY "YYYY-MM-DD" format.
- All dates MUST be in ${data.month} ${currentYear} (between ${currentYear}-${monthIndex.toString().padStart(2, '0')}-01 and ${currentYear}-${monthIndex.toString().padStart(2, '0')}-28).
- Distribute posts evenly throughout the month.
- If a post relates to a specific awareness day, schedule it on or near that date.

Ensure the tone is professional yet accessible, empathetic, and strictly follows medical ethics (no sensationalism, no guarantees of cure).
`;
}
