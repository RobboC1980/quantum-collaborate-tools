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

// Default configuration - using our dedicated API proxy
const defaultConfig: QwenConfig = {
  // In development, we don't need to provide the API key in the client
  // as it will be handled by our proxy server
  apiKey: '',
  baseUrl: '',
  model: 'qwen-max',
  useProxy: true, // Always use the proxy to avoid exposing API keys in client
};

/**
 * QWEN API Client for interacting with QWEN language model
 */
export class QwenClient {
  private config: QwenConfig;
  private retryCount: number = 2;
  private retryDelay: number = 1000;
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
  private async makeRequest<T>(endpoint: string, body: Record<string, unknown>): Promise<T> {
    let lastError: Error | null = null;
    
    // Implement retry logic
    for (let attempt = 0; attempt <= this.retryCount; attempt++) {
      try {
        // If we're retrying, wait before the next attempt
        if (attempt > 0 && this.retryDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        }

        // Make the API request
        if (this.debugMode) {
          console.log(`Making request to ${endpoint} (attempt ${attempt + 1}/${this.retryCount + 1})`);
        }
        
        const response = await this.axiosInstance.post(endpoint, body);
        
        if (this.debugMode) {
          console.log(`QWEN API Response (${endpoint}):`, response.status);
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
  private createApiError(message: string, status?: number, code?: string, data?: Record<string, unknown>): QwenApiError {
    const error = new Error(message) as QwenApiError;
    error.name = 'QwenApiError';
    if (status) error.status = status;
    if (code) error.code = code;
    if (data) error.data = data;
    return error;
  }

  /**
   * Generate text completion using QWEN
   */
  async createCompletion(request: QwenCompletionRequest): Promise<QwenCompletionResponse> {
    try {
      return await this.makeRequest<QwenCompletionResponse>('/completions', {
        model: this.config.model,
        ...request,
      });
    } catch (error) {
      // Enhanced error handling for user feedback
      let errorMessage = "There was an error contacting the AI service. Please try again later.";
      
      if (error instanceof Error) {
        console.error('QWEN API Error:', error);
        
        // Provide more specific messages based on error type
        if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
          errorMessage = "The AI service took too long to respond. Try with a shorter prompt or simpler request.";
        } else {
          errorMessage = error.message;
        }
      } else {
        console.error('Unknown error:', error);
      }
      
      // Show toast notification to user
      toast({
        title: "AI Request Failed",
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  }

  /**
   * Generate embeddings
   */
  async createEmbedding(request: QwenEmbeddingRequest): Promise<QwenEmbeddingResponse> {
    try {
      return await this.makeRequest<QwenEmbeddingResponse>('/embeddings', {
        ...request,
      });
    } catch (error) {
      // Enhanced error handling for user feedback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('QWEN Embedding API Error:', error);
      
      // Show toast notification to user
      toast({
        title: "AI Embedding Failed",
        description: "There was an error generating embeddings. Please try again later.",
        variant: "destructive",
      });
      
      throw error;
    }
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
   * Handle API errors
   */
  static handleQwenApiError(error: unknown): void {
    if (error instanceof Error) {
      console.error('QWEN API Error:', error);
      
      toast({
        title: "AI Request Failed",
        description: error.message || "There was an error contacting the AI service",
        variant: "destructive",
      });
    } else {
      console.error('Unknown error:', error);
      
      toast({
        title: "Unknown Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  }
}

// Export a singleton instance
export const qwenClient = new QwenClient();

// Export the error handler as a standalone function
export const handleQwenApiError = QwenClient.handleQwenApiError;

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