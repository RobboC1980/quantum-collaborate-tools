
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SprintSummaryCardProps {
  sprint: {
    id: number;
    name: string;
    startDate: string | Date;
    endDate: string | Date;
    status: string;
    progress: number;
    totalStories: number;
    completedStories: number;
  };
  onClick?: () => void;
}

const SprintSummaryCard: React.FC<SprintSummaryCardProps> = ({ sprint, onClick }) => {
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const daysLeft = differenceInDays(endDate, new Date());
  
  // Status colors
  const getStatusColor = () => {
    switch (sprint.status) {
      case 'active':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'planned':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get badge variant based on status
  const getStatusBadge = () => {
    switch (sprint.status) {
      case 'active':
        return 'blue';
      case 'completed':
        return 'green';
      case 'planned':
        return 'orange';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className={`border-l-4 ${getStatusColor()} hover:shadow-md transition-shadow`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{sprint.name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-muted-foreground">
              <Calendar size={14} className="mr-1" />
              <span>{format(startDate, "MMM d")} - {format(endDate, "MMM d")}</span>
            </div>
          </div>
          <Badge variant={getStatusBadge() as any} className="capitalize">
            {sprint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span>Progress</span>
              <span className="font-medium">{sprint.progress}%</span>
            </div>
            <Progress value={sprint.progress} className="h-2" />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-medium">{sprint.completedStories}/{sprint.totalStories}</span>
              <span className="text-muted-foreground ml-1">stories completed</span>
            </div>
            {sprint.status === 'active' && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1 text-muted-foreground" />
                <span className={daysLeft <= 2 ? "text-red-500 font-medium" : "text-muted-foreground"}>
                  {daysLeft} days left
                </span>
              </div>
            )}
          </div>
          
          {onClick && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 flex items-center justify-center gap-1"
              onClick={onClick}
            >
              View Details <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SprintSummaryCard;
