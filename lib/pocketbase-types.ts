/**
 * PocketBase Collection Types
 * These types represent the structure of data stored in PocketBase
 */

/**
 * Base record type with PocketBase system fields
 */
export interface PocketBaseRecord {
    id: string;
    created: string;
    updated: string;
    collectionId: string;
    collectionName: string;
}

/**
 * Generation record in PocketBase
 * Represents a content plan generation
 */
export interface PBGeneration extends PocketBaseRecord {
    // User/Organization info
    userId?: string;
    organizationId?: string;

    // Generation metadata
    title: string;
    specialization: string;
    purpose?: string;
    contentType?: string;
    numberOfPublications: number;
    context?: string;

    // Medical-specific fields
    month?: string;
    goals?: any[]; // JSON array of goals
    formatCounts?: Record<string, number>; // JSON object with format counts
    useHealthCalendar?: boolean;

    // Status
    status: 'draft' | 'generated' | 'completed';

    // Timestamps
    generatedAt?: string;
}

/**
 * Content Plan Item record in PocketBase
 * Represents individual posts in a content plan
 */
export interface PBContentPlanItem extends PocketBaseRecord {
    // Reference to generation
    generationId: string;

    // Content details
    title: string;
    format: 'Reels' | 'Carrossel' | 'Post Estático' | 'Stories' | 'Live/Collab';
    status: 'draft' | 'approved' | 'generated';
    publishDate?: string;

    // Content structure
    painPoint?: string;
    cta?: string;
    contentOutline?: string;

    // Additional metadata
    metadata?: any; // JSON object for additional data
}

/**
 * User record in PocketBase
 */
export interface PBUser extends PocketBaseRecord {
    email: string;
    name?: string;
    avatar?: string;
    verified: boolean;
}

/**
 * Medical Specialization record in PocketBase
 */
export interface PBMedicalSpecialization extends PocketBaseRecord {
    name: string;
    nameEn?: string;
    slug: string;
    icon?: string;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

/**
 * Content Goal record in PocketBase
 */
export interface PBContentGoal extends PocketBaseRecord {
    name: string;
    nameEn?: string;
    slug: string;
    description?: string;
    defaultWeight: number;
    isActive: boolean;
    sortOrder: number;
}

/**
 * Instagram Format record in PocketBase
 */
export interface PBInstagramFormat extends PocketBaseRecord {
    name: string;
    nameEn?: string;
    slug: string;
    icon?: string;
    description?: string;
    defaultCount: number;
    isActive: boolean;
    sortOrder: number;
}

/**
 * Month record in PocketBase
 */
export interface PBMonth extends PocketBaseRecord {
    name: string;
    nameEn?: string;
    number: number;
    slug: string;
    isActive: boolean;
}

/**
 * Health Calendar Event record in PocketBase
 */
export interface PBHealthCalendarEvent extends PocketBaseRecord {
    monthId: string;
    specializationId?: string;
    eventName: string;
    eventNameEn?: string;
    description: string;
    descriptionEn?: string;
    color?: string;
    date?: string;
    year: number;
    isActive: boolean;
    source?: 'manual' | 'official';
    notes?: string;
}

/**
 * Collection names as constants
 */
export const COLLECTIONS = {
    GENERATIONS: 'generations',
    CONTENT_PLAN_ITEMS: 'content_plan_items',
    USERS: 'users',
    MEDICAL_SPECIALIZATIONS: 'medical_specializations',
    CONTENT_GOALS: 'content_goals',
    INSTAGRAM_FORMATS: 'instagram_formats',
    MONTHS: 'months',
    HEALTH_CALENDAR_EVENTS: 'health_calendar_events',
} as const;

/**
 * Helper type for collection names
 */
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

