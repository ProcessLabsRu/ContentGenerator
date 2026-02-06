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
        metadata: pbGen.goals ? { goals: pbGen.goals } : {},
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
        is_approved: pbItem.approved || false,
        created_at: pbItem.created,
        updated_at: pbItem.updated,
    };
}

export async function createGeneration(
    data: GenerationInput,
    items: ContentPlanItemInput[]
): Promise<GenerationWithItems> {
    // Создаем генерацию
    const pbGeneration = await pbCreateGeneration({
        title: data.title,
        specialization: data.specialization,
        purpose: data.purpose,
        contentType: data.content_type,
        numberOfPublications: data.number_of_publications,
        context: data.context || '',
        month: '',
        goals: [],
        formatCounts: {},
        useHealthCalendar: false,
        additionalContext: data.context || '',
    } as any);

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
            approved: !!item.is_approved,
        }))
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
        approved: data.is_approved,
    });
    return pbItemToItem(pbItem);
}
