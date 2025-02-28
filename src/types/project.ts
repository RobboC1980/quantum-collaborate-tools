import { User } from './user';
import { EpicWithRelations } from './epic';

export enum ProjectStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ON_HOLD = 'on-hold',
  CANCELLED = 'cancelled',
  PLANNING = 'planning'
}

export enum ProjectPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  startDate: Date;
  targetDate: Date;
  completedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  tags: string[];
  epicIds: string[];
}

export interface ProjectWithRelations extends Project {
  owner: User;
  epics: EpicWithRelations[];
}

// Mock data for development
export const mockProjects: ProjectWithRelations[] = [
  {
    id: 'P-001',
    title: 'Quantum Collaborate Platform',
    description: 'A collaborative platform for agile teams to manage projects, sprints, and tasks efficiently.',
    status: ProjectStatus.ACTIVE,
    priority: ProjectPriority.HIGH,
    progress: 65,
    startDate: new Date('2024-01-15'),
    targetDate: new Date('2024-07-30'),
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-05-18'),
    ownerId: 'U-001',
    tags: ['agile', 'collaboration', 'project-management'],
    epicIds: ['E-001', 'E-002', 'E-003'],
    owner: {
      id: 'U-001',
      email: 'alex@example.com',
      fullName: 'Alex Johnson',
      role: 'Project Manager',
      avatarUrl: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=6366F1&color=fff'
    },
    epics: []  // This will be populated when needed
  },
  {
    id: 'P-002',
    title: 'Customer Portal Redesign',
    description: 'Redesign of the customer portal with improved UX and additional self-service features.',
    status: ProjectStatus.PLANNING,
    priority: ProjectPriority.MEDIUM,
    progress: 15,
    startDate: new Date('2024-06-01'),
    targetDate: new Date('2024-09-30'),
    createdAt: new Date('2024-05-10'),
    updatedAt: new Date('2024-05-20'),
    ownerId: 'U-002',
    tags: ['ux', 'portal', 'customer-experience'],
    epicIds: ['E-004', 'E-005'],
    owner: {
      id: 'U-002',
      email: 'sarah@example.com',
      fullName: 'Sarah Chen',
      role: 'UX Lead',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Chen&background=6366F1&color=fff'
    },
    epics: []  // This will be populated when needed
  },
  {
    id: 'P-003',
    title: 'Mobile App Development',
    description: 'Development of a cross-platform mobile application for iOS and Android.',
    status: ProjectStatus.ON_HOLD,
    priority: ProjectPriority.HIGH,
    progress: 40,
    startDate: new Date('2024-02-15'),
    targetDate: new Date('2024-08-30'),
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-04-25'),
    ownerId: 'U-003',
    tags: ['mobile', 'cross-platform', 'react-native'],
    epicIds: ['E-006', 'E-007', 'E-008'],
    owner: {
      id: 'U-003',
      email: 'michael@example.com',
      fullName: 'Michael Rodriguez',
      role: 'Mobile Dev Lead',
      avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Rodriguez&background=6366F1&color=fff'
    },
    epics: []  // This will be populated when needed
  },
  {
    id: 'P-004',
    title: 'Data Analytics Dashboard',
    description: 'Implementation of a real-time data analytics dashboard with customizable widgets.',
    status: ProjectStatus.COMPLETED,
    priority: ProjectPriority.MEDIUM,
    progress: 100,
    startDate: new Date('2023-11-01'),
    targetDate: new Date('2024-03-31'),
    completedDate: new Date('2024-03-28'),
    createdAt: new Date('2023-10-25'),
    updatedAt: new Date('2024-03-28'),
    ownerId: 'U-004',
    tags: ['analytics', 'dashboard', 'data-visualization'],
    epicIds: ['E-009', 'E-010'],
    owner: {
      id: 'U-004',
      email: 'emily@example.com',
      fullName: 'Emily Taylor',
      role: 'Data Scientist',
      avatarUrl: 'https://ui-avatars.com/api/?name=Emily+Taylor&background=6366F1&color=fff'
    },
    epics: []  // This will be populated when needed
  },
  {
    id: 'P-005',
    title: 'API Gateway Implementation',
    description: 'Implementation of an API gateway for improved security and performance.',
    status: ProjectStatus.ACTIVE,
    priority: ProjectPriority.CRITICAL,
    progress: 75,
    startDate: new Date('2024-03-15'),
    targetDate: new Date('2024-06-30'),
    createdAt: new Date('2024-03-10'),
    updatedAt: new Date('2024-05-22'),
    ownerId: 'U-005',
    tags: ['api', 'gateway', 'security', 'performance'],
    epicIds: ['E-011', 'E-012'],
    owner: {
      id: 'U-005',
      email: 'david@example.com',
      fullName: 'David Kim',
      role: 'Backend Lead',
      avatarUrl: 'https://ui-avatars.com/api/?name=David+Kim&background=6366F1&color=fff'
    },
    epics: []  // This will be populated when needed
  }
];

// Helper functions
export function getStatusColor(status: ProjectStatus): string {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case ProjectStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case ProjectStatus.ON_HOLD:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case ProjectStatus.CANCELLED:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case ProjectStatus.PLANNING:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
}

export function getPriorityColor(priority: ProjectPriority): string {
  switch (priority) {
    case ProjectPriority.LOW:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case ProjectPriority.MEDIUM:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case ProjectPriority.HIGH:
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case ProjectPriority.CRITICAL:
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  }
} 