
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Layers, Clock, Flag } from 'lucide-react';
import { StoryWithRelations } from '@/types/story';

interface StoryCardProps {
  story: StoryWithRelations;
  onClick?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  // Format dates
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'backlog':
        return 'bg-gray-100 text-gray-800';
      case 'ready':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'review':
        return 'bg-purple-100 text-purple-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority icon
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'high':
        return <Flag className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Flag className="h-4 w-4 text-blue-500" />;
      default:
        return <Flag className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get type badge color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'enhancement':
        return 'bg-blue-100 text-blue-800';
      case 'bug':
        return 'bg-red-100 text-red-800';
      case 'technical-debt':
        return 'bg-purple-100 text-purple-800';
      case 'research':
        return 'bg-green-100 text-green-800';
      case 'documentation':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  console.log("Rendering story card for:", story.id);

  return (
    <Card 
      className="hover:border-primary/50 transition-colors cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      <CardContent className="p-4 flex-1">
        <div className="flex justify-between mb-2">
          <Badge variant="outline" className="text-xs font-mono">
            {story.id}
          </Badge>
          <Badge className={getStatusColor(story.status)}>
            {story.status.replace('-', ' ')}
          </Badge>
        </div>
        
        <h3 className="font-medium mb-2 line-clamp-2">{story.title}</h3>
        
        <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
          {story.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          <Badge className={getTypeColor(story.type)} variant="secondary">
            {story.type.replace('-', ' ')}
          </Badge>
          
          {story.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          
          {story.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{story.tags.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 border-t flex justify-between items-center">
        <div className="flex items-center gap-2">
          {getPriorityIcon(story.priority)}
          <Badge 
            variant="outline" 
            className="text-xs px-2 py-0 h-5 hover:bg-secondary"
          >
            {story.points}
          </Badge>
          
          {story.epicId && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Layers className="h-3 w-3 mr-1" />
              {story.epic?.name || story.epicId}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {story.updatedAt && (
            <div className="text-xs text-muted-foreground mr-2">
              <Clock className="h-3 w-3 inline mr-1" />
              {formatDate(story.updatedAt)}
            </div>
          )}
          
          {story.assignee ? (
            <Avatar className="h-6 w-6">
              <AvatarImage src={story.assignee.avatarUrl} alt={story.assignee.fullName} />
              <AvatarFallback>{story.assignee.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <Avatar className="h-6 w-6">
              <AvatarFallback>?</AvatarFallback>
            </Avatar>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default StoryCard;
