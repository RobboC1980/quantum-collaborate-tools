
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TaskBoard from '@/components/task/TaskBoard';
import TaskDetailDialog from '@/components/task/TaskDetailDialog';
import { mockTasks, TaskWithRelations, TaskStatus } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

const TaskManagement = () => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | null>(null);
  const [tasks, setTasks] = useState<TaskWithRelations[]>(mockTasks);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: TaskWithRelations) => {
    console.log('Edit task:', task);
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleSaveTask = (task: TaskWithRelations) => {
    setTasks(prevTasks => {
      // Check if task already exists (update case)
      const existingIndex = prevTasks.findIndex(t => t.id === task.id);
      
      if (existingIndex >= 0) {
        // Update existing task
        const updatedTasks = [...prevTasks];
        updatedTasks[existingIndex] = task;
        
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
    setTasks(prevTasks => prevTasks.filter(t => t.id !== task.id));
    
    toast({
      title: "Task Deleted",
      description: `Task "${task.title}" has been deleted.`,
      variant: "destructive",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
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
