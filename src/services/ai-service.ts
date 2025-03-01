import { aiClient } from '@/integrations/openai/client';
import { Story, StoryWithRelations } from '@/types/story';
import { Task, TaskWithRelations, TaskStatus, TaskPriority } from '@/types/task';
import { toast } from 'react-hot-toast';

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

// Interface for AI writing assistance
export interface WritingAssistanceResult {
  content: string;
  suggestions: string[];
}

// Logging function for AI operations
const logAiOperation = (operation: string, success: boolean, details?: any) => {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'FAILURE';
  console.log(`[AI-SERVICE][${timestamp}][${status}] ${operation}`, details || '');
};

// Retry mechanism for AI operations
const withRetry = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries = 2
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`[AI-SERVICE] Retry attempt ${attempt - 1} for ${operationName}`);
      }
      
      const result = await operation();
      logAiOperation(operationName, true);
      return result;
    } catch (error) {
      lastError = error;
      logAiOperation(operationName, false, { error: error instanceof Error ? error.message : String(error), attempt });
      
      // Don't wait on the last attempt
      if (attempt <= maxRetries) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const backoffTime = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    }
  }
  
  // If we get here, all retries failed
  throw lastError;
};

// AI service for handling all AI-powered features
export const aiService = {
  /**
   * Generate a story description and outline based on a title
   */
  async generateStoryDescription(title: string): Promise<StoryGenerationResult> {
    return withRetry(async () => {
      const prompt = `
        As a writing assistant for a student or content creator, please generate a comprehensive description and outline for the following writing project: "${title}".
        
        Please format your response as a JSON object with the following structure:
        {
          "description": "A paragraph describing the writing project and its goals",
          "outline": ["Section 1", "Section 2", "Section 3", ...]
        }
        
        The description should be a single paragraph explaining what the project is about, its purpose, and key elements to cover.
        The outline should break down the project into logical sections or chapters.
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

export default aiService; 