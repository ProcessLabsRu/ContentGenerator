export interface DatabaseConfig {
  provider: 'pocketbase';
  pocketbase?: {
    url: string;
  };
}

function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  return value || defaultValue || '';
}

export function getDatabaseConfig(): DatabaseConfig {
  return {
    provider: 'pocketbase',
    pocketbase: {
      url: getEnvVar('POCKETBASE_URL') || getEnvVar('NEXT_PUBLIC_POCKETBASE_URL'),
    },
  };
}

// Validate configuration
export function validateConfig(config: DatabaseConfig): void {
  if (config.provider === 'pocketbase') {
    if (!config.pocketbase) {
      throw new Error('PocketBase configuration is missing');
    }
    if (!config.pocketbase.url) {
      throw new Error('PocketBase URL is required');
    }
  }
}

// Export validated config singleton
let cachedConfig: DatabaseConfig | null = null;

export function getValidatedConfig(): DatabaseConfig {
  if (!cachedConfig) {
    cachedConfig = getDatabaseConfig();
    validateConfig(cachedConfig);
  }
  return cachedConfig;
}

// LLM Configuration
export type LLMProvider = 'openai' | 'gemini' | 'deepseek';

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

export function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER as LLMProvider) || 'gemini';

  return {
    provider,
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    },
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || 'deepseek-chat',
    },
  };
}

export function validateLLMConfig(config: LLMConfig): void {
  if (config.provider === 'openai' && !config.openai.apiKey) {
    throw new Error('OPENAI_API_KEY is required when using OpenAI provider');
  }
  if (config.provider === 'gemini' && !config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is required when using Gemini provider');
  }
  if (config.provider === 'deepseek' && !config.deepseek.apiKey) {
    throw new Error('DEEPSEEK_API_KEY is required when using DeepSeek provider');
  }
}

