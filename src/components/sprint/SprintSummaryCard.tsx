
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
  
  // Status colors with higher contrast 
  const getStatusColor = () => {
    switch (sprint.status) {
      case 'active':
        return 'border-blue-600';
      case 'completed':
        return 'border-green-600';
      case 'planned':
        return 'border-orange-500';
      default:
        return 'border-gray-500';
    }
  };

  // Background colors with better contrast
  const getCardBackground = () => {
    switch (sprint.status) {
      case 'active':
        return 'bg-gradient-to-br from-white to-blue-50';
      case 'completed':
        return 'bg-gradient-to-br from-white to-green-50';
      case 'planned':
        return 'bg-gradient-to-br from-white to-orange-50';
      default:
        return 'bg-white';
    }
  };

  // Get badge variant based on status
  const getStatusBadge = () => {
    switch (sprint.status) {
      case 'active':
        return 'default';
      case 'completed':
        return 'success';
      case 'planned':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Get progress color based on status and progress
  const getProgressColor = () => {
    if (sprint.status === 'completed') return 'bg-green-600';
    if (sprint.status === 'planned') return 'bg-orange-500';
    if (sprint.progress < 30) return 'bg-red-500';
    if (sprint.progress < 70) return 'bg-blue-600';
    return 'bg-green-600';
  };

  return (
    <Card className={`border-l-4 ${getStatusColor()} hover:shadow-md transition-shadow ${getCardBackground()}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold text-gray-800">{sprint.name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-700">
              <Calendar size={14} className="mr-1" />
              <span>{format(startDate, "MMM d")} - {format(endDate, "MMM d")}</span>
            </div>
          </div>
          <Badge variant={getStatusBadge() as any} className="capitalize font-medium px-2.5 py-0.5">
            {sprint.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1 text-sm">
              <span className="font-medium text-gray-700">Progress</span>
              <span className="font-bold text-gray-800">{sprint.progress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full ${getProgressColor()} rounded-full`} 
                style={{ width: `${sprint.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-bold text-gray-800">{sprint.completedStories}/{sprint.totalStories}</span>
              <span className="text-gray-700 ml-1">stories completed</span>
            </div>
            {sprint.status === 'active' && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1 text-gray-700" />
                <span className={daysLeft <= 2 ? "text-red-600 font-bold" : "text-gray-700 font-medium"}>
                  {daysLeft} days left
                </span>
              </div>
            )}
          </div>
          
          {onClick && (
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full mt-2 flex items-center justify-center gap-1 bg-white hover:bg-gray-50 border-gray-300 text-gray-800 font-medium"
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
