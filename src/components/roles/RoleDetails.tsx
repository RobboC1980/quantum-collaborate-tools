import React from 'react';
import { Role, Permission } from '@/types/role';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Clock, Shield, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface RoleDetailsProps {
  role: Role;
  permissions: Permission[];
  onClose: () => void;
  onEdit: (role: Role) => void;
}

const RoleDetails: React.FC<RoleDetailsProps> = ({
  role,
  permissions,
  onClose,
  onEdit
}) => {
  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Check if role has a specific permission
  const hasPermission = (permissionId: string) => {
    if (role.permissions.includes('*')) return true;
    return role.permissions.includes(permissionId);
  };

  // Format timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
            <CardTitle>{role.name}</CardTitle>
          </div>
          <div className="flex space-x-2">
            {role.isDefault && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="mr-1 h-3 w-3" />
                Default
              </Badge>
            )}
            {role.isSystem && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                System Role
              </Badge>
            )}
          </div>
        </div>
        <CardDescription>{role.description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between text-sm">
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Created: {formatDate(role.createdAt)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Updated: {formatDate(role.updatedAt)}</span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-3">Permissions</h3>
          
          {role.permissions.includes('*') ? (
            <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md mb-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                <span className="font-medium">Full Access</span>
              </div>
              <p className="text-sm mt-1">This role has access to all permissions.</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium capitalize">{category}</h4>
                    <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                      {categoryPermissions.map(permission => (
                        <div 
                          key={permission.id} 
                          className={`flex items-center justify-between p-2 rounded-md ${
                            hasPermission(permission.id) 
                              ? 'bg-green-50 text-green-700' 
                              : 'bg-gray-50 text-gray-500'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs">{permission.description}</div>
                          </div>
                          {hasPermission(permission.id) ? (
                            <Check className="h-4 w-4 flex-shrink-0" />
                          ) : (
                            <X className="h-4 w-4 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end space-x-2 pt-3">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onEdit(role)}>
          Edit Role
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoleDetails; 