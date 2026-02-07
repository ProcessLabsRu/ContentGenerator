import PocketBase from 'pocketbase';
import {
    Generation,
    GenerationInput,
    GenerationWithItems,
    ContentPlanItem,
    ContentPlanItemInput,
    ContentPlanStatus,
    ContentPlanItemUpdate,
} from '../types';
import {
    getGenerations,
    createGeneration as pbCreateGeneration,
    updateGeneration as pbUpdateGeneration,
    deleteGeneration as pbDeleteGeneration,
    getContentPlanItems,
    createContentPlanItem,
    updateContentPlanItem,
    deleteContentPlanItem,
    batchCreateContentPlanItems,
    getMonths,
    getHealthCalendarEvents as pbGetHealthCalendarEvents,
    createHealthCalendarEvent as pbCreateHealthCalendarEvent,
    updateHealthCalendarEvent as pbUpdateHealthCalendarEvent,
    deleteHealthCalendarEvent as pbDeleteHealthCalendarEvent,
} from '../pocketbase-service';
import { PBGeneration, PBContentPlanItem } from '../pocketbase-types';

// Преобразование PocketBase Generation в типы приложения
function pbGenerationToGeneration(pbGen: PBGeneration): Generation {
    return {
        id: pbGen.id,
        title: pbGen.title,
        specialization: pbGen.specialization,
        purpose: pbGen.purpose || '',
        content_type: pbGen.contentType || '',
        number_of_publications: pbGen.numberOfPublications,
        context: pbGen.context || null,
        metadata: {
            goals: pbGen.goals || [],
            month: pbGen.month || '',
            formatCounts: pbGen.formatCounts || {},
            useHealthCalendar: pbGen.useHealthCalendar || false,
        },
        created_at: pbGen.created,
        updated_at: pbGen.updated,
    };
}

// Преобразование PocketBase ContentPlanItem в типы приложения
function pbItemToItem(pbItem: PBContentPlanItem): ContentPlanItem {
    return {
        id: pbItem.id,
        generation_id: pbItem.generationId,
        format: pbItem.format,
        title: pbItem.title,
        pain_point: pbItem.painPoint || '',
        content_outline: pbItem.contentOutline || '',
        cta: pbItem.cta || '',
        status: pbItem.status as ContentPlanStatus,
        publish_date: pbItem.publishDate || null,
        created_at: pbItem.created,
        updated_at: pbItem.updated,
    };
}

export async function createGeneration(
    data: GenerationInput,
    items: ContentPlanItemInput[],
    client?: PocketBase
): Promise<GenerationWithItems> {
    // Создаем генерацию
    const pbGeneration = await pbCreateGeneration({
        title: data.title,
        specialization: data.specialization,
        purpose: data.purpose,
        contentType: data.content_type,
        numberOfPublications: Number(data.number_of_publications),
        context: data.context || '',
        month: (data.metadata as any)?.month || '',
        goals: (data.metadata as any)?.goals || [],
        formatCounts: (data.metadata as any)?.formatCounts || {},
        useHealthCalendar: !!(data.metadata as any)?.useHealthCalendar,
        additionalContext: data.context || '',
    } as any, undefined, client);

    // Создаем элементы контент-плана
    const pbItems = await batchCreateContentPlanItems(
        pbGeneration.id,
        items.map(item => ({
            title: item.title,
            format: item.format,
            status: item.status as any,
            painPoint: item.pain_point,
            contentOutline: item.content_outline,
            cta: item.cta,
            publishDate: item.publish_date || undefined,
        })),
        client
    );

    const generation = pbGenerationToGeneration(pbGeneration);
    const contentItems = pbItems.map(pbItemToItem);

    return {
        ...generation,
        items: contentItems,
    };
}

export async function getGenerationById(id: string): Promise<Generation | null> {
    try {
        const pbGen = await getGenerations(undefined, 1, 1);
        // TODO: Implement getOne in pocketbase-service
        return null;
    } catch (error) {
        return null;
    }
}

