import { aiClient } from '@/integrations/openai/client';
import { Story, StoryWithRelations } from '@/types/story';
import { Task, TaskWithRelations, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from 'react-hot-toast';
import { UserStoryFormat } from '@/components/ai/StoryGenerator';

// Interface for AI-generated story descriptions and outlines
export interface StoryGenerationResult {
  description: string;
  outline: string[];
}

// Interface for AI-generated tasks
export interface TaskGenerationResult {
  tasks: {
    title: string;
    description: string;
    estimatedHours?: number;
  }[];
}

// Interface for AI-generated acceptance criteria
export interface AcceptanceCriteriaResult {
  criteria: string[];
}

// Interface for AI writing assistance
export interface WritingAssistanceResult {
  content: string;
  suggestions: string[];
}

// Logging helper for AI operations
const logAiOperation = (
  operation: string, 
  success: boolean, 
  details?: Record<string, unknown>
) => {
  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`[AI-SERVICE] ${operation} ${status}`, details || '');
  
  // In a real app, you might want to log this to an analytics service
  if (!success) {
    toast.error(`AI operation failed: ${operation}`);
  }
};

// Helper function to retry API calls with exponential backoff
const withRetry = async <T>(
  fn: () => Promise<T>,
  operationName: string,
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let lastError: unknown;
  
  while (retries < maxRetries) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.error(`Error in ${operationName} (attempt ${retries + 1}/${maxRetries}):`, error);
      
      // Only retry on network errors or rate limits
      if (error instanceof Error && 
          (error.message.includes('network') || 
           error.message.includes('timeout') || 
           error.message.includes('rate limit'))) {
        retries++;
        // Exponential backoff: 1s, 2s, 4s, etc.
        const delay = Math.pow(2, retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }
  
  // If we've exhausted retries or hit a non-retryable error
  throw lastError;
};

// AI service for handling all AI-powered features
export const aiService = {
  /**
   * Generate a story description and outline based on a title
   */
  async generateStoryDescription(title: string, storyFormat: UserStoryFormat = 'user'): Promise<StoryGenerationResult> {
    return withRetry(async () => {
      // Get the appropriate format prefix
      const formatPrefix = getStoryFormatPrefix(storyFormat);
      
      const prompt = `
        As a product manager or agile coach, please generate a user story with acceptance criteria for the following request: "${title}".
        
        Please format your response as a JSON object with the following structure:
        {
          "description": "A user story in the format '${formatPrefix} [action] so that [benefit]'",
          "outline": ["Acceptance Criterion 1", "Acceptance Criterion 2", "Acceptance Criterion 3", ...]
        }
        
        The description should be a single, well-formed user story that follows the format "${formatPrefix} [action] so that [benefit]".
        The outline should contain 3-6 specific, testable acceptance criteria that clearly define when the story is complete.
        Each acceptance criterion should be concise, clear, and focused on a single requirement.
      `;
      
      const result = await aiClient.generateStructuredData<StoryGenerationResult>(prompt);
      
      // Validate the response
      if (!result.description || !result.outline || !Array.isArray(result.outline)) {
        throw new Error('AI returned an invalid response format');
      }
      
      return result;
    }, 'generateStoryDescription');
  },
  
  /**
   * Generate acceptance criteria for a story based on its title and description
   */
  async generateAcceptanceCriteria(story: { title: string; description: string }): Promise<AcceptanceCriteriaResult> {
    return withRetry(async () => {
      const prompt = `
        Based on the following user story titled "${story.title}" with description "${story.description}", 
        please generate a list of acceptance criteria that would define when this story is complete.
        
        Please format your response as a JSON object with the following structure:
        {
          "criteria": ["Criterion 1", "Criterion 2", "Criterion 3", ...]
        }
        
        Include 3-6 specific, testable acceptance criteria that clearly define when the story is complete.
        Each criterion should be concise, clear, and focused on a single requirement.
        Criteria should follow the format "The system should..." or similar action-oriented phrasing.
      `;
      
      const result = await aiClient.generateStructuredData<AcceptanceCriteriaResult>(prompt);
      
      // Validate the response
      if (!result.criteria || !Array.isArray(result.criteria)) {
        throw new Error('AI returned an invalid response format');
      }
      
      return result;
    }, 'generateAcceptanceCriteria');
  },
  
  /**
   * Generate tasks for a story based on its description and outline
   */
  async generateTasksForStory(story: Story): Promise<TaskGenerationResult> {
    return withRetry(async () => {
      const prompt = `
        Based on the following writing project titled "${story.title}" with description "${story.description}", 
        please generate a list of tasks that would help complete this project.
        
        ${story.acceptanceCriteria?.length ? `The project should meet these criteria: ${story.acceptanceCriteria.join(', ')}` : ''}
        
        Please format your response as a JSON object with the following structure:
        {
          "tasks": [
            {
              "title": "Task title",
              "description": "Detailed description of what this task involves",
              "estimatedHours": 2.5
            },
            ...
          ]
        }
        
        Include 4-8 tasks that logically break down the work required for this project.
        Each task should be specific, actionable, and have a clear outcome.
        For estimatedHours, provide a reasonable time estimate in hours (can be decimal).
      `;
      
      const result = await aiClient.generateStructuredData<TaskGenerationResult>(prompt);
      
      // Validate the response
      if (!result.tasks || !Array.isArray(result.tasks)) {
        throw new Error('AI returned an invalid response format');
      }
      
      return result;
    }, 'generateTasksForStory');
  },
  
  /**
   * Generate tasks from a story for the QuantumScribe application
   */
  async generateTasksFromStory(story: StoryWithRelations): Promise<Task[]> {
    // First, get the task generation result
    const result = await this.generateTasksForStory(story);
    
    // Convert the result to Task objects with generated IDs
    return result.tasks.map((task, index) => ({
      id: `generated-${Date.now()}-${index}`,
      title: task.title,
      description: task.description,
      status: 'to-do' as TaskStatus,
      priority: 'medium' as TaskPriority,
      estimatedHours: task.estimatedHours || 0,
      storyId: story.id,
      reporterId: story.reporterId,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      subtasks: [],
      attachments: [],
      columnPosition: 0
    }));
  },
  
  /**
   * Provide AI-assisted writing help for a specific task
   */
  async getWritingAssistance(
    task: Partial<Task> & { title: string; description: string }, 
    requestType: 'contentDraft' | 'suggestions' | 'researchTopic'
  ): Promise<WritingAssistanceResult> {
    return withRetry(async () => {
      let prompt = `
        I'm working on the following writing task:
        Title: "${task.title}"
        Description: "${task.description}"
        
      `;
      
      switch (requestType) {
        case 'contentDraft':
          prompt += `
            Please write a draft for this task.
            Format your response as a JSON object with:
            {
              "content": "The full draft content",
              "suggestions": ["Suggestion 1 for improvement", "Suggestion 2 for improvement", ...]
            }
            The content should be a complete draft addressing the task description.
            Include 3-5 suggestions for how to improve or expand the draft.
          `;
          break;
          
        case 'suggestions':
          prompt += `
            Please provide suggestions for how to approach this writing task.
            Format your response as a JSON object with:
            {
              "content": "A paragraph explaining the best approach to this task",
              "suggestions": ["Specific suggestion 1", "Specific suggestion 2", ...]
            }
            The content should explain the overall approach to take.
            Include 3-5 specific suggestions for content, structure, or style.
          `;
          break;
          
        case 'researchTopic':
          prompt += `
            Please recommend research topics and potential sources that would be helpful for this task.
            Format your response as a JSON object with:
            {
              "content": "A paragraph explaining why research is important for this topic and how to approach it",
              "suggestions": ["Research topic 1: brief explanation and potential sources", "Research topic 2: brief explanation and potential sources", ...]
            }
            Include 3-5 specific research topics with brief explanations and suggestions of where to find information.
          `;
          break;
      }
      
      const result = await aiClient.generateStructuredData<WritingAssistanceResult>(prompt);
      
      // Validate the response
      if (!result.content || !result.suggestions || !Array.isArray(result.suggestions)) {
        throw new Error('AI returned an invalid response format');
      }
      
      return result;
    }, 'getWritingAssistance');
  },
  
  /**
   * Review and suggest improvements for written content
   */
  async reviewContent(content: string, focusAreas?: string[]): Promise<string> {
    const areasToFocus = focusAreas?.length 
      ? `Focus particularly on these areas: ${focusAreas.join(', ')}.` 
      : 'Focus on clarity, structure, grammar, and style.';
    
    const prompt = `
      Please review the following written content and provide constructive feedback and suggestions for improvement.
      ${areasToFocus}
      
      Content to review:
      "${content}"
      
      Provide your feedback in a helpful, constructive manner that identifies strengths and offers specific suggestions
      for improvement.
    `;
    
    return await aiClient.generateContent(prompt);
  }
};

/**
 * Helper function to get the appropriate user story format prefix
 */
function getStoryFormatPrefix(format: UserStoryFormat): string {
  const formatPrefixes: Record<UserStoryFormat, string> = {
    'user': 'As a user, I want to',
    'developer': 'As a developer, I want to',
    'administrator': 'As an administrator, I want to',
    'product-owner': 'As a product owner, I want to',
    'tester': 'As a tester, I want to',
    'stakeholder': 'As a stakeholder, I want to'
  };
  
  return formatPrefixes[format];
}

export default aiService; 