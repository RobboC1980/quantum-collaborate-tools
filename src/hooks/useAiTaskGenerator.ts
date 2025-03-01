import { useState } from 'react';
import TaskGenerator, { 
  GeneratedTask, 
  TaskGenerationParams,
  SubtaskGenerationParams,
  TaskEstimationParams,
  CompletionCriteriaParams
} from '@/services/ai/task-generator';

interface UseAiTaskGeneratorProps {
  onTasksSuccess?: (tasks: GeneratedTask[]) => void;
  onSubtasksSuccess?: (subtasks: string[]) => void;
  onEstimationSuccess?: (points: number) => void;
  onCriteriaSuccess?: (criteria: string[]) => void;
  onError?: (error: Error) => void;
}

interface UseAiTaskGeneratorReturn {
  tasks: GeneratedTask[];
  subtasks: string[];
  estimatedPoints: number | null;
  completionCriteria: string[];
  isGeneratingTasks: boolean;
  isGeneratingSubtasks: boolean;
  isEstimating: boolean;
  isGeneratingCriteria: boolean;
  error: Error | null;
  generateTasks: (params: TaskGenerationParams) => Promise<GeneratedTask[]>;
  generateSubtasks: (params: SubtaskGenerationParams) => Promise<string[]>;
  estimateTaskEffort: (params: TaskEstimationParams) => Promise<number>;
  generateCompletionCriteria: (params: CompletionCriteriaParams) => Promise<string[]>;
  reset: () => void;
}

/**
 * Hook for generating tasks and related information using AI
 */
export function useAiTaskGenerator(props?: UseAiTaskGeneratorProps): UseAiTaskGeneratorReturn {
  const { 
    onTasksSuccess, 
    onSubtasksSuccess, 
    onEstimationSuccess, 
    onCriteriaSuccess, 
    onError 
  } = props || {};
  
  const [tasks, setTasks] = useState<GeneratedTask[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [estimatedPoints, setEstimatedPoints] = useState<number | null>(null);
  const [completionCriteria, setCompletionCriteria] = useState<string[]>([]);
  
  const [isGeneratingTasks, setIsGeneratingTasks] = useState(false);
  const [isGeneratingSubtasks, setIsGeneratingSubtasks] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);
  
  const [error, setError] = useState<Error | null>(null);

  const generateTasks = async (params: TaskGenerationParams): Promise<GeneratedTask[]> => {
    try {
      setIsGeneratingTasks(true);
      setError(null);
      
      const generatedTasks = await TaskGenerator.generateTasks(params);
      
      setTasks(generatedTasks);
      
      if (onTasksSuccess) {
        onTasksSuccess(generatedTasks);
      }
      
      return generatedTasks;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to generate tasks');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsGeneratingTasks(false);
    }
  };

  const generateSubtasks = async (params: SubtaskGenerationParams): Promise<string[]> => {
    try {
      setIsGeneratingSubtasks(true);
      setError(null);
      
      const generatedSubtasks = await TaskGenerator.generateSubtasks(params);
      
      setSubtasks(generatedSubtasks);
      
      if (onSubtasksSuccess) {
        onSubtasksSuccess(generatedSubtasks);
      }
      
      return generatedSubtasks;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to generate subtasks');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsGeneratingSubtasks(false);
    }
  };

  const estimateTaskEffort = async (params: TaskEstimationParams): Promise<number> => {
    try {
      setIsEstimating(true);
      setError(null);
      
      const points = await TaskGenerator.estimateTaskEffort(params);
      
      setEstimatedPoints(points);
      
      if (onEstimationSuccess) {
        onEstimationSuccess(points);
      }
      
      return points;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to estimate task effort');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return 0;
    } finally {
      setIsEstimating(false);
    }
  };

  const generateCompletionCriteria = async (params: CompletionCriteriaParams): Promise<string[]> => {
    try {
      setIsGeneratingCriteria(true);
      setError(null);
      
      const criteria = await TaskGenerator.generateCompletionCriteria(params);
      
      setCompletionCriteria(criteria);
      
      if (onCriteriaSuccess) {
        onCriteriaSuccess(criteria);
      }
      
      return criteria;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to generate completion criteria');
      setError(errorObj);
      
      if (onError) {
        onError(errorObj);
      }
      
      return [];
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  const reset = () => {
    setTasks([]);
    setSubtasks([]);
    setEstimatedPoints(null);
    setCompletionCriteria([]);
    setError(null);
  };

  return {
    tasks,
    subtasks,
    estimatedPoints,
    completionCriteria,
    isGeneratingTasks,
    isGeneratingSubtasks,
    isEstimating,
    isGeneratingCriteria,
    error,
    generateTasks,
    generateSubtasks,
    estimateTaskEffort,
    generateCompletionCriteria,
    reset,
  };
}

export default useAiTaskGenerator; 