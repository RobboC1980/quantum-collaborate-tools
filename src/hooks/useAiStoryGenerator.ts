import { useState, useCallback, useRef, useEffect } from 'react';
import StoryGenerator, { GeneratedStory, StoryGenerationParams } from '@/services/ai/story-generator';
import { toast } from '@/components/ui/use-toast';

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
  cancelGeneration: () => void;
}

/**
 * Hook for generating user stories using AI
 */
export function useAiStoryGenerator(props?: UseAiStoryGeneratorProps): UseAiStoryGeneratorReturn {
  const { onSuccess, onError } = props || {};
  
  const [stories, setStories] = useState<GeneratedStory[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Use refs to maintain AbortController instance across renders
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutIdRef = useRef<number | null>(null);

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Function to cancel any ongoing generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    
    setIsGenerating(false);
  }, []);

  // Use useCallback to memoize the function and avoid unnecessary rerenders
  const generateStories = useCallback(async (params: StoryGenerationParams): Promise<GeneratedStory[]> => {
    // Validate parameters before proceeding
    if (!params.featureDescription || params.featureDescription.trim().length < 5) {
      const validationError = new Error('Please provide a more detailed feature description (at least 5 characters)');
      setError(validationError);
      
      toast({
        title: "Validation Error",
        description: validationError.message,
        variant: "destructive"
      });
      
      if (onError) onError(validationError);
      return [];
    }

    // Reset previous results and errors
    setError(null);
    
    // Cancel any ongoing generation
    cancelGeneration();
    
    // Create a new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    // Set generating state first
    setIsGenerating(true);
    
    // Set a timeout to automatically cancel after 2 minutes to avoid hanging
    timeoutIdRef.current = window.setTimeout(() => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        
        const timeoutError = new Error('Story generation timed out after 2 minutes. Try a simpler or shorter request.');
        setError(timeoutError);
        setIsGenerating(false);
        
        toast({
          title: "Generation Timeout",
          description: "The story generation process took too long and was cancelled. Try a simpler description.",
          variant: "destructive"
        });
        
        if (onError) onError(timeoutError);
      }
    }, 120000) as unknown as number; // 2 minute timeout
    
    try {
      // Call the story generator with the abort signal
      const generatedStories = await StoryGenerator.generateStories(params);
      
      // Clear the timeout since we got a successful response
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      
      // Validate that we have stories before proceeding
      if (!generatedStories || generatedStories.length === 0) {
        throw new Error('No stories were generated. Please try again with a more detailed description.');
      }
      
      // Update state with the generated stories
      setStories(generatedStories);
      
      toast({
        title: "Stories Generated",
        description: `Successfully generated ${generatedStories.length} user ${generatedStories.length === 1 ? 'story' : 'stories'}`,
        variant: "default"
      });
      
      // Call the success callback if provided
      if (onSuccess) {
        onSuccess(generatedStories);
      }
      
      return generatedStories;
    } catch (err) {
      console.error('Error in generateStories hook:', err);
      
      // Only handle errors if not aborted or if we're still in generating state
      // This prevents error messages after user-initiated cancellations
      if (isGenerating) {
        const errorObj = err instanceof Error ? err : new Error('Failed to generate stories');
        
        // Update error state
        setError(errorObj);
        
        // Only show toast if not a cancellation
        if (!errorObj.message.includes('cancelled') && !errorObj.message.includes('aborted')) {
          toast({
            title: "Story Generation Failed",
            description: errorObj.message,
            variant: "destructive"
          });
        }
        
        // Call error callback if provided
        if (onError) {
          onError(errorObj);
        }
      }
      
      return [];
    } finally {
      // Always clean up resources
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
      
      // Always ensure we reset the generating state
      setIsGenerating(false);
      
      // Clear the abort controller reference
      abortControllerRef.current = null;
    }
  }, [onSuccess, onError, cancelGeneration]);

  const reset = useCallback(() => {
    setStories([]);
    setError(null);
    cancelGeneration();
  }, [cancelGeneration]);

  return {
    stories,
    isGenerating,
    error,
    generateStories,
    reset,
    cancelGeneration
  };
}

export default useAiStoryGenerator; 