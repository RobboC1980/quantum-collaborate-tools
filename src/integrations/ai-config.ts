// AI model configuration options

export type AIProvider = 'qwen';
export type AIModel = 'qwen-max' | 'qwen-plus' | 'qwen-turbo' | 'qwen-lite';

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
    const savedModel = localStorage.getItem('ai_model');
    
    if (savedModel) {
      return {
        provider: 'qwen',
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
  provider: 'qwen' as AIProvider,
  model: loadSavedConfig().model as AIModel,
  temperature: 0.7,
};

// Save AI config to localStorage
export const saveAIConfig = (model: AIModel) => {
  try {
    localStorage.setItem('ai_model', model);
    defaultAIConfig.model = model;
    return true;
  } catch (error) {
    console.error('Failed to save AI config to localStorage:', error);
    return false;
  }
};

// AI model configurations
export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'qwen-max': {
    provider: 'qwen',
    model: 'qwen-max',
    description: 'Qwen 2.5 Max - Advanced model with strong capabilities',
    maxTokens: 32000,
    capabilities: ['Text generation', 'Reasoning', 'Code generation', 'Complex tasks'],
    baseTokenCost: 3.0,
  },
  'qwen-plus': {
    provider: 'qwen',
    model: 'qwen-plus',
    description: 'Qwen 2.5 Plus - Balanced model for general tasks',
    maxTokens: 16000,
    capabilities: ['Text generation', 'Reasoning', 'Code generation'],
    baseTokenCost: 1.0,
  },
  'qwen-turbo': {
    provider: 'qwen',
    model: 'qwen-turbo',
    description: 'Qwen 2.5 Turbo - Fast model for simpler tasks',
    maxTokens: 8000,
    capabilities: ['Text generation', 'Basic reasoning'],
    baseTokenCost: 0.5,
  },
  'qwen-lite': {
    provider: 'qwen',
    model: 'qwen-lite',
    description: 'Qwen 2.5 Lite - Lightweight and efficient model',
    maxTokens: 4096,
    capabilities: ['Text generation', 'Basic tasks'],
    baseTokenCost: 0.25,
  }
};

export const AI_PROVIDERS = {
  'qwen': {
    name: 'Qwen',
    description: 'AI models from Alibaba Cloud',
    models: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen-lite'],
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