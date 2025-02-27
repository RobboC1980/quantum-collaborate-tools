
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Calendar, ListTodo, BarChart2 } from 'lucide-react';
import SprintBoard from '@/components/sprint/SprintBoard';
import SprintCalendar from '@/components/sprint/SprintCalendar';
import ActiveSprintCard from '@/components/sprint/ActiveSprintCard';

const SprintManagement = () => {
  const [searchParams] = useSearchParams();
  const sprintId = searchParams.get('id');
  const [activeTab, setActiveTab] = useState('board');
  
  // Mock sprint data
  const mockSprints = [
    {
      id: 1,
      name: 'Sprint 23',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-28'),
      goal: 'Complete user authentication and dashboard widgets',
      status: 'active',
      team: 'Team Alpha',
      progress: 68,
      totalStories: 24,
      completedStories: 16,
      storyPoints: {
        total: 120,
        completed: 76
      }
    },
    {
      id: 2,
      name: 'Sprint 24',
      startDate: new Date('2024-05-29'),
      endDate: new Date('2024-06-11'),
      goal: 'Implement API integration and data visualization',
      status: 'planned',
      team: 'Team Beta',
      progress: 0,
      totalStories: 18,
      completedStories: 0,
      storyPoints: {
        total: 98,
        completed: 0
      }
    },
    {
      id: 3,
      name: 'Sprint 22',
      startDate: new Date('2024-05-01'),
      endDate: new Date('2024-05-14'),
      goal: 'Setup project infrastructure and core components',
      status: 'completed',
      team: 'Team Alpha',
      progress: 100,
      totalStories: 20,
      completedStories: 20,
      storyPoints: {
        total: 110,
        completed: 110
      }
    }
  ];
  
  // Find the selected sprint (defaults to the active sprint if none selected)
  const [selectedSprint, setSelectedSprint] = useState<any>(null);
  
  useEffect(() => {
    if (sprintId) {
      const sprint = mockSprints.find(s => s.id === Number(sprintId));
      if (sprint) {
        setSelectedSprint(sprint);
        return;
      }
    }
    
    // Default to active sprint if no ID is specified or not found
    const activeSprint = mockSprints.find(s => s.status === 'active');
    setSelectedSprint(activeSprint || mockSprints[0]);
  }, [sprintId]);
  
  if (!selectedSprint) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sprint Management</h1>
          <Button className="gap-1">
            <PlusCircle size={16} />
            Create Sprint
          </Button>
        </div>
        
        <ActiveSprintCard sprint={selectedSprint} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="board" className="flex items-center gap-1">
                <ListTodo size={14} />
                Board
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-1">
                <Calendar size={14} />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <BarChart2 size={14} />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Export
              </Button>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>
          </div>
          
          <TabsContent value="board" className="mt-0">
            <SprintBoard sprint={selectedSprint} />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-0">
            <SprintCalendar sprints={mockSprints} />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Burndown Chart</CardTitle>
                  <CardDescription>
                    Track progress against the ideal burndown line
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Burndown chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Velocity Chart</CardTitle>
                  <CardDescription>
                    Track team velocity across sprints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">Velocity chart will be displayed here</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Sprint Breakdown</CardTitle>
                  <CardDescription>
                    Breakdown of stories by status, type, and assignee
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                      <p className="text-muted-foreground">Status distribution chart</p>
                    </div>
                    <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                      <p className="text-muted-foreground">Story type distribution chart</p>
                    </div>
                    <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md">
                      <p className="text-muted-foreground">Assignee load chart</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SprintManagement;
