import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  FileText,
  CheckSquare,
  Layers,
  Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SprintSummaryCard from '@/components/sprint/SprintSummaryCard';
import StoryList from '@/components/story/StoryList';
import { mockStories } from '@/types/story';
import { mockTasks } from '@/types/task';
import { useAuth } from '@/contexts/AuthContext';
import { useUIInjection } from '@/hooks/useUIInjection';
import ROUTES from '@/constants/routes';

const Dashboard = () => {
  console.log("Dashboard component rendering");
  
  const navigate = useNavigate();
  const { user, profile, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const uiInjection = useUIInjection();
  
  console.log("Dashboard auth state:", { 
    user: user ? `User ID: ${user.id}` : "No user", 
    profile: profile ? `Profile: ${profile.full_name}` : "No profile",
    authLoading
  });
  
  useEffect(() => {
    console.log("Dashboard useEffect running");
    let isMounted = true;
    
    // Simulate loading data
    const timer = setTimeout(() => {
      if (isMounted) {
        console.log("Dashboard data loaded");
        setIsLoading(false);
      }
    }, 300);
    
    return () => {
      console.log("Dashboard useEffect cleanup");
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Mock data for dashboard
  const projectStats = {
    activeProjects: 12,
    completedSprints: 48,
    completedStories: 287,
    teamMembers: 16
  };
  
  // Upcoming sprints
  const upcomingSprints = [
    {
      id: 1,
      name: 'Sprint 23',
      startDate: new Date('2024-05-15'),
      endDate: new Date('2024-05-28'),
      status: 'active',
      progress: 68,
      totalStories: 24,
      completedStories: 16
    },
    {
      id: 2,
      name: 'Sprint 24',
      startDate: new Date('2024-05-29'),
      endDate: new Date('2024-06-11'),
      status: 'planned',
      progress: 0,
      totalStories: 18,
      completedStories: 0
    }
  ];
  
  // Upcoming deadlines
  const upcomingDeadlines = [
    {
      id: 'deadline-1',
      title: 'Complete API Integration',
      dueDate: new Date('2024-05-25'),
      type: 'story',
      priority: 'high'
    },
    {
      id: 'deadline-2',
      title: 'User Testing Session',
      dueDate: new Date('2024-05-27'),
      type: 'milestone',
      priority: 'medium'
    },
    {
      id: 'deadline-3',
      title: 'Sprint 23 Demo',
      dueDate: new Date('2024-05-28'),
      type: 'event',
      priority: 'medium'
    },
    {
      id: 'deadline-4',
      title: 'Release v1.2.0',
      dueDate: new Date('2024-06-05'),
      type: 'milestone',
      priority: 'critical'
    }
  ];
  
  // Recent activity
  const recentActivity = [
    {
      id: 'activity-1',
      user: {
        name: 'Alex Johnson',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
      },
      action: 'completed',
      item: {
        type: 'task',
        title: 'Implement user authentication'
      },
      timestamp: new Date('2024-05-22T14:32:00')
    },
    {
      id: 'activity-2',
      user: {
        name: 'Sarah Chen',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
      },
      action: 'created',
      item: {
        type: 'story',
        title: 'User profile settings'
      },
      timestamp: new Date('2024-05-22T11:15:00')
    },
    {
      id: 'activity-3',
      user: {
        name: 'Michael Rodriguez',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'
      },
      action: 'updated',
      item: {
        type: 'epic',
        title: 'User Management'
      },
      timestamp: new Date('2024-05-21T16:45:00')
    },
    {
      id: 'activity-4',
      user: {
        name: 'Emily Taylor',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily'
      },
      action: 'commented',
      item: {
        type: 'story',
        title: 'Dashboard analytics'
      },
      timestamp: new Date('2024-05-21T10:20:00')
    }
  ];
  
  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Calculate time ago for activity
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };
  
  // Get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Get item type icon
  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'story':
        return <FileText className="h-3.5 w-3.5" />;
      case 'task':
        return <CheckSquare className="h-3.5 w-3.5" />;
      case 'epic':
        return <Layers className="h-3.5 w-3.5" />;
      default:
        return <Activity className="h-3.5 w-3.5" />;
    }
  };
  
  if (isLoading || authLoading) {
    console.log("Dashboard is in loading state", { isLoading, authLoading });
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
        </div>
      </DashboardLayout>
    );
  }
  
  console.log("Dashboard rendering content");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              Welcome back, {profile?.full_name || 'User'}
            </span>
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

        {/* Project Management Quick Links */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-quantum-600" />
                  <h3 className="font-medium">Projects</h3>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => navigate(ROUTES.DASHBOARD.PROJECTS)}
                >
                  <ArrowRight size={16} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">Manage your projects and teams</p>
              <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                {projectStats.activeProjects} Active
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/sprints')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CalendarDays className="h-10 w-10 mb-3 text-blue-600" />
              <h3 className="font-medium text-lg">Sprints</h3>
              <p className="text-sm text-muted-foreground mb-4">Manage sprint planning and execution</p>
              <div className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                {upcomingSprints.filter(s => s.status === 'active').length} Active
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200 hover:bg-green-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/stories')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <FileText className="h-10 w-10 mb-3 text-green-600" />
              <h3 className="font-medium text-lg">Stories</h3>
              <p className="text-sm text-muted-foreground mb-4">Create and manage user stories</p>
              <div className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                {mockStories.length} Total
              </div>
            </CardContent>
          </Card>

          <Card className="bg-purple-50 border-purple-200 hover:bg-purple-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/tasks')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <CheckSquare className="h-10 w-10 mb-3 text-purple-600" />
              <h3 className="font-medium text-lg">Tasks</h3>
              <p className="text-sm text-muted-foreground mb-4">Track and manage implementation tasks</p>
              <div className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">
                {mockTasks.length} Total
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer" onClick={() => navigate('/dashboard/epics')}>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <Layers className="h-10 w-10 mb-3 text-amber-600" />
              <h3 className="font-medium text-lg">Epics</h3>
              <p className="text-sm text-muted-foreground mb-4">Organize work into epics and features</p>
              <div className="text-xs bg-amber-500 text-white px-2 py-1 rounded-full">
                3 Active
              </div>
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
                <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => navigate('/dashboard/sprints')}>
                  <PlusCircle size={14} />
                  New Sprint
                </Button>
              </div>
              
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {upcomingSprints.map(sprint => (
                  <SprintSummaryCard 
                    key={sprint.id} 
                    sprint={sprint} 
                    onClick={() => navigate(`/dashboard/sprints?id=${sprint.id}`)}
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
                          <p className="text-xs text-muted-foreground">{deadline.dueDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
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
                          onClick={() => navigate(`/dashboard/stories?id=${story.id}`)}
                        >
                          <ArrowRight size={14} />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate('/dashboard/stories')}
                    >
                      <PlusCircle size={14} className="mr-1" />
                      Create New Story
                    </Button>
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
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-4 border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-full bg-quantum-100 flex items-center justify-center text-quantum-700 flex-shrink-0">
                        <img src={activity.user.avatar} alt={activity.user.name} className="h-8 w-8 rounded-full" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.user.name}</span>
                          <span className="text-muted-foreground"> {activity.action} </span>
                          <span className="font-medium">{activity.item.title}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{timeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="stories">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">My Stories</h2>
              <Button onClick={() => navigate('/dashboard/stories')}>
                <PlusCircle size={16} className="mr-2" />
                Create Story
              </Button>
            </div>
            <StoryList 
              stories={mockStories.filter(story => story.assigneeId === 'user-123')} 
              onCreateStory={() => navigate('/dashboard/stories')}
              onSelectStory={(story) => navigate(`/dashboard/stories?id=${story.id}`)}
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
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">My Tasks</h2>
              <Button onClick={() => navigate('/dashboard/tasks')}>
                <PlusCircle size={16} className="mr-2" />
                Create Task
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {mockTasks.filter(task => task.assigneeId === 'user-123').slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-muted-foreground">{task.id}</span>
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-sm mt-1">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="text-xs text-muted-foreground">
                            {task.story?.id}: {task.story?.title.substring(0, 20)}...
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => navigate(`/dashboard/tasks?taskId=${task.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => navigate('/dashboard/tasks')}
                  >
                    View All Tasks
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
