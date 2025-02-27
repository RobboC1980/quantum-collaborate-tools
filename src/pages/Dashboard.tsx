
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowUp, 
  ArrowDown, 
  CalendarDays, 
  CheckCircle, 
  Clock, 
  Activity,
  PlusCircle,
  ListTodo,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SprintSummaryCard from '@/components/sprint/SprintSummaryCard';
import StoryList from '@/components/story/StoryList';
import StoryDetailDialog from '@/components/story/StoryDetailDialog';
import { mockStories } from '@/types/story';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  
  // Mock data for dashboard
  const projectStats = {
    activeProjects: 12,
    completedSprints: 48,
    completedStories: 287,
    teamMembers: 16
  };

  const mockSprints = [
    {
      id: 1,
      name: 'Sprint 23',
      startDate: '2024-05-15',
      endDate: '2024-05-28',
      status: 'active',
      progress: 68,
      totalStories: 24,
      completedStories: 16,
    },
    {
      id: 2,
      name: 'Sprint 24',
      startDate: '2024-05-29',
      endDate: '2024-06-11',
      status: 'planned',
      progress: 0,
      totalStories: 18,
      completedStories: 0,
    },
    {
      id: 3,
      name: 'Sprint 22',
      startDate: '2024-05-01',
      endDate: '2024-05-14',
      status: 'completed',
      progress: 100,
      totalStories: 20,
      completedStories: 20,
    }
  ];

  // Mock data for upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, title: 'Sprint 23 Demo', date: 'May 28, 2024', type: 'sprint' },
    { id: 2, title: 'Epic: User Authentication', date: 'June 10, 2024', type: 'epic' },
    { id: 3, title: 'Quarterly Planning', date: 'June 15, 2024', type: 'meeting' },
  ];

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, user: 'Alice Cooper', action: 'completed', item: 'User profile page redesign', time: '2 hours ago' },
    { id: 2, user: 'Bob Johnson', action: 'created', item: 'Bug fix: Login validation', time: '4 hours ago' },
    { id: 3, user: 'Charlie Brown', action: 'updated', item: 'Sprint 23 capacity', time: '5 hours ago' },
    { id: 4, user: 'Diana Ross', action: 'commented on', item: 'API integration story', time: '6 hours ago' },
    { id: 5, user: 'Edward Norton', action: 'moved', item: 'Dashboard widgets to In Review', time: '8 hours ago' },
  ];

  // Get the current active sprint
  const activeSprint = mockSprints.find(sprint => sprint.status === 'active');

  const navigateToSprint = (sprintId: number) => {
    navigate(`/dashboard/sprints?id=${sprintId}`);
  };
  
  const handleCreateStory = () => {
    setSelectedStory(null);
    setIsStoryDialogOpen(true);
  };
  
  const handleEditStory = (story: any) => {
    setSelectedStory(story);
    setIsStoryDialogOpen(true);
  };
  
  const handleSaveStory = (story: any) => {
    console.log('Story saved:', story);
    // In a real app, we would save to the database
    // For now, we'll just close the dialog
    setIsStoryDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
              <div className="h-4 w-4 text-quantum-600">
                <Activity size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.activeProjects}</div>
              <p className="text-xs text-muted-foreground">
                2 added this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Sprints</CardTitle>
              <div className="h-4 w-4 text-quantum-600">
                <CalendarDays size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.completedSprints}</div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Stories</CardTitle>
              <div className="h-4 w-4 text-quantum-600">
                <CheckCircle size={16} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.completedStories}</div>
              <p className="text-xs text-muted-foreground">
                +24 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <div className="h-4 w-4 text-quantum-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projectStats.teamMembers}</div>
              <p className="text-xs text-muted-foreground">
                +2 new this month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area with Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Sprints Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Sprints</h2>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <PlusCircle size={14} />
                  New Sprint
                </Button>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {mockSprints.map(sprint => (
                  <SprintSummaryCard 
                    key={sprint.id} 
                    sprint={sprint} 
                    onClick={() => navigateToSprint(sprint.id)}
                  />
                ))}
              </div>
            </div>
            
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {/* Upcoming Deadlines Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Upcoming Deadlines</CardTitle>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                      View All
                    </Button>
                  </div>
                  <CardDescription>
                    Stay on track with important dates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingDeadlines.map((deadline) => (
                      <div key={deadline.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-full ${
                          deadline.type === 'sprint' ? 'bg-blue-100 text-blue-700' :
                          deadline.type === 'epic' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          <Clock size={14} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">{deadline.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              {/* My Stories Card */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">My Stories</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 px-2 text-muted-foreground"
                      onClick={() => navigate('/dashboard/stories')}
                    >
                      View All
                    </Button>
                  </div>
                  <CardDescription>
                    Stories assigned to you in the current sprint
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStories.slice(0, 3).map((story) => (
                      <div key={story.id} className="flex items-center justify-between p-2 border rounded-md">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-100 text-blue-700">
                            <ListTodo size={14} />
                          </div>
                          <div>
                            <p className="text-sm font-medium line-clamp-1">
                              {story.title}
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {story.points} pts
                              </Badge>
                              <span className="text-xs text-muted-foreground capitalize">
                                {story.status.replace('-', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditStory(story)}
                        >
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Recent Activity Card */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground">
                    View All
                  </Button>
                </div>
                <CardDescription>
                  Latest updates and changes in your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-quantum-100 flex items-center justify-center text-quantum-700 flex-shrink-0">
                        {activity.user.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.user}</span>
                          <span className="text-muted-foreground"> {activity.action} </span>
                          <span className="font-medium">{activity.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stories">
            <StoryList 
              stories={mockStories}
              onCreateStory={handleCreateStory}
              onSelectStory={handleEditStory}
            />
          </TabsContent>
          
          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  View detailed analytics and team performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Analytics charts will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tasks">
            <Card>
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>
                  View and manage your assigned tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border border-dashed rounded-md">
                  <p className="text-muted-foreground">Task management interface will be displayed here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Story Creation/Edit Dialog */}
      <StoryDetailDialog 
        isOpen={isStoryDialogOpen}
        onClose={() => setIsStoryDialogOpen(false)}
        onSave={handleSaveStory}
        story={selectedStory}
      />
    </DashboardLayout>
  );
};

export default Dashboard;
