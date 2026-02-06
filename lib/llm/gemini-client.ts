import { GoogleGenerativeAI } from '@google/generative-ai';
import { LLMClient, LLMMessage, LLMResponse } from './types';

export class GeminiClient implements LLMClient {
    private client: GoogleGenerativeAI;
    private modelName: string;

    constructor(apiKey: string, model: string = 'gemini-1.5-pro') {
        this.client = new GoogleGenerativeAI(apiKey);
        this.modelName = model;
    }

    private convertMessages(messages: LLMMessage[]): { role: string; parts: { text: string }[] }[] {
        // Gemini использует формат: role = 'user' | 'model'
        // Системные сообщения добавляются как первое user сообщение
        const converted: { role: string; parts: { text: string }[] }[] = [];

        let systemPrompt = '';

        for (const msg of messages) {
            if (msg.role === 'system') {
                systemPrompt += msg.content + '\n\n';
            } else if (msg.role === 'user') {
                const content = systemPrompt ? systemPrompt + msg.content : msg.content;
                converted.push({
                    role: 'user',
                    parts: [{ text: content }],
                });
                systemPrompt = ''; // Используем системный промпт только один раз
            } else if (msg.role === 'assistant') {
                converted.push({
                    role: 'model',
                    parts: [{ text: msg.content }],
                });
            }
        }

        return converted;
    }

    async generate(messages: LLMMessage[]): Promise<LLMResponse> {
        try {
            const model = this.client.getGenerativeModel({ model: this.modelName });

            const convertedMessages = this.convertMessages(messages);

            // Если есть только одно сообщение, используем простой generateContent
            if (convertedMessages.length === 1) {
                const result = await model.generateContent(convertedMessages[0].parts[0].text);
                const response = result.response;

                return {
                    content: response.text(),
                    usage: response.usageMetadata ? {
                        promptTokens: response.usageMetadata.promptTokenCount || 0,
                        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                        totalTokens: response.usageMetadata.totalTokenCount || 0,
                    } : undefined,
                };
            }

            // Для диалога используем chat
            const chat = model.startChat({
                history: convertedMessages.slice(0, -1),
            });

            const lastMessage = convertedMessages[convertedMessages.length - 1];
            const result = await chat.sendMessage(lastMessage.parts[0].text);
            const response = result.response;

            return {
                content: response.text(),
                usage: response.usageMetadata ? {
                    promptTokens: response.usageMetadata.promptTokenCount || 0,
                    completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                    totalTokens: response.usageMetadata.totalTokenCount || 0,
                } : undefined,
            };
        } catch (error) {
            console.error('Gemini generation error:', error);
            throw new Error(`Gemini generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async *generateStream(messages: LLMMessage[]): AsyncGenerator<string> {
        try {
            const model = this.client.getGenerativeModel({ model: this.modelName });

            const convertedMessages = this.convertMessages(messages);

            // Если есть только одно сообщение
            if (convertedMessages.length === 1) {
                const result = await model.generateContentStream(convertedMessages[0].parts[0].text);

                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) {
                        yield text;
                    }
                }
                return;
            }

            // Для диалога
            const chat = model.startChat({
                history: convertedMessages.slice(0, -1),
            });

            const lastMessage = convertedMessages[convertedMessages.length - 1];
            const result = await chat.sendMessageStream(lastMessage.parts[0].text);

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                    yield text;
                }
            }
        } catch (error) {
            console.error('Gemini streaming error:', error);
            throw new Error(`Gemini streaming failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
