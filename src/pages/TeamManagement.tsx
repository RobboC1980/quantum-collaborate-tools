import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle, Search, UserPlus, Mail, Phone, Building, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams } from 'react-router-dom';
import RolesManagement from '@/components/roles/RolesManagement';
import { PermissionGuard } from '@/components/common/PermissionGuard';

// Mock team members data
const mockTeamMembers = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex.johnson@example.com',
    role: 'Product Manager',
    department: 'Product',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    status: 'active',
    phone: '+1 (555) 123-4567',
    location: 'New York, NY',
    joinDate: '2022-03-15',
    projects: ['Project Alpha', 'Project Beta'],
  },
  {
    id: 'user-2',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    role: 'Senior Developer',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    status: 'active',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA',
    joinDate: '2021-06-22',
    projects: ['Project Beta', 'Project Gamma'],
  },
  {
    id: 'user-3',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@example.com',
    role: 'UX Designer',
    department: 'Design',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    status: 'active',
    phone: '+1 (555) 345-6789',
    location: 'Austin, TX',
    joinDate: '2022-01-10',
    projects: ['Project Alpha', 'Project Delta'],
  },
  {
    id: 'user-4',
    name: 'Emily Taylor',
    email: 'emily.taylor@example.com',
    role: 'QA Engineer',
    department: 'Quality Assurance',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    status: 'active',
    phone: '+1 (555) 456-7890',
    location: 'Chicago, IL',
    joinDate: '2021-11-05',
    projects: ['Project Beta', 'Project Epsilon'],
  },
  {
    id: 'user-5',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'DevOps Engineer',
    department: 'Operations',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    status: 'on-leave',
    phone: '+1 (555) 567-8901',
    location: 'Seattle, WA',
    joinDate: '2022-02-18',
    projects: ['Project Gamma'],
  },
  {
    id: 'user-6',
    name: 'Jessica Brown',
    email: 'jessica.brown@example.com',
    role: 'Frontend Developer',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica',
    status: 'active',
    phone: '+1 (555) 678-9012',
    location: 'Boston, MA',
    joinDate: '2021-09-30',
    projects: ['Project Alpha', 'Project Delta'],
  },
  {
    id: 'user-7',
    name: 'Robert Kim',
    email: 'robert.kim@example.com',
    role: 'Backend Developer',
    department: 'Engineering',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    status: 'active',
    phone: '+1 (555) 789-0123',
    location: 'Portland, OR',
    joinDate: '2022-04-05',
    projects: ['Project Beta', 'Project Epsilon'],
  },
  {
    id: 'user-8',
    name: 'Amanda Martinez',
    email: 'amanda.martinez@example.com',
    role: 'Product Designer',
    department: 'Design',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
    status: 'inactive',
    phone: '+1 (555) 890-1234',
    location: 'Denver, CO',
    joinDate: '2021-07-15',
    projects: ['Project Gamma'],
  },
];

// Mock departments data
const mockDepartments = [
  { id: 'dept-1', name: 'Engineering', memberCount: 3, lead: 'Sarah Chen' },
  { id: 'dept-2', name: 'Design', memberCount: 2, lead: 'Michael Rodriguez' },
  { id: 'dept-3', name: 'Product', memberCount: 1, lead: 'Alex Johnson' },
  { id: 'dept-4', name: 'Quality Assurance', memberCount: 1, lead: 'Emily Taylor' },
  { id: 'dept-5', name: 'Operations', memberCount: 1, lead: 'David Wilson' },
];

const TeamManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'members');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
  const [departments, setDepartments] = useState(mockDepartments);
  const { toast } = useToast();

  // Update URL when tab changes
  useEffect(() => {
    if (activeTab === 'members') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', activeTab);
    }
    setSearchParams(searchParams);
  }, [activeTab, searchParams, setSearchParams]);

  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Filter team members based on search term and department filter
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.role.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      departmentFilter === 'all' || 
      member.department.toLowerCase() === departmentFilter.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  const handleAddMember = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The ability to add team members will be available in a future update.",
    });
  };

  const handleViewMemberDetails = (memberId) => {
    toast({
      title: "Member Details",
      description: `Viewing details for team member ID: ${memberId}`,
    });
  };

  const handleAddDepartment = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The ability to add departments will be available in a future update.",
    });
  };

  // Render loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-quantum-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Team Management</h1>
          <Button onClick={handleAddMember} className="gap-1">
            <UserPlus size={16} />
            Add Team Member
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search team members..."
                      className="pl-8 w-full"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded-md px-3 py-1.5 text-sm bg-background"
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      aria-label="Filter by department"
                    >
                      <option value="all">All Departments</option>
                      {departments.map(dept => (
                        <option key={dept.id} value={dept.name}>{dept.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {filteredMembers.length === 0 ? (
                  <div className="text-center py-10">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No team members found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your search or filter criteria
                    </p>
                    <Button onClick={handleAddMember} variant="outline">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Add New Team Member
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredMembers.map(member => (
                      <Card key={member.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="bg-muted p-4 flex items-center gap-4">
                            <Avatar className="h-14 w-14 border-2 border-background">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-medium">{member.name}</h3>
                              <p className="text-sm text-muted-foreground">{member.role}</p>
                              <Badge 
                                className={
                                  member.status === 'active' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 
                                  member.status === 'on-leave' ? 'bg-amber-100 text-amber-800 hover:bg-amber-100' : 
                                  'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                }
                              >
                                {member.status === 'active' ? 'Active' : 
                                 member.status === 'on-leave' ? 'On Leave' : 'Inactive'}
                              </Badge>
                            </div>
                          </div>
                          <div className="p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span>{member.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{member.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-muted-foreground" />
                              <span>{member.department}</span>
                            </div>
                            <div className="pt-2">
                              <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={() => handleViewMemberDetails(member.id)}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>Departments</CardTitle>
                  <Button size="sm" onClick={handleAddDepartment}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Department
                  </Button>
                </div>
                <CardDescription>
                  Manage your organization's departments and team structure
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {departments.map(dept => (
                    <Card key={dept.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{dept.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Team Lead:</span>
                            <span className="font-medium">{dept.lead}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Members:</span>
                            <Badge variant="outline">{dept.memberCount}</Badge>
                          </div>
                          <Button variant="outline" className="w-full mt-2">
                            View Department
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles" className="mt-0 border-0 p-0">
            <Card>
              <CardHeader>
                <CardTitle>Roles & Permissions</CardTitle>
                <CardDescription>
                  Manage roles and permissions for your team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PermissionGuard 
                  permission="roles:manage" 
                  fallback={
                    <div className="p-4 text-center">
                      <h3 className="text-lg font-medium">Access Restricted</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        You don't have permission to manage roles and permissions.
                        Please contact your administrator for access.
                      </p>
                    </div>
                  }
                >
                  <RolesManagement />
                </PermissionGuard>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default TeamManagement; 