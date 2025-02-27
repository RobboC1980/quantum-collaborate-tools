
import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TaskBoard from '@/components/task/TaskBoard';
import TaskDetailDialog from '@/components/task/TaskDetailDialog';
import { mockTasks, TaskWithRelations, TaskStatus } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

const TaskManagement = () => {
  const mountedRef = useRef(true);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [tasks, setTasks] = useState<TaskWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Set the mounted ref to true when the component mounts
    mountedRef.current = true;
    
    // Indicate loading is in progress
    setIsLoading(true);
    console.log("TaskManagement: Starting data load");
    
    // Load the tasks with a small delay to simulate fetching
    const timer = setTimeout(() => {
      // Only update state if the component is still mounted
      if (mountedRef.current) {
        console.log("TaskManagement: Setting tasks data");
        setTasks(mockTasks);
        setIsLoading(false);
        console.log("TaskManagement: Data loaded");
      }
    }, 300);
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("TaskManagement: Component unmounting, cleaning up");
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array means this only runs once on mount
  
  const handleCreateTask = () => {
    console.log("Creating new task");
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: TaskWithRelations) => {
    console.log('Editing task:', task);
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleSaveTask = (task: TaskWithRelations) => {
    console.log('Saving task:', task);
    
    setTasks(prevTasks => {
      // Check if task already exists (update case)
      const existingIndex = prevTasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        // Update existing task
        const updatedTasks = [...prevTasks];
        updatedTasks[existingIndex] = {
          ...task,
          updatedAt: new Date()
        };
        
        toast({
          title: "Task Updated",
          description: `Task "${task.title}" has been updated successfully.`,
        });
        
        return updatedTasks;
      } else {
        // Create new task
        toast({
          title: "Task Created",
          description: `Task "${task.title}" has been created successfully.`,
        });
        
        // Add a new task with a generated ID
        const newTask = {
          ...task,
          id: `T-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return [...prevTasks, newTask];
      }
    });
    
    setIsTaskDialogOpen(false);
  };
  
  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    console.log(`Moving task ${taskId} to ${newStatus}`);
    
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          return { ...task, status: newStatus, updatedAt: new Date() };
        }
        return task;
      });
    });
    
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      toast({
        title: "Task Moved",
        description: `Task "${task.title}" moved to ${newStatus.replace('-', ' ')}.`,
      });
    }
  };
  
  const handleDeleteTask = (task: TaskWithRelations) => {
    console.log('Deleting task:', task);
    
    setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    
    toast({
      title: "Task Deleted",
      description: `Task "${task.title}" has been deleted.`,
      variant: "destructive",
    });
  };

  // Render a loading spinner while data is loading
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <Button onClick={handleCreateTask} className="gap-1">
            <PlusCircle size={16} />
            New Task
          </Button>
        </div>
        
        <TaskBoard 
          tasks={tasks}
          onSelectTask={handleEditTask}
          onCreateTask={handleCreateTask}
          onDeleteTask={handleDeleteTask}
          onMoveTask={handleMoveTask}
        />
        
        <TaskDetailDialog
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={() => setIsTaskDialogOpen(false)}
          onSave={handleSaveTask}
        />
      </div>
    </DashboardLayout>
  );
};

export default TaskManagement;
