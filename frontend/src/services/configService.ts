interface LLMProvider {
  id: string;
  name: string;
  apiKeyRequired: boolean;
  baseUrlRequired: boolean;
  defaultBaseUrl?: string;
  models: string[];
}

interface LLMConfig {
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
  parameters?: Record<string, any>;
}

export type { LLMProvider, LLMConfig };

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: 'gemini',
    name: 'Gemini',
    apiKeyRequired: true,
    baseUrlRequired: false,
    defaultBaseUrl: 'https://generativelanguage.googleapis.com/v1beta',
    models: ['gemini-2.5-flash-preview-05-20', 'gemini-1.5-pro', 'gemini-1.5-flash']
  },
  {
    id: 'openai',
    name: 'OpenAI',
    apiKeyRequired: true,
    baseUrlRequired: false,
    defaultBaseUrl: 'https://api.openai.com/v1',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo']
  },
  {
    id: 'ollama',
    name: 'Ollama (本地)',
    apiKeyRequired: false,
    baseUrlRequired: true,
    defaultBaseUrl: 'http://localhost:11434',
    models: ['llama3', 'llama3.1', 'llama3.2', 'qwen2.5', 'deepseek-coder', 'codellama']
  },
  {
    id: 'lmstudio',
    name: 'LMStudio (本地)',
    apiKeyRequired: false,
    baseUrlRequired: true,
    defaultBaseUrl: 'http://localhost:1234/v1',
    models: ['当前加载的模型']  // LMStudio 动态加载模型
  }
];

class ConfigService {
  private static instance: ConfigService;
  private envConfig: Record<string, string> = {};

  private constructor() {
    this.loadEnvConfig();
  }

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private async loadEnvConfig() {
    try {
      // 在前端环境中，通过 import.meta.env 读取环境变量
      this.envConfig = {
        GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
        GEMINI_MODEL: import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20',
        GEMINI_BASE_URL: import.meta.env.VITE_GEMINI_BASE_URL || '',
        OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
        OPENAI_BASE_URL: import.meta.env.VITE_OPENAI_BASE_URL || 'https://api.openai.com/v1',
        OLLAMA_BASE_URL: import.meta.env.VITE_OLLAMA_BASE_URL || 'http://localhost:11434',
        OLLAMA_MODEL: import.meta.env.VITE_OLLAMA_MODEL || 'llama3',
        LMSTUDIO_BASE_URL: import.meta.env.VITE_LMSTUDIO_BASE_URL || 'http://localhost:1234/v1',
        LMSTUDIO_MODEL: import.meta.env.VITE_LMSTUDIO_MODEL || 'current-model'
      };
    } catch (error) {
      console.warn('无法加载环境配置，使用默认值', error);
      this.envConfig = {
        GEMINI_API_KEY: '',
        GEMINI_MODEL: 'gemini-2.5-flash-preview-05-20',
        GEMINI_BASE_URL: '',
        OPENAI_API_KEY: '',
        OPENAI_BASE_URL: 'https://api.openai.com/v1',
        OLLAMA_BASE_URL: 'http://localhost:11434',
        OLLAMA_MODEL: 'llama3',
        LMSTUDIO_BASE_URL: 'http://localhost:1234/v1',
        LMSTUDIO_MODEL: 'current-model'
      };
    }
  }

  public hasApiKey(providerId: string): boolean {
    switch (providerId) {
      case 'gemini':
        return !!this.envConfig.GEMINI_API_KEY;
      case 'openai':
        return !!this.envConfig.OPENAI_API_KEY;
      case 'ollama':
      case 'lmstudio':
        return true; // 本地服务不需要API密钥
      default:
        return false;
    }
  }

  public getDefaultConfig(): LLMConfig {
    return {
      provider: 'gemini',
      model: this.envConfig.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20',
      apiKey: this.envConfig.GEMINI_API_KEY || '',
      baseUrl: this.envConfig.GEMINI_BASE_URL || '',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant.',
      parameters: {}
    };
  }

  public getProviderConfig(providerId: string): Partial<LLMConfig> {
    switch (providerId) {
      case 'gemini':
        return {
          provider: 'gemini',
          model: this.envConfig.GEMINI_MODEL || 'gemini-2.5-flash-preview-05-20',
          apiKey: this.envConfig.GEMINI_API_KEY || '',
          baseUrl: this.envConfig.GEMINI_BASE_URL || ''
        };
      case 'openai':
        return {
          provider: 'openai',
          model: 'gpt-4',
          apiKey: this.envConfig.OPENAI_API_KEY || '',
          baseUrl: this.envConfig.OPENAI_BASE_URL || 'https://api.openai.com/v1'
        };
      case 'ollama':
        return {
          provider: 'ollama',
          model: this.envConfig.OLLAMA_MODEL || 'llama3',
          baseUrl: this.envConfig.OLLAMA_BASE_URL || 'http://localhost:11434'
        };
      case 'lmstudio':
        return {
          provider: 'lmstudio',
          model: this.envConfig.LMSTUDIO_MODEL || 'current-model',
          baseUrl: this.envConfig.LMSTUDIO_BASE_URL || 'http://localhost:1234/v1'
        };
      default:
        return this.getDefaultConfig();
    }
  }

  public getProvider(providerId: string): LLMProvider | undefined {
    return LLM_PROVIDERS.find(p => p.id === providerId);
  }

  public getAllProviders(): LLMProvider[] {
    return LLM_PROVIDERS;
  }
}

export const configService = ConfigService.getInstance();