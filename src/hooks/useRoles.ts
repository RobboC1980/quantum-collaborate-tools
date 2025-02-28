import { useState, useEffect, useCallback } from 'react';
import { Role, Permission } from '@/types/role';
import { 
  fetchRoles as apiFetchRoles, 
  fetchPermissions as apiFetchPermissions,
  createRole as apiCreateRole,
  updateRole as apiUpdateRole,
  deleteRole as apiDeleteRole,
  assignRoleToUser as apiAssignRoleToUser,
  removeRoleFromUser as apiRemoveRoleFromUser,
  getUserRoles as apiGetUserRoles,
  RoleCreateDTO,
  RoleUpdateDTO,
  RoleAssignmentDTO
} from '@/services/roleService';
import { toast } from '@/components/ui/use-toast';

// Mock data for development
const MOCK_ROLES: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    description: 'Full access to all resources and settings',
    isDefault: false,
    isSystem: true,
    permissions: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Project Manager',
    description: 'Can manage projects, epics, and team assignments',
    isDefault: false,
    isSystem: true,
    permissions: ['1', '2', '3', '5', '6', '7', '8', '10'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Team Member',
    description: 'Standard team member with access to assigned projects',
    isDefault: true,
    isSystem: true,
    permissions: ['2', '7', '12', '17', '18', '19', '22'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Viewer',
    description: 'Read-only access to projects and tasks',
    isDefault: false,
    isSystem: true,
    permissions: ['2', '7', '12', '17', '22'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_PERMISSIONS: Permission[] = [
  { id: '1', name: 'Create Projects', description: 'Can create new projects', category: 'project', action: 'create' },
  { id: '2', name: 'View Projects', description: 'Can view project details', category: 'project', action: 'read' },
  { id: '3', name: 'Edit Projects', description: 'Can edit project details', category: 'project', action: 'update' },
  { id: '4', name: 'Delete Projects', description: 'Can delete projects', category: 'project', action: 'delete' },
  { id: '5', name: 'Manage Projects', description: 'Can manage all aspects of projects', category: 'project', action: 'manage' },
  { id: '6', name: 'Create Epics', description: 'Can create new epics', category: 'epic', action: 'create' },
  { id: '7', name: 'View Epics', description: 'Can view epic details', category: 'epic', action: 'read' },
  { id: '8', name: 'Edit Epics', description: 'Can edit epic details', category: 'epic', action: 'update' },
  { id: '9', name: 'Delete Epics', description: 'Can delete epics', category: 'epic', action: 'delete' },
  { id: '10', name: 'Manage Epics', description: 'Can manage all aspects of epics', category: 'epic', action: 'manage' },
  { id: '11', name: 'Create Stories', description: 'Can create new stories', category: 'story', action: 'create' },
  { id: '12', name: 'View Stories', description: 'Can view story details', category: 'story', action: 'read' },
  { id: '13', name: 'Edit Stories', description: 'Can edit story details', category: 'story', action: 'update' },
  { id: '14', name: 'Delete Stories', description: 'Can delete stories', category: 'story', action: 'delete' },
  { id: '15', name: 'Manage Stories', description: 'Can manage all aspects of stories', category: 'story', action: 'manage' },
  { id: '16', name: 'Create Tasks', description: 'Can create new tasks', category: 'task', action: 'create' },
  { id: '17', name: 'View Tasks', description: 'Can view task details', category: 'task', action: 'read' },
  { id: '18', name: 'Edit Tasks', description: 'Can edit task details', category: 'task', action: 'update' },
  { id: '19', name: 'Delete Tasks', description: 'Can delete tasks', category: 'task', action: 'delete' },
  { id: '20', name: 'Manage Tasks', description: 'Can manage all aspects of tasks', category: 'task', action: 'manage' },
  { id: '21', name: 'View Team', description: 'Can view team details', category: 'team', action: 'read' },
  { id: '22', name: 'Edit Team', description: 'Can edit team details', category: 'team', action: 'update' },
  { id: '23', name: 'Assign Team Members', description: 'Can assign team members to projects', category: 'team', action: 'assign' },
  { id: '24', name: 'Manage Team', description: 'Can manage all aspects of team', category: 'team', action: 'manage' },
  { id: '25', name: 'System Settings', description: 'Can access and modify system settings', category: 'system', action: 'manage' },
  { id: '26', name: 'Manage Roles', description: 'Can create and manage roles', category: 'system', action: 'manage' }
];

// Environment check to determine if we should use mock data
const USE_MOCK_DATA = process.env.NODE_ENV === 'development'; // Always use mock data in development

export interface UseRolesResult {
  roles: Role[];
  permissions: Permission[];
  loading: boolean;
  error: string | null;
  createRole: (role: RoleCreateDTO) => Promise<Role | null>;
  updateRole: (id: string, role: RoleUpdateDTO) => Promise<Role | null>;
  deleteRole: (id: string) => Promise<boolean>;
  assignRoleToUser: (assignment: RoleAssignmentDTO) => Promise<boolean>;
  removeRoleFromUser: (userId: string, roleId: string) => Promise<boolean>;
  getUserRoles: (userId: string) => Promise<Role[]>;
  refreshRoles: () => Promise<void>;
}

export function useRoles(): UseRolesResult {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use useCallback to memoize the refreshRoles function to avoid recreating it on every render
  const refreshRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (USE_MOCK_DATA) {
        // Use mock data
        setRoles(MOCK_ROLES);
        setPermissions(MOCK_PERMISSIONS);
      } else {
        // Fetch both roles and permissions in parallel
        const [rolesData, permissionsData] = await Promise.all([
          apiFetchRoles(),
          apiFetchPermissions()
        ]);
        setRoles(rolesData);
        setPermissions(permissionsData);
      }
    } catch (err) {
      console.error('Error fetching roles/permissions:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);

      // Fallback to mock data in case of error in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data as fallback');
        setRoles(MOCK_ROLES);
        setPermissions(MOCK_PERMISSIONS);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load roles and permissions',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Call refreshRoles on mount
  useEffect(() => {
    refreshRoles();
  }, [refreshRoles]);

  const createRole = useCallback(async (roleData: RoleCreateDTO): Promise<Role | null> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        const newRole: Role = {
          id: Math.random().toString(36).substring(2, 9),
          name: roleData.name,
          description: roleData.description,
          isDefault: roleData.isDefault,
          isSystem: false,
          permissions: roleData.permissions || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setRoles(prev => [...prev, newRole]);
        return newRole;
      } else {
        const newRole = await apiCreateRole(roleData);
        setRoles(prev => [...prev, newRole]);
        toast({
          title: 'Success',
          description: `Role "${newRole.name}" created successfully`,
        });
        return newRole;
      }
    } catch (err) {
      console.error('Error creating role:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create role',
        variant: 'destructive',
      });
      return null;
    }
  }, []);

  const updateRole = useCallback(async (id: string, roleData: RoleUpdateDTO): Promise<Role | null> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        const roleIndex = roles.findIndex(r => r.id === id);
        if (roleIndex === -1) return null;
        
        const updatedRole: Role = {
          ...roles[roleIndex],
          name: roleData.name || roles[roleIndex].name,
          description: roleData.description || roles[roleIndex].description,
          isDefault: roleData.isDefault !== undefined ? roleData.isDefault : roles[roleIndex].isDefault,
          permissions: roleData.permissions || roles[roleIndex].permissions,
          updatedAt: new Date().toISOString()
        };
        
        const newRoles = [...roles];
        newRoles[roleIndex] = updatedRole;
        setRoles(newRoles);
        return updatedRole;
      } else {
        const updatedRole = await apiUpdateRole(id, roleData);
        setRoles(prev => prev.map(role => role.id === id ? updatedRole : role));
        toast({
          title: 'Success',
          description: `Role "${updatedRole.name}" updated successfully`,
        });
        return updatedRole;
      }
    } catch (err) {
      console.error('Error updating role:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to update role',
        variant: 'destructive',
      });
      return null;
    }
  }, [roles]);

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation
        setRoles(prev => prev.filter(role => role.id !== id));
        return true;
      } else {
        await apiDeleteRole(id);
        setRoles(prev => prev.filter(role => role.id !== id));
        toast({
          title: 'Success',
          description: 'Role deleted successfully',
        });
        return true;
      }
    } catch (err) {
      console.error('Error deleting role:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to delete role',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const assignRoleToUser = useCallback(async (assignment: RoleAssignmentDTO): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation - just return success
        return true;
      } else {
        await apiAssignRoleToUser(assignment);
        toast({
          title: 'Success',
          description: 'Role assigned successfully',
        });
        return true;
      }
    } catch (err) {
      console.error('Error assigning role:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to assign role',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const removeRoleFromUser = useCallback(async (userId: string, roleId: string): Promise<boolean> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation - just return success
        return true;
      } else {
        await apiRemoveRoleFromUser(userId, roleId);
        toast({
          title: 'Success',
          description: 'Role removed successfully',
        });
        return true;
      }
    } catch (err) {
      console.error('Error removing role:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove role',
        variant: 'destructive',
      });
      return false;
    }
  }, []);

  const getUserRoles = useCallback(async (userId: string): Promise<Role[]> => {
    try {
      if (USE_MOCK_DATA) {
        // Mock implementation - return some roles
        return MOCK_ROLES.filter(role => Math.random() > 0.5);
      } else {
        return await apiGetUserRoles(userId);
      }
    } catch (err) {
      console.error('Error getting user roles:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to get user roles',
        variant: 'destructive',
      });
      return [];
    }
  }, []);

  return {
    roles,
    permissions,
    loading,
    error,
    createRole,
    updateRole,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
    getUserRoles,
    refreshRoles,
  };
} 