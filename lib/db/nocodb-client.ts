import { getValidatedConfig } from '../config';
import {
  Generation,
  GenerationInput,
  GenerationWithItems,
  ContentPlanItem,
  ContentPlanItemInput,
  ContentPlanStatus,
  ContentPlanItemUpdate,
} from '../types';

interface NocoDBResponse<T> {
  list: T[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalRows: number;
    isFirstPage: boolean;
    isLastPage: boolean;
  };
}

interface NocoDBRecord {
  Id: string;
  CreatedAt: string;
  [key: string]: any;
}

class NocoDBClient {
  private apiUrl: string;
  private apiToken: string;
  private baseId: string;
  private generationsTableId: string;
  private itemsTableId: string;

  constructor() {
    const config = getValidatedConfig();

    if (config.provider !== 'nocodb') {
      throw new Error('NocoDB client can only be used when DATABASE_PROVIDER=nocodb');
    }

    if (!config.nocodb) {
      throw new Error('NocoDB configuration is missing');
    }

    this.apiUrl = config.nocodb.apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiToken = config.nocodb.apiToken;
    this.baseId = config.nocodb.baseId;

    // Table IDs - these should be configured via env or determined via API
    // For now, assuming table names match our schema
    this.generationsTableId = process.env.NOCODB_GENERATIONS_TABLE_ID || 'Generations';
    this.itemsTableId = process.env.NOCODB_ITEMS_TABLE_ID || 'ContentPlanItems';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.apiUrl}/tables/${this.baseId}/${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'xc-token': this.apiToken,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`NocoDB API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    return response.json();
  }

  private mapNocoDBRecordToGeneration(record: NocoDBRecord): Generation {
    return {
      id: record.Id,
      title: record.Title || '',
      created_at: record.CreatedAt || new Date().toISOString(),
      updated_at: record.UpdatedAt || record.CreatedAt || new Date().toISOString(),
      specialization: record.Specialization || '',
      purpose: record.Purpose || '',
      content_type: record.ContentType || '',
      number_of_publications: record.NumberOfPublications || 0,
      context: record.Context || null,
      metadata: record.Metadata || {},
    };
  }

  private mapNocoDBRecordToContentPlanItem(record: NocoDBRecord): ContentPlanItem {
    const isApproved =
      record.IsApproved === true ||
      record.IsApproved === 'true' ||
      record.IsApproved === 1;
    return {
      id: record.Id,
      generation_id: record.GenerationId,
      format: record.Format || '',
      title: record.Title || '',
      pain_point: record.PainPoint || '',
      content_outline: record.ContentOutline || '',
      cta: record.CTA || '',
      status: (record.Status || 'draft') as ContentPlanStatus,
      publish_date: record.PublishDate || null,
      is_approved: isApproved,
      created_at: record.CreatedAt,
      updated_at: record.UpdatedAt,
    };
  }

  private mapGenerationToNocoDBRecord(data: GenerationInput): Record<string, any> {
    return {
      Title: data.title,
      Specialization: data.specialization,
      Purpose: data.purpose,
      ContentType: data.content_type,
      NumberOfPublications: data.number_of_publications,
      Context: data.context || null,
      Metadata: JSON.stringify(data.metadata || {}),
    };
  }

  private mapItemToNocoDBRecord(data: ContentPlanItemInput, generationId: string): Record<string, any> {
    return {
      GenerationId: generationId,
      Format: data.format,
      Title: data.title,
      PainPoint: data.pain_point || null,
      ContentOutline: data.content_outline || null,
      CTA: data.cta || null,
      Status: data.status || 'draft',
      PublishDate: data.publish_date || null,
      IsApproved: data.is_approved ?? false,
    };
  }

  async createGeneration(
    data: GenerationInput,
    items: ContentPlanItemInput[]
  ): Promise<GenerationWithItems> {
    // Create generation
    const generationRecord = this.mapGenerationToNocoDBRecord(data);
    const createResponse = await this.request<NocoDBRecord>(
      `${this.generationsTableId}`,
      {
        method: 'POST',
        body: JSON.stringify(generationRecord),
      }
    );

    const generation = this.mapNocoDBRecordToGeneration(createResponse);

    // Create items
    const createdItems: ContentPlanItem[] = [];

    for (const item of items) {
      const itemRecord = this.mapItemToNocoDBRecord(item, generation.id);
      const itemResponse = await this.request<NocoDBRecord>(
        `${this.itemsTableId}`,
        {
          method: 'POST',
          body: JSON.stringify(itemRecord),
        }
      );
      createdItems.push(this.mapNocoDBRecordToContentPlanItem(itemResponse));
    }

    return {
      ...generation,
      items: createdItems,
    };
  }

  async getGenerationById(id: string): Promise<Generation | null> {
    try {
      const response = await this.request<NocoDBRecord>(
        `${this.generationsTableId}/${id}`
      );
      return this.mapNocoDBRecordToGeneration(response);
    } catch (error: any) {
      if (error.message.includes('404') || error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  async getAllGenerations(): Promise<Generation[]> {
    const response = await this.request<NocoDBResponse<NocoDBRecord>>(
      `${this.generationsTableId}?sort=-CreatedAt`
    );

    return response.list.map((record) => this.mapNocoDBRecordToGeneration(record));
  }

  async updateGeneration(
    id: string,
    data: Partial<GenerationInput>
  ): Promise<Generation> {
    const updateRecord: Record<string, any> = {};

    if (data.specialization !== undefined) updateRecord.Specialization = data.specialization;
    if (data.purpose !== undefined) updateRecord.Purpose = data.purpose;
    if (data.content_type !== undefined) updateRecord.ContentType = data.content_type;
    if (data.number_of_publications !== undefined) updateRecord.NumberOfPublications = data.number_of_publications;
    if (data.context !== undefined) updateRecord.Context = data.context;
    if (data.metadata !== undefined) updateRecord.Metadata = JSON.stringify(data.metadata);

    const response = await this.request<NocoDBRecord>(
      `${this.generationsTableId}/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updateRecord),
      }
    );

    return this.mapNocoDBRecordToGeneration(response);
  }

  async deleteGeneration(id: string): Promise<void> {
    await this.request(
      `${this.generationsTableId}/${id}`,
      {
        method: 'DELETE',
      }
    );
  }

  async getItemsByGenerationId(generationId: string): Promise<ContentPlanItem[]> {
    const response = await this.request<NocoDBResponse<NocoDBRecord>>(
      `${this.itemsTableId}?where=(GenerationId,eq,${generationId})&sort=CreatedAt`
    );

    return response.list.map((record) => this.mapNocoDBRecordToContentPlanItem(record));
  }

  async updateItemStatus(
    itemId: string,
    status: ContentPlanStatus
  ): Promise<ContentPlanItem> {
    const response = await this.request<NocoDBRecord>(
      `${this.itemsTableId}/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ Status: status }),
      }
    );

    return this.mapNocoDBRecordToContentPlanItem(response);
  }

  async updateItem(
    itemId: string,
    data: ContentPlanItemUpdate
  ): Promise<ContentPlanItem> {
    const updateRecord: Record<string, any> = {};

    if (data.format !== undefined) updateRecord.Format = data.format;
    if (data.title !== undefined) updateRecord.Title = data.title;
    if (data.pain_point !== undefined) updateRecord.PainPoint = data.pain_point;
    if (data.content_outline !== undefined)
      updateRecord.ContentOutline = data.content_outline;
    if (data.cta !== undefined) updateRecord.CTA = data.cta;
    if (data.status !== undefined) updateRecord.Status = data.status;
    if (data.publish_date !== undefined)
      updateRecord.PublishDate = data.publish_date;
    if (data.is_approved !== undefined)
      updateRecord.IsApproved = data.is_approved;

    const response = await this.request<NocoDBRecord>(
      `${this.itemsTableId}/${itemId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updateRecord),
      }
    );

    return this.mapNocoDBRecordToContentPlanItem(response);
  }
}

