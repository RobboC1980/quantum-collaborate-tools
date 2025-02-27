
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, Flag, CheckSquare, MessageSquare, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskWithRelations } from '@/types/task';

interface TaskCardProps {
  task: TaskWithRelations;
  onClick?: () => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, isDragging }) => {
  // Calculate percentage of completed subtasks
  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskCompletionPercentage = totalSubtasks > 0 
    ? Math.round((completedSubtasks / totalSubtasks) * 100) 
    : 0;
  
  // Get priority badge color
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority icon
  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'critical': return <Flag className="h-3.5 w-3.5 text-red-600" />;
      case 'high': return <Flag className="h-3.5 w-3.5 text-orange-500" />;
      case 'medium': return <Flag className="h-3.5 w-3.5 text-yellow-500" />;
      case 'low': return <Flag className="h-3.5 w-3.5 text-green-500" />;
      default: return <Flag className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow cursor-pointer",
        isDragging ? "shadow-md opacity-75" : ""
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-2">
          {/* Story Reference */}
          {task.story && (
            <div className="text-xs text-gray-500 font-mono">
              {task.story.id}
            </div>
          )}
          
          {/* Task Title */}
          <h3 className="font-medium text-sm line-clamp-2">{task.title}</h3>
          
          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.tags.slice(0, 3).map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-gray-100 text-gray-700 text-xs px-1.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
              {task.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Task metadata */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              {/* Priority */}
              <div className="flex items-center">
                {getPriorityIcon()}
              </div>
              
              {/* Subtasks */}
              {totalSubtasks > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{completedSubtasks}/{totalSubtasks}</span>
                </div>
              )}
              
              {/* Comments */}
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}
              
              {/* Attachments */}
              {task.attachments.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <Paperclip className="h-3.5 w-3.5" />
                  <span>{task.attachments.length}</span>
                </div>
              )}
            </div>
            
            {/* Assignee */}
            {task.assignee && (
              <Avatar className="h-6 w-6">
                <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.fullName} />
                <AvatarFallback>{task.assignee.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
          </div>
          
          {/* Due date if exists */}
          {task.dueDate && (
            <div className="flex items-center mt-2 text-xs">
              <Clock className="h-3.5 w-3.5 mr-1 text-gray-500" />
              <span className={cn(
                "text-gray-700",
                new Date(task.dueDate) < new Date() ? "text-red-600 font-medium" : ""
              )}>
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          
          {/* Progress bar for subtasks */}
          {totalSubtasks > 0 && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${subtaskCompletionPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
