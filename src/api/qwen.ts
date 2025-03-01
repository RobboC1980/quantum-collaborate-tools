import axios from 'axios';
import { z } from 'zod';

// Environment configuration with validation
const getEnvVariable = (key: string, required = false): string => {
  const value = process.env[key] || '';
  if (required && !value) {
    console.error(`Required environment variable ${key} is not set`);
  }
  return value;
};

// Validate required API configuration
const QWEN_API_KEY = getEnvVariable('QWEN_API_KEY', true);
const QWEN_API_URL = getEnvVariable('QWEN_API_URL', true) || 'https://api.qwen.ai/v1';
const QWEN_MODEL = getEnvVariable('QWEN_MODEL') || 'qwen2.5-7b-instruct';
const QWEN_EMBEDDING_MODEL = getEnvVariable('QWEN_EMBEDDING_MODEL') || 'qwen2.5-embedding';

// Create a axios instance for QWEN API
const qwenAxios = axios.create({
  baseURL: QWEN_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${QWEN_API_KEY}`,
  },
  timeout: 30000, // 30 second timeout
});

// Input validation schemas
const completionRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  max_tokens: z.number().int().positive().optional(),
  temperature: z.number().min(0).max(1).optional(),
  top_p: z.number().min(0).max(1).optional(),
  stop: z.array(z.string()).optional(),
  frequency_penalty: z.number().min(0).max(2).optional(),
  presence_penalty: z.number().min(0).max(2).optional(),
});

const embeddingRequestSchema = z.object({
  input: z.union([
    z.string().min(1, "Input cannot be empty"),
    z.array(z.string().min(1))
  ]),
  model: z.string().optional(),
});

// Error handling
export class QwenApiError extends Error {
  status: number;
  code?: string;
  data?: Record<string, unknown>;

  constructor(message: string, status = 500, code?: string, data?: Record<string, unknown>) {
    super(message);
    this.name = 'QwenApiError';
    this.status = status;
    this.code = code;
    this.data = data;
  }
}

// Format error response
const formatErrorResponse = (error: unknown): QwenApiError => {
  if (error instanceof QwenApiError) {
    return error;
  }
  
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const errorData = error.response?.data as Record<string, unknown> || {};
    const errorMessage = typeof errorData.error === 'object' && errorData.error 
      ? (errorData.error as Record<string, unknown>).message as string
      : undefined;
    const message = errorMessage || error.message || 'Unknown QWEN API error';
    const code = typeof errorData.error === 'object' && errorData.error 
      ? (errorData.error as Record<string, unknown>).code as string
      : undefined;
    
    return new QwenApiError(message, status, code, errorData);
  }
  
  if (error instanceof Error) {
    return new QwenApiError(error.message);
  }
  
  return new QwenApiError('Unknown error occurred');
};

// API functions
export const qwenApi = {
  /**
   * Generate text completion using QWEN 2.5
   */
  async createCompletion(request: z.infer<typeof completionRequestSchema>) {
    try {
      // Validate request
      const validatedRequest = completionRequestSchema.parse(request);
      
      // Make API call
      const response = await qwenAxios.post('/completions', {
        model: QWEN_MODEL,
        ...validatedRequest
      });
      
      return response.data;
    } catch (error) {
      throw formatErrorResponse(error);
    }
  },
  
  /**
   * Generate embeddings using QWEN 2.5
   */
  async createEmbedding(request: z.infer<typeof embeddingRequestSchema>) {
    try {
      // Validate request
      const validatedRequest = embeddingRequestSchema.parse(request);
      
      // Make API call
      const response = await qwenAxios.post('/embeddings', {
        model: validatedRequest.model || QWEN_EMBEDDING_MODEL,
        ...validatedRequest
      });
      
      return response.data;
    } catch (error) {
      throw formatErrorResponse(error);
    }
  }
};

export default qwenApi; 