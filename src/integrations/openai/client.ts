import OpenAI from 'openai';
import { toast } from 'react-hot-toast';
import { defaultAIConfig, getModelConfig, saveAIConfig } from '../ai-config';

// Set up Qwen API key from environment variable or use a fallback
const QWEN_API_KEY = import.meta.env.VITE_QWEN_API_KEY || 'dummy-key-for-development';

// Initialize Qwen client using OpenAI-compatible SDK
const qwenClient = new OpenAI({
  apiKey: QWEN_API_KEY,
  baseURL: 'http://localhost:3001/api/qwen',
  dangerouslyAllowBrowser: true
});

// Error handling for API calls
const handleApiError = (error: any) => {
  console.error('AI API Error:', error);
  
  // Check for connection refused errors
  if (error.message && (
    error.message.includes('Failed to fetch') || 
    error.message.includes('NetworkError') ||
    error.message.includes('ECONNREFUSED') ||
    error.message.includes('ERR_CONNECTION_REFUSED')
  )) {
    const proxyError = "Unable to connect to AI proxy server. Please ensure the proxy server is running by executing 'npm run proxy' in a separate terminal window or using the start-app.bat file.";
    toast.error(proxyError);
    console.error("=== PROXY SERVER CONNECTION ERROR ===");
    console.error("The application cannot connect to the proxy server at http://localhost:3001");
    console.error("Please make sure:");
    console.error("1. You're running the proxy server with 'npm run proxy'");
    console.error("2. No other applications are using port 3001");
    console.error("3. There are no firewall or antivirus blocking the connection");
    console.error("Try running the 'start-app.bat' file to automatically handle port conflicts");
    throw new Error(proxyError);
  }
  
  const errorMessage = error.message || 'An error occurred with the AI service';
  toast.error(errorMessage);
  throw error;
};

// AI client implementation - using Qwen exclusively
export const aiClient = {
  generateContent: async (prompt: string, options = {}) => {
    try {
      const modelConfig = getModelConfig(defaultAIConfig.model);
      const model = modelConfig.model;
      
      console.log(`Using Qwen model: ${model}`);
      
      const response = await qwenClient.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        temperature: defaultAIConfig.temperature,
        ...options
      });
      
      if (!response.choices || !response.choices.length) {
        console.warn('Qwen API returned empty response:', response);
        return '';
      }
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      return handleApiError(error);
    }
  },

  generateStructuredData: async <T>(prompt: string, options = {}) => {
    try {
      const modelConfig = getModelConfig(defaultAIConfig.model);
      const model = modelConfig.model;
      
      console.log(`Using Qwen model for structured data: ${model}`);
      // For structured data, add instructions to output valid JSON
      const enhancedPrompt = `${prompt}\n\nPlease respond with valid JSON only.`;
      
      const response = await qwenClient.chat.completions.create({
        model: model,
        messages: [{ role: 'user', content: enhancedPrompt }],
        temperature: defaultAIConfig.temperature,
        response_format: { type: 'json_object' },
        ...options
      });
      
      if (!response.choices || !response.choices.length) {
        console.warn('Qwen API returned empty response:', response);
        return {} as T;
      }
      
      const content = response.choices[0]?.message?.content || '{}';
      try {
        return JSON.parse(content) as T;
      } catch (parseError) {
        console.error('Failed to parse JSON response:', content, parseError);
        toast.error('Failed to parse AI response as JSON');
        return {} as T;
      }
    } catch (error) {
      return handleApiError(error);
    }
  }
};

// Function to switch AI model at runtime
export const switchAiModel = (model: string) => {
  const result = saveAIConfig(model as any);
  if (!result) {
    toast.error('Failed to save AI model preferences');
  }
  return aiClient;
}; 