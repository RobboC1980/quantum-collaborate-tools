
import { User } from './user';

export type StoryType = 'enhancement' | 'bug' | 'technical-debt' | 'research' | 'documentation';
export type StoryStatus = 'backlog' | 'ready' | 'in-progress' | 'review' | 'done';
export type StoryPriority = 'low' | 'medium' | 'high' | 'critical';
export type RiskLevel = 'low' | 'medium' | 'high';

export interface Story {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  status: StoryStatus;
  priority: StoryPriority;
  points: number;
  epicId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId: string;
  tags: string[];
  acceptanceCriteria: string[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  originalStoryId?: string;
  childStoryIds: string[];
  businessValue: number;
  riskLevel: RiskLevel;
}

export interface StoryWithRelations extends Story {
  epic?: {
    id: string;
    name: string;
  };
  sprint?: {
    id: number;
    name: string;
  };
  assignee?: User;
  reporter: User;
}

// Mock data for development
export const mockStories: StoryWithRelations[] = [
  {
    id: 'QS-101',
    title: 'Implement user authentication flow',
    description: 'Create a secure authentication system with email and social login options',
    type: 'enhancement',
    status: 'in-progress',
    priority: 'high',
    points: 8,
    epicId: 'EP-01',
    sprintId: 1,
    assigneeId: 'user-123',
    reporterId: 'user-456',
    tags: ['authentication', 'security', 'frontend'],
    acceptanceCriteria: [
      'Users can sign up with email',
      'Users can log in with existing credentials',
      'Password reset functionality works',
      'Social login with Google and GitHub works'
    ],
    attachments: [],
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-05-14'),
    dependencies: [],
    childStoryIds: [],
    businessValue: 8,
    riskLevel: 'medium',
    epic: {
      id: 'EP-01',
      name: 'User Authentication & Authorization'
    },
    sprint: {
      id: 1,
      name: 'Sprint 23'
    },
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
    }
  },
  {
    id: 'QS-102',
    title: 'Design and implement dashboard widgets',
    description: 'Create reusable dashboard widgets for the main user dashboard',
    type: 'enhancement',
    status: 'ready',
    priority: 'medium',
    points: 5,
    epicId: 'EP-02',
    sprintId: 1,
    assigneeId: 'user-123',
    reporterId: 'user-789',
    tags: ['dashboard', 'frontend', 'ui'],
    acceptanceCriteria: [
      'Widget container is responsive',
      'Widgets can be customized by users',
      'Widget settings are persisted',
      'At least 5 widget types are implemented'
    ],
    attachments: ['widget-mockup.png'],
    createdAt: new Date('2024-05-12'),
    updatedAt: new Date('2024-05-12'),
    dependencies: ['QS-101'],
    childStoryIds: [],
    businessValue: 7,
    riskLevel: 'low',
    epic: {
      id: 'EP-02',
      name: 'Dashboard Experience'
    },
    sprint: {
      id: 1,
      name: 'Sprint 23'
    },
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
    id: 'QS-103',
    title: 'Fix login validation bug',
    description: 'Users reporting issues with email validation during login',
    type: 'bug',
    status: 'review',
    priority: 'high',
    points: 3,
    epicId: 'EP-01',
    sprintId: 1,
    assigneeId: 'user-789',
    reporterId: 'user-456',
    tags: ['bug', 'authentication', 'frontend'],
    acceptanceCriteria: [
      'Email validation accepts correct email formats',
      'Clear error messages are shown for invalid inputs',
      'All edge cases for email formats are handled correctly'
    ],
    attachments: ['bug-screenshot.png'],
    createdAt: new Date('2024-05-13'),
    updatedAt: new Date('2024-05-15'),
    dependencies: [],
    childStoryIds: [],
    businessValue: 6,
    riskLevel: 'low',
    epic: {
      id: 'EP-01',
      name: 'User Authentication & Authorization'
    },
    sprint: {
      id: 1,
      name: 'Sprint 23'
    },
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
    id: 'QS-104',
    title: 'Implement API response caching',
    description: 'Add caching layer to improve performance for frequently used API endpoints',
    type: 'technical-debt',
    status: 'backlog',
    priority: 'medium',
    points: 5,
    epicId: 'EP-03',
    sprintId: 2,
    assigneeId: undefined,
    reporterId: 'user-456',
    tags: ['performance', 'backend', 'caching'],
    acceptanceCriteria: [
      'Cache hit ratio is at least 80%',
      'Response time improves by 50% for cached endpoints',
      'Cache invalidation works correctly',
      'Cache size is configurable'
    ],
    attachments: [],
    createdAt: new Date('2024-05-14'),
    updatedAt: new Date('2024-05-14'),
    dependencies: [],
    childStoryIds: [],
    businessValue: 6,
    riskLevel: 'medium',
    epic: {
      id: 'EP-03',
      name: 'Platform Performance Optimization'
    },
    sprint: {
      id: 2,
      name: 'Sprint 24'
    },
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  },
  {
    id: 'QS-105',
    title: 'Research graph visualization libraries',
    description: 'Evaluate options for implementing dependency graph visualizations',
    type: 'research',
    status: 'done',
    priority: 'low',
    points: 3,
    epicId: 'EP-02',
    sprintId: 1,
    assigneeId: 'user-456',
    reporterId: 'user-456',
    tags: ['research', 'visualization', 'frontend'],
    acceptanceCriteria: [
      'At least 5 libraries are evaluated',
      'Performance benchmarks are documented',
      'Report includes pros/cons of each option',
      'Final recommendation is provided'
    ],
    attachments: ['research-doc.pdf'],
    createdAt: new Date('2024-05-08'),
    updatedAt: new Date('2024-05-16'),
    dependencies: [],
    childStoryIds: [],
    businessValue: 4,
    riskLevel: 'low',
    epic: {
      id: 'EP-02',
      name: 'Dashboard Experience'
    },
    sprint: {
      id: 1,
      name: 'Sprint 23'
    },
    assignee: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    },
    reporter: {
      id: 'user-456',
      email: 'bob@example.com',
      fullName: 'Bob Johnson',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob'
    }
  }
];
