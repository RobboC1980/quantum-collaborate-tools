// AI model configuration options

export type AIProvider = 'openai' | 'qwen';
export type AIModel = 'gpt-4o' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'qwen-max' | 'qwen-plus';

export interface AIModelConfig {
  provider: AIProvider;
  model: AIModel;
  description: string;
  maxTokens: number;
  capabilities: string[];
  baseTokenCost: number; // in USD per 1M tokens
}

// Load preferences from localStorage if available
const loadSavedConfig = (): {provider: AIProvider, model: AIModel} => {
  try {
    const savedProvider = localStorage.getItem('ai_provider');
    const savedModel = localStorage.getItem('ai_model');
    
    if (savedProvider && savedModel) {
      return {
        provider: savedProvider as AIProvider,
        model: savedModel as AIModel
      };
    }
  } catch (error) {
    console.error('Failed to load AI config from localStorage:', error);
  }
  
  // Default values if nothing is saved
  return {
    provider: 'qwen',
    model: 'qwen-max'
  };
};

// Default AI configuration
export const defaultAIConfig = {
  provider: loadSavedConfig().provider as AIProvider,
  model: loadSavedConfig().model as AIModel,
  temperature: 0.7,
};

// Save AI config to localStorage
export const saveAIConfig = (provider: AIProvider, model: AIModel) => {
  try {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem('ai_model', model);
    defaultAIConfig.provider = provider;
    defaultAIConfig.model = model;
    return true;
  } catch (error) {
    console.error('Failed to save AI config to localStorage:', error);
    return false;
  }
};

// AI model configurations
export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    description: 'OpenAI GPT-4o - Advanced AI model with strong reasoning capabilities',
    maxTokens: 8192,
    capabilities: ['Text generation', 'Reasoning', 'Code generation'],
    baseTokenCost: 5.0,
  },
  'gpt-4-turbo': {
    provider: 'openai',
    model: 'gpt-4-turbo',
    description: 'OpenAI GPT-4 Turbo - Powerful model with large context window',
    maxTokens: 128000,
    capabilities: ['Text generation', 'Reasoning', 'Code generation'],
    baseTokenCost: 10.0,
  },
  'gpt-3.5-turbo': {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    description: 'OpenAI GPT-3.5 Turbo - Fast and efficient AI model',
    maxTokens: 16000,
    capabilities: ['Text generation', 'Basic reasoning'],
    baseTokenCost: 0.5,
  },
  'qwen-max': {
    provider: 'qwen',
    model: 'qwen-max',
    description: 'Qwen 2.5 Max - Advanced model with strong capabilities',
    maxTokens: 32000,
    capabilities: ['Text generation', 'Reasoning', 'Code generation'],
    baseTokenCost: 3.0,
  },
  'qwen-plus': {
    provider: 'qwen',
    model: 'qwen-plus',
    description: 'Qwen 2.5 Plus - Efficient model for general tasks',
    maxTokens: 16000,
    capabilities: ['Text generation', 'Basic reasoning'],
    baseTokenCost: 1.0,
  },
};

export const AI_PROVIDERS = {
  'openai': {
    name: 'OpenAI',
    description: 'Advanced AI models from OpenAI',
    models: ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
  },
  'qwen': {
    name: 'Qwen',
    description: 'AI models from Alibaba Cloud',
    models: ['qwen-max', 'qwen-plus'],
  },
};

// Get the model configuration
export function getModelConfig(model: AIModel): AIModelConfig {
  return AI_MODELS[model];
}

// Get model options for a specific provider
export function getModelsByProvider(provider: AIProvider): AIModel[] {
  return AI_PROVIDERS[provider].models as AIModel[];
}

export default { 
  defaultAIConfig,
  AI_MODELS,
  AI_PROVIDERS,
  getModelConfig,
  getModelsByProvider
}; 