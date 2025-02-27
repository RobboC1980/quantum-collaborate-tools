
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import TaskBoard from '@/components/task/TaskBoard';
import TaskDetailDialog from '@/components/task/TaskDetailDialog';
import { mockTasks } from '@/types/task';
import { useToast } from '@/components/ui/use-toast';

const TaskManagement = () => {
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const { toast } = useToast();
  
  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsTaskDialogOpen(true);
  };
  
  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };
  
  const handleSaveTask = (task: any) => {
    // In a real app, this would save to the backend
    console.log('Saving task:', task);
    toast({
      title: selectedTask ? 'Task Updated' : 'Task Created',
      description: `Task "${task.title}" has been ${selectedTask ? 'updated' : 'created'} successfully.`,
    });
    setIsTaskDialogOpen(false);
  };

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
          tasks={mockTasks}
          onSelectTask={handleEditTask}
          onCreateTask={handleCreateTask}
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
