
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, Flag, Hash, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Story, StoryWithRelations } from '@/types/story';

interface StoryCardProps {
  story: StoryWithRelations;
  onClick?: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  // Functions to determine UI elements based on story properties
  const getTypeColor = () => {
    switch (story.type) {
      case 'enhancement': return 'bg-blue-100 text-blue-800';
      case 'bug': return 'bg-red-100 text-red-800';
      case 'technical-debt': return 'bg-purple-100 text-purple-800';
      case 'research': return 'bg-teal-100 text-teal-800';
      case 'documentation': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = () => {
    switch (story.priority) {
      case 'critical': return <Flag className="h-3.5 w-3.5 text-red-600" />;
      case 'high': return <Flag className="h-3.5 w-3.5 text-orange-500" />;
      case 'medium': return <Flag className="h-3.5 w-3.5 text-yellow-500" />;
      case 'low': return <Flag className="h-3.5 w-3.5 text-green-500" />;
      default: return <Flag className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (story.status) {
      case 'backlog': return <Badge variant="outline">Backlog</Badge>;
      case 'ready': return <Badge variant="info">Ready</Badge>;
      case 'in-progress': return <Badge variant="warning">In Progress</Badge>;
      case 'review': return <Badge variant="secondary">Review</Badge>;
      case 'done': return <Badge variant="success">Done</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-gray-500">{story.id}</span>
              <Badge className={`${getTypeColor()} capitalize`}>{story.type.replace('-', ' ')}</Badge>
            </div>
            {getStatusBadge()}
          </div>
          
          <h3 className="font-medium text-base line-clamp-2">{story.title}</h3>
          
          <div className="flex flex-wrap gap-2 mt-1">
            {story.tags.map((tag, index) => (
              <span 
                key={index} 
                className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100 rounded-full px-2 py-0.5">
                <Hash className="h-3.5 w-3.5 text-gray-500 mr-1" />
                <span className="text-xs font-medium">{story.points}</span>
              </div>
              <div className="flex items-center">
                {getPriorityIcon()}
              </div>
              {story.epic && (
                <div className="flex items-center bg-purple-100 text-purple-800 rounded-full px-2 py-0.5">
                  <span className="text-xs font-medium">{story.epic.name}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {story.assignee && (
                <Avatar className="h-6 w-6">
                  <AvatarImage src={story.assignee.avatarUrl} alt={story.assignee.fullName} />
                  <AvatarFallback>{story.assignee.fullName.charAt(0)}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
          
          {onClick && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-2 w-full justify-center gap-1"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              View Details <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCard;