export async function getAllGenerations(): Promise<Generation[]> {
    const result = await getGenerations(undefined, 1, 100);
    return result.items.map(pbGenerationToGeneration);
}

export async function updateGeneration(
    id: string,
    data: Partial<GenerationInput>
): Promise<Generation> {
    const pbGen = await pbUpdateGeneration(id, {
        specialization: data.specialization,
        purpose: data.purpose,
        contentType: data.content_type,
        numberOfPublications: data.number_of_publications,
        context: data.context || undefined,
    });

    return pbGenerationToGeneration(pbGen);
}

export async function deleteGeneration(id: string): Promise<void> {
    await pbDeleteGeneration(id);
}

export async function getItemsByGenerationId(generationId: string): Promise<ContentPlanItem[]> {
    const result = await getContentPlanItems(generationId);
    return result.items.map(pbItemToItem);
}

export async function updateItemStatus(
    itemId: string,
    status: ContentPlanStatus
): Promise<ContentPlanItem> {
    const pbItem = await updateContentPlanItem(itemId, { status: status as any });
    return pbItemToItem(pbItem);
}

export async function updateItem(
    itemId: string,
    data: ContentPlanItemUpdate
): Promise<ContentPlanItem> {
    const pbItem = await updateContentPlanItem(itemId, {
        title: data.title,
        format: data.format,
        status: data.status as any,
        painPoint: data.pain_point,
        contentOutline: data.content_outline,
        cta: data.cta,
        publishDate: data.publish_date || undefined,
    });
    return pbItemToItem(pbItem);
}

export async function deleteItem(itemId: string): Promise<void> {
    await deleteContentPlanItem(itemId);
}

// Health Calendar transformation and access

function pbHealthEventToHealthEvent(
    pbEvent: import('../pocketbase-types').PBHealthCalendarEvent,
    months?: import('../pocketbase-types').PBMonth[]
): import('../types').HealthCalendarEvent {
    const month = months?.find(m => m.id === pbEvent.monthId)?.name as any || 'Janeiro';

    return {
        id: pbEvent.id,
        month: month,
        monthId: pbEvent.monthId,
        eventName: pbEvent.eventName,
        description: pbEvent.description,
        date: pbEvent.date,
        year: pbEvent.year,
        color: pbEvent.color,
        isActive: pbEvent.isActive,
        specializationId: pbEvent.specializationId,
        source: pbEvent.source,
        notes: pbEvent.notes,
        created_at: pbEvent.created,
        updated_at: pbEvent.updated,
    };
}

export async function getHealthCalendarEvents(): Promise<import('../types').HealthCalendarEvent[]> {
    const months = await getMonths();
    const result = await pbGetHealthCalendarEvents(1, 1000);
    return result.items.map((e: import('../pocketbase-types').PBHealthCalendarEvent) => pbHealthEventToHealthEvent(e, months));
}

export async function createHealthCalendarEvent(
    data: Partial<import('../pocketbase-types').PBHealthCalendarEvent>
): Promise<import('../types').HealthCalendarEvent> {
    const pbEvent = await pbCreateHealthCalendarEvent(data);
    const months = await getMonths();
    return pbHealthEventToHealthEvent(pbEvent, months);
}

export async function updateHealthCalendarEvent(
    id: string,
    data: Partial<import('../pocketbase-types').PBHealthCalendarEvent>
): Promise<import('../types').HealthCalendarEvent> {
    const pbEvent = await pbUpdateHealthCalendarEvent(id, data);
    const months = await getMonths();
    return pbHealthEventToHealthEvent(pbEvent, months);
}

export async function deleteHealthCalendarEvent(id: string): Promise<void> {
    await pbDeleteHealthCalendarEvent(id);
}

export async function getAllMonths(): Promise<import('../pocketbase-types').PBMonth[]> {
    return getMonths();
}
