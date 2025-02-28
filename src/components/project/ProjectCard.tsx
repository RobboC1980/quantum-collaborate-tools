import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, 
  Calendar, 
  Tag, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ProjectWithRelations, 
  getStatusColor, 
  getPriorityColor 
} from '@/types/project';

interface ProjectCardProps {
  project: ProjectWithRelations;
  onEdit: (project: ProjectWithRelations) => void;
  onDelete: (project: ProjectWithRelations) => void;
  onView: (project: ProjectWithRelations) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
  onView
}) => {
  // Format dates for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate time ago for last update
  const timeAgo = formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-1">{project.title}</h3>
            <div className="flex flex-wrap gap-2">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('-', ' ')}
              </Badge>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
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
              <DropdownMenuItem onClick={() => onView(project)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(project)}>
                Edit project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project)}
                className="text-red-600"
              >
                Delete project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Target:</span>
            </div>
            <div className="text-right">
              {formatDate(project.targetDate)}
            </div>
            
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Epics:</span>
            </div>
            <div className="text-right">
              {project.epicIds.length}
            </div>
          </div>
          
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground mr-1" />
              {project.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {project.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{project.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.owner.avatarUrl} alt={project.owner.fullName} />
            <AvatarFallback>{project.owner.fullName.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <span>{project.owner.fullName}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{timeAgo}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard; 