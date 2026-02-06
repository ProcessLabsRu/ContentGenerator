import { NextResponse } from 'next/server';
import { getCurrentProvider, isProviderConfigured } from '@/lib/llm';
import { getLLMConfig } from '@/lib/config';

export async function GET() {
    try {
        const config = getLLMConfig();
        const currentProvider = getCurrentProvider();
        const isConfigured = isProviderConfigured(currentProvider);

        return NextResponse.json({
            provider: currentProvider,
            configured: isConfigured,
            availableProviders: {
                openai: isProviderConfigured('openai'),
                gemini: isProviderConfigured('gemini'),
            },
            models: {
                openai: config.openai.model,
                gemini: config.gemini.model,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Failed to get LLM status',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
