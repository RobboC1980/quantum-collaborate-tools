import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, ListTodo, Calculator, CheckCircle2 } from 'lucide-react';
import { useAiTaskGenerator } from '@/hooks';
import { GeneratedTask } from '@/services/ai/task-generator';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface TaskAiAssistantProps {
  storyTitle?: string;
  storyDescription?: string;
  acceptanceCriteria?: string[];
  onTasksGenerated?: (tasks: GeneratedTask[]) => void;
  onSubtasksGenerated?: (subtasks: string[], parentTaskId?: string) => void;
  onEstimateGenerated?: (points: number, taskId?: string) => void;
  onCompletionCriteriaGenerated?: (criteria: string[], taskId?: string) => void;
}

export function TaskAiAssistant({
  storyTitle = '',
  storyDescription = '',
  acceptanceCriteria = [],
  onTasksGenerated,
  onSubtasksGenerated,
  onEstimateGenerated,
  onCompletionCriteriaGenerated
}: TaskAiAssistantProps) {
  // State for tabs
  const [activeTab, setActiveTab] = useState('tasks');

  // State for tasks generation
  const [taskType, setTaskType] = useState<'development' | 'design' | 'testing' | 'documentation' | 'general'>('development');
  const [numberOfTasks, setNumberOfTasks] = useState(3);
  const [teamContext, setTeamContext] = useState('');

  // State for subtasks
  const [parentTaskTitle, setParentTaskTitle] = useState('');
  const [parentTaskDescription, setParentTaskDescription] = useState('');
  const [numberOfSubtasks, setNumberOfSubtasks] = useState(3);
  
  // State for estimation
  const [taskTitleForEstimation, setTaskTitleForEstimation] = useState('');
  const [taskDescriptionForEstimation, setTaskDescriptionForEstimation] = useState('');
  const [estimationScale, setEstimationScale] = useState<'fibonacci' | 'linear' | 'tshirt'>('fibonacci');
  
  // State for completion criteria
  const [taskTitleForCriteria, setTaskTitleForCriteria] = useState('');
  const [taskDescriptionForCriteria, setTaskDescriptionForCriteria] = useState('');
  const [numberOfCriteria, setNumberOfCriteria] = useState(3);

  // Use the AI task generator hook
  const { 
    generateTasks,
    generateSubtasks,
    estimateTaskEffort,
    generateCompletionCriteria,
    tasks,
    subtasks,
    estimatedPoints,
    completionCriteria,
    isGeneratingTasks,
    isGeneratingSubtasks,
    isEstimating,
    isGeneratingCriteria,
    error,
    reset
  } = useAiTaskGenerator({
    onTasksSuccess: (generatedTasks) => {
      if (generatedTasks.length > 0) {
        toast({
          title: "Tasks generated successfully",
          description: `Generated ${generatedTasks.length} tasks from the story`,
        });
      }
    },
    onSubtasksSuccess: (generatedSubtasks) => {
      if (generatedSubtasks.length > 0) {
        toast({
          title: "Subtasks generated successfully",
          description: `Generated ${generatedSubtasks.length} subtasks`,
        });
      }
    },
    onEstimationSuccess: (points) => {
      toast({
        title: "Effort estimated",
        description: `Estimated effort: ${points} points`,
      });
    },
    onCriteriaSuccess: (criteria) => {
      if (criteria.length > 0) {
        toast({
          title: "Completion criteria generated",
          description: `Generated ${criteria.length} completion criteria`,
        });
      }
    },
    onError: (err) => {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateTasks = async () => {
    if (!storyTitle || !storyDescription) {
      toast({
        title: "Missing information",
        description: "Story title and description are required",
        variant: "destructive",
      });
      return;
    }
    
    await generateTasks({
      storyTitle,
      storyDescription,
      acceptanceCriteria,
      teamContext,
      taskType,
      numberOfTasks,
      includeTechDetails: true
    });
  };

  const handleGenerateSubtasks = async () => {
    if (!parentTaskTitle || !parentTaskDescription) {
      toast({
        title: "Missing information",
        description: "Task title and description are required",
        variant: "destructive",
      });
      return;
    }
    
    await generateSubtasks({
      parentTaskTitle,
      parentTaskDescription,
      teamContext,
      taskType,
      numberOfSubtasks
    });
  };

  const handleEstimateTask = async () => {
    if (!taskTitleForEstimation || !taskDescriptionForEstimation) {
      toast({
        title: "Missing information",
        description: "Task title and description are required",
        variant: "destructive",
      });
      return;
    }
    
    await estimateTaskEffort({
      taskTitle: taskTitleForEstimation,
      taskDescription: taskDescriptionForEstimation,
      teamContext,
      estimationScale
    });
  };

  const handleGenerateCompletionCriteria = async () => {
    if (!taskTitleForCriteria || !taskDescriptionForCriteria) {
      toast({
        title: "Missing information",
        description: "Task title and description are required",
        variant: "destructive",
      });
      return;
    }
    
    await generateCompletionCriteria({
      taskTitle: taskTitleForCriteria,
      taskDescription: taskDescriptionForCriteria,
      taskType,
      numberOfCriteria
    });
  };

  const handleUseTasks = () => {
    if (onTasksGenerated && tasks.length > 0) {
      onTasksGenerated(tasks);
      toast({
        title: "Tasks applied",
        description: "The generated tasks have been applied",
      });
    }
  };

  const handleUseSubtasks = () => {
    if (onSubtasksGenerated && subtasks.length > 0) {
      onSubtasksGenerated(subtasks);
      toast({
        title: "Subtasks applied",
        description: "The generated subtasks have been applied",
      });
    }
  };

  const handleUseEstimate = () => {
    if (onEstimateGenerated && estimatedPoints !== null) {
      onEstimateGenerated(estimatedPoints);
      toast({
        title: "Estimate applied",
        description: "The generated estimate has been applied",
      });
    }
  };

  const handleUseCriteria = () => {
    if (onCompletionCriteriaGenerated && completionCriteria.length > 0) {
      onCompletionCriteriaGenerated(completionCriteria);
      toast({
        title: "Criteria applied",
        description: "The generated completion criteria have been applied",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Task Assistant
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="tasks" className="flex items-center gap-1">
              <ListTodo className="h-4 w-4" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="subtasks" className="flex items-center gap-1">
              <ListTodo className="h-4 w-4" />
              Subtasks
            </TabsTrigger>
            <TabsTrigger value="estimate" className="flex items-center gap-1">
              <Calculator className="h-4 w-4" />
              Estimate
            </TabsTrigger>
            <TabsTrigger value="criteria" className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              Criteria
            </TabsTrigger>
          </TabsList>

          {/* Task Generation Tab */}
          <TabsContent value="tasks" className="space-y-4">
            <div className="space-y-2">
              <Label>Task Type</Label>
              <Select 
                value={taskType} 
                onValueChange={(value) => setTaskType(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select task type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="testing">Testing</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Context (Optional)</Label>
                <Input 
                  placeholder="e.g. Frontend team"
                  value={teamContext}
                  onChange={(e) => setTeamContext(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Number of Tasks</Label>
                <Select 
                  value={String(numberOfTasks)} 
                  onValueChange={(value) => setNumberOfTasks(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Task</SelectItem>
                    <SelectItem value="2">2 Tasks</SelectItem>
                    <SelectItem value="3">3 Tasks</SelectItem>
                    <SelectItem value="4">4 Tasks</SelectItem>
                    <SelectItem value="5">5 Tasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateTasks}
              disabled={isGeneratingTasks || !storyTitle || !storyDescription}
              className="w-full"
            >
              {isGeneratingTasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Tasks...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Tasks from Story
                </>
              )}
            </Button>
            
            {error && activeTab === 'tasks' && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
                Error: {error.message}
              </div>
            )}
            
            {tasks.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Generated Tasks</h3>
                  <Badge variant="outline">AI Generated</Badge>
                </div>
                
                <div className="space-y-3">
                  {tasks.map((task, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium">{task.title}</h4>
                        {task.estimatedPoints && (
                          <Badge variant="secondary">
                            {task.estimatedPoints} points
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm mt-1">{task.description}</p>
                    </div>
                  ))}
                </div>
                
                {onTasksGenerated && (
                  <Button 
                    onClick={handleUseTasks}
                    className="w-full"
                  >
                    Use These Tasks
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Subtask Generation Tab */}
          <TabsContent value="subtasks" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="parentTaskTitle">Parent Task Title</Label>
              <Input
                id="parentTaskTitle"
                placeholder="Enter the parent task title"
                value={parentTaskTitle}
                onChange={(e) => setParentTaskTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="parentTaskDescription">Parent Task Description</Label>
              <Textarea
                id="parentTaskDescription"
                placeholder="Enter the parent task description"
                value={parentTaskDescription}
                onChange={(e) => setParentTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select 
                  value={taskType} 
                  onValueChange={(value) => setTaskType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Number of Subtasks</Label>
                <Select 
                  value={String(numberOfSubtasks)} 
                  onValueChange={(value) => setNumberOfSubtasks(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Subtasks</SelectItem>
                    <SelectItem value="3">3 Subtasks</SelectItem>
                    <SelectItem value="4">4 Subtasks</SelectItem>
                    <SelectItem value="5">5 Subtasks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateSubtasks}
              disabled={isGeneratingSubtasks || !parentTaskTitle || !parentTaskDescription}
              className="w-full"
            >
              {isGeneratingSubtasks ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Subtasks...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Subtasks
                </>
              )}
            </Button>
            
            {error && activeTab === 'subtasks' && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
                Error: {error.message}
              </div>
            )}
            
            {subtasks.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Generated Subtasks</h3>
                  <Badge variant="outline">AI Generated</Badge>
                </div>
                
                <div className="border rounded-md p-3">
                  <ul className="space-y-2">
                    {subtasks.map((subtask, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">{index + 1}.</span>
                        <span>{subtask}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {onSubtasksGenerated && (
                  <Button 
                    onClick={handleUseSubtasks}
                    className="w-full"
                  >
                    Use These Subtasks
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Effort Estimation Tab */}
          <TabsContent value="estimate" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitleForEstimation">Task Title</Label>
              <Input
                id="taskTitleForEstimation"
                placeholder="Enter the task title"
                value={taskTitleForEstimation}
                onChange={(e) => setTaskTitleForEstimation(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskDescriptionForEstimation">Task Description</Label>
              <Textarea
                id="taskDescriptionForEstimation"
                placeholder="Enter the task description"
                value={taskDescriptionForEstimation}
                onChange={(e) => setTaskDescriptionForEstimation(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Estimation Scale</Label>
              <Select 
                value={estimationScale} 
                onValueChange={(value) => setEstimationScale(value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select estimation scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fibonacci">Fibonacci (1,2,3,5,8,13,21)</SelectItem>
                  <SelectItem value="linear">Linear (1-10)</SelectItem>
                  <SelectItem value="tshirt">T-Shirt Sizes (XS,S,M,L,XL,XXL)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleEstimateTask}
              disabled={isEstimating || !taskTitleForEstimation || !taskDescriptionForEstimation}
              className="w-full"
            >
              {isEstimating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Estimating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Estimate Task Effort
                </>
              )}
            </Button>
            
            {error && activeTab === 'estimate' && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
                Error: {error.message}
              </div>
            )}
            
            {estimatedPoints !== null && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Estimated Effort</h3>
                  <Badge variant="outline">AI Generated</Badge>
                </div>
                
                <div className="border rounded-md p-3 flex justify-center items-center flex-col">
                  <span className="text-4xl font-bold">{estimatedPoints}</span>
                  <span className="text-sm text-muted-foreground mt-1">
                    {estimationScale === 'fibonacci' && 'Fibonacci Points'}
                    {estimationScale === 'linear' && 'Linear Points'}
                    {estimationScale === 'tshirt' && 
                      `T-Shirt Size (${
                        estimatedPoints === 1 ? 'XS' : 
                        estimatedPoints === 2 ? 'S' : 
                        estimatedPoints === 3 ? 'M' : 
                        estimatedPoints === 5 ? 'L' : 
                        estimatedPoints === 8 ? 'XL' : 'XXL'
                      })`
                    }
                  </span>
                </div>
                
                {onEstimateGenerated && (
                  <Button 
                    onClick={handleUseEstimate}
                    className="w-full"
                  >
                    Use This Estimate
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Completion Criteria Tab */}
          <TabsContent value="criteria" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="taskTitleForCriteria">Task Title</Label>
              <Input
                id="taskTitleForCriteria"
                placeholder="Enter the task title"
                value={taskTitleForCriteria}
                onChange={(e) => setTaskTitleForCriteria(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taskDescriptionForCriteria">Task Description</Label>
              <Textarea
                id="taskDescriptionForCriteria"
                placeholder="Enter the task description"
                value={taskDescriptionForCriteria}
                onChange={(e) => setTaskDescriptionForCriteria(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Task Type</Label>
                <Select 
                  value={taskType} 
                  onValueChange={(value) => setTaskType(value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select task type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="documentation">Documentation</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Number of Criteria</Label>
                <Select 
                  value={String(numberOfCriteria)} 
                  onValueChange={(value) => setNumberOfCriteria(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select number" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Criteria</SelectItem>
                    <SelectItem value="3">3 Criteria</SelectItem>
                    <SelectItem value="4">4 Criteria</SelectItem>
                    <SelectItem value="5">5 Criteria</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Button 
              onClick={handleGenerateCompletionCriteria}
              disabled={isGeneratingCriteria || !taskTitleForCriteria || !taskDescriptionForCriteria}
              className="w-full"
            >
              {isGeneratingCriteria ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Criteria...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Generate Completion Criteria
                </>
              )}
            </Button>
            
            {error && activeTab === 'criteria' && (
              <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
                Error: {error.message}
              </div>
            )}
            
            {completionCriteria.length > 0 && (
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Completion Criteria</h3>
                  <Badge variant="outline">AI Generated</Badge>
                </div>
                
                <div className="border rounded-md p-3">
                  <ul className="space-y-2">
                    {completionCriteria.map((criterion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-muted-foreground">•</span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {onCompletionCriteriaGenerated && (
                  <Button 
                    onClick={handleUseCriteria}
                    className="w-full"
                  >
                    Use These Criteria
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TaskAiAssistant; 