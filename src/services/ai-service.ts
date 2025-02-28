import { aiClient } from '@/integrations/openai/client';
import { Story, StoryWithRelations } from '@/types/story';
import { Task, TaskWithRelations, TaskStatus, TaskPriority } from '@/types/task';

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

// AI service for handling all AI-powered features
export const aiService = {
  /**
   * Generate a story description and outline based on a title
   */
  async generateStoryDescription(title: string): Promise<StoryGenerationResult> {
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
    
    return await aiClient.generateStructuredData<StoryGenerationResult>(prompt);
  },
  
  /**
   * Generate tasks for a story based on its description and outline
   */
  async generateTasksForStory(story: Story): Promise<TaskGenerationResult> {
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
    
    return await aiClient.generateStructuredData<TaskGenerationResult>(prompt);
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
    let prompt = `
      You're helping with a writing task titled "${task.title}" that is described as: "${task.description}".
    `;
    
    switch (requestType) {
      case 'contentDraft':
        prompt += `
          Please draft initial content for this task. The content should be well-structured,
          appropriate for the topic, and serve as a solid starting point for the writer.
          Please format your response as a JSON object with:
          {
            "content": "Your draft content here...",
            "suggestions": ["Additional suggestion 1", "Additional suggestion 2", ...]
          }
          The content should be substantial but not excessive (approximately 250-400 words).
          Include 2-3 suggestions for how the writer might expand on or improve the draft.
        `;
        break;
        
      case 'suggestions':
        prompt += `
          Please provide creative suggestions for how to develop this task.
          These could include potential arguments, examples, perspectives, or approaches.
          Format your response as a JSON object with:
          {
            "content": "",
            "suggestions": ["Detailed suggestion 1", "Detailed suggestion 2", ...]
          }
          The content field should be empty, and include 4-6 detailed suggestions in the suggestions array.
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
    
    return await aiClient.generateStructuredData<WritingAssistanceResult>(prompt);
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