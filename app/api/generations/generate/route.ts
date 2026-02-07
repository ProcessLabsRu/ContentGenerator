import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/llm/prompts';
import { createGeneration } from '@/lib/db/adapter';
import { normalizeLLMResponse } from '@/lib/llm/normalization';
import { createAuthenticatedPocketBase } from '@/lib/pocketbase';
import {
    MedicalContentFormData,
    GenerationInput,
    ContentPlanItemInput,
    ApiResponse,
    ApiErrorResponse
} from '@/lib/types';

export async function POST(request: NextRequest) {
    try {
        const formData: MedicalContentFormData = await request.json();

        // 1. Инициализация LLM клиента
        const llmClient = createLLMClient();

        // 2. Подготовка промптов
        const userPrompt = generateUserPrompt(formData);
        const messages = [
            { role: 'system' as const, content: SYSTEM_PROMPT },
            { role: 'user' as const, content: userPrompt }
        ];

        // 3. Генерация контента
        const response = await llmClient.generate(messages);

        // 4. Парсинг и нормализация ответа
        let items: ContentPlanItemInput[] = [];
        try {
            // Пытаемся очистить ответ от возможных markdown тегов, если LLM их добавила
            const jsonMatch = response.content.match(/\[[\s\S]*\]/);
            const jsonStr = jsonMatch ? jsonMatch[0] : response.content;
            const rawItems = JSON.parse(jsonStr);
            console.log(`[API Generate] Raw items from LLM: ${Array.isArray(rawItems) ? rawItems.length : 'not an array'}`);

            // Нормализация данных (включая дату)
            items = normalizeLLMResponse(rawItems, formData.month) as ContentPlanItemInput[];
            console.log(`[API Generate] Normalized items: ${items.length}, first date: ${items[0]?.publish_date}`);
        } catch (parseError) {
            console.error('Failed to parse LLM response as JSON:', response.content);
            return NextResponse.json<ApiErrorResponse>({
                error: {
                    message: 'Сгенерированный контент имеет неверный формат. Попробуйте еще раз.',
                    code: 'PARSE_ERROR'
                }
            }, { status: 500 });
        }

        // 5. Сохранение в базу данных с авторизацией
        const cookieHeader = request.headers.get('cookie') || '';
        const pb = createAuthenticatedPocketBase(cookieHeader);

        const generationInput: GenerationInput = {
            title: formData.title,
            specialization: formData.specialization,
            purpose: formData.goals.join(', '),
            content_type: 'Instagram Content Plan',
            number_of_publications: formData.totalPublications || 1,
            context: formData.additionalContext,
            metadata: {
                month: formData.month,
                useHealthCalendar: formData.useHealthCalendar,
                goals: formData.goals,
                formatCounts: formData.formatCounts
            }
        };

        const result = await createGeneration(generationInput, items, pb);

        return NextResponse.json<ApiResponse<typeof result>>({
            data: result
        });

    } catch (error: any) {
        console.error('Content generation error:', error);
        return NextResponse.json<ApiErrorResponse>({
            error: {
                message: error.message || 'Произошла ошибка при генерации контент-плана.',
                code: 'GENERATION_ERROR'
            }
        }, { status: 500 });
    }
}
