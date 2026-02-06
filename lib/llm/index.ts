import { LLMClient, LLMProvider } from './types';
import { OpenAIClient } from './openai-client';
import { GeminiClient } from './gemini-client';
import { DeepSeekClient } from './deepseek-client';

/**
 * Создает клиент для выбранного LLM провайдера
 * Провайдер выбирается через переменную окружения LLM_PROVIDER
 */
export function createLLMClient(): LLMClient {
    const provider = (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

    switch (provider) {
        case 'openai': {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                throw new Error('OPENAI_API_KEY is not set in environment variables');
            }
            const model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
            return new OpenAIClient(apiKey, model);
        }

        case 'gemini': {
            const apiKey = process.env.GEMINI_API_KEY;
            if (!apiKey) {
                throw new Error('GEMINI_API_KEY is not set in environment variables');
            }
            const model = process.env.GEMINI_MODEL || 'gemini-1.5-pro';
            return new GeminiClient(apiKey, model);
        }

        case 'deepseek': {
            const apiKey = process.env.DEEPSEEK_API_KEY;
            if (!apiKey) {
                throw new Error('DEEPSEEK_API_KEY is not set in environment variables');
            }
            const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
            return new DeepSeekClient(apiKey, model);
        }

        default:
            throw new Error(`Unsupported LLM provider: ${provider}`);
    }
}

/**
 * Получает текущего провайдера
 */
export function getCurrentProvider(): LLMProvider {
    return (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';
}

/**
 * Проверяет, настроен ли провайдер
 */
export function isProviderConfigured(provider: LLMProvider): boolean {
    switch (provider) {
        case 'openai':
            return !!process.env.OPENAI_API_KEY;
        case 'gemini':
            return !!process.env.GEMINI_API_KEY;
        case 'deepseek':
            return !!process.env.DEEPSEEK_API_KEY;
        default:
            return false;
    }
}

// Экспортируем все типы
export * from './types';
export { OpenAIClient } from './openai-client';
export { GeminiClient } from './gemini-client';
export { DeepSeekClient } from './deepseek-client';
