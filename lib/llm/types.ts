/**
 * Типы для работы с LLM провайдерами
 */

export type LLMProvider = 'openai' | 'gemini' | 'deepseek';

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface LLMClient {
    /**
     * Генерация текста
     */
    generate(messages: LLMMessage[]): Promise<LLMResponse>;

    /**
     * Потоковая генерация текста
     */
    generateStream(messages: LLMMessage[]): AsyncGenerator<string>;
}

export interface LLMConfig {
    provider: LLMProvider;
    openai: {
        apiKey?: string;
        model: string;
    };
    gemini: {
        apiKey?: string;
        model: string;
    };
    deepseek: {
        apiKey?: string;
        model: string;
    };
}
