// Export all AI-related services and types

// QWEN API Client
export { 
  qwenClient, 
  handleQwenApiError,
  type QwenCompletionRequest,
  type QwenCompletionResponse,
  type QwenEmbeddingRequest,
  type QwenEmbeddingResponse,
  type QwenApiError,
  type QwenConfig
} from './qwen-client';

// Story Generator
export {
  StoryGenerator,
  type GeneratedStory,
  type StoryGenerationParams
} from './story-generator';

// Task Generator
export {
  TaskGenerator,
  type GeneratedTask,
  type TaskGenerationParams,
  type SubtaskGenerationParams,
  type TaskEstimationParams,
  type CompletionCriteriaParams
} from './task-generator';

// Import services for default export
import { qwenClient } from './qwen-client';
import { StoryGenerator } from './story-generator';
import { TaskGenerator } from './task-generator';

// Default export for convenience
export default {
  qwenClient,
  StoryGenerator,
  TaskGenerator
}; 