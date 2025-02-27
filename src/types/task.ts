
import { User } from './user';
import { StoryWithRelations } from './story';

export type TaskStatus = 'to-do' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface TimeEntry {
  id: string;
  startTime: Date;
  endTime?: Date;
  description?: string;
  userId: string;
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  mentions: string[];
  attachments: string[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  estimatedHours?: number;
  actualHours?: number;
  storyId: string;
  assigneeId?: string;
  reporterId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  tags: string[];
  subtasks: Subtask[];
  attachments: string[];
  blockersDescription?: string;
  completionCriteria?: string;
  columnPosition: number;
}

export interface TaskWithRelations extends Task {
  story?: StoryWithRelations;
  assignee?: User;
  reporter: User;
  timeEntries?: TimeEntry[];
  comments?: Comment[];
  watchers?: User[];
}

// Mock data for development
export const mockTasks: TaskWithRelations[] = [
  {
    id: 'T-101',
    title: 'Create user login form',
    description: 'Implement the form for user login including validation and error handling',
    status: 'in-progress',
    priority: 'high',
    estimatedHours: 4,
    actualHours: 2.5,
    storyId: 'QS-101',
    assigneeId: 'user-123',
    reporterId: 'user-456',
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-05-14'),
    dueDate: new Date('2024-05-18'),
    tags: ['frontend', 'react'],
    subtasks: [
      { id: 'ST-1', title: 'Create form layout', completed: true },
      { id: 'ST-2', title: 'Implement validation', completed: false },
      { id: 'ST-3', title: 'Add error handling', completed: false }
    ],
    attachments: ['login-form-design.jpg'],
    completionCriteria: 'Form validates all inputs and displays appropriate error messages',
    columnPosition: 1,
    assignee: {
      id: 'user-123',
      email: 'alice@example.com',
      fullName: 'Alice Cooper',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    },
    timeEntries: [
      {
        id: 'TE-1',
        startTime: new Date('2024-05-14T10:00:00'),
        endTime: new Date('2024-05-14T12:30:00'),
        description: 'Created basic form layout and started validation',
        userId: 'user-123'
      }
    ],
    comments: [
      {
        id: 'C-1',
        content: 'Should we use Formik or React Hook Form?',
        createdAt: new Date('2024-05-12T15:30:00'),
        userId: 'user-123',
        mentions: [],
        attachments: []
      },
      {
        id: 'C-2',
        content: '@alice Let\'s go with React Hook Form for better performance',
        createdAt: new Date('2024-05-12T16:15:00'),
        userId: 'user-456',
        mentions: ['user-123'],
        attachments: []
      }
    ]
  },
  {
    id: 'T-102',
    title: 'Implement social login buttons',
    description: 'Add Google and GitHub authentication options to the login page',
    status: 'to-do',
    priority: 'medium',
    estimatedHours: 6,
    storyId: 'QS-101',
    assigneeId: 'user-789',
    reporterId: 'user-456',
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-05-12'),
    dueDate: new Date('2024-05-20'),
    tags: ['frontend', 'auth'],
    subtasks: [
      { id: 'ST-4', title: 'Setup Google OAuth', completed: false },
      { id: 'ST-5', title: 'Setup GitHub OAuth', completed: false },
      { id: 'ST-6', title: 'Design login buttons', completed: true }
    ],
    attachments: [],
    columnPosition: 0,
    assignee: {
      id: 'user-789',
      email: 'charlie@example.com',
      fullName: 'Charlie Brown',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
    },
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  },
  {
    id: 'T-103',
    title: 'Create reusable chart components',
    description: 'Build customizable chart components for the dashboard widgets',
    status: 'to-do',
    priority: 'medium',
    estimatedHours: 8,
    storyId: 'QS-102',
    assigneeId: 'user-123',
    reporterId: 'user-789',
    createdAt: new Date('2024-05-13'),
    updatedAt: new Date('2024-05-13'),
    dueDate: new Date('2024-05-22'),
    tags: ['frontend', 'visualization'],
    subtasks: [
      { id: 'ST-7', title: 'Research chart libraries', completed: true },
      { id: 'ST-8', title: 'Create bar chart component', completed: false },
      { id: 'ST-9', title: 'Create line chart component', completed: false },
      { id: 'ST-10', title: 'Create pie chart component', completed: false }
    ],
    attachments: [],
    columnPosition: 0,
    assignee: {
      id: 'user-123',
      email: 'alice@example.com',
      fullName: 'Alice Cooper',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice'
    },
    reporter: {
      id: 'user-789',
      email: 'charlie@example.com',
      fullName: 'Charlie Brown',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
    }
  },
  {
    id: 'T-104',
    title: 'Fix email validation regex',
    description: 'Update the email validation regex to handle all valid email formats correctly',
    status: 'review',
    priority: 'high',
    estimatedHours: 2,
    actualHours: 1.5,
    storyId: 'QS-103',
    assigneeId: 'user-789',
    reporterId: 'user-456',
    createdAt: new Date('2024-05-14'),
    updatedAt: new Date('2024-05-15'),
    dueDate: new Date('2024-05-16'),
    tags: ['bug', 'frontend'],
    subtasks: [
      { id: 'ST-11', title: 'Research correct email regex', completed: true },
      { id: 'ST-12', title: 'Update validation function', completed: true },
      { id: 'ST-13', title: 'Test with edge cases', completed: true }
    ],
    attachments: ['email-test-cases.txt'],
    completionCriteria: 'All email formats in the test cases document should validate correctly',
    columnPosition: 2,
    assignee: {
      id: 'user-789',
      email: 'charlie@example.com',
      fullName: 'Charlie Brown',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie'
    },
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    },
    comments: [
      {
        id: 'C-3',
        content: 'I found a good regex that handles all the edge cases we need.',
        createdAt: new Date('2024-05-14T11:20:00'),
        userId: 'user-789',
        mentions: [],
        attachments: []
      },
      {
        id: 'C-4',
        content: 'Looks good, but can you add some more test cases for international domains?',
        createdAt: new Date('2024-05-15T09:45:00'),
        userId: 'user-456',
        mentions: [],
        attachments: []
      }
    ]
  },
  {
    id: 'T-105',
    title: 'Implement Redis caching for API responses',
    description: 'Add Redis cache to store frequently accessed API responses',
    status: 'backlog',
    priority: 'medium',
    estimatedHours: 10,
    storyId: 'QS-104',
    reporterId: 'user-456',
    createdAt: new Date('2024-05-14'),
    updatedAt: new Date('2024-05-14'),
    tags: ['backend', 'performance'],
    subtasks: [
      { id: 'ST-14', title: 'Set up Redis in development', completed: false },
      { id: 'ST-15', title: 'Create cache middleware', completed: false },
      { id: 'ST-16', title: 'Implement cache invalidation', completed: false },
      { id: 'ST-17', title: 'Add cache configuration options', completed: false }
    ],
    attachments: [],
    columnPosition: 0,
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  }
];
