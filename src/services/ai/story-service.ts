import { QwenClient, qwenClient, handleQwenApiError } from './qwen-client';
import { StoryPriority, StoryStatus, StoryType, RiskLevel } from '@/types/story';

// Types for Story AI Service
export interface GeneratedStory {
  title: string;
  description: string;
  type: StoryType;
  priority: StoryPriority;
  points: number;
  tags: string[];
  acceptanceCriteria: string[];
  businessValue: number;
  riskLevel: RiskLevel;
}

export interface StoryPromptInput {
  businessDomain?: string;
  projectContext?: string;
  featureDescription: string;
  userPersona?: string;
  constraints?: string[];
}

export interface StoryGenerationOptions {
  includeAcceptanceCriteria?: boolean;
  suggestTags?: boolean;
  suggestPoints?: boolean;
  temperature?: number;
}

/**
 * AI Service for Story-related operations
 */
export class StoryAIService {
  private client: QwenClient;

  constructor(client = qwenClient) {
    this.client = client;
  }

  /**
   * Generate a user story based on a feature description
   */
  async generateStory(
    input: StoryPromptInput,
    options: StoryGenerationOptions = {}
  ): Promise<GeneratedStory> {
    try {
      const prompt = this.buildStoryGenerationPrompt(input, options);
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 1000,
        temperature: options.temperature || 0.7,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stop: ["```"]
      });

      // Parse the response into a structured story
      return this.parseStoryResponse(response.choices[0].text);
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to generate story');
    }
  }

  /**
   * Generate acceptance criteria for an existing story
   */
  async generateAcceptanceCriteria(storyDescription: string, count: number = 5): Promise<string[]> {
    try {
      const prompt = `Generate ${count} detailed acceptance criteria for the following user story:\n\n${storyDescription}\n\nThe acceptance criteria should be specific, measurable, and testable. Format your response as a list with each item on a new line starting with a dash.`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 500,
        temperature: 0.7
      });

      // Parse the response to extract acceptance criteria
      return this.parseListResponse(response.choices[0].text);
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to generate acceptance criteria');
    }
  }

  /**
   * Suggest story points based on description and acceptance criteria
   */
  async suggestStoryPoints(
    description: string, 
    acceptanceCriteria: string[]
  ): Promise<number> {
    try {
      const criteriaText = acceptanceCriteria.map(c => `- ${c}`).join('\n');
      const prompt = `Estimate story points (using Fibonacci sequence: 1, 2, 3, 5, 8, 13, 21) for the following user story:\n\nDescription: ${description}\n\nAcceptance Criteria:\n${criteriaText}\n\nConsider complexity, uncertainty, and effort required. Respond with just a single number representing the estimated story points.`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 10,
        temperature: 0.3
      });

      // Extract the number from the response
      const pointsMatch = response.choices[0].text.match(/\d+/);
      return pointsMatch ? parseInt(pointsMatch[0], 10) : 3; // Default to 3 if parsing fails
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to suggest story points');
    }
  }

  /**
   * Suggest relevant tags for a story based on its description
   */
  async suggestTags(description: string, existingTags: string[] = []): Promise<string[]> {
    try {
      const existingTagsText = existingTags.length > 0 
        ? `Existing tags: ${existingTags.join(', ')}\n` 
        : '';
        
      const prompt = `${existingTagsText}Suggest 3-5 relevant tags for categorizing the following user story. Each tag should be a single word or short phrase:\n\n${description}\n\nReturn only the tags as a comma-separated list.`;
      
      const response = await this.client.createCompletion({
        prompt,
        max_tokens: 100,
        temperature: 0.7
      });

      // Parse comma-separated tags
      const tagsText = response.choices[0].text.trim();
      return tagsText
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0 && !existingTags.includes(tag));
    } catch (error) {
      throw handleQwenApiError(error, 'Failed to suggest tags');
    }
  }

  /**
   * Build the prompt for story generation
   */
  private buildStoryGenerationPrompt(
    input: StoryPromptInput,
    options: StoryGenerationOptions
  ): string {
    // Build content blocks
    const domainBlock = input.businessDomain 
      ? `Business Domain: ${input.businessDomain}\n` 
      : '';
      
    const projectBlock = input.projectContext 
      ? `Project Context: ${input.projectContext}\n` 
      : '';
      
    const personaBlock = input.userPersona 
      ? `User Persona: ${input.userPersona}\n` 
      : '';
      
    const constraintsBlock = input.constraints && input.constraints.length > 0 
      ? `Constraints:\n${input.constraints.map(c => `- ${c}`).join('\n')}\n` 
      : '';

    // Build the prompt with all information
    return `
You are an expert agile product manager helping to create high-quality user stories.

${domainBlock}${projectBlock}${personaBlock}${constraintsBlock}
Feature Description: ${input.featureDescription}

Create a user story based on the information above.
Format your response as JSON with the following structure:
\`\`\`json
{
  "title": "A concise title for the story",
  "description": "A detailed description using the 'As a [role], I want [goal], so that [benefit]' format",
  "type": "${options.suggestPoints ? 'One of: enhancement, bugfix, feature, technical-debt' : 'enhancement'}",
  "priority": "${options.suggestPoints ? 'One of: low, medium, high, critical' : 'medium'}",
  ${options.suggestPoints ? '"points": "A Fibonacci number (1, 2, 3, 5, 8, 13, 21) based on complexity",' : ''}
  ${options.suggestTags ? '"tags": ["3-5 relevant tags for categorization"],' : ''}
  ${options.includeAcceptanceCriteria ? '"acceptanceCriteria": ["3-7 specific, measurable, and testable criteria"],' : ''}
  ${options.suggestPoints ? '"businessValue": "A number from 1-10 indicating business value",' : ''}
  ${options.suggestPoints ? '"riskLevel": "One of: low, medium, high"' : ''}
}
\`\`\`
`;
  }

  /**
   * Parse the AI response into a structured story
   */
  private parseStoryResponse(responseText: string): GeneratedStory {
    try {
      // Extract JSON from the response text (handling potential text before/after the JSON)
      const jsonMatch = responseText.match(/```json([\s\S]*?)```/) || 
                       responseText.match(/{[\s\S]*?}/);
                       
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }
      
      const jsonStr = jsonMatch[0].replace(/```json|```/g, '');
      const story = JSON.parse(jsonStr) as GeneratedStory;
      
      // Apply default values for any missing fields
      return {
        title: story.title || 'Untitled Story',
        description: story.description || '',
        type: story.type || 'enhancement',
        priority: story.priority || 'medium',
        points: story.points || 3,
        tags: story.tags || [],
        acceptanceCriteria: story.acceptanceCriteria || [],
        businessValue: story.businessValue || 5,
        riskLevel: story.riskLevel || 'low'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return a default story if parsing fails
      return {
        title: 'AI Generated Story',
        description: responseText.substring(0, 200),
        type: 'enhancement',
        priority: 'medium',
        points: 3,
        tags: [],
        acceptanceCriteria: [],
        businessValue: 5,
        riskLevel: 'low'
      };
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
export const storyAIService = new StoryAIService(); 