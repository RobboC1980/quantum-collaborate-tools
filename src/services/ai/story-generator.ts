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
    // Add an AbortController for request cancellation
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => {
      abortController.abort();
      console.log('Aborting story generation request due to timeout');
    }, 100000); // 100 second timeout
    
    try {
      const { 
        projectContext = '',
        featureDescription, 
        userPerspective = 'As a user',
        additionalContext = '',
        numberOfStories = 1
      } = params;

      // Guard against empty or very short feature descriptions
      if (!featureDescription || featureDescription.length < 5) {
        console.error('Feature description is too short or empty');
        throw new Error('Feature description is too short. Please provide more details.');
      }

      // Create concise prompt for the AI
      const prompt = this.createStoryGenerationPrompt(
        projectContext,
        featureDescription,
        userPerspective,
        additionalContext,
        numberOfStories
      );

      // Configure the request with more conservative settings
      const request: QwenCompletionRequest = {
        prompt,
        max_tokens: 600, // Further reduce token count to avoid timeouts
        temperature: 0.4, // Lower temperature for more predictable output
        top_p: 0.85,
      };

      console.log("Generating stories with prompt length:", prompt.length);
      
      try {
        // Call the QWEN API with proper error handling and abort signal
        const response = await qwenClient.createCompletion(request);
        
        // Check if response has valid choices
        if (!response || !response.choices || response.choices.length === 0) {
          console.error('API returned empty response', response);
          return [];
        }
        
        // Parse the response text
        const generatedText = response.choices[0].text.trim();
        
        if (!generatedText) {
          console.error('API returned empty text');
          return [];
        }
        
        // Parse the response into structured story objects
        const stories = this.parseStoryResponse(generatedText);
        console.log('Successfully generated and parsed stories:', stories.length);
        
        // Return early if we have valid stories
        if (stories.length > 0) {
          return stories;
        } else {
          throw new Error('Failed to parse stories from AI response');
        }
      } catch (error: unknown) {
        console.error('Error during API call or parsing:', error);
        
        // Enhanced error handling for abort/timeout
        if (error instanceof Error) {
          if (error.name === 'AbortError' || error.message.includes('aborted')) {
            throw new Error('Story generation timed out. Please try a simpler request or try again later.');
          }
        }
        
        handleQwenApiError(error);
        throw error; // Re-throw to propagate to the hook
      }
    } catch (error: unknown) {
      console.error('Unexpected error in generateStories:', error);
      
      // Create a user-friendly error message
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate stories. Please try again.';
      const enhancedError = new Error(errorMessage);
      
      // Throw to propagate to the hook
      throw enhancedError;
    } finally {
      // Always clear the timeout to prevent memory leaks
      clearTimeout(timeoutId);
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
    // Even more concise prompt to reduce likelihood of timeout
    return `
Generate ${numberOfStories} user stor${numberOfStories > 1 ? 'ies' : 'y'} for:
${featureDescription}
${projectContext ? `Context: ${projectContext}` : ''}
${additionalContext ? `Additional: ${additionalContext}` : ''}

Use perspective: "${userPerspective}"

Format:
STORY:
TITLE: As a [user], I want [action], so that [benefit]
DESCRIPTION: [Brief explanation]
ACCEPTANCE CRITERIA:
- [Criterion 1]
- [Criterion 2]
- [Criterion 3]
`;
  }

  /**
   * Parse the AI response into structured story objects
   */
  private static parseStoryResponse(text: string): GeneratedStory[] {
    try {
      const stories: GeneratedStory[] = [];
      // More robust parsing that handles different formats
      const storyBlocks = text.split(/STORY\s+\d+:|STORY:/i).filter(block => block.trim());
      
      if (storyBlocks.length === 0 && text.trim()) {
        // Try to parse the entire text as a single story if no STORY: markers found
        return this.parseStoryBlock(text);
      }

      for (const block of storyBlocks) {
        try {
          const story = this.parseStoryBlock(block);
          if (story.length > 0) {
            stories.push(...story);
          }
        } catch (error) {
          console.error('Error parsing story block:', error);
        }
      }

      return stories;
    } catch (error) {
      console.error('Error in parseStoryResponse:', error);
      return [];
    }
  }
  
  /**
   * Parse a single story block
   */
  private static parseStoryBlock(block: string): GeneratedStory[] {
    if (!block.trim()) return [];
    
    try {
      // Extract title
      const titleMatch = block.match(/TITLE:([^\n]+)/i) || block.match(/As a .+, I want .+, so that .+/i);
      const title = titleMatch ? titleMatch[0].trim() : '';

      // Extract description
      const descMatch = block.match(/DESCRIPTION:([^]*?)(?=ACCEPTANCE CRITERIA:|ACCEPTANCE|CRITERIA:)/i);
      let description = '';
      
      if (descMatch && descMatch[1]) {
        description = descMatch[1].trim();
      } else {
        // Try to extract description from paragraphs between title and acceptance criteria
        const lines = block.split('\n');
        const titleIndex = lines.findIndex(l => /TITLE:|As a/i.test(l));
        const criteriaIndex = lines.findIndex(l => /ACCEPTANCE CRITERIA:|ACCEPTANCE|CRITERIA:/i.test(l));
        
        if (titleIndex !== -1 && criteriaIndex !== -1 && criteriaIndex > titleIndex + 1) {
          description = lines.slice(titleIndex + 1, criteriaIndex).join('\n').trim();
        }
      }

      // Extract acceptance criteria
      const criteriaMatch = block.match(/ACCEPTANCE CRITERIA:([^]*?)(?=($))/i) || 
                             block.match(/CRITERIA:([^]*?)(?=($))/i) ||
                             block.match(/ACCEPTANCE:([^]*?)(?=($))/i);
                             
      const criteriaText = criteriaMatch ? criteriaMatch[1].trim() : '';
      
      // Parse criteria points - handle different formats of bullet points
      const criteria = criteriaText
        .split(/\n-|\n\*|\n\d+\.|\n•/)
        .map(point => point.trim())
        .filter(point => point.length > 0);
        
      // Only add story if it has at least a title
      if (title) {
        const defaultDescription = description || 'Feature implementation details';
        return [{
          title,
          description: defaultDescription,
          acceptanceCriteria: criteria.length > 0 ? criteria : ['Story is complete and working as expected'],
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing single story block:', error);
      return [];
    }
  }
}

export default StoryGenerator; 