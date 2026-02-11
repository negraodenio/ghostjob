// LLM Provider Interface and Implementations
// Supports SiliconFlow (primary) and OpenRouter (fallback) with automatic failover

export interface Message {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatOptions {
    temperature?: number;
    maxTokens?: number;
    model?: string;
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
            }),
            signal: AbortSignal.timeout(30000), // 30s timeout
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
            }),
            signal: AbortSignal.timeout(30000), // 30s timeout
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
    const providers: LLMProvider[] = [
        new SiliconFlowProvider(),
        new OpenRouterProvider(),
    ];

    let lastError: Error | null = null;

    for (const provider of providers) {
        // Try each provider with exponential backoff
        for (let attempt = 0; attempt < 3; attempt++) {
            try {
                console.log(`[LLM] Attempting ${provider.getName()}, attempt ${attempt + 1}/3`);
                const response = await provider.chat(messages, options);
                console.log(`[LLM] Success with ${provider.getName()}`);
                return response;
            } catch (error) {
                lastError = error as Error;
                console.error(`[LLM] Error with ${provider.getName()}, attempt ${attempt + 1}/3:`, error);

                // Exponential backoff: 1s, 2s, 4s
                if (attempt < 2) {
                    const delay = Math.pow(2, attempt) * 1000;
                    console.log(`[LLM] Retrying in ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
    }

    // All providers failed
    throw new Error(`All LLM providers failed. Last error: ${lastError?.message}`);
}

// Helper function to create system + user message pair
export function createConversation(systemPrompt: string, userMessage: string): Message[] {
    return [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
    ];
}
