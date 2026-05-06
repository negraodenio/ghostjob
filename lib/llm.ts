// Supports SiliconFlow (primary) and OpenRouter (fallback) with automatic failover
import { redis, isRedisEnabled } from './redis';
import crypto from 'crypto';

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
    responseFormat?: 'json_object';
}

export interface LLMProvider {
    chat(messages: Message[], options?: ChatOptions): Promise<string>;
    getName(): string;
}

// SiliconFlow Provider (Primary - DeepSeek model)
export class SiliconFlowProvider implements LLMProvider {
    private apiKey: string;
    private apiUrl: string;
    private model: string;

    constructor() {
        this.apiKey = process.env.SILICONFLOW_API_KEY || '';
        this.apiUrl = process.env.SILICONFLOW_API_URL || 'https://api.siliconflow.com/v1';
        this.model = 'deepseek-ai/DeepSeek-V2.5';
    }

    getName(): string {
        return 'SiliconFlow (DeepSeek)';
    }

    async chat(messages: Message[], options?: ChatOptions): Promise<string> {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 4000,
                ...(options?.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
            }),
            signal: AbortSignal.timeout(30000), // Increased to 30s for better stability with complex generation tasks
        });

        if (!response.ok) {
            throw new Error(`SiliconFlow API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
}

// OpenRouter Provider (Fallback)
export class OpenRouterProvider implements LLMProvider {
    private apiKey: string;
    private apiUrl: string;
    private model: string;

    constructor() {
        this.apiKey = process.env.OPENROUTER_API_KEY || '';
        this.apiUrl = 'https://openrouter.ai/api/v1';
        this.model = 'meta-llama/llama-3.1-70b-instruct';
    }

    getName(): string {
        return 'OpenRouter (Llama)';
    }

    async chat(messages: Message[], options?: ChatOptions): Promise<string> {
        const response = await fetch(`${this.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`,
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
            },
            body: JSON.stringify({
                model: options?.model || this.model,
                messages,
                temperature: options?.temperature ?? 0.7,
                max_tokens: options?.maxTokens ?? 4000,
                ...(options?.responseFormat === 'json_object' ? { response_format: { type: 'json_object' } } : {}),
            }),
            signal: AbortSignal.timeout(30000), // Increased to 30s for better stability with complex generation tasks
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0]?.message?.content || '';
    }
}

// Main LLM function with automatic failover and retry logic
export async function getLLMResponse(
    messages: Message[],
    options?: ChatOptions
): Promise<string> {
    // 1. Try Cache First
    const promptString = JSON.stringify(messages) + (options?.model || '');
    const cacheKey = `llm_cache:${crypto.createHash('md5').update(promptString).digest('hex')}`;

    if (isRedisEnabled) {
        try {
            const cached = await redis.get<string>(cacheKey);
            if (cached) {
                console.log(`[LLM] Cache hit for key: ${cacheKey}`);
                return cached;
            }
        } catch (cacheError) {
            console.warn('[LLM] Redis read error:', cacheError);
        }
    }

    const providers: LLMProvider[] = [
        new SiliconFlowProvider(),
        new OpenRouterProvider(),
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
        // Try each provider with backoff
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                console.log(`[LLM] Attempting ${provider.getName()}, attempt ${attempt + 1}/2`);
                const response = await provider.chat(messages, options);
                console.log(`[LLM] Success with ${provider.getName()}`);

                // 2. Save to Cache on success
                if (isRedisEnabled && response) {
                    try {
                        await redis.set(cacheKey, response, { ex: 60 * 60 * 24 }); // 24h cache
                        console.log(`[LLM] Response cached: ${cacheKey}`);
                    } catch (cacheError) {
                        console.warn('[LLM] Redis write error:', cacheError);
                    }
                }

                return response;
            } catch (error) {
                lastError = error as Error;
                console.error(`[LLM] Error with ${provider.getName()}, attempt ${attempt + 1}/2:`, error);

                // Exponential backoff
                if (attempt < 1) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[LLM] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }

    // All providers failed
    const errorMessage = lastError?.message || 'Unknown error';
    if (errorMessage.includes('timeout') || errorMessage.includes('AbortSignal')) {
        throw new Error('O servidor de IA demorou muito para responder (Timeout). Tente novamente em instantes.');
    }
    throw new Error(`Falha na comunicação com a IA: ${errorMessage}`);
}

// Helper function to create system + user message pair
export function createConversation(systemPrompt: string, userMessage: string): Message[] {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];
}
