import { getPocketBase } from './pocketbase';
import {
    PBMedicalSpecialization,
    PBContentGoal,
    PBInstagramFormat,
    PBMonth,
    PBHealthCalendarEvent,
    COLLECTIONS
} from './pocketbase-types';

/**
 * Сервис для работы со справочниками PocketBase
 */

// Кэш для справочников (чтобы не загружать каждый раз)
let cache: {
    specializations?: PBMedicalSpecialization[];
    goals?: PBContentGoal[];
    formats?: PBInstagramFormat[];
    months?: PBMonth[];
    healthEvents?: PBHealthCalendarEvent[];
    lastUpdate?: number;
} = {};

const CACHE_TTL = 5 * 60 * 1000; // 5 минут

/**
 * Проверяет, актуален ли кэш
 */
function isCacheValid(): boolean {
    if (!cache.lastUpdate) return false;
    return Date.now() - cache.lastUpdate < CACHE_TTL;
}

/**
 * Очищает кэш справочников
 */
export function clearDictionariesCache(): void {
    cache = {};
}

/**
 * Получить все медицинские специализации
 */
export async function getMedicalSpecializations(
    forceRefresh = false
): Promise<PBMedicalSpecialization[]> {
    if (!forceRefresh && cache.specializations && isCacheValid()) {
        return cache.specializations;
    }

    try {
        const pb = getPocketBase();
        const records = await pb.collection(COLLECTIONS.MEDICAL_SPECIALIZATIONS).getFullList<PBMedicalSpecialization>({
            filter: 'isActive = true',
            sort: 'sortOrder'
        });

        cache.specializations = records;
        cache.lastUpdate = Date.now();
        return records;
    } catch (error) {
        console.error('Erro ao carregar especializações:', error);
        return cache.specializations || [];
    }
}

/**
 * Получить специализацию по slug
 */
export async function getMedicalSpecializationBySlug(
    slug: string
): Promise<PBMedicalSpecialization | null> {
    const specializations = await getMedicalSpecializations();
    return specializations.find(s => s.slug === slug) || null;
}

/**
 * Получить все цели контента
 */
export async function getContentGoals(
    forceRefresh = false
): Promise<PBContentGoal[]> {
    if (!forceRefresh && cache.goals && isCacheValid()) {
        return cache.goals;
    }

    try {
        const pb = getPocketBase();
        const records = await pb.collection(COLLECTIONS.CONTENT_GOALS).getFullList<PBContentGoal>({
            filter: 'isActive = true',
            sort: 'sortOrder'
        });

        cache.goals = records;
        cache.lastUpdate = Date.now();
        return records;
    } catch (error) {
        console.error('Erro ao carregar objetivos:', error);
        return cache.goals || [];
    }
}

/**
 * Получить цель по slug
 */
export async function getContentGoalBySlug(
    slug: string
): Promise<PBContentGoal | null> {
    const goals = await getContentGoals();
    return goals.find(g => g.slug === slug) || null;
}

/**
 * Получить все форматы Instagram
 */
export async function getInstagramFormats(
    forceRefresh = false
): Promise<PBInstagramFormat[]> {
    if (!forceRefresh && cache.formats && isCacheValid()) {
        return cache.formats;
    }

    try {
        const pb = getPocketBase();
        const records = await pb.collection(COLLECTIONS.INSTAGRAM_FORMATS).getFullList<PBInstagramFormat>({
            filter: 'isActive = true',
            sort: 'sortOrder'
        });

        cache.formats = records;
        cache.lastUpdate = Date.now();
        return records;
    } catch (error) {
        console.error('Erro ao carregar formatos:', error);
        return cache.formats || [];
    }
}

/**
 * Получить формат по slug
 */
export async function getInstagramFormatBySlug(
    slug: string
): Promise<PBInstagramFormat | null> {
    const formats = await getInstagramFormats();
    return formats.find(f => f.slug === slug) || null;
}

/**
 * Получить все месяцы
 */
export async function getMonths(
    forceRefresh = false
): Promise<PBMonth[]> {
    if (!forceRefresh && cache.months && isCacheValid()) {
        return cache.months;
    }

    try {
        const pb = getPocketBase();
        const records = await pb.collection(COLLECTIONS.MONTHS).getFullList<PBMonth>({
            filter: 'isActive = true',
            sort: 'number'
        });

        cache.months = records;
        cache.lastUpdate = Date.now();
        return records;
    } catch (error) {
        console.error('Erro ao carregar meses:', error);
        return cache.months || [];
    }
}

