import { useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { storyAIService, GeneratedStory, StoryPromptInput, StoryGenerationOptions } from '@/services/ai/story-service';
import { taskAIService, GeneratedTask, TaskBreakdownOptions } from '@/services/ai/task-service';
import { StoryWithRelations } from '@/types/story';

// Types for AI assistant hook
interface UseAIAssistantOptions {
  onError?: (error: Error) => void;
}

interface UseAIAssistantResult {
  // Loading states
  isGeneratingStory: boolean;
  isGeneratingTasks: boolean;
  isGeneratingCriteria: boolean;
  isGeneratingTags: boolean;
  isGeneratingPoints: boolean;
  isGeneratingEstimate: boolean;
  isGeneratingSubtasks: boolean;
  
  // Story-related functions
  generateStory: (input: StoryPromptInput, options?: StoryGenerationOptions) => Promise<GeneratedStory | null>;
  generateAcceptanceCriteria: (storyDescription: string, count?: number) => Promise<string[]>;
  suggestStoryPoints: (description: string, acceptanceCriteria: string[]) => Promise<number>;
  suggestTags: (description: string, existingTags?: string[]) => Promise<string[]>;
  
  // Task-related functions
  breakdownStoryIntoTasks: (story: Partial<StoryWithRelations>, options?: TaskBreakdownOptions) => Promise<GeneratedTask[]>;
  suggestTaskEstimate: (title: string, description: string) => Promise<number>;
  generateSubtasks: (title: string, description: string, count?: number) => Promise<{ title: string, completed: boolean }[]>;
  suggestCompletionCriteria: (title: string, description: string) => Promise<string>;
}

/**
 * React hook for AI assistant functionality
 */
export const useAIAssistant = (options?: UseAIAssistantOptions): UseAIAssistantResult => {
  // Loading states
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isGeneratingPoints, setIsGeneratingPoints] = useState(false);
  const [isGeneratingEstimate, setIsGeneratingEstimate] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  
  // Error handler
  const handleError = useCallback((error: Error, customMessage: string) => {
    console.error(`AI Assistant Error: ${customMessage}`, error);
    
    // Show toast notification
    toast({
      title: 'AI Assistant Error',
      description: error.message || customMessage,
      variant: 'destructive',
    });
    
    // Call custom error handler if provided
    if (options?.onError) {
      options.onError(error);
    }
  }, [options]);
  
  // Story generation
  const generateStory = useCallback(async (
    input: StoryPromptInput, 
    options?: StoryGenerationOptions
  ): Promise<GeneratedStory | null> => {
    setIsGeneratingStory(true);
    
    try {
      const story = await storyAIService.generateStory(input, options);
      
      toast({
        title: 'Story Generated',
        description: 'AI has created a story based on your input.',
      });
      
      return story;
    } catch (error) {
      handleError(error as Error, 'Failed to generate story');
      return null;
    } finally {
      setIsGeneratingStory(false);
    }
  }, [handleError]);
  
  // Generate acceptance criteria
  const generateAcceptanceCriteria = useCallback(async (
    storyDescription: string,
    count: number = 5
  ): Promise<string[]> => {
    setIsGeneratingCriteria(true);
    
    try {
      const criteria = await storyAIService.generateAcceptanceCriteria(storyDescription, count);
      
      toast({
        title: 'Acceptance Criteria Generated',
        description: `AI has suggested ${criteria.length} acceptance criteria.`,
      });
      
      return criteria;
    } catch (error) {
      handleError(error as Error, 'Failed to generate acceptance criteria');
      return [];
    } finally {
      setIsGeneratingCriteria(false);
    }
  }, [handleError]);
  
  // Suggest story points
  const suggestStoryPoints = useCallback(async (
    description: string,
    acceptanceCriteria: string[]
  ): Promise<number> => {
    setIsGeneratingPoints(true);
    
    try {
      const points = await storyAIService.suggestStoryPoints(description, acceptanceCriteria);
      
      toast({
        title: 'Story Points Suggested',
        description: `AI suggests ${points} points for this story.`,
      });
      
      return points;
    } catch (error) {
      handleError(error as Error, 'Failed to suggest story points');
      return 3; // Default to 3 points
    } finally {
      setIsGeneratingPoints(false);
    }
  }, [handleError]);
  
  // Suggest tags
  const suggestTags = useCallback(async (
    description: string,
    existingTags: string[] = []
  ): Promise<string[]> => {
    setIsGeneratingTags(true);
    
    try {
      const tags = await storyAIService.suggestTags(description, existingTags);
      
      toast({
        title: 'Tags Suggested',
        description: `AI has suggested ${tags.length} tags.`,
      });
      
      return tags;
    } catch (error) {
      handleError(error as Error, 'Failed to suggest tags');
      return [];
    } finally {
      setIsGeneratingTags(false);
    }
  }, [handleError]);
  
  // Break down story into tasks
  const breakdownStoryIntoTasks = useCallback(async (
    story: Partial<StoryWithRelations>,
    options?: TaskBreakdownOptions
  ): Promise<GeneratedTask[]> => {
    setIsGeneratingTasks(true);
    
    try {
      const tasks = await taskAIService.breakdownStoryIntoTasks(story, options);
      
      toast({
        title: 'Tasks Generated',
        description: `AI has broken down the story into ${tasks.length} tasks.`,
      });
      
      return tasks;
    } catch (error) {
      handleError(error as Error, 'Failed to break down story into tasks');
      return [];
    } finally {
      setIsGeneratingTasks(false);
    }
  }, [handleError]);
  
  // Suggest task estimate
  const suggestTaskEstimate = useCallback(async (
    title: string,
    description: string
  ): Promise<number> => {
    setIsGeneratingEstimate(true);
    
    try {
      const hours = await taskAIService.suggestTaskEstimate(title, description);
      
      toast({
        title: 'Task Estimate Suggested',
        description: `AI suggests ${hours} hours for this task.`,
      });
      
      return hours;
    } catch (error) {
      handleError(error as Error, 'Failed to suggest task estimate');
      return 4; // Default to 4 hours
    } finally {
      setIsGeneratingEstimate(false);
    }
  }, [handleError]);
  
  // Generate subtasks
  const generateSubtasks = useCallback(async (
    title: string,
    description: string,
    count: number = 4
  ): Promise<{ title: string, completed: boolean }[]> => {
    setIsGeneratingSubtasks(true);
    
    try {
      const subtasks = await taskAIService.generateSubtasks(title, description, count);
      
      toast({
        title: 'Subtasks Generated',
        description: `AI has generated ${subtasks.length} subtasks.`,
      });
      
      return subtasks;
    } catch (error) {
      handleError(error as Error, 'Failed to generate subtasks');
      return [];
    } finally {
      setIsGeneratingSubtasks(false);
    }
  }, [handleError]);
  
  // Suggest completion criteria
  const suggestCompletionCriteria = useCallback(async (
    title: string,
    description: string
  ): Promise<string> => {
    setIsGeneratingCriteria(true);
    
    try {
      const criteria = await taskAIService.suggestCompletionCriteria(title, description);
      
      toast({
        title: 'Completion Criteria Suggested',
        description: 'AI has suggested completion criteria for this task.',
      });
      
      return criteria;
    } catch (error) {
      handleError(error as Error, 'Failed to suggest completion criteria');
      return '';
    } finally {
      setIsGeneratingCriteria(false);
    }
  }, [handleError]);
  
  return {
    // Loading states
    isGeneratingStory,
    isGeneratingTasks,
    isGeneratingCriteria,
    isGeneratingTags,
    isGeneratingPoints,
    isGeneratingEstimate,
    isGeneratingSubtasks,
    
    // Story-related functions
    generateStory,
    generateAcceptanceCriteria,
    suggestStoryPoints,
    suggestTags,
    
    // Task-related functions
    breakdownStoryIntoTasks,
    suggestTaskEstimate,
    generateSubtasks,
    suggestCompletionCriteria,
  };
}; 