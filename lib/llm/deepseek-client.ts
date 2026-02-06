import OpenAI from 'openai';
import { LLMClient, LLMMessage, LLMResponse } from './types';

/**
 * Клиент для DeepSeek LLM
 * Использует OpenAI SDK с кастомным baseURL
 */
export class DeepSeekClient implements LLMClient {
    private client: OpenAI;
    private model: string;

    constructor(apiKey: string, model: string = 'deepseek-chat') {
        this.client = new OpenAI({
            apiKey,
            baseURL: 'https://api.deepseek.com',
        });
        this.model = model;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        try {
            const completion = await this.client.chat.completions.create({
                model: this.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
            });

            const choice = completion.choices[0];

            return {
                content: choice.message.content || '',
                usage: completion.usage ? {
                    promptTokens: completion.usage.prompt_tokens,
                    completionTokens: completion.usage.completion_tokens,
                    totalTokens: completion.usage.total_tokens,
                } : undefined,
            };
        } catch (error) {
            console.error('DeepSeek generation error:', error);
            throw new Error(`DeepSeek generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async *generateStream(messages: LLMMessage[]): AsyncGenerator<string> {
        try {
            const stream = await this.client.chat.completions.create({
                model: this.model,
                messages: messages.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                })),
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            console.error('DeepSeek streaming error:', error);
            throw new Error(`DeepSeek streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
