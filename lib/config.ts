export interface DatabaseConfig {
  provider: 'direct' | 'nocodb' | 'pocketbase';
  direct?: {
    connectionString?: string;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
    ssl?: boolean;
  };
  nocodb?: {
    apiUrl: string;
    apiToken: string;
    baseId: string;
  };
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

function getEnvVarAsNumber(name: string, defaultValue?: number): number {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  if (!value) {
    throw new Error(`Environment variable ${name} is required but not set`);
  }
  const num = parseInt(value, 10);
  if (isNaN(num)) {
    throw new Error(`Environment variable ${name} must be a number`);
  }
  return num;
}

function getEnvVarAsBoolean(name: string, defaultValue?: boolean): boolean {
  const value = process.env[name];
  if (!value && defaultValue !== undefined) {
    return defaultValue;
  }
  return value === 'true' || value === '1';
}

export function getDatabaseConfig(): DatabaseConfig {
  const provider = (getEnvVar('DATABASE_PROVIDER', 'direct') || 'direct') as 'direct' | 'nocodb' | 'pocketbase';

  if (provider === 'pocketbase') {
    return {
      provider: 'pocketbase',
      pocketbase: {
        url: getEnvVar('POCKETBASE_URL') || getEnvVar('NEXT_PUBLIC_POCKETBASE_URL'),
      },
    };
  }

  if (provider === 'nocodb') {
    return {
      provider: 'nocodb',
      nocodb: {
        apiUrl: getEnvVar('NOCODB_API_URL'),
        apiToken: getEnvVar('NOCODB_API_TOKEN'),
        baseId: getEnvVar('NOCODB_BASE_ID'),
      },
    };
  }

  // Direct PostgreSQL connection
  const connectionString = process.env.DATABASE_URL;

  if (connectionString && connectionString.trim() !== '') {
    return {
      provider: 'direct',
      direct: {
        connectionString: connectionString.trim(),
        ssl: getEnvVarAsBoolean('POSTGRES_SSL', false),
      },
    };
  }

  // Fallback to individual parameters - only if DATABASE_URL is not set
  // Check if at least some individual parameters are set
  const hasIndividualParams =
    process.env.POSTGRES_HOST ||
    process.env.POSTGRES_USER ||
    process.env.POSTGRES_PASSWORD;

  if (hasIndividualParams) {
    return {
      provider: 'direct',
      direct: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: getEnvVarAsNumber('POSTGRES_PORT', 5432),
        database: process.env.POSTGRES_DATABASE || 'content_generator',
        user: process.env.POSTGRES_USER || '',
        password: process.env.POSTGRES_PASSWORD || '',
        ssl: getEnvVarAsBoolean('POSTGRES_SSL', false),
      },
    };
  }

  // If neither DATABASE_URL nor individual params are set, return minimal config
  // This allows the app to start but database operations will fail gracefully
  return {
    provider: 'direct',
    direct: {
      connectionString: '', // Empty string will cause connection errors, but won't crash during config
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
  } else if (config.provider === 'nocodb') {
    if (!config.nocodb) {
      throw new Error('NocoDB configuration is missing');
    }
    if (!config.nocodb.apiUrl || !config.nocodb.apiToken || !config.nocodb.baseId) {
      throw new Error('NocoDB configuration is incomplete. Required: apiUrl, apiToken, baseId');
    }
  } else {
    if (!config.direct) {
      throw new Error('Direct database configuration is missing');
    }
    // Allow empty connectionString during build/startup - validation will happen on actual connection
    if (!config.direct.connectionString && !config.direct.host) {
      throw new Error('Direct database configuration must have either DATABASE_URL (connectionString) or POSTGRES_HOST');
    }
    // Only validate database name if using individual parameters (not connectionString)
    if (!config.direct.connectionString && !config.direct.database) {
      throw new Error('Direct database configuration requires database name when using individual parameters');
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