// Export singleton instance
let nocodbClient: NocoDBClient | null = null;

export function getNocoDBClient(): NocoDBClient {
  if (!nocodbClient) {
    nocodbClient = new NocoDBClient();
  }
  return nocodbClient;
}

// Export functions that match the direct-access interface
export async function createGeneration(
  data: GenerationInput,
  items: ContentPlanItemInput[]
): Promise<GenerationWithItems> {
  return getNocoDBClient().createGeneration(data, items);
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  return getNocoDBClient().getGenerationById(id);
}

export async function getAllGenerations(): Promise<Generation[]> {
  return getNocoDBClient().getAllGenerations();
}

export async function updateGeneration(
  id: string,
  data: Partial<GenerationInput>
): Promise<Generation> {
  return getNocoDBClient().updateGeneration(id, data);
}

export async function deleteGeneration(id: string): Promise<void> {
  return getNocoDBClient().deleteGeneration(id);
}

export async function getItemsByGenerationId(generationId: string): Promise<ContentPlanItem[]> {
  return getNocoDBClient().getItemsByGenerationId(generationId);
}

export async function updateItemStatus(
  itemId: string,
  status: ContentPlanStatus
): Promise<ContentPlanItem> {
  return getNocoDBClient().updateItemStatus(itemId, status);
}

export async function updateItem(
  itemId: string,
  data: ContentPlanItemUpdate
): Promise<ContentPlanItem> {
  return getNocoDBClient().updateItem(itemId, data);
}
