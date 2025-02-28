import { User } from './user';
import { StoryWithRelations } from './story';

export type EpicStatus = 'backlog' | 'planning' | 'in-progress' | 'review' | 'done';
export type EpicPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Epic {
  id: string;
  title: string;
  description: string;
  status: EpicStatus;
  priority: EpicPriority;
  startDate?: Date;
  targetDate?: Date;
  completedDate?: Date;
  progress: number; // 0-100
  ownerId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EpicWithRelations extends Epic {
  owner?: User;
  stories?: StoryWithRelations[];
}

// Mock data for development
export const mockEpics: EpicWithRelations[] = [
  {
    id: 'EP-01',
    title: 'User Authentication & Authorization',
    description: 'Implement secure user authentication and role-based authorization across the platform',
    status: 'in-progress',
    priority: 'high',
    startDate: new Date('2024-05-01'),
    targetDate: new Date('2024-06-15'),
    progress: 65,
    ownerId: 'user-456',
    tags: ['security', 'core-functionality', 'user-management'],
    createdAt: new Date('2024-04-15'),
    updatedAt: new Date('2024-05-20'),
    owner: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    },
    stories: []
  },
  {
    id: 'EP-02',
    title: 'Dashboard Experience',
    description: 'Create an intuitive and customizable dashboard with widgets and data visualization',
    status: 'planning',
    priority: 'medium',
    startDate: new Date('2024-06-01'),
    targetDate: new Date('2024-07-15'),
    progress: 15,
    ownerId: 'user-123',
    tags: ['ui', 'dashboard', 'visualization'],
    createdAt: new Date('2024-04-20'),
    updatedAt: new Date('2024-05-18'),
    owner: {
      id: 'user-123',
      email: 'alice@example.com',
      fullName: 'Alice Cooper',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    stories: []
  },
  {
    id: 'EP-03',
    title: 'Platform Performance Optimization',
    description: 'Improve application performance, reduce load times, and optimize database queries',
    status: 'backlog',
    priority: 'medium',
    targetDate: new Date('2024-08-30'),
    progress: 0,
    ownerId: 'user-789',
    tags: ['performance', 'optimization', 'technical-debt'],
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
    owner: {
      id: 'user-789',
      email: 'charlie@example.com',
      fullName: 'Charlie Brown',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
    },
    stories: []
  },
  {
    id: 'EP-04',
    title: 'Reporting & Analytics',
    description: 'Build comprehensive reporting tools and analytics dashboards for project insights',
    status: 'backlog',
    priority: 'low',
    progress: 0,
    tags: ['reporting', 'analytics', 'data'],
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-05-10'),
    stories: []
  },
  {
    id: 'EP-05',
    title: 'Mobile Responsiveness',
    description: 'Ensure all application features work seamlessly on mobile and tablet devices',
    status: 'done',
    priority: 'high',
    startDate: new Date('2024-03-01'),
    targetDate: new Date('2024-04-15'),
    completedDate: new Date('2024-04-12'),
    progress: 100,
    ownerId: 'user-123',
    tags: ['mobile', 'responsive', 'ui'],
    createdAt: new Date('2024-02-15'),
    updatedAt: new Date('2024-04-12'),
    owner: {
      id: 'user-123',
      email: 'alice@example.com',
      fullName: 'Alice Cooper',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    stories: []
  }
];

// Helper function to get status color
export const getEpicStatusColor = (status: EpicStatus): string => {
  switch (status) {
    case 'backlog':
      return 'bg-gray-100 text-gray-800';
    case 'planning':
      return 'bg-blue-100 text-blue-800';
    case 'in-progress':
      return 'bg-yellow-100 text-yellow-800';
    case 'review':
      return 'bg-purple-100 text-purple-800';
    case 'done':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Helper function to get priority color
export const getEpicPriorityColor = (priority: EpicPriority): string => {
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