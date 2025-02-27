
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Filter, Search, ChevronDown } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuCheckboxItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import TaskBoard from '@/components/task/TaskBoard';
import TaskDetailDialog from '@/components/task/TaskDetailDialog';
import { mockTasks, TaskWithRelations, TaskStatus } from '@/types/task';
import { mockStories } from '@/types/story';

const TaskManagement = () => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | undefined>(undefined);
  const [tasks, setTasks] = useState(mockTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    stories: mockStories.map(s => s.id),
    assignees: [] as string[],
    priorities: ['low', 'medium', 'high', 'critical']
  });
  
  const handleCreateTask = () => {
    setSelectedTask(undefined);
    setIsTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: TaskWithRelations) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleSaveTask = (task: TaskWithRelations) => {
    console.log('Task saved:', task);
    
    // Update the tasks list
    setTasks(prevTasks => {
      const taskIndex = prevTasks.findIndex(t => t.id === task.id);
      if (taskIndex >= 0) {
        // Update existing task
        const newTasks = [...prevTasks];
        newTasks[taskIndex] = task;
        return newTasks;
      } else {
        // Add new task
        return [...prevTasks, task];
      }
    });
    
    setIsTaskDialogOpen(false);
  };
  
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    // Update task status
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return {
            ...task,
            status: newStatus,
            updatedAt: new Date()
          };
        }
        return task;
      });
    });
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Apply search filter
    const matchesSearch = searchTerm === '' || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply story filter
    const matchesStory = filters.stories.length === 0 || 
      filters.stories.includes(task.storyId);
    
    // Apply assignee filter
    const matchesAssignee = filters.assignees.length === 0 || 
      (task.assigneeId && filters.assignees.includes(task.assigneeId));
    
    // Apply priority filter
    const matchesPriority = filters.priorities.length === 0 || 
      filters.priorities.includes(task.priority);
    
    return matchesSearch && matchesStory && matchesAssignee && matchesPriority;
  });
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Task Board</h1>
          <Button onClick={handleCreateTask} className="gap-1">
            <PlusCircle size={16} />
            New Task
          </Button>
        </div>
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1">
                  Stories <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {mockStories.map(story => (
                  <DropdownMenuCheckboxItem
                    key={story.id}
                    checked={filters.stories.includes(story.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFilters({
                          ...filters,
                          stories: [...filters.stories, story.id]
                        });
                      } else {
                        setFilters({
                          ...filters,
                          stories: filters.stories.filter(id => id !== story.id)
                        });
                      }
                    }}
                  >
                    {story.id}: {story.title.substring(0, 20)}...
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" size="icon">
              <Filter size={16} />
            </Button>
          </div>
        </div>
        
        {/* Task Board */}
        <TaskBoard 
          tasks={filteredTasks}
          onCreateTask={handleCreateTask}
          onSelectTask={handleEditTask}
          onMoveTask={handleMoveTask}
        />
        
        {/* Task Detail Dialog */}
        <TaskDetailDialog 
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          onSave={handleSaveTask}
          task={selectedTask}
        />
      </div>
    </DashboardLayout>
  );
};

export default TaskManagement;
