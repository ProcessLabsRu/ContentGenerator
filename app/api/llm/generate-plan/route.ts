import { NextRequest, NextResponse } from 'next/server';
import { createLLMClient } from '@/lib/llm';
import { MedicalContentFormData } from '@/lib/types';
import { SYSTEM_PROMPT, generateUserPrompt } from '@/lib/llm/prompts';
import { normalizeLLMResponse } from '@/lib/llm/normalization';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const formData = body as MedicalContentFormData;

        if (!formData.specialization || !formData.month) {
            return NextResponse.json(
                { error: 'Specialization and month are required' },
                { status: 400 }
            );
        }

        const client = createLLMClient();

        const response = await client.generate([
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: generateUserPrompt(formData) }
        ]);

        let items = [];
        try {
            // Clean up code blocks if present
            const cleanContent = response.content.replace(/```json\n?|\n?```/g, '').trim();
            const rawItems = JSON.parse(cleanContent);

            // Normalize and validate response
            items = normalizeLLMResponse(rawItems, formData.month);
        } catch (e) {
            console.error('Failed to parse LLM response:', e);
            console.error('Raw content:', response.content);
            return NextResponse.json(
                { error: 'Failed to generate valid JSON format', raw: response.content },
                { status: 500 }
            );
        }

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Generation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate plan',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
