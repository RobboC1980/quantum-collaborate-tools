
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Plus, ChevronRight, Clock, Calendar as CalendarIcon2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import SprintBoard from '@/components/sprint/SprintBoard';
import SprintCalendar from '@/components/sprint/SprintCalendar';
import ActiveSprintCard from '@/components/sprint/ActiveSprintCard';

// Mock data for sprints
const initialSprints = [
  {
    id: 1,
    name: 'Sprint 23',
    startDate: new Date(2024, 4, 15),
    endDate: new Date(2024, 4, 28),
    goal: 'Complete user authentication and profile management features',
    status: 'active',
    team: 'Core Team',
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
    name: 'Sprint 22',
    startDate: new Date(2024, 4, 1),
    endDate: new Date(2024, 4, 14),
    goal: 'Implement dashboard analytics and reporting',
    status: 'completed',
    team: 'Core Team',
    progress: 100,
    totalStories: 18,
    completedStories: 18,
    storyPoints: {
      total: 92,
      completed: 92
    }
  },
  {
    id: 3,
    name: 'Sprint 21',
    startDate: new Date(2024, 3, 17),
    endDate: new Date(2024, 3, 30),
    goal: 'Project settings and user permissions',
    status: 'completed',
    team: 'Core Team',
    progress: 100,
    totalStories: 20,
    completedStories: 18,
    storyPoints: {
      total: 104,
      completed: 96
    }
  }
];

const SprintManagement = () => {
  const [sprints, setSprints] = useState(initialSprints);
  const [open, setOpen] = useState(false);
  const [newSprint, setNewSprint] = useState({
    name: '',
    startDate: new Date(),
    endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // Default to 2 weeks
    goal: '',
    team: 'Core Team'
  });

  // Get active sprint
  const activeSprint = sprints.find(sprint => sprint.status === 'active');
  
  // Get upcoming sprints
  const upcomingSprints = sprints
    .filter(sprint => new Date(sprint.startDate) > new Date() && sprint.status !== 'active')
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
  // Get completed sprints
  const completedSprints = sprints
    .filter(sprint => sprint.status === 'completed')
    .sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime());

  const handleCreateSprint = () => {
    // Validate inputs
    if (!newSprint.name || !newSprint.goal || !newSprint.team) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Create new sprint
    const newSprintObj = {
      id: sprints.length + 1,
      ...newSprint,
      status: 'upcoming',
      progress: 0,
      totalStories: 0,
      completedStories: 0,
      storyPoints: {
        total: 0,
        completed: 0
      }
    };

    setSprints([...sprints, newSprintObj]);
    setOpen(false);
    toast.success('Sprint created successfully');
    
    // Reset form
    setNewSprint({
      name: '',
      startDate: new Date(),
      endDate: new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000),
      goal: '',
      team: 'Core Team'
    });
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sprint Management</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus size={16} />
                New Sprint
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Sprint</DialogTitle>
                <DialogDescription>
                  Set up a new sprint for your team to work on
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Sprint Name</Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Sprint 24" 
                    value={newSprint.name}
                    onChange={(e) => setNewSprint({...newSprint, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newSprint.startDate ? format(newSprint.startDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newSprint.startDate}
                          onSelect={(date) => date && setNewSprint({...newSprint, startDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid gap-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newSprint.endDate ? format(newSprint.endDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newSprint.endDate}
                          onSelect={(date) => date && setNewSprint({...newSprint, endDate: date})}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="team">Team</Label>
                  <Select 
                    value={newSprint.team} 
                    onValueChange={(value) => setNewSprint({...newSprint, team: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Core Team">Core Team</SelectItem>
                      <SelectItem value="Frontend Team">Frontend Team</SelectItem>
                      <SelectItem value="Backend Team">Backend Team</SelectItem>
                      <SelectItem value="Design Team">Design Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal">Sprint Goal</Label>
                  <Textarea 
                    id="goal" 
                    placeholder="What do you want to achieve in this sprint?" 
                    value={newSprint.goal}
                    onChange={(e) => setNewSprint({...newSprint, goal: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateSprint}>Create Sprint</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Active Sprint */}
        {activeSprint && (
          <ActiveSprintCard sprint={activeSprint} />
        )}

        {/* Sprint Management Tabs */}
        <Tabs defaultValue="board" className="space-y-4">
          <TabsList className="h-10">
            <TabsTrigger value="board" className="h-9">Board</TabsTrigger>
            <TabsTrigger value="calendar" className="h-9">Calendar</TabsTrigger>
            <TabsTrigger value="list" className="h-9">List</TabsTrigger>
          </TabsList>
          
          <TabsContent value="board" className="space-y-4">
            <SprintBoard sprint={activeSprint} />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-4">
            <SprintCalendar sprints={sprints} />
          </TabsContent>
          
          <TabsContent value="list" className="space-y-4">
            {/* Upcoming Sprints */}
            {upcomingSprints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Sprints</CardTitle>
                  <CardDescription>
                    Scheduled sprints that will start in the future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {upcomingSprints.map((sprint) => (
                      <div key={sprint.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <h3 className="font-semibold">{sprint.name}</h3>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                              Upcoming
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon2 size={14} className="mr-1" /> 
                            {format(new Date(sprint.startDate), "MMM d")} - {format(new Date(sprint.endDate), "MMM d, yyyy")}
                          </div>
                          <p className="text-sm mt-1 text-muted-foreground">{sprint.goal}</p>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Completed Sprints */}
            {completedSprints.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completed Sprints</CardTitle>
                  <CardDescription>
                    Review past sprints and their outcomes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {completedSprints.map((sprint) => (
                      <div key={sprint.id} className="flex items-center justify-between border-b pb-4 last:border-b-0 last:pb-0">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <h3 className="font-semibold">{sprint.name}</h3>
                            <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                              Completed
                            </span>
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-1">
                            <CalendarIcon2 size={14} className="mr-1" /> 
                            {format(new Date(sprint.startDate), "MMM d")} - {format(new Date(sprint.endDate), "MMM d, yyyy")}
                          </div>
                          <div className="flex items-center text-sm mt-1 text-muted-foreground">
                            <CheckCircle size={14} className="mr-1 text-green-600" /> 
                            {sprint.completedStories}/{sprint.totalStories} stories completed
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <ChevronRight size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SprintManagement;
