import { NextResponse } from 'next/server';

import { getCurrentProvider, isProviderConfigured, createLLMClient } from '@/lib/llm';

export async function GET() {
    try {
        const currentProvider = getCurrentProvider();
        const isConfigured = isProviderConfigured(currentProvider);

        if (!isConfigured) {
            return NextResponse.json(
                {
                    status: 'error',
                    provider: currentProvider,
                    message: `${currentProvider} is not configured (missing API key)`,
                },
                { status: 503 }
            );
        }

        try {
            const client = createLLMClient();
            await client.generate([{ role: 'user', content: 'test' }]);

            return NextResponse.json({
                status: 'ok',
                provider: currentProvider,
                message: `${currentProvider} connection is healthy`,
            });
        } catch (error: any) {
            return NextResponse.json(
                {
                    status: 'error',
                    provider: currentProvider,
                    message: `Failed to connect to ${currentProvider}: ${error.message}`,
                },
                { status: 503 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            {
                status: 'error',
                message: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
