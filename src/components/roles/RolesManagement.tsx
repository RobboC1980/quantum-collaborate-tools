import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RolesList from './RolesList';
import RoleDetails from './RoleDetails';
import RoleForm from './RoleForm';
import UserRoleAssignment from './UserRoleAssignment';
import { useRoles } from '@/hooks/useRoles';
import { Role } from '@/types/role';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import { RoleCreateDTO } from '@/services/roleService';

enum RolesView {
  LIST = 'list',
  DETAILS = 'details',
  CREATE = 'create',
  EDIT = 'edit',
  ASSIGNMENT = 'assignment',
}

const RolesManagement: React.FC = () => {
  // Ensure all useState hooks are called unconditionally and in the same order
  const [activeTab, setActiveTab] = useState<string>('roles');
  const [view, setView] = useState<RolesView>(RolesView.LIST);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    roles, 
    permissions,
    refreshRoles,
    createRole, 
    updateRole, 
    deleteRole,
    assignRoleToUser 
  } = useRoles();

  // Fetch roles and permissions on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshRoles();
      } catch (error) {
        console.error("Error loading data:", error);
        toast({
          title: 'Error',
          description: 'Failed to load roles and permissions',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [refreshRoles]);

  // Handlers for role list actions
  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setView(RolesView.DETAILS);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setView(RolesView.EDIT);
  };

  const handleDeleteRole = (role: Role) => {
    setSelectedRole(role);
    setDeleteDialogOpen(true);
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setView(RolesView.CREATE);
  };

  const confirmDeleteRole = async () => {
    if (selectedRole) {
      try {
        await deleteRole(selectedRole.id);
        toast({
          title: 'Success',
          description: `Role "${selectedRole.name}" has been deleted.`,
        });
        setView(RolesView.LIST);
      } catch (error) {
        toast({
          title: 'Error',
          description: `Failed to delete role: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    }
    
    setDeleteDialogOpen(false);
  };

  // Handle role form submission
  const handleRoleFormSubmit = async (formData: RoleCreateDTO) => {
    try {
      if (view === RolesView.CREATE) {
        // Create new role
        const newRole = await createRole(formData);
        if (newRole) {
          toast({
            title: 'Success',
            description: `Role "${newRole.name}" has been created.`,
          });
          setView(RolesView.LIST);
        }
      } else if (view === RolesView.EDIT && selectedRole) {
        // Update existing role
        const updated = await updateRole(selectedRole.id, formData);
        if (updated) {
          toast({
            title: 'Success',
            description: `Role "${formData.name}" has been updated.`,
          });
          setView(RolesView.LIST);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to ${view === RolesView.CREATE ? 'create' : 'update'} role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  // Handle assigning role to user
  const handleAssignRoleToUser = async (userId: string, roleId: string) => {
    try {
      await assignRoleToUser({ userId, roleId });
      toast({
        title: 'Success',
        description: 'Role has been assigned successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: `Failed to assign role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Render the appropriate content based on current view
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-quantum-600"></div>
        </div>
      );
    }

    if (activeTab === 'roles') {
      switch (view) {
        case RolesView.DETAILS:
          return selectedRole ? (
            <RoleDetails 
              role={selectedRole} 
              permissions={permissions}
              onClose={() => setView(RolesView.LIST)}
              onEdit={handleEditRole}
            />
          ) : null;
          
        case RolesView.CREATE:
          return (
            <RoleForm 
              permissions={permissions}
              onSubmit={handleRoleFormSubmit}
              onCancel={() => setView(RolesView.LIST)}
            />
          );
          
        case RolesView.EDIT:
          return selectedRole ? (
            <RoleForm 
              role={selectedRole}
              permissions={permissions}
              onSubmit={handleRoleFormSubmit}
              onCancel={() => setView(RolesView.LIST)}
            />
          ) : null;
          
        case RolesView.LIST:
        default:
          return (
            <RolesList 
              roles={roles}
              onViewRole={handleViewRole}
              onEditRole={handleEditRole}
              onDeleteRole={handleDeleteRole}
              onCreateRole={handleCreateRole}
            />
          );
      }
    } else {
      // Assignment tab
      return (
        <UserRoleAssignment 
          onAssign={handleAssignRoleToUser}
        />
      );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="assignments">Role Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {renderContent()}
        </TabsContent>
      </Tabs>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the role "{selectedRole?.name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRole}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RolesManagement; 