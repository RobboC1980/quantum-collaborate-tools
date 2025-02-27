
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { isLoading, error, listUsers, updateUserRole } = useAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (profile && profile.role !== 'admin') {
      toast.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [user, profile]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data, error } = await listUsers();
      if (error) {
        toast.error(`Error fetching users: ${error.message}`);
      } else {
        setUsers(data?.users || []);
      }
    } catch (err: any) {
      toast.error(`Error fetching users: ${err.message}`);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const { error } = await updateUserRole(userId, role);
      if (error) {
        toast.error(`Error updating role: ${error.message}`);
      } else {
        toast.success('User role updated successfully');
        fetchUsers();
      }
    } catch (err: any) {
      toast.error(`Error updating role: ${err.message}`);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
          <CardDescription>Manage users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={fetchUsers} disabled={isLoading}>
              Refresh User List
            </Button>
            
            {error && <div className="text-red-500">Error: {error.message}</div>}
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Select
                        defaultValue={user.role || 'member'}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="moderator">Moderator</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
