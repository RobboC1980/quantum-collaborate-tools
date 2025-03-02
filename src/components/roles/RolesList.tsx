import React from 'react';
import { Role } from '@/types/role';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Eye, Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface RolesListProps {
  roles: Role[];
  onViewRole: (role: Role) => void;
  onEditRole: (role: Role) => void;
  onDeleteRole: (role: Role) => void;
  onCreateRole: () => void;
}

const RolesList: React.FC<RolesListProps> = ({
  roles,
  onViewRole,
  onEditRole,
  onDeleteRole,
  onCreateRole
}) => {
  // Sort roles: system roles first, then alphabetically
  const sortedRoles = [...roles].sort((a, b) => {
    if (a.isSystem && !b.isSystem) return -1;
    if (!a.isSystem && b.isSystem) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Available Roles</h3>
        <Button size="sm" onClick={onCreateRole}>
          <Plus className="mr-2 h-4 w-4" />
          Create Role
        </Button>
      </div>
      
      <ScrollArea className="h-[450px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedRoles.map((role) => (
            <Card key={role.id} className="relative overflow-hidden">
              {role.isDefault && (
                <div className="absolute top-2 right-2">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <Check className="mr-1 h-3 w-3" />
                    Default
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
                  <CardTitle className="text-lg">{role.name}</CardTitle>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {role.permissions.length === 1 && role.permissions[0] === '*' 
                    ? 'Full access to all permissions'
                    : `${role.permissions.length} permissions`}
                </div>
                
                {role.isSystem && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    System Role
                  </Badge>
                )}
              </CardContent>
              
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => onViewRole(role)}>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                
                <Button variant="outline" size="sm" onClick={() => onEditRole(role)}>
                  <Pencil className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                
                {!role.isSystem && (
                  <Button variant="outline" size="sm" onClick={() => onDeleteRole(role)}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RolesList; 