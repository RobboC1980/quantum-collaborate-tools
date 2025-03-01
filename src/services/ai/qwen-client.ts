import { toast } from '@/components/ui/use-toast';

// Define the types for QWEN 2.5 API
export interface QwenCompletionRequest {
  prompt: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stop?: string[];
  frequency_penalty?: number;
  presence_penalty?: number;
}

export interface QwenCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    text: string;
    index: number;
    logprobs: Record<string, number> | null;
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface QwenEmbeddingRequest {
  input: string | string[];
  model?: string;
}

export interface QwenEmbeddingResponse {
  object: string;
  data: {
    object: string;
    embedding: number[];
    index: number;
  }[];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

// API Error handling
export interface QwenApiError extends Error {
  status?: number;
  code?: string;
  data?: Record<string, unknown>;
}

// Configuration for QWEN API
export interface QwenConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
  organizationId?: string;
}

// Default configuration that can be overridden
const defaultConfig: QwenConfig = {
  apiKey: process.env.QWEN_API_KEY || '',
  baseUrl: 'https://api.qwen.ai/v1',
  model: 'qwen2.5-7b-instruct',
};

/**
 * QWEN API Client for interacting with QWEN 2.5 language model
 */
export class QwenClient {
  private config: QwenConfig;

  constructor(config?: Partial<QwenConfig>) {
    this.config = { ...defaultConfig, ...config };
    
    if (!this.config.apiKey) {
      console.warn('QWEN API key is not set. API calls will fail.');
    }
  }

  /**
   * Make a request to the QWEN API
   */
  private async makeRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    try {
      const response = await fetch(`${this.config.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          ...(this.config.organizationId ? { 'Qwen-Organization': this.config.organizationId } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw this.createApiError(
          errorData.error?.message || `API request failed with status ${response.status}`,
          response.status,
          errorData.error?.code,
          errorData
        );
      }

      return await response.json() as T;
    } catch (error) {
      if (error instanceof Error) {
        throw this.createApiError(error.message);
      }
      throw this.createApiError('Unknown error occurred');
    }
  }

  /**
   * Create a standardized API error
   */
  private createApiError(message: string, status?: number, code?: string, data?: Record<string, unknown>): QwenApiError {
    const error = new Error(message) as QwenApiError;
    error.name = 'QwenApiError';
    if (status) error.status = status;
    if (code) error.code = code;
    if (data) error.data = data;
    return error;
  }

  /**
   * Generate text completion using QWEN 2.5
   */
  async createCompletion(request: QwenCompletionRequest): Promise<QwenCompletionResponse> {
    return this.makeRequest<QwenCompletionResponse>('/completions', {
      model: this.config.model,
      ...request,
    });
  }

  /**
   * Generate embeddings using QWEN 2.5
   */
  async createEmbedding(request: QwenEmbeddingRequest): Promise<QwenEmbeddingResponse> {
    return this.makeRequest<QwenEmbeddingResponse>('/embeddings', {
      model: request.model || 'qwen2.5-embedding',
      ...request,
    });
  }
}

// Create and export a singleton instance with default configuration
export const qwenClient = new QwenClient();

// Export a function to handle QWEN API errors gracefully
export const handleQwenApiError = (error: Error | QwenApiError, fallbackMessage: string = 'AI service error'): QwenApiError => {
  console.error('QWEN API Error:', error);
  
  const apiError = error as QwenApiError;
  
  // Display error toast (if not in a test environment)
  if (process.env.NODE_ENV !== 'test') {
    toast({
      title: 'AI Service Error',
      description: apiError.message || fallbackMessage,
      variant: 'destructive',
    });
  }
  
  return apiError;
}; 