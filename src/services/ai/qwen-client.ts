import { toast } from '@/components/ui/use-toast';
import axios from 'axios';

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
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  organizationId?: string;
  useProxy?: boolean;
}

// Safe access to environment variables
const getClientEnvVar = (key: string): string => {
  // Direct access to typed Vite environment variables
  if (key === 'VITE_QWEN_API_KEY') return import.meta.env.VITE_QWEN_API_KEY || '';
  if (key === 'VITE_QWEN_API_URL') return import.meta.env.VITE_QWEN_API_URL || '';
  if (key === 'VITE_QWEN_MODEL') return import.meta.env.VITE_QWEN_MODEL || '';
  if (key === 'VITE_QWEN_EMBEDDING_MODEL') return import.meta.env.VITE_QWEN_EMBEDDING_MODEL || '';
  
  // Fallback to dynamic access (less reliable in production builds)
  return (import.meta.env as Record<string, string>)[key] || '';
};

// Default configuration
const defaultConfig: QwenConfig = {
  apiKey: getClientEnvVar('VITE_QWEN_API_KEY'),
  baseUrl: getClientEnvVar('VITE_QWEN_API_URL') || 'https://api.qwen.ai/v1',
  model: getClientEnvVar('VITE_QWEN_MODEL') || 'qwen2.5-7b-instruct',
  useProxy: true, // Default to using the proxy in development
};

/**
 * QWEN API Client for interacting with QWEN 2.5 language model
 */
export class QwenClient {
  private config: QwenConfig;
  private retryCount: number = 2;
  private retryDelay: number = 1000;
  private axiosInstance: ReturnType<typeof axios.create>;
  private debugMode: boolean = false;

  constructor(config?: Partial<QwenConfig>) {
    this.config = { ...defaultConfig, ...config };
    
    // Only warn if no API key AND proxy is disabled
    if (!this.config.apiKey && !this.config.useProxy) {
      console.warn('QWEN API key is not set. API calls will fail unless using proxy.');
    } else if (!this.config.apiKey && this.config.useProxy) {
      // When using proxy without API key, check if we're in development mode
      if (import.meta.env.DEV) {
        console.info('Running with proxy in development mode. API key will be injected by the server.');
      } else {
        console.warn('Using proxy in production without API key may not work correctly.');
      }
    }
    
    // Determine the base URL based on whether we're using the proxy
    const baseURL = this.config.useProxy 
      ? '/api/qwen' // Use the Vite proxy
      : this.config.baseUrl;
    
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && !this.config.useProxy 
          ? { 'Authorization': `Bearer ${this.config.apiKey}` } 
          : {}),
        ...(this.config.organizationId ? { 'Qwen-Organization': this.config.organizationId } : {}),
      },
      timeout: 30000, // 30 second timeout
    });
    
    // Enable debug mode in development
    this.debugMode = import.meta.env.DEV || false;
  }

  /**
   * Make a request to the QWEN API
   */
  private async makeRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    let lastError: Error | null = null;
    
    // If using proxy and we have an API key, add it to the request body
    // This is a workaround for the proxy to forward the API key
    if (this.config.useProxy && this.config.apiKey && !body.api_key) {
      body = { ...body, api_key: this.config.apiKey };
    }
    
    // Implement retry logic
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        // If we're retrying, wait before the next attempt
        if (attempt > 0 && this.retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }

        // Make the API request
        const response = await this.axiosInstance.post(endpoint, body);
        
        if (this.debugMode) {
          console.log(`QWEN API Response (${endpoint}):`, response.data);
        }

        return response.data as T;
      } catch (error) {
        if (this.debugMode) {
          console.error(`QWEN API Error (${endpoint}):`, error);
        }
        
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last attempt, throw the error
        if (attempt === this.retryCount) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const errorData = error.response?.data as Record<string, unknown> || {};
            const message = typeof errorData.error === 'object' && errorData.error
              ? (errorData.error as Record<string, unknown>).message as string
              : error.message;
            const code = typeof errorData.error === 'object' && errorData.error
              ? (errorData.error as Record<string, unknown>).code as string
              : undefined;
            
            throw this.createApiError(message, status, code, errorData);
          }
          
          if (error instanceof Error) {
            throw this.createApiError(error.message);
          }
          
          throw this.createApiError('Unknown error occurred');
        }
        
        // Otherwise continue to the next retry attempt
        console.warn(`API request failed, retrying (${attempt + 1}/${this.retryCount})...`, error);
      }
    }

    // This should never be reached due to the throw in the loop above
    throw lastError || new Error('Unknown error occurred');
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

  /**
   * Configure retry settings
   */
  setRetryOptions(count: number, delayMs: number): void {
    this.retryCount = count;
    this.retryDelay = delayMs;
  }
  
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
  
  /**
   * Enable or disable proxy mode
   */
  setUseProxy(enabled: boolean): void {
    this.config.useProxy = enabled;
    
    // Recreate the axios instance with the new configuration
    const baseURL = this.config.useProxy 
      ? '/api/qwen' 
      : this.config.baseUrl;
      
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && !this.config.useProxy 
          ? { 'Authorization': `Bearer ${this.config.apiKey}` } 
          : {}),
        ...(this.config.organizationId ? { 'Qwen-Organization': this.config.organizationId } : {}),
      },
      timeout: 30000,
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
  if (import.meta.env.MODE !== 'test') {
    toast({
      title: 'AI Service Error',
      description: apiError.message || fallbackMessage,
      variant: 'destructive',
    });
  }
  
  return apiError;
}; 