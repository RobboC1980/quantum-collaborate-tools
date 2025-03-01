import { QwenClient, qwenClient, handleQwenApiError } from './qwen-client';
import { TaskPriority, TaskStatus } from '@/types/task';
import { StoryWithRelations } from '@/types/story';

// Types for Task AI Service
export interface GeneratedTask {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours: number;
  tags: string[];
  subtasks: { title: string; completed: boolean }[];
  completionCriteria?: string;
}

export interface TaskBreakdownOptions {
  numberOfTasks?: number;
  includeSubtasks?: boolean;
  suggestEstimates?: boolean;
  detailedDescriptions?: boolean;
}

/**
 * AI Service for Task-related operations
 */
export class TaskAIService {
  private client: QwenClient;

  constructor(client = qwenClient) {
    this.client = client;
  }

  /**
   * Break down a story into tasks
   */
  async breakdownStoryIntoTasks(
    story: Partial<StoryWithRelations>,
    options: TaskBreakdownOptions = {}
  ): Promise<GeneratedTask[]> {
    try {
      const prompt = this.buildTaskBreakdownPrompt(story, options);
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 1500,
        temperature: 0.7,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.2,
      });

      // Parse the response into a structured list of tasks
      return this.parseTasksResponse(response.choices[0].text);
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to break down story into tasks');
    }
  }

  /**
   * Suggest estimated hours for a task
   */
  async suggestTaskEstimate(
    taskTitle: string, 
    taskDescription: string
  ): Promise<number> {
    try {
      const prompt = `Based on the following task, estimate how many hours it would take an average developer to complete.
      
Task Title: ${taskTitle}
Task Description: ${taskDescription}

Consider the complexity, scope, and potential challenges. Provide a realistic estimate in hours as a single number.
Respond with just the number of hours (e.g., "4" for 4 hours).`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 10,
        temperature: 0.3
      });

      // Extract the number from the response
      const hoursMatch = response.choices[0].text.match(/\d+/);
      return hoursMatch ? parseInt(hoursMatch[0], 10) : 4; // Default to 4 if parsing fails
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to suggest task estimate');
    }
  }

  /**
   * Generate subtasks for a given task
   */
  async generateSubtasks(
    taskTitle: string, 
    taskDescription: string, 
    count: number = 4
  ): Promise<{ title: string; completed: boolean }[]> {
    try {
      const prompt = `Break down the following task into ${count} logical subtasks that would help complete it:
      
Task Title: ${taskTitle}
Task Description: ${taskDescription}

List each subtask as a clear, actionable item.
Format your response as a bulleted list with each item on a new line starting with a dash.`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 500,
        temperature: 0.7
      });

      // Parse the list response
      const subtaskTitles = this.parseListResponse(response.choices[0].text);
      
      // Convert to subtask objects
      return subtaskTitles.map(title => ({
        title,
        completed: false
      }));
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to generate subtasks');
    }
  }

  /**
   * Suggest completion criteria for a task
   */
  async suggestCompletionCriteria(
    taskTitle: string, 
    taskDescription: string
  ): Promise<string> {
    try {
      const prompt = `For the following task, generate clear and specific completion criteria. The criteria should define when the task can be considered complete and ready for review.
      
Task Title: ${taskTitle}
Task Description: ${taskDescription}

The completion criteria should be measurable and testable. Provide a concise paragraph describing the completion criteria.`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 200,
        temperature: 0.7
      });

      return response.choices[0].text.trim();
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to suggest completion criteria');
    }
  }

  /**
   * Build the prompt for task breakdown
   */
  private buildTaskBreakdownPrompt(
    story: Partial<StoryWithRelations>,
    options: TaskBreakdownOptions
  ): string {
    // Extract the story information
    const title = story.title || '';
    const description = story.description || '';
    const acceptanceCriteria = story.acceptanceCriteria 
      ? story.acceptanceCriteria.map(c => `- ${c}`).join('\n') 
      : '';
      
    const taskCount = options.numberOfTasks || 4;
    
    // Build the prompt
    return `
You are an expert agile team member helping to break down a user story into specific tasks.

Story Title: ${title}
Story Description: ${description}
${acceptanceCriteria ? `\nAcceptance Criteria:\n${acceptanceCriteria}` : ''}

Break down this story into ${taskCount} detailed technical tasks that would be needed to implement it.
${options.detailedDescriptions ? 'Provide detailed descriptions for each task.' : ''}
${options.includeSubtasks ? 'Include 2-4 subtasks for each task.' : ''}
${options.suggestEstimates ? 'Suggest estimated hours for each task.' : ''}

Format your response as JSON with the following structure:
\`\`\`json
[
  {
    "title": "Task title",
    "description": "Detailed task description",
    "status": "to-do",
    "priority": "medium",
    ${options.suggestEstimates ? '"estimatedHours": "Estimated hours as a number (e.g., 4)",' : ''}
    "tags": ["relevant", "tags"],
    ${options.includeSubtasks ? '"subtasks": [{"title": "Subtask title", "completed": false}, ...],' : ''}
    "completionCriteria": "Measurable criteria for when this task is complete"
  },
  ...
]
\`\`\`

Make sure the tasks are technical and specific enough for a developer to implement.
`;
  }

  /**
   * Parse the AI response into a structured list of tasks
   */
  private parseTasksResponse(responseText: string): GeneratedTask[] {
    try {
      // Extract JSON from the response text (handling potential text before/after the JSON)
      const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || 
                       responseText.match(/\[([\s\S]*?)\]/);
                       
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }
      
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '');
      const tasks = JSON.parse(jsonStr) as GeneratedTask[];
      
      // Validate and apply defaults to each task
      return tasks.map(task => ({
        title: task.title || 'Untitled Task',
        description: task.description || '',
        status: task.status || 'to-do',
        priority: task.priority || 'medium',
        estimatedHours: task.estimatedHours || 4,
        tags: task.tags || [],
        subtasks: task.subtasks || [],
        completionCriteria: task.completionCriteria
      }));
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return a default task if parsing fails
      return [{
        title: 'AI Generated Task',
        description: responseText.substring(0, 200),
        status: 'to-do',
        priority: 'medium',
        estimatedHours: 4,
        tags: [],
        subtasks: []
      }];
    }
  }

  /**
   * Parse a list response from the AI
   */
  private parseListResponse(responseText: string): string[] {
    // Split by new lines and find lines that start with - or *
    return responseText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*'))
      .map(line => line.substring(1).trim())
      .filter(item => item.length > 0);
  }
}

// Export a singleton instance
export const taskAIService = new TaskAIService(); 