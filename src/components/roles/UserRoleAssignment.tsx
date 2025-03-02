import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoaderCircle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Role } from '@/types/role';
import { useRoles } from '@/hooks/useRoles';
import { assignRoleToUser, removeRoleFromUser, getUserRoles } from '@/services/roleService';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface UserRoleAssignmentProps {
  users?: User[];
  onAssign?: (userId: string, roleId: string) => Promise<void>;
  onRemove?: (userId: string, roleId: string) => Promise<void>;
}

// Mock users for development until the API is fully implemented
const MOCK_USERS: User[] = [
  { id: 'user-1', email: 'john.doe@example.com', name: 'John Doe' },
  { id: 'user-2', email: 'jane.smith@example.com', name: 'Jane Smith' },
  { id: 'user-3', email: 'alex.wilson@example.com', name: 'Alex Wilson' },
  { id: 'user-4', email: 'sam.johnson@example.com', name: 'Sam Johnson' },
  { id: 'user-5', email: 'taylor.brown@example.com', name: 'Taylor Brown' },
];

export default function UserRoleAssignment({ 
  users: initialUsers, 
  onAssign, 
  onRemove 
}: UserRoleAssignmentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [savingUser, setSavingUser] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<Record<string, Role[]>>({});
  
  const { roles, loading: loadingRoles } = useRoles();

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      setIsLoading(true);
      try {
        // Use provided users or mock users
        const usersToUse = initialUsers || MOCK_USERS;
        setUsers(usersToUse);
        
        // In a real app, this is where we would fetch users from the API
        // const { data: { session } } = await supabase.auth.getSession();
        // if (!session) {
        //   toast({
        //     title: "Authentication Required",
        //     description: "You must be logged in to view team members.",
        //     variant: "destructive",
        //   });
        //   return;
        // }
        // const response = await fetch('/api/users');
        // if (!response.ok) throw new Error('Failed to fetch users');
        // const data = await response.json();
        // setUsers(data);
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error",
          description: "Failed to load team members. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUsers();
  }, [initialUsers]);

  // Fetch user roles
  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!users.length) return;
      
      try {
        const userRolesMap: Record<string, Role[]> = {};
        
        await Promise.all(
          users.map(async (user) => {
            const roles = await getUserRoles(user.id);
            userRolesMap[user.id] = roles;
          })
        );
        
        setUserRoles(userRolesMap);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        toast({
          title: "Error",
          description: "Failed to load user roles.",
          variant: "destructive",
        });
      }
    };

    if (!isLoading) {
      fetchUserRoles();
    }
  }, [users, isLoading]);

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.email?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower)
    );
  });

  const handleRoleChange = async (userId: string, roleId: string) => {
    if (!roleId) return;
    
    try {
      setSavingUser(userId);
      
      // Check if user already has this role
      const userCurrentRoles = userRoles[userId] || [];
      const hasRole = userCurrentRoles.some(role => role.id === roleId);
      
      if (hasRole) {
        // No need to assign the same role
        toast({
          title: "Info",
          description: "User already has this role.",
        });
        return;
      }
      
      // Call the callback if provided
      if (onAssign) {
        await onAssign(userId, roleId);
      } else {
        await assignRoleToUser({ userId, roleId });
      }
      
      // Update local state
      const role = roles.find(r => r.id === roleId);
      if (role) {
        setUserRoles(prev => ({
          ...prev,
          [userId]: [...(prev[userId] || []), role]
        }));
      }
      
      setSelectedRoles(prev => ({ ...prev, [userId]: '' }));
      
      toast({
        title: "Success",
        description: "Role assigned successfully.",
      });
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingUser(null);
    }
  };

  const handleRemoveRole = async (userId: string, roleId: string) => {
    try {
      setSavingUser(userId);
      
      // Call the callback if provided
      if (onRemove) {
        await onRemove(userId, roleId);
      } else {
        await removeRoleFromUser(userId, roleId);
      }
      
      // Update local state
      setUserRoles(prev => ({
        ...prev,
        [userId]: (prev[userId] || []).filter(role => role.id !== roleId)
      }));
      
      toast({
        title: "Success",
        description: "Role removed successfully.",
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingUser(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assign Roles to Users</CardTitle>
        <CardDescription>
          Manage role assignments for team members
        </CardDescription>
        <div className="mt-2">
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading || loadingRoles ? (
          <div className="flex justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-3 font-medium">Team Member</th>
                  <th className="text-left p-3 font-medium">Email</th>
                  <th className="text-left p-3 font-medium">Current Roles</th>
                  <th className="text-left p-3 font-medium">Assign Role</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-muted-foreground">
                      No team members found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="p-3">
                        {user.name || user.email.split('@')[0] || 'Unknown User'}
                      </td>
                      <td className="p-3">{user.email}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {userRoles[user.id]?.length > 0 ? (
                            userRoles[user.id].map((role) => (
                              <div key={`${user.id}-${role.id}`} className="flex items-center">
                                <Badge variant="outline" className="mr-1">
                                  {role.name}
                                </Badge>
                                {!role.isSystem && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 rounded-full"
                                    onClick={() => handleRemoveRole(user.id, role.id)}
                                    disabled={savingUser === user.id}
                                  >
                                    ×
                                  </Button>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">No roles assigned</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center space-x-2">
                          <Select
                            value={selectedRoles[user.id] || ''}
                            onValueChange={(value) => setSelectedRoles(prev => ({ ...prev, [user.id]: value }))}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleRoleChange(user.id, selectedRoles[user.id])}
                            disabled={!selectedRoles[user.id] || savingUser === user.id}
                            size="sm"
                          >
                            {savingUser === user.id ? (
                              <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                              'Assign'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 