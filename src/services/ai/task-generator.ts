import { qwenClient, handleQwenApiError, QwenCompletionRequest } from './qwen-client';

/**
 * Represents a generated task with title, description, and estimated points
 */
export interface GeneratedTask {
  title: string;
  description: string;
  estimatedPoints?: number;
  subtasks?: string[];
  completionCriteria?: string[];
}

/**
 * Parameters for task generation
 */
export interface TaskGenerationParams {
  storyTitle: string;
  storyDescription: string;
  acceptanceCriteria?: string[];
  teamContext?: string; // e.g. "Frontend team", "Backend team"
  taskType?: 'development' | 'design' | 'testing' | 'documentation' | 'general';
  numberOfTasks?: number;
  includeTechDetails?: boolean;
}

/**
 * Parameters for subtask generation
 */
export interface SubtaskGenerationParams {
  parentTaskTitle: string;
  parentTaskDescription: string;
  teamContext?: string;
  taskType?: 'development' | 'design' | 'testing' | 'documentation' | 'general';
  numberOfSubtasks?: number;
}

/**
 * Parameters for task estimation
 */
export interface TaskEstimationParams {
  taskTitle: string;
  taskDescription: string;
  teamContext?: string;
  complexityFactors?: string[];
  estimationScale?: 'fibonacci' | 'linear' | 'tshirt';
}

/**
 * Parameters for completion criteria generation
 */
export interface CompletionCriteriaParams {
  taskTitle: string;
  taskDescription: string;
  taskType?: 'development' | 'design' | 'testing' | 'documentation' | 'general';
  numberOfCriteria?: number;
}

/**
 * Service to generate tasks using AI
 */
export class TaskGenerator {
  /**
   * Generate tasks based on a user story
   */
  static async generateTasks(params: TaskGenerationParams): Promise<GeneratedTask[]> {
    try {
      const { 
        storyTitle,
        storyDescription,
        acceptanceCriteria = [],
        teamContext = '',
        taskType = 'general',
        numberOfTasks = 3,
        includeTechDetails = true
      } = params;

      // Create prompt for the AI
      const prompt = this.createTaskGenerationPrompt(
        storyTitle,
        storyDescription,
        acceptanceCriteria,
        teamContext,
        taskType,
        numberOfTasks,
        includeTechDetails
      );

      // Configure the request
      const request: QwenCompletionRequest = {
        prompt,
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
      };

      // Call the QWEN API
      const response = await qwenClient.createCompletion(request);
      
      // Parse the response
      const generatedText = response.choices[0].text.trim();
      return this.parseTaskResponse(generatedText);
      
    } catch (error) {
      handleQwenApiError(error, 'Failed to generate tasks');
      return [];
    }
  }

  /**
   * Generate subtasks for a specific task
   */
  static async generateSubtasks(params: SubtaskGenerationParams): Promise<string[]> {
    try {
      const { 
        parentTaskTitle,
        parentTaskDescription,
        teamContext = '',
        taskType = 'general',
        numberOfSubtasks = 3
      } = params;

      // Create prompt for the AI
      const prompt = `
I need to break down a task into ${numberOfSubtasks} detailed subtasks.

PARENT TASK: ${parentTaskTitle}
TASK DESCRIPTION: ${parentTaskDescription}
${teamContext ? `TEAM CONTEXT: ${teamContext}` : ''}
TASK TYPE: ${taskType}

Please generate ${numberOfSubtasks} specific and actionable subtasks that would be needed to complete this parent task. 
Each subtask should be a discrete piece of work that can be completed independently.

Format the response as a list with one subtask per line, starting with a dash:
- [Subtask 1]
- [Subtask 2]
- [Subtask 3]
${numberOfSubtasks > 3 ? '- [Subtask 4]' : ''}
${numberOfSubtasks > 4 ? '- [Subtask 5]' : ''}
...
`;

      // Configure the request
      const request: QwenCompletionRequest = {
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
      };

      // Call the QWEN API
      const response = await qwenClient.createCompletion(request);
      
      // Parse the response
      const generatedText = response.choices[0].text.trim();
      return generatedText
        .split('\n')
        .map(line => line.replace(/^[-*]\s/, '').trim())
        .filter(line => line.length > 0);
      
    } catch (error) {
      handleQwenApiError(error, 'Failed to generate subtasks');
      return [];
    }
  }

  /**
   * Generate an effort estimation for a task
   */
  static async estimateTaskEffort(params: TaskEstimationParams): Promise<number> {
    try {
      const { 
        taskTitle,
        taskDescription,
        teamContext = '',
        complexityFactors = [],
        estimationScale = 'fibonacci'
      } = params;

      // Determine the scale explanation based on the estimation type
      let scaleExplanation = '';
      let possibleValues = '';
      
      if (estimationScale === 'fibonacci') {
        scaleExplanation = 'Fibonacci sequence (1, 2, 3, 5, 8, 13, 21)';
        possibleValues = '1, 2, 3, 5, 8, 13, or 21';
      } else if (estimationScale === 'linear') {
        scaleExplanation = 'Linear scale from 1 to 10';
        possibleValues = '1, 2, 3, 4, 5, 6, 7, 8, 9, or 10';
      } else if (estimationScale === 'tshirt') {
        scaleExplanation = 'T-shirt sizes converted to numbers (XS=1, S=2, M=3, L=5, XL=8, XXL=13)';
        possibleValues = '1, 2, 3, 5, 8, or 13';
      }

      // Create prompt for the AI
      const prompt = `
I need to estimate the effort required for a development task using story points on a ${scaleExplanation}.

TASK: ${taskTitle}
DESCRIPTION: ${taskDescription}
${teamContext ? `TEAM CONTEXT: ${teamContext}` : ''}
${complexityFactors.length > 0 ? `COMPLEXITY FACTORS:\n- ${complexityFactors.join('\n- ')}` : ''}

Based on the information provided, estimate the appropriate story points for this task.
Consider factors like technical complexity, uncertainty, and required effort.

Please provide your estimate as a single number from the following possible values: ${possibleValues}.
Format the response as: ESTIMATE: [number]
`;

      // Configure the request
      const request: QwenCompletionRequest = {
        prompt,
        max_tokens: 100,
        temperature: 0.3,
      };

      // Call the QWEN API
      const response = await qwenClient.createCompletion(request);
      
      // Parse the response
      const generatedText = response.choices[0].text.trim();
      const match = generatedText.match(/ESTIMATE:\s*(\d+)/i);
      
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
      
      // If we couldn't parse a number, try to find any number in the response
      const numberMatch = generatedText.match(/\d+/);
      return numberMatch ? parseInt(numberMatch[0], 10) : 3; // Default to 3 if we can't find a number
      
    } catch (error) {
      handleQwenApiError(error, 'Failed to estimate task effort');
      return 3; // Default to 3 points if estimation fails
    }
  }

