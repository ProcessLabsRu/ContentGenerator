import { PoolClient } from 'pg';
import { getPool, withTransaction } from './client';
import {
  Generation,
  GenerationInput,
  GenerationWithItems,
  ContentPlanItem,
  ContentPlanItemInput,
  ContentPlanStatus,
  ContentPlanItemUpdate,
} from '../types';

const padDatePart = (value: number) => value.toString().padStart(2, '0');

// Helper to map database row to Generation
function mapRowToGeneration(row: any): Generation {
  return {
    id: row.id,
    title: row.title || '',
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at?.toISOString() || row.created_at.toISOString(),
    specialization: row.specialization,
    purpose: row.purpose,
    content_type: row.content_type,
    number_of_publications: row.number_of_publications,
    context: row.context,
    metadata: row.metadata || {},
  };
}

// Helper to map database row to ContentPlanItem
function mapRowToContentPlanItem(row: any): ContentPlanItem {
  const publishDate =
    row.publish_date instanceof Date
      ? row.publish_date
      : row.publish_date
        ? new Date(row.publish_date)
        : null;
  const hasValidPublishDate =
    publishDate && !Number.isNaN(publishDate.getTime());

  return {
    id: row.id,
    generation_id: row.generation_id,
    format: row.format,
    title: row.title,
    pain_point: row.pain_point || '',
    content_outline: row.content_outline || '',
    cta: row.cta || '',
    status: row.status as ContentPlanStatus,
    publish_date: hasValidPublishDate
      ? `${publishDate.getFullYear()}-${padDatePart(
        publishDate.getMonth() + 1
      )}-${padDatePart(publishDate.getDate())}`
      : null,
    is_approved: row.is_approved ?? false,
    created_at: row.created_at?.toISOString(),
    updated_at: row.updated_at?.toISOString(),
  };
}

