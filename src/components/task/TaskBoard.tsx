
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal, AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import { TaskWithRelations, TaskStatus } from '@/types/task';

interface TaskBoardProps {
  tasks: TaskWithRelations[];
  onCreateTask?: () => void;
  onSelectTask?: (task: TaskWithRelations) => void;
  onMoveTask?: (taskId: string, newStatus: TaskStatus) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onCreateTask,
  onSelectTask,
  onMoveTask
}) => {
  // Define columns for the board
  const columns: { id: TaskStatus; name: string }[] = [
    { id: 'backlog', name: 'Backlog' },
    { id: 'to-do', name: 'To Do' },
    { id: 'in-progress', name: 'In Progress' },
    { id: 'review', name: 'Review' },
    { id: 'done', name: 'Done' }
  ];

  // Task being dragged
  const [draggedTask, setDraggedTask] = useState<string | null>(null);

  // Group tasks by status
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status)
      .sort((a, b) => a.columnPosition - b.columnPosition);
  };

  // Handle drag start
  const handleDragStart = (taskId: string) => {
    setDraggedTask(taskId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    if (draggedTask && onMoveTask) {
      onMoveTask(draggedTask, status);
      setDraggedTask(null);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-end mb-4">
        <Button onClick={onCreateTask} className="gap-1">
          <PlusCircle size={16} />
          New Task
        </Button>
      </div>
      
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map(column => {
          const columnTasks = getTasksByStatus(column.id);
          return (
            <div 
              key={column.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <Card className="h-full">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-medium">{column.name}</CardTitle>
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-2">
                    {columnTasks.length > 0 ? (
                      columnTasks.map(task => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => handleDragStart(task.id)}
                        >
                          <TaskCard 
                            task={task} 
                            onClick={() => onSelectTask && onSelectTask(task)}
                            isDragging={draggedTask === task.id}
                          />
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-md border-gray-200 text-center">
                        <p className="text-sm text-muted-foreground">No tasks</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2"
                          onClick={onCreateTask}
                        >
                          <PlusCircle size={14} className="mr-1" />
                          Add Task
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TaskBoard;