/**
 * Получить месяц по номеру
 */
export async function getMonthByNumber(
    number: number
): Promise<PBMonth | null> {
    const months = await getMonths();
    return months.find(m => m.number === number) || null;
}

/**
 * Получить месяц по slug
 */
export async function getMonthBySlug(
    slug: string
): Promise<PBMonth | null> {
    const months = await getMonths();
    return months.find(m => m.slug === slug) || null;
}

/**
 * Получить события календаря здоровья
 */
export async function getHealthCalendarEvents(
    monthId?: string,
    specializationId?: string,
    year?: number,
    forceRefresh = false
): Promise<PBHealthCalendarEvent[]> {
    if (!forceRefresh && cache.healthEvents && isCacheValid() && !monthId && !specializationId && !year) {
        return cache.healthEvents;
    }

    try {
        const pb = getPocketBase();

        // Строим фильтр
        const filters: string[] = ['isActive = true'];
        if (monthId) filters.push(`monthId = "${monthId}"`);
        if (specializationId) filters.push(`specializationId = "${specializationId}"`);
        if (year) filters.push(`year = ${year}`);

        const records = await pb.collection(COLLECTIONS.HEALTH_CALENDAR_EVENTS).getFullList<PBHealthCalendarEvent>({
            filter: filters.join(' && '),
            expand: 'monthId,specializationId'
        });

        // Кэшируем только если нет фильтров
        if (!monthId && !specializationId && !year) {
            cache.healthEvents = records;
            cache.lastUpdate = Date.now();
        }

        return records;
    } catch (error) {
        console.error('Erro ao carregar eventos do calendário:', error);
        return cache.healthEvents || [];
    }
}

/**
 * Получить события календаря по названию месяца
 */
export async function getHealthCalendarEventsByMonth(
    monthName: string,
    specializationName?: string,
    year = 2025
): Promise<PBHealthCalendarEvent[]> {
    // Получаем ID месяца
    const months = await getMonths();
    const month = months.find(m => m.name === monthName);
    if (!month) return [];

    // Получаем ID специализации (если указана)
    let specializationId: string | undefined;
    if (specializationName) {
        const specializations = await getMedicalSpecializations();
        const specialization = specializations.find(s => s.name === specializationName);
        specializationId = specialization?.id;
    }

    return getHealthCalendarEvents(month.id, specializationId, year);
}

/**
 * Получить предстоящие события календаря
 */
export async function getUpcomingHealthEvents(
    currentMonthNumber: number,
    specializationName?: string,
    limit = 3,
    year = 2025
): Promise<PBHealthCalendarEvent[]> {
    const months = await getMonths();

    // Сортируем месяцы начиная с текущего
    const sortedMonths = [
        ...months.filter(m => m.number >= currentMonthNumber),
        ...months.filter(m => m.number < currentMonthNumber)
    ];

    // Получаем ID специализации (если указана)
    let specializationId: string | undefined;
    if (specializationName) {
        const specializations = await getMedicalSpecializations();
        const specialization = specializations.find(s => s.name === specializationName);
        specializationId = specialization?.id;
    }

    const events: PBHealthCalendarEvent[] = [];

    for (const month of sortedMonths) {
        const monthEvents = await getHealthCalendarEvents(month.id, specializationId, year);
        events.push(...monthEvents);

        if (events.length >= limit) {
            break;
        }
    }

    return events.slice(0, limit);
}

/**
 * Загрузить все справочники одновременно
 */
export async function loadAllDictionaries(forceRefresh = false): Promise<{
    specializations: PBMedicalSpecialization[];
    goals: PBContentGoal[];
    formats: PBInstagramFormat[];
    months: PBMonth[];
}> {
    const [specializations, goals, formats, months] = await Promise.all([
        getMedicalSpecializations(forceRefresh),
        getContentGoals(forceRefresh),
        getInstagramFormats(forceRefresh),
        getMonths(forceRefresh)
    ]);

    return { specializations, goals, formats, months };
}
