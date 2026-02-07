import PocketBase from 'pocketbase';
import { getPocketBase, getPocketBaseUrl } from './pocketbase';
import {
    PBGeneration,
    PBContentPlanItem,
    PBHealthCalendarEvent,
    PBMonth,
    COLLECTIONS,
} from './pocketbase-types';
import { MedicalContentFormData } from './types';

/**
 * PocketBase Service
 * Provides methods for interacting with PocketBase collections
 */

/**
 * Create a new generation record
 */
export async function createGeneration(
    formData: MedicalContentFormData,
    userId?: string,
    client?: PocketBase
): Promise<PBGeneration> {
    const pb = client || getPocketBase();

    const record = await pb.collection(COLLECTIONS.GENERATIONS).create<PBGeneration>({
        userId,
        title: (formData as any).title || formData.specialization || 'Content Plan',
        specialization: formData.specialization,
        month: formData.month,
        goals: formData.goals,
        formatCounts: formData.formatCounts,
        useHealthCalendar: formData.useHealthCalendar,
        context: formData.additionalContext,
        numberOfPublications: (formData as any).numberOfPublications
            ? Number((formData as any).numberOfPublications)
            : (typeof formData.formatCounts === 'object' && formData.formatCounts !== null
                ? Object.values(formData.formatCounts).reduce((sum, val) => sum + (Number(val) || 0), 0)
                : 1),
        status: 'draft',
    });

    return record;
}



/**
 * Batch create content plan items
 */
export async function batchCreateContentPlanItems(
    generationId: string,
    items: Array<Omit<PBContentPlanItem, keyof import('./pocketbase-types').PocketBaseRecord | 'generationId'>>,
    client?: PocketBase
): Promise<PBContentPlanItem[]> {
    const pb = client || getPocketBase();

    const promises = items.map(item =>
        pb.collection(COLLECTIONS.CONTENT_PLAN_ITEMS).create<PBContentPlanItem>({
            generationId,
            ...item,
        }).catch(err => {
            console.error('Error creating item:', item.title, err.response || err);
            throw err;
        })
    );

    return await Promise.all(promises);
}

/**
 * Get all generations
 */
export async function getGenerations(
    userId?: string,
    page = 1,
    perPage = 50
): Promise<{ items: PBGeneration[]; totalItems: number; totalPages: number }> {
    const pb = getPocketBase();

    const filter = userId ? `userId = "${userId}"` : '';

    const result = await pb.collection(COLLECTIONS.GENERATIONS).getList<PBGeneration>(page, perPage, {
        filter,
        sort: '-created',
    });

    return {
        items: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
    };
}

/**
 * Get a single generation by ID
 */
export async function getGeneration(id: string): Promise<PBGeneration> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.GENERATIONS).getOne<PBGeneration>(id);
}

/**
 * Update a generation
 */
export async function updateGeneration(
    id: string,
    data: Partial<PBGeneration>
): Promise<PBGeneration> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.GENERATIONS).update<PBGeneration>(id, data);
}

/**
 * Delete a generation
 */
export async function deleteGeneration(id: string): Promise<boolean> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.GENERATIONS).delete(id);
}

/**
 * Create a content plan item
 */
export async function createContentPlanItem(
    generationId: string,
    itemData: Omit<PBContentPlanItem, keyof import('./pocketbase-types').PocketBaseRecord | 'generationId'>
): Promise<PBContentPlanItem> {
    const pb = getPocketBase();

    const record = await pb.collection(COLLECTIONS.CONTENT_PLAN_ITEMS).create<PBContentPlanItem>({
        generationId,
        ...itemData,
    });

    return record;
}

/**
 * Get content plan items for a generation
 */
export async function getContentPlanItems(
    generationId?: string,
    page = 1,
    perPage = 100
): Promise<{ items: PBContentPlanItem[]; totalItems: number }> {
    const pb = getPocketBase();

    const options: any = {
        sort: 'publishDate',
    };

    if (generationId) {
        options.filter = `generationId = "${generationId}"`;
    }

    const result = await pb.collection(COLLECTIONS.CONTENT_PLAN_ITEMS).getList<PBContentPlanItem>(
        page,
        perPage,
        options
    );

    return {
        items: result.items,
        totalItems: result.totalItems,
    };
}

/**
 * Update a content plan item
 */
export async function updateContentPlanItem(
    id: string,
    data: Partial<PBContentPlanItem>
): Promise<PBContentPlanItem> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.CONTENT_PLAN_ITEMS).update<PBContentPlanItem>(id, data);
}

/**
 * Delete a content plan item
 */
export async function deleteContentPlanItem(id: string): Promise<boolean> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.CONTENT_PLAN_ITEMS).delete(id);
}



/**
 * Check PocketBase connection
 */
export async function checkPocketBaseConnection(): Promise<boolean> {
    try {
        const pb = getPocketBase();
        // Используем простой запрос к API вместо admin health check
        // Пробуем получить список коллекций (публичный endpoint)
        await pb.collection('medical_specializations').getList(1, 1);
        return true;
    } catch (error) {
        console.error('PocketBase connection error:', error);
        return false;
    }
}

/**
 * Health Calendar Events methods
 */

export async function getHealthCalendarEvents(
    page = 1,
    perPage = 500
): Promise<{ items: PBHealthCalendarEvent[]; totalItems: number }> {
    const pb = getPocketBase();
    const result = await pb.collection(COLLECTIONS.HEALTH_CALENDAR_EVENTS).getList<PBHealthCalendarEvent>(page, perPage, {
        sort: 'monthId,date',
    });
    return {
        items: result.items,
        totalItems: result.totalItems,
    };
}

export async function createHealthCalendarEvent(
    data: Partial<PBHealthCalendarEvent>
): Promise<PBHealthCalendarEvent> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.HEALTH_CALENDAR_EVENTS).create<PBHealthCalendarEvent>(data);
}

export async function updateHealthCalendarEvent(
    id: string,
    data: Partial<PBHealthCalendarEvent>
): Promise<PBHealthCalendarEvent> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.HEALTH_CALENDAR_EVENTS).update<PBHealthCalendarEvent>(id, data);
}

export async function deleteHealthCalendarEvent(id: string): Promise<boolean> {
    const pb = getPocketBase();
    return await pb.collection(COLLECTIONS.HEALTH_CALENDAR_EVENTS).delete(id);
}

export async function getMonths(): Promise<import('./pocketbase-types').PBMonth[]> {
    const pb = getPocketBase();
    const result = await pb.collection(COLLECTIONS.MONTHS).getFullList<import('./pocketbase-types').PBMonth>();
    return result;
}

// Re-export utility functions
export { getPocketBaseUrl };
