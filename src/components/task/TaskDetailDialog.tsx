import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Calendar,
  Clock,
  Tag,
  Link,
  User,
  MessageSquare,
  ListChecks,
  Paperclip,
  Flag,
  Play,
  Pause,
  PlusCircle,
  Trash2
} from 'lucide-react';
import { TaskWithRelations, TaskStatus, TaskPriority, Subtask } from '@/types/task';
import { User as UserType, mockUsers } from '@/types/user';
import { StoryWithRelations, mockStories } from '@/types/story';
import TaskAiAssistant from './TaskAiAssistant';
import { toast } from '@/components/ui/use-toast';
import { GeneratedTask } from '@/services/ai/task-generator';

interface TaskDetailDialogProps {
  task?: TaskWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: TaskWithRelations) => void;
}

const TaskDetailDialog: React.FC<TaskDetailDialogProps> = ({
  task,
  isOpen,
  onClose,
  onSave
}) => {
  const isNewTask = !task;
  const [activeTab, setActiveTab] = useState('details');
  const [isTracking, setIsTracking] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  // For a new task, create a default template
  const [formData, setFormData] = useState<Partial<TaskWithRelations>>(
    task || {
      title: '',
      description: '',
      status: 'to-do' as TaskStatus,
      priority: 'medium' as TaskPriority,
      storyId: '',
      reporterId: mockUsers[0].id, // Default to first user for now
      tags: [],
      subtasks: [],
      attachments: [],
      columnPosition: 0,
    }
  );

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    if (onSave && formData.title && formData.storyId) {
      // In a real app, we would create or update the task in the database
      const updatedTask = {
        ...(task || {
          id: `T-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
          comments: [],
          timeEntries: [],
        }),
        ...formData,
        updatedAt: new Date()
      } as TaskWithRelations;
      
      onSave(updatedTask);
      onClose();
    }
  };

  // Handle subtasks
  const addSubtask = () => {
    const newSubtask: Subtask = {
      id: `ST-${Math.floor(Math.random() * 1000)}`,
      title: '',
      completed: false
    };
    
    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), newSubtask]
    });
  };

  const updateSubtask = (index: number, field: keyof Subtask, value: any) => {
    const newSubtasks = [...(formData.subtasks || [])];
    newSubtasks[index] = {
      ...newSubtasks[index],
      [field]: value
    };
    
    handleChange('subtasks', newSubtasks);
  };

  const removeSubtask = (index: number) => {
    const newSubtasks = [...(formData.subtasks || [])];
    newSubtasks.splice(index, 1);
    handleChange('subtasks', newSubtasks);
  };

  // Handle tags
  const [newTag, setNewTag] = useState('');
  
  const addTag = (tag: string) => {
    if (tag && !(formData.tags || []).includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', (formData.tags || []).filter(t => t !== tag));
  };

  // Handle time tracking
  const toggleTimeTracking = () => {
    setIsTracking(!isTracking);
    // In a real app, we would start or stop a timer here
    // and add a new time entry to the database
  };

  // Format time duration
  const formatDuration = (hours: number) => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    
    return `${wholeHours}h ${minutes}m`;
  };

  // Add comment
  const addComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: `C-${Math.floor(Math.random() * 1000)}`,
      content: newComment,
      createdAt: new Date(),
      userId: mockUsers[0].id, // Current user
      mentions: [],
      attachments: []
    };
    
    setFormData({
      ...formData,
      comments: [...(formData.comments || []), comment]
    });
    
    setNewComment('');
  };

  // Handlers for AI-generated tasks and subtasks
  const handleTasksGenerated = (tasks: GeneratedTask[]) => {
    if (tasks.length > 0) {
      // Use the first generated task to update the form
      const generatedTask = tasks[0];
      
      setFormData({
        ...formData,
        title: generatedTask.title,
        description: generatedTask.description,
      });
      
      toast({
        title: "Task Applied",
        description: "AI-generated task has been applied to the form",
      });
    }
  };
  
  const handleSubtasksGenerated = (subtasks: string[]) => {
    // Convert string subtasks into Subtask objects
    const newSubtasks: Subtask[] = subtasks.map(title => ({
      id: `ST-${Math.floor(Math.random() * 1000)}`,
      title,
      completed: false
    }));
    
    // Add the new subtasks to existing ones
    setFormData({
      ...formData,
      subtasks: [...(formData.subtasks || []), ...newSubtasks]
    });
    
    toast({
      title: "Subtasks Applied",
      description: `${subtasks.length} AI-generated subtasks have been added`,
    });
  };
  
  const handleEstimateGenerated = (points: number) => {
    // Assuming points can be translated to estimated hours
    const estimatedHours = points * 1.5; // Simple conversion as an example
    
    setFormData({
      ...formData,
      estimatedHours: estimatedHours
    });
    
    toast({
      title: "Estimate Applied",
      description: `AI-generated estimate of ${estimatedHours} hours has been applied`,
    });
  };
  
  const handleCompletionCriteriaGenerated = (criteria: string[]) => {
    // Join the criteria into a single string and append to description
    const criteriaText = "\n\nCompletion Criteria:\n" + criteria.map(c => `- ${c}`).join("\n");
    
    setFormData({
      ...formData,
      description: (formData.description || '') + criteriaText
    });
    
    toast({
      title: "Completion Criteria Applied",
      description: "AI-generated completion criteria have been added to the description",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewTask ? 'Create Task' : 'Edit Task'}</DialogTitle>
          <DialogDescription>
            {isNewTask 
              ? 'Create a new task to track specific work items.' 
              : `Editing task ${task?.id}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="subtasks">Subtasks</TabsTrigger>
            <TabsTrigger value="time">Time Tracking</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
            <TabsTrigger value="ai-assistant">AI Assistant</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter a concise title for this task"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide detailed explanation of the task"
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="story">Parent Story *</Label>
                  <Select 
                    value={formData.storyId || ''} 
                    onValueChange={(value) => handleChange('storyId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select story" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStories.map(story => (
                        <SelectItem key={story.id} value={story.id}>
                          {story.id}: {story.title.substring(0, 30)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select 
                    value={formData.assigneeId || 'unassigned'} 
                    onValueChange={(value) => handleChange('assigneeId', value === 'unassigned' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {mockUsers.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value as TaskStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="to-do">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleChange('priority', value as TaskPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="date"
                    value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''} 
                    onChange={(e) => handleChange('dueDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input 
                    id="estimatedHours" 
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours || ''} 
                    onChange={(e) => handleChange('estimatedHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g. 4.5"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="actualHours">Actual Hours</Label>
                  <Input 
                    id="actualHours" 
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.actualHours || ''} 
                    onChange={(e) => handleChange('actualHours', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="e.g. 3.5"
                    disabled={true} // Should be calculated from time entries
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add a tag" 
                    value={newTag} 
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag) {
                        e.preventDefault();
                        addTag(newTag);
                        setNewTag('');
                      }
                    }}
                  />
                  <Button type="button" onClick={() => {
                    if (newTag) {
                      addTag(newTag);
                      setNewTag('');
                    }
                  }}>
                    Add
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="completionCriteria">Completion Criteria</Label>
                <Textarea 
                  id="completionCriteria" 
                  value={formData.completionCriteria || ''} 
                  onChange={(e) => handleChange('completionCriteria', e.target.value)}
                  placeholder="Describe the requirements for this task to be considered complete"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="subtasks" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Subtasks</h3>
                <Button type="button" onClick={addSubtask} variant="outline" size="sm">
                  <PlusCircle size={14} className="mr-1" />
                  Add Subtask
                </Button>
              </div>
              
              {(formData.subtasks || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
                  <ListChecks className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No subtasks</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Break down this task into smaller, manageable subtasks to track progress more effectively.
                  </p>
                  <Button type="button" onClick={addSubtask}>
                    Add First Subtask
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.subtasks || []).map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`subtask-${index}`}
                        checked={subtask.completed}
                        onCheckedChange={(checked) => 
                          updateSubtask(index, 'completed', checked === true)
                        }
                      />
                      <Input 
                        value={subtask.title} 
                        onChange={(e) => updateSubtask(index, 'title', e.target.value)}
                        placeholder="Enter subtask"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeSubtask(index)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="time" className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Time Tracking</h3>
                  <p className="text-sm text-muted-foreground">Track time spent on this task</p>
                </div>
                
                <Button
                  variant={isTracking ? "destructive" : "default"}
                  onClick={toggleTimeTracking}
                  className="gap-1"
                >
                  {isTracking ? (
                    <>
                      <Pause size={16} />
                      Stop Timer
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Start Timer
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Estimated</p>
                  <p className="text-2xl font-bold">{formData.estimatedHours ? formatDuration(formData.estimatedHours) : '–'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Logged</p>
                  <p className="text-2xl font-bold">{formData.actualHours ? formatDuration(formData.actualHours) : '–'}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Time Entries</h4>
                  <Button type="button" variant="outline" size="sm">
                    <PlusCircle size={14} className="mr-1" />
                    Add Manually
                  </Button>
                </div>
                
                {(formData.timeEntries || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
                    <Clock className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No time entries</h3>
                    <p className="text-muted-foreground mb-1 max-w-md">
                      Start the timer or add time entries manually to track time spent on this task.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 border rounded-md divide-y">
                    {(formData.timeEntries || []).map((entry, index) => {
                      const duration = entry.endTime 
                        ? (entry.endTime.getTime() - entry.startTime.getTime()) / (1000 * 60 * 60)
                        : 0;
                      
                      return (
                        <div key={index} className="p-3 flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium">
                              {entry.startTime.toLocaleDateString()} ({formatDuration(duration)})
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.startTime.toLocaleTimeString()} - {entry.endTime?.toLocaleTimeString() || 'In progress'}
                            </p>
                            {entry.description && (
                              <p className="text-sm mt-1">{entry.description}</p>
                            )}
                          </div>
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="space-y-4 py-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Comments</h3>
              
              {/* Comment input */}
              <div className="space-y-2">
                <Textarea 
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end">
                  <Button 
                    type="button" 
                    onClick={addComment}
                    disabled={!newComment.trim()}
                  >
                    Add Comment
                  </Button>
                </div>
              </div>
              
              {/* Comments list */}
              <div className="space-y-4">
                {(formData.comments || []).length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="font-medium">No comments yet</h3>
                    <p className="text-muted-foreground mb-1 max-w-md">
                      Be the first to comment on this task.
                    </p>
                  </div>
                ) : (
                  (formData.comments || []).map((comment, index) => {
                    const user = mockUsers.find(u => u.id === comment.userId);
                    
                    return (
                      <div key={index} className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                          <AvatarFallback>{user?.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-muted/30 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-sm font-medium">{user?.fullName}</span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(comment.createdAt).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-sm">{comment.content}</p>
                          </div>
                          <div className="flex space-x-2 mt-1">
                            <Button variant="ghost" size="sm" className="h-auto py-0 px-1 text-xs">
                              Reply
                            </Button>
                            <Button variant="ghost" size="sm" className="h-auto py-0 px-1 text-xs">
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>
          
          {/* AI Assistant Tab */}
          <TabsContent value="ai-assistant" className="space-y-4 py-4">
            <TaskAiAssistant 
              storyTitle={mockStories.find(s => s.id === formData.storyId)?.title}
              storyDescription={mockStories.find(s => s.id === formData.storyId)?.description}
              acceptanceCriteria={mockStories.find(s => s.id === formData.storyId)?.acceptanceCriteria || []}
              onTasksGenerated={handleTasksGenerated}
              onSubtasksGenerated={handleSubtasksGenerated}
              onEstimateGenerated={handleEstimateGenerated}
              onCompletionCriteriaGenerated={handleCompletionCriteriaGenerated}
            />
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!formData.title || !formData.storyId}
          >
            {isNewTask ? 'Create Task' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailDialog;
