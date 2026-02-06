import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient, LLMMessage } from '@/lib/llm';

export async function POST(request: NextRequest) {
    try {
        const { messages } = await request.json() as { messages: LLMMessage[] };

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array is required' },
                { status: 400 }
            );
        }

        // Создаем клиент для выбранного провайдера
        const client = createLLMClient();

        // Генерируем ответ
        const response = await client.generate(messages);

        return NextResponse.json(response);
    } catch (error) {
        console.error('LLM generation error:', error);

        return NextResponse.json(
            {
                error: 'Failed to generate content',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
