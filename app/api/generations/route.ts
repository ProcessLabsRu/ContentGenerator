import { createAuthenticatedPocketBase } from '@/lib/pocketbase';
import { NextRequest, NextResponse } from 'next/server';
import {
  createGeneration,
  getAllGenerations,
} from '@/lib/db/adapter';
import {
  GenerationInput,
  ContentPlanItemInput,
  ApiResponse,
  ApiErrorResponse,
} from '@/lib/types';

export async function GET() {
  try {
    const generations = await getAllGenerations();

    return NextResponse.json<ApiResponse<typeof generations>>({
      data: generations,
    });
  } catch (error: any) {
    console.error('Error fetching generations:', error);
    return NextResponse.json<ApiErrorResponse>(
      {
        error: {
          message: error.message || 'Failed to fetch generations',
          code: 'FETCH_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (
      !body.generation ||
      !body.items ||
      !Array.isArray(body.items)
    ) {
      return NextResponse.json<ApiErrorResponse>(
        {
          error: {
            message: 'Invalid request body. Expected { generation: GenerationInput, items: ContentPlanItemInput[] }',
            code: 'VALIDATION_ERROR',
          },
        },
        { status: 400 }
      );
    }

    const generationInput: GenerationInput = {
      title: body.generation.title || '',
      specialization: body.generation.specialization,
      purpose: body.generation.purpose,
      content_type: body.generation.contentType || body.generation.content_type,
      number_of_publications: body.generation.numberOfPublications || body.generation.number_of_publications,
      context: body.generation.context || null,
      metadata: body.generation.metadata || {},
    };

    const itemsInput: ContentPlanItemInput[] = body.items.map((item: any) => ({
      format: item.format,
      title: item.title,
      pain_point: item.pain_point || item.painPoint || '',
      content_outline: item.content_outline || item.contentOutline || '',
      cta: item.cta || '',
      status: item.status || 'draft',
      publish_date: item.publish_date || item.publishDate || null,
    }));

    const cookieHeader = request.headers.get('cookie') || '';
    const pb = createAuthenticatedPocketBase(cookieHeader);

    const created = await createGeneration(generationInput, itemsInput, pb);

    return NextResponse.json<ApiResponse<typeof created>>(
      {
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating generation:', error);
    return NextResponse.json<ApiErrorResponse>(
      {
        error: {
          message: error.message || 'Failed to create generation',
          code: 'CREATE_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
