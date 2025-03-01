import { useState } from 'react';
import StoryGenerator, { GeneratedStory, StoryGenerationParams } from '@/services/ai/story-generator';

interface UseAiStoryGeneratorProps {
  onSuccess?: (stories: GeneratedStory[]) => void;
  onError?: (error: Error) => void;
}

interface UseAiStoryGeneratorReturn {
  stories: GeneratedStory[];
  isGenerating: boolean;
  error: Error | null;
  generateStories: (params: StoryGenerationParams) => Promise<GeneratedStory[]>;
  reset: () => void;
}

/**
 * Hook for generating user stories using AI
 */
export function useAiStoryGenerator(props?: UseAiStoryGeneratorProps): UseAiStoryGeneratorReturn {
  const { onSuccess, onError } = props || {};
  
  const [stories, setStories] = useState<GeneratedStory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateStories = async (params: StoryGenerationParams): Promise<GeneratedStory[]> => {
    try {
      setIsGenerating(true);
      setError(null);
      
      const generatedStories = await StoryGenerator.generateStories(params);
      
      setStories(generatedStories);
      
      if (onSuccess) {
        onSuccess(generatedStories);
      }
      
      return generatedStories;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to generate stories');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setStories([]);
    setError(null);
  };

  return {
    stories,
    isGenerating,
    error,
    generateStories,
    reset,
  };
}

export default useAiStoryGenerator; 