  /**
   * Generate completion criteria for a task
   */
  static async generateCompletionCriteria(params: CompletionCriteriaParams): Promise<string[]> {
    try {
      const { 
        taskTitle,
        taskDescription,
        taskType = 'general',
        numberOfCriteria = 3
      } = params;

      // Create prompt for the AI
      const prompt = `
I need to define ${numberOfCriteria} clear completion criteria for a ${taskType} task.

TASK: ${taskTitle}
DESCRIPTION: ${taskDescription}

Please generate ${numberOfCriteria} specific and measurable criteria that would indicate this task is complete.
Each criterion should be objective and verifiable.

Format the response as a list with one criterion per line, starting with a dash:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
${numberOfCriteria > 3 ? '- [Criterion 4]' : ''}
${numberOfCriteria > 4 ? '- [Criterion 5]' : ''}
...
`;

      // Configure the request
      const request: QwenCompletionRequest = {
        prompt,
        max_tokens: 1000,
        temperature: 0.7,
      };

      // Call the QWEN API
      const response = await qwenClient.createCompletion(request);
      
      // Parse the response
      const generatedText = response.choices[0].text.trim();
      return generatedText
        .split('\n')
        .map(line => line.replace(/^[-*]\s/, '').trim())
        .filter(line => line.length > 0);
      
    } catch (error) {
      handleQwenApiError(error, 'Failed to generate completion criteria');
      return [];
    }
  }

  /**
   * Create a structured prompt for task generation
   */
  private static createTaskGenerationPrompt(
    storyTitle: string,
    storyDescription: string,
    acceptanceCriteria: string[],
    teamContext: string,
    taskType: string,
    numberOfTasks: number,
    includeTechDetails: boolean
  ): string {
    return `
I need to break down a user story into ${numberOfTasks} practical development tasks.

USER STORY: ${storyTitle}
DESCRIPTION: ${storyDescription}
${acceptanceCriteria.length > 0 ? `ACCEPTANCE CRITERIA:\n- ${acceptanceCriteria.join('\n- ')}` : ''}
${teamContext ? `TEAM CONTEXT: ${teamContext}` : ''}
TASK TYPE: ${taskType}

Please generate ${numberOfTasks} specific and actionable tasks that would be needed to complete this user story. 
Each task should be something that a developer can work on independently.
${includeTechDetails ? 'Include technical implementation details where appropriate.' : 'Focus on what needs to be done, not how.'}

Format the response as follows:
TASK 1:
TITLE: [Task title]
DESCRIPTION: [Detailed task description]
${includeTechDetails ? 'ESTIMATED POINTS: [A number from 1-8 representing complexity]' : ''}

TASK 2:
TITLE: [Task title]
DESCRIPTION: [Detailed task description]
${includeTechDetails ? 'ESTIMATED POINTS: [A number from 1-8 representing complexity]' : ''}

${numberOfTasks > 2 ? 'TASK 3:' : ''}
${numberOfTasks > 2 ? 'TITLE: [Task title]' : ''}
${numberOfTasks > 2 ? 'DESCRIPTION: [Detailed task description]' : ''}
${numberOfTasks > 2 && includeTechDetails ? 'ESTIMATED POINTS: [A number from 1-8 representing complexity]' : ''}

${numberOfTasks > 3 ? '...' : ''}
`;
  }

  /**
   * Parse the AI response into structured task objects
   */
  private static parseTaskResponse(text: string): GeneratedTask[] {
    const tasks: GeneratedTask[] = [];
    const taskBlocks = text.split(/TASK \d+:/g).filter(block => block.trim());

    for (const block of taskBlocks) {
      try {
        // Extract title
        const titleMatch = block.match(/TITLE:([^\n]+)/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract description
        const descMatch = block.match(/DESCRIPTION:([^]*?)(?=(ESTIMATED POINTS:|TASK \d+:|$))/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract estimated points if present
        const pointsMatch = block.match(/ESTIMATED POINTS:([^\n]+)/i);
        const pointsStr = pointsMatch ? pointsMatch[1].trim() : '';
        const estimatedPoints = pointsStr ? parseInt(pointsStr, 10) || undefined : undefined;

        tasks.push({
          title,
          description,
          estimatedPoints,
        });
      } catch (error) {
        console.error('Error parsing task from AI response:', error);
      }
    }

    return tasks;
  }
}

export default TaskGenerator; 