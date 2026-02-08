export type ContentPlanStatus = "Rascunho" | "Aprovado" | "Gerado";

export interface ContentPlanItem {
  id: string;
  generation_id?: string; // Optional for backward compatibility
  format: 'Reels' | 'Carrossel' | 'Post Estático' | 'Stories' | 'Live/Collab';
  title: string;
  pain_point: string;
  content_outline: string;
  cta: string;
  status: ContentPlanStatus;
  publish_date?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Input type for creating content plan items (without id, timestamps)
export interface ContentPlanItemInput {
  format: 'Reels' | 'Carrossel' | 'Post Estático' | 'Stories' | 'Live/Collab';
  title: string;
  pain_point: string;
  content_outline: string;
  cta: string;
  status?: ContentPlanStatus;
  publish_date?: string | null;
}

export interface ContentPlanItemUpdate {
  id: string;
  format?: 'Reels' | 'Carrossel' | 'Post Estático' | 'Stories' | 'Live/Collab';
  title?: string;
  pain_point?: string;
  content_outline?: string;
  cta?: string;
  status?: ContentPlanStatus;
  publish_date?: string | null;
}

export interface GenerationFormData {
  title: string;
  specialization: string;
  purpose: string;
  contentType: string;
  numberOfPublications: number;
  context?: string;
}

// Medical Specializations for Instagram Content
export type MedicalSpecialization =
  | "Mamografia/Mastologia"
  | "Odontologia"
  | "Ginecologia e Obstetrícia"
  | "Dermatologia"
  | "Pediatria"
  | "Cardiologia"
  | "Ortopedia"
  | "Oftalmologia"
  | "Endocrinologia"
  | "Nutrologia/Nutrição";

// Months in Portuguese
export type MonthOption =
  | "Janeiro"
  | "Fevereiro"
  | "Março"
  | "Abril"
  | "Maio"
  | "Junho"
  | "Julho"
  | "Agosto"
  | "Setembro"
  | "Outubro"
  | "Novembro"
  | "Dezembro";

// Content Goals (Objetivos)
export type ContentGoal =
  | "Conversão"
  | "Autoridade"
  | "Crescimento"
  | "Educação"
  | "Engajamento";

// Instagram Content Formats
export type InstagramFormat =
  | "Reels"
  | "Carrossel"
  | "Post Estático"
  | "Stories"
  | "Live/Collab";

// Format counts for Instagram
export interface FormatCounts {
  reels: number;
  carrossel: number;
  postEstatico: number;
  stories: number;
  liveCollab: number;
}

// Medical Content Plan Form Data
export interface MedicalContentFormData {
  title: string;
  specialization: MedicalSpecialization | "";
  month: MonthOption | "";
  goals: ContentGoal[];
  formatCounts: FormatCounts;
  additionalContext: string;
  useHealthCalendar: boolean;
  totalPublications: number;
}

// Health Calendar Event
export interface HealthCalendarEvent {
  id?: string;
  month: MonthOption;
  monthId?: string;
  specialization?: MedicalSpecialization | null;
  specializationId?: string;
  eventName: string;
  description: string;
  date?: string;
  color?: string;
  isActive?: boolean;
  source?: 'manual' | 'official';
  notes?: string;
  type?: 'day' | 'month';
  isRecurring?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Legacy types (keeping for backward compatibility)
export type SpecializationOption =
  | "Digital Marketing"
  | "SaaS"
  | "E-commerce"
  | "Healthcare"
  | "Education"
  | "Finance"
  | "Technology"
  | "Real Estate"
  | "Direct Access/PostgreSQL";

export type PurposeOption =
  | "Lead Generation"
  | "Brand Awareness"
  | "Thought Leadership"
  | "Customer Education"
  | "Product Launch"
  | "Customer Retention"
  | "Community Building";

export type ContentTypeOption =
  | "Educational"
  | "Promotional"
  | "Entertainment"
  | "Case Study"
  | "How-to Guide"
  | "News & Updates"
  | "Comparison"
  | "Review";

// Database types
export interface Generation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  specialization: string;
  purpose: string;
  content_type: string;
  number_of_publications: number;
  context: string | null;
  metadata?: Record<string, unknown>;
  items?: ContentPlanItem[]; // Optional: items can be loaded separately
}

// Input type for creating a generation (without id, created_at)
export interface GenerationInput {
  title: string;
  specialization: string;
  purpose: string;
  content_type: string;
  number_of_publications: number;
  context?: string | null;
  metadata?: Record<string, unknown>;
}

// Complete generation with items for API responses
export interface GenerationWithItems extends Generation {
  items: ContentPlanItem[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  error?: never;
}

export interface ApiErrorResponse {
  data?: never;
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
}export type ApiResult<T> = ApiResponse<T> | ApiErrorResponse;
