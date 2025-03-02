import { toast } from '@/components/ui/use-toast';
import axios, { AxiosRequestConfig } from 'axios';

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
  isAborted?: boolean;
}

// Configuration for QWEN API
export interface QwenConfig {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  organizationId?: string;
  useProxy?: boolean;
}

// Default configuration - using standard QWEN API
const defaultConfig: QwenConfig = {
  // In development, we don't need to provide the API key in the client
  // as it will be handled by our proxy server
  apiKey: '',
  baseUrl: '',
  model: 'qwen2.5-7b-instruct', // Updated to use QWEN 2.5 model
  useProxy: true, // Always use the proxy to avoid exposing API keys in client
};

/**
 * QWEN API Client for interacting with QWEN language model
 */
export class QwenClient {
  private config: QwenConfig;
  private retryCount: number = 1; // Reduced retry count to minimize timeouts
  private retryDelay: number = 500;
  private axiosInstance: ReturnType<typeof axios.create>;
  private debugMode: boolean = false;

  constructor(config?: Partial<QwenConfig>) {
    this.config = { ...defaultConfig, ...config };
    
    // Determine the base URL - always use proxy for security
    const baseURL = '/api/qwen';
    
    // Create axios instance
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 120 second timeout - AI can be slow for large prompts
    });
    
    // Enable debug mode in development
    this.debugMode = import.meta.env.DEV || false;
  }

  /**
   * Make a request to the QWEN API
   */
  private async makeRequest<T>(
    endpoint: string, 
    body: Record<string, unknown>,
    signal?: AbortSignal
  ): Promise<T> {
    let lastError: Error | null = null;
    
    // Create request config with abort signal if provided
    const config: AxiosRequestConfig = {
      signal
    };

    // If signal is already aborted, fail fast
    if (signal?.aborted) {
      throw this.createApiError('Request aborted by client', 499, 'ABORTED', undefined, true);
    }
    
    // Implement retry logic
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        // Check if aborted between retries
        if (signal?.aborted) {
          throw this.createApiError('Request aborted by client', 499, 'ABORTED', undefined, true);
        }
        
        // If we're retrying, wait before the next attempt
        if (attempt > 0 && this.retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }

        // Make the API request
        if (this.debugMode) {
          console.log(`Making request to ${endpoint} (attempt ${attempt + 1}/${this.retryCount + 1})`);
        }
        
        const response = await this.axiosInstance.post(endpoint, body, config);
        
        if (this.debugMode) {
          console.log(`QWEN API Response (${endpoint}):`, response.status);
        }

        return response.data as T;
      } catch (error) {
        // Handle abort errors immediately without retrying
        if (axios.isCancel(error) || signal?.aborted) {
          throw this.createApiError('Request aborted by client', 499, 'ABORTED', undefined, true);
        }
        
        if (this.debugMode) {
          console.error(`QWEN API Error (${endpoint}):`, error);
        }
        
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last attempt, throw the error
        if (attempt === this.retryCount) {
          if (axios.isAxiosError(error)) {
            const status = error.response?.status || 500;
            const errorData = error.response?.data as Record<string, unknown> || {};
            let message = error.message;
            
            // Special handling for timeout errors
            if (error.code === 'ECONNABORTED') {
              message = 'The request to the AI service timed out. Try again with a shorter prompt or simpler request.';
            } 
            // Try to extract more detailed error message from the response
            else if (typeof errorData.message === 'string') {
              message = errorData.message;
            } else if (typeof errorData.error === 'string') {
              message = errorData.error;
            } else if (typeof errorData.error === 'object' && errorData.error) {
              message = (errorData.error as Record<string, unknown>).message as string || message;
            }
            
            throw this.createApiError(message, status, error.code, errorData);
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
  private createApiError(
    message: string, 
    status?: number, 
    code?: string, 
    data?: Record<string, unknown>,
    isAborted?: boolean
  ): QwenApiError {
    const error = new Error(message) as QwenApiError;
    error.name = 'QwenApiError';
    if (status) error.status = status;
    if (code) error.code = code;
    if (data) error.data = data;
    if (isAborted) error.isAborted = true;
    return error;
  }

  /**
   * Generate text completion using QWEN
   */
  async createCompletion(
    request: QwenCompletionRequest,
    signal?: AbortSignal
  ): Promise<QwenCompletionResponse> {
    try {
      return await this.makeRequest<QwenCompletionResponse>(
        '/completions', 
        {
          model: this.config.model,
          ...request,
        },
        signal
      );
    } catch (error) {
      // Enhanced error handling for user feedback
      let errorMessage = "There was an error contacting the AI service. Please try again later.";
      let showToast = true;
      
      if (error instanceof Error) {
        console.error('QWEN API Error:', error);
        
        // Handle abort errors differently - don't show toast for user-initiated cancellations
        const qwenError = error as QwenApiError;
        if (qwenError.isAborted || signal?.aborted) {
          errorMessage = "Request was cancelled.";
          showToast = false; // Don't show toast for aborted requests
        }
        // Provide more specific messages based on error type
        else if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          errorMessage = "The AI service took too long to respond. Try with a shorter prompt or simpler request.";
        } else {
          errorMessage = error.message;
        }
      } else {
        console.error('Unknown error:', error);
      }
      
      // Show toast notification to user if needed
      if (showToast) {
        toast({
          title: "AI Request Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }

  /**
   * Generate embeddings
   */
  async createEmbedding(
    request: QwenEmbeddingRequest,
    signal?: AbortSignal
  ): Promise<QwenEmbeddingResponse> {
    try {
      return await this.makeRequest<QwenEmbeddingResponse>(
        '/embeddings', 
        {
          ...request,
        },
        signal
      );
    } catch (error) {
      // Enhanced error handling for user feedback
      let errorMessage = error instanceof Error ? error.message : 'Unknown error';
      let showToast = true;
      
      console.error('QWEN Embedding API Error:', error);
      
      // Handle abort errors
      if (error instanceof Error) {
        const qwenError = error as QwenApiError;
        if (qwenError.isAborted || signal?.aborted) {
          errorMessage = "Embedding request was cancelled.";
          showToast = false; // Don't show toast for aborted requests
        }
      }
      
      // Show toast notification to user if needed
      if (showToast) {
        toast({
          title: "AI Embedding Failed",
          description: "There was an error generating embeddings. Please try again later.",
          variant: "destructive",
        });
      }
      
      throw error;
    }
  }
}

/**
 * Singleton instance of the QWEN client
 */
export const qwenClient = new QwenClient();

/**
 * Handle API errors and provide user feedback
 */
export function handleQwenApiError(error: unknown): void {
  if (error instanceof Error) {
    console.error('QWEN API Error:', error);
    
    // Already handled in the client methods
    const qwenError = error as QwenApiError;
    if (qwenError.isAborted) {
      // Don't show toast for aborted requests
      return;
    }
    
    toast({
      title: "AI Service Error",
      description: error.message || "An error occurred with the AI service.",
      variant: "destructive",
    });
  } else {
    console.error('Unknown QWEN API error:', error);
    toast({
      title: "AI Service Error",
      description: "An unknown error occurred with the AI service.",
      variant: "destructive",
    });
  }
}

export default qwenClient;

// Helper functions
export async function createCompletion(
  prompt: string, 
  options?: Partial<QwenCompletionRequest>
): Promise<QwenCompletionResponse> {
  return qwenClient.createCompletion({
    prompt,
    max_tokens: options?.max_tokens || 1000,
    temperature: options?.temperature || 0.7,
    top_p: options?.top_p || 1,
    ...options,
  });
}

export async function createEmbedding(
  input: string | string[],
  options?: Partial<QwenEmbeddingRequest>
): Promise<QwenEmbeddingResponse> {
  return qwenClient.createEmbedding({
    input,
    ...options,
  });
} 