export async function createGeneration(
  data: GenerationInput,
  items: ContentPlanItemInput[]
): Promise<GenerationWithItems> {
  return withTransaction(async (client: PoolClient) => {
    // Insert generation
    const generationResult = await client.query(
      `INSERT INTO generations (title, specialization, purpose, content_type, number_of_publications, context, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.title,
        data.specialization,
        data.purpose,
        data.content_type,
        data.number_of_publications,
        data.context || null,
        JSON.stringify(data.metadata || {}),
      ]
    );

    const generation = mapRowToGeneration(generationResult.rows[0]);

    // Insert items
    if (items.length > 0) {
      const itemPlaceholders: string[] = [];
      const itemValues: any[] = [];

      items.forEach((item, index) => {
        const baseIndex = index * 9;
        itemPlaceholders.push(
          `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4}, $${baseIndex + 5}, $${baseIndex + 6}, $${baseIndex + 7}, $${baseIndex + 8}, $${baseIndex + 9})`
        );
        itemValues.push(
          generation.id,
          item.format,
          item.title,
          item.pain_point || null,
          item.content_outline || null,
          item.cta || null,
          item.status || 'draft',
          item.publish_date || null,
          item.is_approved ?? false
        );
      });

      await client.query(
        `INSERT INTO content_plan_items (generation_id, format, title, pain_point, content_outline, cta, status, publish_date, is_approved)
         VALUES ${itemPlaceholders.join(', ')}`,
        itemValues
      );
    }

    // Fetch the created items
    const itemsResult = await client.query(
      'SELECT * FROM content_plan_items WHERE generation_id = $1 ORDER BY created_at',
      [generation.id]
    );

    const createdItems = itemsResult.rows.map(mapRowToContentPlanItem);

    return {
      ...generation,
      items: createdItems,
    };
  });
}

export async function getGenerationById(id: string): Promise<Generation | null> {
  const pool = getPool();
  const result = await pool.query('SELECT * FROM generations WHERE id = $1', [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return mapRowToGeneration(result.rows[0]);
}

export async function getAllGenerations(): Promise<Generation[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM generations ORDER BY created_at DESC'
  );

  return result.rows.map(mapRowToGeneration);
}

export async function updateGeneration(
  id: string,
  data: Partial<GenerationInput>
): Promise<Generation> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.specialization !== undefined) {
    updates.push(`specialization = $${paramIndex++}`);
    values.push(data.specialization);
  }
  if (data.purpose !== undefined) {
    updates.push(`purpose = $${paramIndex++}`);
    values.push(data.purpose);
  }
  if (data.content_type !== undefined) {
    updates.push(`content_type = $${paramIndex++}`);
    values.push(data.content_type);
  }
  if (data.number_of_publications !== undefined) {
    updates.push(`number_of_publications = $${paramIndex++}`);
    values.push(data.number_of_publications);
  }
  if (data.context !== undefined) {
    updates.push(`context = $${paramIndex++}`);
    values.push(data.context);
  }
  if (data.metadata !== undefined) {
    updates.push(`metadata = $${paramIndex++}`);
    values.push(JSON.stringify(data.metadata));
  }

  if (updates.length === 0) {
    const existing = await getGenerationById(id);
    if (!existing) {
      throw new Error(`Generation with id ${id} not found`);
    }
    return existing;
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE generations SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error(`Generation with id ${id} not found`);
  }

  return mapRowToGeneration(result.rows[0]);
}

export async function deleteGeneration(id: string): Promise<void> {
  const pool = getPool();
  const result = await pool.query('DELETE FROM generations WHERE id = $1', [id]);

  if (result.rowCount === 0) {
    throw new Error(`Generation with id ${id} not found`);
  }
}

export async function getItemsByGenerationId(generationId: string): Promise<ContentPlanItem[]> {
  const pool = getPool();
  const result = await pool.query(
    'SELECT * FROM content_plan_items WHERE generation_id = $1 ORDER BY created_at',
    [generationId]
  );

  return result.rows.map(mapRowToContentPlanItem);
}

export async function updateItemStatus(
  itemId: string,
  status: ContentPlanStatus
): Promise<ContentPlanItem> {
  const pool = getPool();
  const result = await pool.query(
    'UPDATE content_plan_items SET status = $1 WHERE id = $2 RETURNING *',
    [status, itemId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Content plan item with id ${itemId} not found`);
  }

  return mapRowToContentPlanItem(result.rows[0]);
}

export async function updateItem(
  itemId: string,
  data: ContentPlanItemUpdate
): Promise<ContentPlanItem> {
  const pool = getPool();
  const updates: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (data.format !== undefined) {
    updates.push(`format = $${paramIndex++}`);
    values.push(data.format);
  }
  if (data.title !== undefined) {
    updates.push(`title = $${paramIndex++}`);
    values.push(data.title);
  }
  if (data.pain_point !== undefined) {
    updates.push(`pain_point = $${paramIndex++}`);
    values.push(data.pain_point);
  }
  if (data.content_outline !== undefined) {
    updates.push(`content_outline = $${paramIndex++}`);
    values.push(data.content_outline);
  }
  if (data.cta !== undefined) {
    updates.push(`cta = $${paramIndex++}`);
    values.push(data.cta);
  }
  if (data.status !== undefined) {
    updates.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.publish_date !== undefined) {
    updates.push(`publish_date = $${paramIndex++}`);
    values.push(data.publish_date);
  }
  if (data.is_approved !== undefined) {
    updates.push(`is_approved = $${paramIndex++}`);
    values.push(data.is_approved);
  }

  if (updates.length === 0) {
    const result = await pool.query(
      'SELECT * FROM content_plan_items WHERE id = $1',
      [itemId]
    );
    if (result.rows.length === 0) {
      throw new Error(`Content plan item with id ${itemId} not found`);
    }
    return mapRowToContentPlanItem(result.rows[0]);
  }

  values.push(itemId);
  const result = await pool.query(
    `UPDATE content_plan_items SET ${updates.join(
      ', '
    )} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    throw new Error(`Content plan item with id ${itemId} not found`);
  }

  return mapRowToContentPlanItem(result.rows[0]);
}
