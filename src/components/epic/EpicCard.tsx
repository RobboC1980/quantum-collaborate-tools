import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Tag, 
  FileText, 
  MoreHorizontal,
  Edit,
  Trash2,
  ClipboardList
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EpicWithRelations, getEpicStatusColor, getEpicPriorityColor } from '@/types/epic';
import { formatDistanceToNow } from 'date-fns';
import { mockUsers } from '@/types/user';

interface EpicCardProps {
  epic: EpicWithRelations;
  onEdit: (epic: EpicWithRelations) => void;
  onDelete: (epic: EpicWithRelations) => void;
  onView: (epic: EpicWithRelations) => void;
}

const EpicCard: React.FC<EpicCardProps> = ({ epic, onEdit, onDelete, onView }) => {
  const statusClass = getEpicStatusColor(epic.status);
  const priorityClass = getEpicPriorityColor(epic.priority);
  
  const formatDate = (date?: Date) => {
    if (!date) return 'Not set';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const updatedAt = new Date(date);
    const seconds = Math.floor((now.getTime() - updatedAt.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };
  
  const storyCount = epic.stories?.length || 0;
  
  const owner = epic.ownerId ? mockUsers.find(user => user.id === epic.ownerId) : null;
  
  return (
    <Card className="h-full flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 
              className="font-medium text-lg cursor-pointer hover:text-primary"
              onClick={() => onView(epic)}
            >
              {epic.title}
            </h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={statusClass}>
                {epic.status.replace('-', ' ')}
              </Badge>
              <Badge variant="outline" className={priorityClass}>
                {epic.priority}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(epic)}>
                <FileText className="mr-2 h-4 w-4" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(epic)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => onDelete(epic)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {epic.description}
        </p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{epic.progress}%</span>
          </div>
          <Progress value={epic.progress} className="h-2" />
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
              <span>{formatDate(epic.targetDate)}</span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <span>{storyCount} stories</span>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={owner?.avatarUrl} alt={owner?.fullName || 'Unassigned'} />
            <AvatarFallback>{owner?.fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            {owner?.fullName || 'Unassigned'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Updated {getTimeAgo(epic.updatedAt)}
        </div>
      </CardFooter>
    </Card>
  );
};

export default EpicCard; 