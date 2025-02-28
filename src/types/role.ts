export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'project' | 'team' | 'epic' | 'story' | 'task' | 'system';
  action: 'create' | 'read' | 'update' | 'delete' | 'manage' | 'assign';
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  isSystem?: boolean;
  permissions: string[]; // Array of permission IDs
  createdAt: string;
  updatedAt: string;
}

// Default system roles
export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role-admin',
    name: 'Administrator',
    description: 'Full access to all resources and settings',
    isDefault: false,
    isSystem: true,
    permissions: ['*'], // Wildcard for all permissions
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'role-project-manager',
    name: 'Project Manager',
    description: 'Can manage projects, epics, and team assignments',
    isDefault: false,
    isSystem: true,
    permissions: [
      'project:create', 'project:read', 'project:update', 'project:delete', 'project:manage',
      'epic:create', 'epic:read', 'epic:update', 'epic:delete', 'epic:manage',
      'story:create', 'story:read', 'story:update', 'story:delete', 'story:manage',
      'task:create', 'task:read', 'task:update', 'task:delete', 'task:manage',
      'team:read', 'team:assign'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'role-team-member',
    name: 'Team Member',
    description: 'Standard team member with access to assigned projects',
    isDefault: true,
    isSystem: true,
    permissions: [
      'project:read',
      'epic:read',
      'story:create', 'story:read', 'story:update',
      'task:create', 'task:read', 'task:update',
      'team:read'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'role-viewer',
    name: 'Viewer',
    description: 'Read-only access to projects and tasks',
    isDefault: false,
    isSystem: true,
    permissions: [
      'project:read',
      'epic:read',
      'story:read',
      'task:read',
      'team:read'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Default permissions
export const DEFAULT_PERMISSIONS: Permission[] = [
  // Project permissions
  { id: 'project:create', name: 'Create Projects', description: 'Can create new projects', category: 'project', action: 'create' },
  { id: 'project:read', name: 'View Projects', description: 'Can view project details', category: 'project', action: 'read' },
  { id: 'project:update', name: 'Edit Projects', description: 'Can edit project details', category: 'project', action: 'update' },
  { id: 'project:delete', name: 'Delete Projects', description: 'Can delete projects', category: 'project', action: 'delete' },
  { id: 'project:manage', name: 'Manage Projects', description: 'Can manage all aspects of projects', category: 'project', action: 'manage' },
  
  // Epic permissions
  { id: 'epic:create', name: 'Create Epics', description: 'Can create new epics', category: 'epic', action: 'create' },
  { id: 'epic:read', name: 'View Epics', description: 'Can view epic details', category: 'epic', action: 'read' },
  { id: 'epic:update', name: 'Edit Epics', description: 'Can edit epic details', category: 'epic', action: 'update' },
  { id: 'epic:delete', name: 'Delete Epics', description: 'Can delete epics', category: 'epic', action: 'delete' },
  { id: 'epic:manage', name: 'Manage Epics', description: 'Can manage all aspects of epics', category: 'epic', action: 'manage' },
  
  // Story permissions
  { id: 'story:create', name: 'Create Stories', description: 'Can create new stories', category: 'story', action: 'create' },
  { id: 'story:read', name: 'View Stories', description: 'Can view story details', category: 'story', action: 'read' },
  { id: 'story:update', name: 'Edit Stories', description: 'Can edit story details', category: 'story', action: 'update' },
  { id: 'story:delete', name: 'Delete Stories', description: 'Can delete stories', category: 'story', action: 'delete' },
  { id: 'story:manage', name: 'Manage Stories', description: 'Can manage all aspects of stories', category: 'story', action: 'manage' },
  
  // Task permissions
  { id: 'task:create', name: 'Create Tasks', description: 'Can create new tasks', category: 'task', action: 'create' },
  { id: 'task:read', name: 'View Tasks', description: 'Can view task details', category: 'task', action: 'read' },
  { id: 'task:update', name: 'Edit Tasks', description: 'Can edit task details', category: 'task', action: 'update' },
  { id: 'task:delete', name: 'Delete Tasks', description: 'Can delete tasks', category: 'task', action: 'delete' },
  { id: 'task:manage', name: 'Manage Tasks', description: 'Can manage all aspects of tasks', category: 'task', action: 'manage' },
  
  // Team permissions
  { id: 'team:read', name: 'View Team', description: 'Can view team details', category: 'team', action: 'read' },
  { id: 'team:update', name: 'Edit Team', description: 'Can edit team details', category: 'team', action: 'update' },
  { id: 'team:assign', name: 'Assign Team Members', description: 'Can assign team members to projects', category: 'team', action: 'assign' },
  { id: 'team:manage', name: 'Manage Team', description: 'Can manage all aspects of team', category: 'team', action: 'manage' },
  
  // System permissions
  { id: 'system:settings', name: 'System Settings', description: 'Can access and modify system settings', category: 'system', action: 'manage' },
  { id: 'system:roles', name: 'Manage Roles', description: 'Can create and manage roles', category: 'system', action: 'manage' }
]; 