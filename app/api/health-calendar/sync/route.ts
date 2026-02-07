import { NextResponse } from 'next/server';
import { getMonths, createHealthCalendarEvent } from '@/lib/db/adapter';
import { scrapeHealthCalendar } from '@/lib/utils/health-calendar-scraper';
import { parseHealthEventsAI } from '@/lib/llm/health-parser';

export async function POST() {
    try {
        // 1. Fetch months to get IDs mapping
        const months = await getMonths();
        const monthMap = new Map(months.map(m => [m.name, m.id]));

        // 2. Scrape data from MS website
        console.log('Starting health calendar sync...');
        const scrapedEvents = await scrapeHealthCalendar();
        console.log(`Scraped ${scrapedEvents.length} events from MS`);

        // 3. Delete ALL existing official events
        console.log('Deleting existing official events...');
        const pb = (await import('@/lib/pocketbase')).getPocketBase();
        const officialEvents = await pb.collection('health_calendar_events').getFullList({
            filter: 'source = "official"'
        });

        console.log(`Deleting ${officialEvents.length} official events...`);
        for (const event of officialEvents) {
            await pb.collection('health_calendar_events').delete(event.id);
        }

        // 4. AI Normalization
        console.log('AI normalizing events...');
        const cleanedEvents = await parseHealthEventsAI(scrapedEvents);
        console.log(`AI normalized ${cleanedEvents.length} events`);

        const currentYear = new Date().getFullYear();
        const monthNames = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
        ];

        let addedCount = 0;

        // 5. Create new events
        for (const event of cleanedEvents) {
            const monthId = monthMap.get(event.month);
            if (!monthId) {
                console.warn(`Month not found: ${event.month}`);
                continue;
            }

            // Format date correctly for PocketBase Date field
            let pbDate = `${currentYear}-01-01 00:00:00`;
            const mIdx = monthNames.indexOf(event.month);
            const mNum = (mIdx !== -1 ? mIdx + 1 : 1).toString().padStart(2, '0');

            const dateMatch = event.date.match(/^(\d{1,2})\/(\d{1,2})$/);
            if (dateMatch) {
                pbDate = `${currentYear}-${dateMatch[2].padStart(2, '0')}-${dateMatch[1].padStart(2, '0')} 00:00:00`;
            } else {
                const dayMatch = event.date.match(/^(\d{1,2})$/);
                if (dayMatch) {
                    pbDate = `${currentYear}-${mNum}-${dayMatch[1].padStart(2, '0')} 00:00:00`;
                } else {
                    pbDate = `${currentYear}-${mNum}-01 00:00:00`;
                }
            }

            const eventData = {
                monthId,
                eventName: event.eventName,
                description: event.description || "-",
                date: pbDate,
                year: currentYear,
                isActive: true,
                source: 'official' as const
            };

            await createHealthCalendarEvent(eventData);
            addedCount++;

            // Avoid overloading PB with too many rapid requests
            if (addedCount % 5 === 0) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        console.log(`Sync completed: ${addedCount} added`);
        return NextResponse.json({
            success: true,
            addedCount,
            totalScraped: scrapedEvents.length
        });
    } catch (error: any) {
        const errorDetails = error.response?.data || error.data || error.message;
        console.error('Health calendar sync error details:', JSON.stringify(errorDetails));
        return NextResponse.json({
            success: false,
            error: error.message || 'Unknown error during sync',
            details: errorDetails
        }, { status: 500 });
    }
}
