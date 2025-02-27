
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, MoreHorizontal, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockStories = [
  {
    id: 1,
    title: 'Implement user authentication flow',
    description: 'Add login, registration, and password reset functionality',
    status: 'todo',
    points: 8,
    priority: 'high',
    assignee: {
      name: 'Alice Cooper',
      avatar: ''
    },
    labels: ['Feature', 'Frontend']
  },
  {
    id: 2,
    title: 'Design dashboard widgets',
    description: 'Create UI components for analytics dashboard',
    status: 'todo',
    points: 5,
    priority: 'medium',
    assignee: {
      name: 'Bob Johnson',
      avatar: ''
    },
    labels: ['Design', 'UI']
  },
  {
    id: 3,
    title: 'API integration for user profiles',
    description: 'Connect frontend to user API endpoints',
    status: 'in-progress',
    points: 5,
    priority: 'medium',
    assignee: {
      name: 'Charlie Brown',
      avatar: ''
    },
    labels: ['Backend', 'API']
  },
  {
    id: 4,
    title: 'Fix login validation bug',
    description: 'Address issue with form validation on the login page',
    status: 'in-progress',
    points: 3,
    priority: 'high',
    assignee: {
      name: 'Diana Ross',
      avatar: ''
    },
    labels: ['Bug', 'Frontend']
  },
  {
    id: 5,
    title: 'Implement forgot password workflow',
    description: 'Add ability for users to reset their password',
    status: 'in-review',
    points: 5,
    priority: 'medium',
    assignee: {
      name: 'Edward Norton',
      avatar: ''
    },
    labels: ['Feature', 'Security']
  },
  {
    id: 6,
    title: 'Add unit tests for authentication',
    description: 'Create comprehensive test suite for auth components',
    status: 'done',
    points: 8,
    priority: 'medium',
    assignee: {
      name: 'Frank Sinatra',
      avatar: ''
    },
    labels: ['Testing', 'Quality']
  },
  {
    id: 7,
    title: 'Optimize image loading performance',
    description: 'Implement lazy loading for images across the app',
    status: 'done',
    points: 3,
    priority: 'low',
    assignee: {
      name: 'Gina Davis',
      avatar: ''
    },
    labels: ['Performance', 'Frontend']
  }
];

interface SprintBoardProps {
  sprint: any;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint }) => {
  const [stories, setStories] = useState(mockStories);

  const columns = [
    { id: 'todo', title: 'To Do', icon: <Clock size={14} /> },
    { id: 'in-progress', title: 'In Progress', icon: <AlertCircle size={14} /> },
    { id: 'in-review', title: 'In Review', icon: <MoreHorizontal size={14} /> },
    { id: 'done', title: 'Done', icon: <CheckCircle size={14} /> }
  ];

  const getStoriesByStatus = (status: string) => {
    return stories.filter(story => story.status === status);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLabelColor = (label: string) => {
    switch (label) {
      case 'Feature': return 'bg-purple-100 text-purple-800';
      case 'Bug': return 'bg-red-100 text-red-800';
      case 'Design': return 'bg-blue-100 text-blue-800';
      case 'Testing': return 'bg-green-100 text-green-800';
      case 'Frontend': return 'bg-indigo-100 text-indigo-800';
      case 'Backend': return 'bg-yellow-100 text-yellow-800';
      case 'API': return 'bg-orange-100 text-orange-800';
      case 'UI': return 'bg-pink-100 text-pink-800';
      case 'Performance': return 'bg-cyan-100 text-cyan-800';
      case 'Security': return 'bg-gray-100 text-gray-800';
      case 'Quality': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((column) => (
          <div key={column.id} className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {column.icon}
                <h3 className="text-sm font-medium ml-1.5">{column.title}</h3>
                <span className="ml-1.5 px-1.5 py-0.5 text-xs rounded bg-gray-100">
                  {getStoriesByStatus(column.id).length}
                </span>
              </div>
              {column.id === 'todo' && (
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  <Plus size={14} />
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {getStoriesByStatus(column.id).map((story) => (
                <Card key={story.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs font-normal">
                          {story.points} points
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Move</DropdownMenuItem>
                            <DropdownMenuItem>Assign</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      <h4 className="font-medium text-sm">{story.title}</h4>
                      <p className="text-xs text-muted-foreground">{story.description}</p>
                      
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {story.labels.map((label, i) => (
                          <span 
                            key={i} 
                            className={`px-1.5 py-0.5 text-xs rounded ${getLabelColor(label)}`}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <span 
                          className={`px-1.5 py-0.5 text-xs rounded ${getPriorityColor(story.priority)}`}
                        >
                          {story.priority.charAt(0).toUpperCase() + story.priority.slice(1)}
                        </span>
                        
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={story.assignee.avatar} alt={story.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {story.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {column.id === 'todo' && getStoriesByStatus(column.id).length === 0 && (
                <Card className="shadow-sm border-dashed">
                  <CardContent className="p-3 flex justify-center items-center h-20">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <Plus size={14} className="mr-1" />
                      Add Story
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SprintBoard;
