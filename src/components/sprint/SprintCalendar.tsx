
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addDays, isSameDay } from 'date-fns';

interface SprintCalendarProps {
  sprints: any[];
}

const SprintCalendar: React.FC<SprintCalendarProps> = ({ sprints }) => {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Group sprints by date
  const getSprintsForDay = (day: Date) => {
    return sprints.filter(sprint => {
      const startDate = new Date(sprint.startDate);
      const endDate = new Date(sprint.endDate);
      return (
        (day >= startDate && day <= endDate) || 
        isSameDay(day, startDate) || 
        isSameDay(day, endDate)
      );
    });
  };
  
  // Generate sprint display colors based on status
  const getSprintColor = (sprint: any) => {
    switch (sprint.status) {
      case 'active': return 'bg-blue-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-gray-300 text-gray-800';
    }
  };
  
  // Handle sprint duration display
  const isSprintStart = (day: Date, sprint: any) => {
    return isSameDay(day, new Date(sprint.startDate));
  };
  
  const isSprintEnd = (day: Date, sprint: any) => {
    return isSameDay(day, new Date(sprint.endDate));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">{format(currentDate, 'MMMM yyyy')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Days of week */}
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center font-medium text-sm py-1">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: monthStart.getDay() }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-24 p-1 bg-gray-50"></div>
          ))}
          
          {monthDays.map((day) => {
            const daySprintsList = getSprintsForDay(day);
            return (
              <div 
                key={day.toISOString()} 
                className={`h-24 p-1 border ${!isSameMonth(day, currentDate) ? 'bg-gray-50' : ''} 
                ${isToday(day) ? 'bg-blue-50 border-blue-200' : ''}`}
              >
                <div className="text-right text-sm mb-1">
                  {format(day, 'd')}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
                  {daySprintsList.map((sprint) => {
                    const isStart = isSprintStart(day, sprint);
                    const isEnd = isSprintEnd(day, sprint);
                    
                    return (
                      <div 
                        key={`${day.toISOString()}-${sprint.id}`} 
                        className={`${getSprintColor(sprint)} text-xs p-1 rounded-sm 
                        ${isStart ? 'rounded-l-md' : ''}
                        ${isEnd ? 'rounded-r-md' : ''}`}
                      >
                        {isStart && sprint.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          
          {Array.from({ length: 6 - monthEnd.getDay() }).map((_, index) => (
            <div key={`empty-end-${index}`} className="h-24 p-1 bg-gray-50"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SprintCalendar;
