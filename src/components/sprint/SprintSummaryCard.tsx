import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProgressBar from './ProgressBar';

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

// Status colors with higher contrast 
const getStatusColor = (status: string) => {
  switch (status) {
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
const getCardBackground = (status: string) => {
  switch (status) {
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
const getStatusBadge = (status: string) => {
  switch (status) {
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
const getProgressColor = (status: string, progress: number) => {
  if (status === 'completed') return 'bg-green-600';
  if (status === 'planned') return 'bg-orange-500';
  if (progress < 30) return 'bg-red-500';
  if (progress < 70) return 'bg-blue-600';
  return 'bg-green-600';
};

const SprintSummaryCard: React.FC<SprintSummaryCardProps> = React.memo(({ sprint, onClick }) => {
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  
  // Memoize calculated values
  const memoizedValues = useMemo(() => {
    const daysLeft = differenceInDays(endDate, new Date());
    const statusColor = getStatusColor(sprint.status);
    const cardBackground = getCardBackground(sprint.status);
    const statusBadge = getStatusBadge(sprint.status);
    const progressColor = getProgressColor(sprint.status, sprint.progress);
    
    return {
      daysLeft,
      statusColor,
      cardBackground,
      statusBadge,
      progressColor
    };
  }, [sprint.status, sprint.progress, endDate]);

  return (
    <Card className={`border-l-4 ${memoizedValues.statusColor} hover:shadow-md transition-shadow ${memoizedValues.cardBackground}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base font-bold text-gray-800">{sprint.name}</CardTitle>
            <div className="flex items-center mt-1 text-sm text-gray-700">
              <Calendar size={14} className="mr-1" />
              <span>{format(startDate, "MMM d")} - {format(endDate, "MMM d")}</span>
            </div>
          </div>
          <Badge variant={memoizedValues.statusBadge as any} className="capitalize font-medium px-2.5 py-0.5">
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
            <ProgressBar 
              value={sprint.progress} 
              maxValue={100} 
              color={
                memoizedValues.progressColor.includes('green') ? 'green' : 
                memoizedValues.progressColor.includes('orange') ? 'orange' : 
                memoizedValues.progressColor.includes('red') ? 'red' : 'blue'
              }
              height="md"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <div>
              <span className="font-bold text-gray-800">{sprint.completedStories}/{sprint.totalStories}</span>
              <span className="text-gray-700 ml-1">stories completed</span>
            </div>
            {sprint.status === 'active' && (
              <div className="flex items-center">
                <Clock size={14} className="mr-1 text-gray-700" />
                <span className={memoizedValues.daysLeft <= 2 ? "text-red-600 font-bold" : "text-gray-700 font-medium"}>
                  {memoizedValues.daysLeft} days left
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
});

SprintSummaryCard.displayName = 'SprintSummaryCard';

export default SprintSummaryCard;
