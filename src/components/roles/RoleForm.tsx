import React, { useState, useEffect } from 'react';
import { Role, Permission } from '@/types/role';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

// Define the form schema
const roleFormSchema = z.object({
  name: z.string().min(2, { message: 'Role name must be at least 2 characters.' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters.' }),
  isDefault: z.boolean().default(false),
  permissions: z.array(z.string())
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  onSubmit: (values: Omit<Role, 'id' | 'createdAt' | 'updatedAt' | 'isSystem'>) => void;
  onCancel: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({
  role,
  permissions,
  onSubmit,
  onCancel
}) => {
  const isEditMode = !!role;
  
  // Group permissions by category
  const permissionsByCategory = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
  
  // Sort categories
  const sortedCategories = Object.keys(permissionsByCategory).sort();
  
  // State for full access switch
  const [hasFullAccess, setHasFullAccess] = useState(
    isEditMode ? role.permissions.includes('*') : false
  );
  
  // Initialize the form with existing role values or defaults
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    defaultValues: {
      name: role?.name || '',
      description: role?.description || '',
      isDefault: role?.isDefault || false,
      permissions: hasFullAccess ? ['*'] : (role?.permissions || [])
    }
  });
  
  // Update form values when full access is toggled
  useEffect(() => {
    if (hasFullAccess) {
      form.setValue('permissions', ['*']);
    } else if (form.getValues('permissions').includes('*')) {
      form.setValue('permissions', []);
    }
  }, [hasFullAccess, form]);
  
  // Handle form submission
  const handleSubmit = (values: RoleFormValues) => {
    onSubmit({
      name: values.name,
      description: values.description,
      isDefault: values.isDefault,
      permissions: values.permissions
    });
  };
  
  // Handle the full access switch toggle
  const handleFullAccessToggle = (checked: boolean) => {
    setHasFullAccess(checked);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center">
          <Shield className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle>{isEditMode ? 'Edit Role' : 'Create New Role'}</CardTitle>
        </div>
        <CardDescription>
          {isEditMode 
            ? 'Update the role details and permissions'
            : 'Define a new role and assign permissions'
          }
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Project Manager" {...field} />
                    </FormControl>
                    <FormDescription>
                      The name of the role as it will appear in the system.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the purpose and responsibilities of this role" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A clear description helps others understand what this role is for.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Default Role</FormLabel>
                      <FormDescription>
                        Automatically assign this role to new team members.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Permissions</h3>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="full-access"
                    checked={hasFullAccess}
                    onCheckedChange={handleFullAccessToggle}
                  />
                  <label htmlFor="full-access" className="text-sm font-medium">
                    Full Access
                  </label>
                </div>
              </div>
              
              {hasFullAccess ? (
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-md mb-4">
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    <span className="font-medium">Full Access Enabled</span>
                  </div>
                  <p className="text-sm mt-1">
                    This role will have access to all permissions, including any added in the future.
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-6">
                    {sortedCategories.map(category => (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium capitalize">{category}</h4>
                          <Badge variant="outline" className="capitalize">{permissionsByCategory[category].length}</Badge>
                        </div>
                        <div className="space-y-2">
                          {permissionsByCategory[category].map(permission => (
                            <FormField
                              key={permission.id}
                              control={form.control}
                              name="permissions"
                              render={({ field }) => (
                                <FormItem
                                  key={permission.id}
                                  className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(permission.id)}
                                      onCheckedChange={(checked) => {
                                        const current = field.value || [];
                                        if (checked) {
                                          field.onChange([...current, permission.id]);
                                        } else {
                                          field.onChange(current.filter(value => value !== permission.id));
                                        }
                                      }}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel className="text-sm font-medium">
                                      {permission.name}
                                    </FormLabel>
                                    <FormDescription className="text-xs">
                                      {permission.description}
                                    </FormDescription>
                                  </div>
                                </FormItem>
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditMode ? 'Save Changes' : 'Create Role'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default RoleForm; 