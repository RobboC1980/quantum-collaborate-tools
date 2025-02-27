
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Paperclip, MessageSquare, CheckSquare, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskWithRelations } from '@/types/task';

interface TaskCardProps {
  task: TaskWithRelations;
  onClick?: () => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onClick, 
  isDragging = false 
}) => {
  // Calculate progress based on completed subtasks
  const completedSubtasks = task.subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  console.log("Rendering task card for:", task.id);
  
  return (
    <Card 
      className={cn(
        "hover:border-primary/50 cursor-pointer transition-all transform",
        isDragging ? "opacity-50 shadow-none" : "shadow-sm"
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs font-mono">
            {task.id}
          </Badge>
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority}
          </Badge>
        </div>
        
        <h3 className="font-medium text-sm mb-2">
          {task.title}
        </h3>
        
        {/* Story reference */}
        <div className="text-xs text-muted-foreground mb-2">
          in <span className="font-semibold">{task.storyId}</span>
        </div>
        
        {/* Progress bar for subtasks */}
        {totalSubtasks > 0 && (
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground flex items-center gap-1">
                <CheckSquare size={12} />
                {completedSubtasks}/{totalSubtasks}
              </span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5">
              <div 
                className="bg-green-500 h-1.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Tags */}
        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 2).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
        
        {/* Footer with metadata */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            {task.dueDate && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Calendar size={12} className="mr-1" />
                {formatDate(task.dueDate)}
              </div>
            )}
            
            {task.attachments.length > 0 && (
              <div className="text-xs text-muted-foreground flex items-center">
                <Paperclip size={12} className="mr-1" />
                {task.attachments.length}
              </div>
            )}
            
            {task.comments && task.comments.length > 0 && (
              <div className="text-xs text-muted-foreground flex items-center">
                <MessageSquare size={12} className="mr-1" />
                {task.comments.length}
              </div>
            )}
          </div>
          
          {task.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignee.avatarUrl} alt={task.assignee.fullName} />
              <AvatarFallback>{task.assignee.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
