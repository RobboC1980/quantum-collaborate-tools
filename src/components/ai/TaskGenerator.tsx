import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { StoryWithRelations } from '@/types/story';
import { Task, TaskStatus, TaskPriority } from '@/types/task';
import { aiService, TaskGenerationResult } from '@/services/ai-service';
import { toast } from '@/components/ui/use-toast';

interface TaskGeneratorProps {
  story: StoryWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveTasks: (tasks: Task[]) => void;
}

const TaskGenerator: React.FC<TaskGeneratorProps> = ({
  story,
  isOpen,
  onClose,
  onSaveTasks
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  const generateTasks = async () => {
    if (!story) return;
    
    setIsGenerating(true);
    try {
      // Call the AI service to generate tasks
      const result = await aiService.generateTasksForStory(story);
      
      // Convert the result to Task objects with generated IDs
      const tasks: Task[] = result.tasks.map((task, index) => ({
        id: `generated-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        status: 'to-do' as TaskStatus,
        priority: 'medium' as TaskPriority,
        estimatedHours: task.estimatedHours || 0,
        storyId: story.id,
        reporterId: story.reporterId,
        assigneeId: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        subtasks: [],
        attachments: [],
        columnPosition: 0
      }));
      
      setGeneratedTasks(tasks);
      setSelectedTasks(tasks); // By default, select all generated tasks
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate tasks. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTaskSelection = (task: Task, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTasks([...selectedTasks, task]);
    } else {
      setSelectedTasks(selectedTasks.filter(t => t.id !== task.id));
    }
  };

  const handleSaveTasks = () => {
    onSaveTasks(selectedTasks);
    onClose();
    // Reset state
    setGeneratedTasks([]);
    setSelectedTasks([]);
  };

  const handleClose = () => {
    onClose();
    // Reset state
    setGeneratedTasks([]);
    setSelectedTasks([]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Tasks for Story</DialogTitle>
        </DialogHeader>
        
        {story && (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-md">
              <h3 className="font-medium mb-1">{story.title}</h3>
              <p className="text-sm text-muted-foreground">{story.description}</p>
            </div>
            
            {generatedTasks.length === 0 ? (
              <div className="flex justify-center py-8">
                {isGenerating ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p>Generating tasks...</p>
                  </div>
                ) : (
                  <Button onClick={generateTasks}>Generate Tasks</Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="font-medium">Generated Tasks</h3>
                <div className="max-h-[300px] overflow-y-auto space-y-2">
                  {generatedTasks.map((task) => (
                    <div key={task.id} className="flex items-start space-x-2 p-2 border rounded-md">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={selectedTasks.some(t => t.id === task.id)}
                        onCheckedChange={(checked) => handleTaskSelection(task, checked as boolean)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`task-${task.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {task.title}
                        </label>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        <DialogFooter>
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            {generatedTasks.length > 0 && (
              <Button onClick={handleSaveTasks} disabled={selectedTasks.length === 0}>
                Save {selectedTasks.length} Tasks
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskGenerator; 