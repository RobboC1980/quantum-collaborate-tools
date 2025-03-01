import { qwenClient, handleQwenApiError, QwenCompletionRequest } from './qwen-client';

/**
 * Represents a generated story with title, description, and acceptance criteria
 */
export interface GeneratedStory {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

/**
 * Parameters for story generation
 */
export interface StoryGenerationParams {
  projectContext?: string;
  featureDescription: string;
  userPerspective?: string; // e.g. "As a project manager", "As a developer"
  additionalContext?: string;
  numberOfStories?: number;
}

/**
 * Service to generate user stories using AI
 */
export class StoryGenerator {
  /**
   * Generate user stories based on a feature description
   */
  static async generateStories(params: StoryGenerationParams): Promise<GeneratedStory[]> {
    try {
      const { 
        projectContext = '',
        featureDescription, 
        userPerspective = 'As a user',
        additionalContext = '',
        numberOfStories = 1
      } = params;

      // Create prompt for the AI
      const prompt = this.createStoryGenerationPrompt(
        projectContext,
        featureDescription,
        userPerspective,
        additionalContext,
        numberOfStories
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
      return this.parseStoryResponse(generatedText);
      
    } catch (error) {
      handleQwenApiError(error, 'Failed to generate stories');
      return [];
    }
  }

  /**
   * Create a structured prompt for story generation
   */
  private static createStoryGenerationPrompt(
    projectContext: string,
    featureDescription: string,
    userPerspective: string,
    additionalContext: string,
    numberOfStories: number
  ): string {
    return `
I need to create ${numberOfStories} detailed user stor${numberOfStories > 1 ? 'ies' : 'y'} for a software development project.

${projectContext ? `Project Context: ${projectContext}\n` : ''}

Feature to implement: ${featureDescription}

${additionalContext ? `Additional context: ${additionalContext}\n` : ''}

Please generate ${numberOfStories} well-structured user stor${numberOfStories > 1 ? 'ies' : 'y'} from the perspective of "${userPerspective}".

For each story, include:
1. A clear title in the format "As a [user type], I want [action], so that [benefit]"
2. A detailed description explaining the feature
3. A list of acceptance criteria (at least 3)

Format the response as follows:
STORY 1:
TITLE: [User story title]
DESCRIPTION: [Detailed description]
ACCEPTANCE CRITERIA:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
...

${numberOfStories > 1 ? 'STORY 2:' : ''}
${numberOfStories > 1 ? 'TITLE: [User story title]' : ''}
${numberOfStories > 1 ? 'DESCRIPTION: [Detailed description]' : ''}
${numberOfStories > 1 ? 'ACCEPTANCE CRITERIA:' : ''}
${numberOfStories > 1 ? '- [Criterion 1]' : ''}
${numberOfStories > 1 ? '- [Criterion 2]' : ''}
${numberOfStories > 1 ? '- [Criterion 3]' : ''}
${numberOfStories > 1 ? '...' : ''}

${numberOfStories > 2 ? '...' : ''}
`;
  }

  /**
   * Parse the AI response into structured story objects
   */
  private static parseStoryResponse(text: string): GeneratedStory[] {
    const stories: GeneratedStory[] = [];
    const storyBlocks = text.split(/STORY \d+:/g).filter(block => block.trim());

    for (const block of storyBlocks) {
      try {
        // Extract title
        const titleMatch = block.match(/TITLE:([^\n]+)/i);
        const title = titleMatch ? titleMatch[1].trim() : '';

        // Extract description
        const descMatch = block.match(/DESCRIPTION:([^]*?)(?=ACCEPTANCE CRITERIA:)/i);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract acceptance criteria
        const criteriaMatch = block.match(/ACCEPTANCE CRITERIA:([^]*?)(?=(STORY \d+:|$))/i);
        const criteriaText = criteriaMatch ? criteriaMatch[1].trim() : '';
        
        // Parse criteria points
        const criteria = criteriaText
          .split(/\n-|\n\*/)
          .map(point => point.trim())
          .filter(point => point.length > 0);

        stories.push({
          title,
          description,
          acceptanceCriteria: criteria,
        });
      } catch (error) {
        console.error('Error parsing story from AI response:', error);
      }
    }

    return stories;
  }
}

export default StoryGenerator; 