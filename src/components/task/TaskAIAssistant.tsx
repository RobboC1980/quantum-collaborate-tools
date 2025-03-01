import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import AIAssistButton from '@/components/ai/AIAssistButton';
import SuggestionPanel from '@/components/ai/SuggestionPanel';
import { useAIAssistant } from '@/hooks/useAIAssistant';
import { StoryWithRelations } from '@/types/story';
import { GeneratedTask } from '@/services/ai/task-service';

interface TaskAIAssistantProps {
  story?: Partial<StoryWithRelations>;
  onTasksGenerated?: (tasks: GeneratedTask[]) => void;
  onEstimateGenerated?: (estimatedHours: number) => void;
  onSubtasksGenerated?: (subtasks: { title: string; completed: boolean }[]) => void;
  onCriteriaGenerated?: (criteria: string) => void;
  taskTitle?: string;
  taskDescription?: string;
}

/**
 * AI Assistant component specifically for task-related AI features
 */
const TaskAIAssistant: React.FC<TaskAIAssistantProps> = ({
  story,
  onTasksGenerated,
  onEstimateGenerated,
  onSubtasksGenerated,
  onCriteriaGenerated,
  taskTitle,
  taskDescription
}) => {
  // State for generated items
  const [generatedTasks, setGeneratedTasks] = useState<GeneratedTask[]>([]);
  const [showGeneratedTasks, setShowGeneratedTasks] = useState(false);
  const [suggestedEstimate, setSuggestedEstimate] = useState<number | null>(null);
  const [showSuggestedEstimate, setShowSuggestedEstimate] = useState(false);
  const [generatedSubtasks, setGeneratedSubtasks] = useState<{ title: string; completed: boolean }[]>([]);
  const [showGeneratedSubtasks, setShowGeneratedSubtasks] = useState(false);
  const [suggestedCriteria, setSuggestedCriteria] = useState<string>('');
  const [showSuggestedCriteria, setShowSuggestedCriteria] = useState(false);

  // Get AI assistant functions
  const {
    isGeneratingTasks,
    isGeneratingEstimate,
    isGeneratingSubtasks,
    isGeneratingCriteria,
    breakdownStoryIntoTasks,
    suggestTaskEstimate,
    generateSubtasks,
    suggestCompletionCriteria
  } = useAIAssistant();

  // Handler for generating tasks from a story
  const handleGenerateTasks = async () => {
    if (!story) return;
    
    setShowGeneratedTasks(false);
    setGeneratedTasks([]);
    
    try {
      const tasks = await breakdownStoryIntoTasks(story, {
        numberOfTasks: 4,
        includeSubtasks: true,
        suggestEstimates: true,
        detailedDescriptions: true
      });
      
      if (tasks && tasks.length > 0) {
        setGeneratedTasks(tasks);
        setShowGeneratedTasks(true);
      }
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  // Handler for accepting generated tasks
  const handleAcceptGeneratedTasks = (tasks: GeneratedTask[]) => {
    if (!tasks || tasks.length === 0 || !onTasksGenerated) return;
    
    onTasksGenerated(tasks);
    setShowGeneratedTasks(false);
  };

  // Handler for suggesting task estimate
  const handleSuggestEstimate = async () => {
    if (!taskTitle || !taskDescription) return;
    
    setShowSuggestedEstimate(false);
    setSuggestedEstimate(null);
    
    try {
      const estimate = await suggestTaskEstimate(taskTitle, taskDescription);
      
      setSuggestedEstimate(estimate);
      setShowSuggestedEstimate(true);
    } catch (error) {
      console.error('Error suggesting task estimate:', error);
    }
  };

  // Handler for accepting suggested estimate
  const handleAcceptSuggestedEstimate = (estimate: number) => {
    if (!estimate || !onEstimateGenerated) return;
    
    onEstimateGenerated(estimate);
    setShowSuggestedEstimate(false);
  };

  // Handler for generating subtasks
  const handleGenerateSubtasks = async () => {
    if (!taskTitle || !taskDescription) return;
    
    setShowGeneratedSubtasks(false);
    setGeneratedSubtasks([]);
    
    try {
      const subtasks = await generateSubtasks(taskTitle, taskDescription, 4);
      
      if (subtasks && subtasks.length > 0) {
        setGeneratedSubtasks(subtasks);
        setShowGeneratedSubtasks(true);
      }
    } catch (error) {
      console.error('Error generating subtasks:', error);
    }
  };

  // Handler for accepting generated subtasks
  const handleAcceptGeneratedSubtasks = (subtasks: { title: string; completed: boolean }[]) => {
    if (!subtasks || subtasks.length === 0 || !onSubtasksGenerated) return;
    
    onSubtasksGenerated(subtasks);
    setShowGeneratedSubtasks(false);
  };

  // Handler for suggesting completion criteria
  const handleSuggestCompletionCriteria = async () => {
    if (!taskTitle || !taskDescription) return;
    
    setShowSuggestedCriteria(false);
    setSuggestedCriteria('');
    
    try {
      const criteria = await suggestCompletionCriteria(taskTitle, taskDescription);
      
      if (criteria) {
        setSuggestedCriteria(criteria);
        setShowSuggestedCriteria(true);
      }
    } catch (error) {
      console.error('Error suggesting completion criteria:', error);
    }
  };

  // Handler for accepting suggested completion criteria
  const handleAcceptSuggestedCriteria = (criteria: string) => {
    if (!criteria || !onCriteriaGenerated) return;
    
    onCriteriaGenerated(criteria);
    setShowSuggestedCriteria(false);
  };

  // Determines which AI features to render based on provided props
  const renderContent = () => {
    // For story breakdown into tasks
    if (story && onTasksGenerated) {
      return (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-quantum-500" />
              <h3 className="text-lg font-medium">AI Task Generation</h3>
            </div>
            
            <AIAssistButton
              onClick={handleGenerateTasks}
              tooltip="Break down story into tasks"
              isLoading={isGeneratingTasks}
              disabled={isGeneratingTasks}
            >
              Generate Tasks
            </AIAssistButton>
          </div>
          
          {showGeneratedTasks && (
            <SuggestionPanel
              title="Generated Tasks"
              description="AI has broken down the story into these tasks"
              suggestions={generatedTasks}
              isLoading={isGeneratingTasks}
              type="list"
              onAccept={handleAcceptGeneratedTasks}
              onReject={() => setShowGeneratedTasks(false)}
            />
          )}
        </>
      );
    }
    
    // For task details (estimate, subtasks, completion criteria)
    if (taskTitle && taskDescription) {
      return (
        <div className="space-y-4">
          <div className="flex items-center mb-2">
            <Sparkles className="h-5 w-5 mr-2 text-quantum-500" />
            <h3 className="text-lg font-medium">AI Task Assistant</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Task estimate suggestion */}
            {onEstimateGenerated && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Estimated Hours</Label>
                  <AIAssistButton
                    onClick={handleSuggestEstimate}
                    tooltip="Suggest estimated hours"
                    isLoading={isGeneratingEstimate}
                    disabled={isGeneratingEstimate}
                    size="sm"
                    variant="ghost"
                  >
                    Suggest
                  </AIAssistButton>
                </div>
                
                {showSuggestedEstimate && (
                  <SuggestionPanel
                    title="Suggested Estimate"
                    description="AI-suggested time estimate"
                    suggestions={suggestedEstimate}
                    isLoading={isGeneratingEstimate}
                    type="number"
                    onAccept={handleAcceptSuggestedEstimate}
                    onReject={() => setShowSuggestedEstimate(false)}
                  />
                )}
              </div>
            )}
            
            {/* Completion criteria suggestion */}
            {onCriteriaGenerated && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Completion Criteria</Label>
                  <AIAssistButton
                    onClick={handleSuggestCompletionCriteria}
                    tooltip="Suggest completion criteria"
                    isLoading={isGeneratingCriteria}
                    disabled={isGeneratingCriteria}
                    size="sm"
                    variant="ghost"
                  >
                    Suggest
                  </AIAssistButton>
                </div>
                
                {showSuggestedCriteria && (
                  <SuggestionPanel
                    title="Suggested Criteria"
                    description="AI-suggested completion criteria"
                    suggestions={suggestedCriteria}
                    isLoading={isGeneratingCriteria}
                    type="text"
                    onAccept={handleAcceptSuggestedCriteria}
                    onReject={() => setShowSuggestedCriteria(false)}
                  />
                )}
              </div>
            )}
          </div>
          
          {/* Subtasks generation */}
          {onSubtasksGenerated && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Subtasks</Label>
                <AIAssistButton
                  onClick={handleGenerateSubtasks}
                  tooltip="Generate subtasks"
                  isLoading={isGeneratingSubtasks}
                  disabled={isGeneratingSubtasks}
                  size="sm"
                >
                  Generate Subtasks
                </AIAssistButton>
              </div>
              
              {showGeneratedSubtasks && (
                <SuggestionPanel
                  title="Generated Subtasks"
                  description="AI-generated subtasks for this task"
                  suggestions={generatedSubtasks}
                  isLoading={isGeneratingSubtasks}
                  type="list"
                  onAccept={handleAcceptGeneratedSubtasks}
                  onReject={() => setShowGeneratedSubtasks(false)}
                />
              )}
            </div>
          )}
        </div>
      );
    }
    
    // Default empty state
    return (
      <div className="flex items-center justify-center p-4 text-center text-muted-foreground">
        <p>No context available for AI assistance</p>
      </div>
    );
  };

  return (
    <Card className="border-quantum-200">
      <CardContent className="pt-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default TaskAIAssistant; 