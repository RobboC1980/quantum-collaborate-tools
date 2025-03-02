import { supabase } from '@/integrations/supabase/client';
import { Role, Permission } from '@/types/role';

// Base URL for the roles API
const ROLES_API_BASE = '/api/roles-api';

export interface RoleCreateDTO {
  name: string;
  description: string;
  isDefault: boolean;
  permissions: string[];
}

export interface RoleUpdateDTO {
  name?: string;
  description?: string;
  isDefault?: boolean;
  permissions?: string[];
}

export interface RoleAssignmentDTO {
  userId: string;
  roleId: string;
}

/**
 * Transforms a role from the API format to the frontend format
 */
const transformRole = (apiRole: any): Role => {
  return {
    id: apiRole.id,
    name: apiRole.name,
    description: apiRole.description,
    isDefault: apiRole.is_default,
    isSystem: apiRole.is_system,
    permissions: apiRole.permissions?.map((p: any) => p.id) || [],
    createdAt: apiRole.created_at,
    updatedAt: apiRole.updated_at
  };
};

/**
 * Transforms a permission from the API format to the frontend format
 */
const transformPermission = (apiPermission: any): Permission => {
  return {
    id: apiPermission.id,
    name: apiPermission.name,
    description: apiPermission.description,
    category: apiPermission.category,
    action: apiPermission.action
  };
};

/**
 * Fetches all roles
 */
export const fetchRoles = async (): Promise<Role[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      throw new Error('Not authenticated');
    }
    
    console.log('Fetching roles from:', `${ROLES_API_BASE}/roles`);
    const response = await fetch(`${ROLES_API_BASE}/roles`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      console.error('Response not OK:', response.status, response.statusText);
      console.error('Content-Type:', contentType);
      
      let errorMessage;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Failed to fetch roles';
      } else {
        // If not JSON, log the text for debugging
        const text = await response.text();
        console.error('Response text:', text);
        errorMessage = 'Server returned non-JSON response';
      }
      
      throw new Error(errorMessage);
    }
    
    const roles = await response.json();
    return roles.map(transformRole);
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

/**
 * Fetches a single role by ID
 */
export const fetchRoleById = async (roleId: string): Promise<Role> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/roles/${roleId}`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch role');
    }
    
    const role = await response.json();
    return transformRole(role);
  } catch (error) {
    console.error(`Error fetching role ${roleId}:`, error);
    throw error;
  }
};

/**
 * Fetches all permissions
 */
export const fetchPermissions = async (): Promise<Permission[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error('Authentication error:', sessionError);
      throw new Error('Not authenticated');
    }
    
    console.log('Fetching permissions from:', `${ROLES_API_BASE}/permissions`);
    const response = await fetch(`${ROLES_API_BASE}/permissions`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      console.error('Response not OK:', response.status, response.statusText);
      console.error('Content-Type:', contentType);
      
      let errorMessage;
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || 'Failed to fetch permissions';
      } else {
        // If not JSON, log the text for debugging
        const text = await response.text();
        console.error('Response text:', text);
        errorMessage = 'Server returned non-JSON response';
      }
      
      throw new Error(errorMessage);
    }
    
    const permissions = await response.json();
    return permissions.map(transformPermission);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    throw error;
  }
};

/**
 * Creates a new role
 */
export const createRole = async (roleData: RoleCreateDTO): Promise<Role> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        name: roleData.name,
        description: roleData.description,
        isDefault: roleData.isDefault,
        permissions: roleData.permissions
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create role');
    }
    
    const newRole = await response.json();
    return transformRole(newRole);
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

/**
 * Updates an existing role
 */
export const updateRole = async (roleId: string, roleData: RoleUpdateDTO): Promise<Role> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/roles/${roleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify(roleData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update role');
    }
    
    const updatedRole = await response.json();
    return transformRole(updatedRole);
  } catch (error) {
    console.error(`Error updating role ${roleId}:`, error);
    throw error;
  }
};

/**
 * Deletes a role
 */
export const deleteRole = async (roleId: string): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete role');
    }
  } catch (error) {
    console.error(`Error deleting role ${roleId}:`, error);
    throw error;
  }
};

/**
 * Assigns a role to a user
 */
export const assignRoleToUser = async (assignment: RoleAssignmentDTO): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/user-roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionData.session.access_token}`
      },
      body: JSON.stringify({
        userId: assignment.userId,
        roleId: assignment.roleId
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to assign role to user');
    }
  } catch (error) {
    console.error('Error assigning role to user:', error);
    throw error;
  }
};

/**
 * Removes a role from a user
 */
export const removeRoleFromUser = async (userId: string, roleId: string): Promise<void> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/user-roles?userId=${userId}&roleId=${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to remove role from user');
    }
  } catch (error) {
    console.error('Error removing role from user:', error);
    throw error;
  }
};

/**
 * Gets roles assigned to a user
 */
export const getUserRoles = async (userId: string): Promise<Role[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      throw new Error('Not authenticated');
    }
    
    const response = await fetch(`${ROLES_API_BASE}/user-roles?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get user roles');
    }
    
    const roles = await response.json();
    return roles.map(transformRole);
  } catch (error) {
    console.error(`Error getting roles for user ${userId}:`, error);
    throw error;
  }
};

/**
 * Checks if the current user has a specific permission
 */
export const checkPermission = async (permission: string): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      return false; // Not authenticated
    }
    
    const response = await fetch(`/api/auth-middleware?permission=${permission}`, {
      headers: {
        'Authorization': `Bearer ${sessionData.session.access_token}`
      }
    });
    
    if (!response.ok) {
      return false;
    }
    
    const result = await response.json();
    return result.authorized;
  } catch (error) {
    console.error(`Error checking permission ${permission}:`, error);
    return false;
  }
}; 