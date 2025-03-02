import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { format, differenceInDays } from 'date-fns';
import { Calendar, Clock, ArrowRight, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import ProgressBar from './ProgressBar';

interface ActiveSprintCardProps {
  sprint: {
    id: number;
    name: string;
    startDate: Date;
    endDate: Date;
    goal: string;
    status: string;
    team: string;
    progress: number;
    totalStories: number;
    completedStories: number;
    storyPoints: {
      total: number;
      completed: number;
    };
  };
}

const ActiveSprintCard: React.FC<ActiveSprintCardProps> = ({ sprint }) => {
  const daysLeft = differenceInDays(new Date(sprint.endDate), new Date());
  const isAtRisk = daysLeft <= 3 && sprint.progress < 70;

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <CardTitle>{sprint.name}</CardTitle>
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                Active
              </span>
            </div>
            <CardDescription className="mt-1">
              {sprint.goal}
            </CardDescription>
          </div>
          <Button variant="outline" className="gap-1">
            Manage Sprint <ArrowRight size={16} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-1 md:col-span-2">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sprint Progress</span>
                <span className="text-sm font-medium">{sprint.progress}%</span>
              </div>
              <Progress value={sprint.progress} className="h-2" />
            </div>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Timeline</span>
            <div className="flex items-center text-sm">
              <Calendar size={14} className="mr-1 text-muted-foreground" /> 
              {format(new Date(sprint.startDate), "MMM d")} - {format(new Date(sprint.endDate), "MMM d")}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Days Remaining</span>
            <div className="flex items-center">
              <Clock size={14} className="mr-1 text-muted-foreground" /> 
              <span className={`text-sm font-medium ${isAtRisk ? 'text-red-600' : ''}`}>
                {daysLeft} days left
              </span>
              {isAtRisk && (
                <AlertCircle size={14} className="ml-1.5 text-red-600" />
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-3">
            <span className="text-sm text-blue-700 font-medium">Stories</span>
            <div className="mt-1">
              <span className="text-xl font-bold">{sprint.completedStories}/{sprint.totalStories}</span>
              <div className="mt-1.5">
                <ProgressBar 
                  value={sprint.completedStories} 
                  maxValue={sprint.totalStories} 
                  color="blue"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-3">
            <span className="text-sm text-purple-700 font-medium">Story Points</span>
            <div className="mt-1">
              <span className="text-xl font-bold">{sprint.storyPoints.completed}/{sprint.storyPoints.total}</span>
              <div className="mt-1.5">
                <ProgressBar 
                  value={sprint.storyPoints.completed} 
                  maxValue={sprint.storyPoints.total} 
                  color="purple"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-3">
            <span className="text-sm text-green-700 font-medium">Team</span>
            <div className="mt-1">
              <span className="text-sm font-medium">{sprint.team}</span>
              <div className="flex items-center mt-1">
                <div className="flex -space-x-1.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={`team-member-${i}`} className="w-6 h-6 rounded-full bg-white border-2 border-green-50 flex items-center justify-center text-xs font-medium">
                      {String.fromCharCode(65 + i)}
                    </div>
                  ))}
                </div>
                <span className="text-xs text-green-700 ml-1.5">+2</span>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-3">
            <span className="text-sm text-orange-700 font-medium">Velocity</span>
            <div className="mt-1">
              <span className="text-xl font-bold">{Math.round(sprint.storyPoints.total / 2)}</span>
              <div className="text-xs text-orange-700 mt-0.5">points per week</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActiveSprintCard;
