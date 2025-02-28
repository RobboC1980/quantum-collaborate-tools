import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import ProjectList from '@/components/project/ProjectList';
import ProjectDetailDialog from '@/components/project/ProjectDetailDialog';
import { mockProjects, ProjectWithRelations, ProjectStatus } from '@/types/project';
import { useToast } from '@/components/ui/use-toast';

const ProjectManagement = () => {
  const mountedRef = useRef(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all');
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectWithRelations | null>(null);
  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  // Update URL when tab changes
  useEffect(() => {
    if (activeTab === 'all') {
      searchParams.delete('tab');
    } else {
      searchParams.set('tab', activeTab);
    }
    setSearchParams(searchParams);
  }, [activeTab, searchParams, setSearchParams]);
  
  // Load projects on mount
  useEffect(() => {
    // Set the mounted ref to true when the component mounts
    mountedRef.current = true;
    
    // Indicate loading is in progress
    setIsLoading(true);
    console.log("ProjectManagement: Starting data load");
    
    // Load the projects with a small delay to simulate fetching
    const timer = setTimeout(() => {
      // Only update state if the component is still mounted
      if (mountedRef.current) {
        console.log("ProjectManagement: Setting projects data");
        setProjects(mockProjects);
        setIsLoading(false);
        console.log("ProjectManagement: Data loaded");
      }
    }, 300);
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("ProjectManagement: Component unmounting, cleaning up");
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []); // Empty dependency array means this only runs once on mount
  
  // Filter projects based on active tab
  const filteredProjects = projects.filter(project => {
    switch (activeTab) {
      case 'active':
        return project.status === ProjectStatus.ACTIVE;
      case 'planning':
        return project.status === ProjectStatus.PLANNING;
      case 'completed':
        return project.status === ProjectStatus.COMPLETED;
      case 'on-hold':
        return project.status === ProjectStatus.ON_HOLD;
      default:
        return true; // 'all' tab
    }
  });
  
  // Handlers for project actions
  const handleCreateProject = () => {
    setSelectedProject(null);
    setIsProjectDialogOpen(true);
  };
  
  const handleEditProject = (project: ProjectWithRelations) => {
    setSelectedProject(project);
    setIsProjectDialogOpen(true);
  };
  
  const handleViewProject = (project: ProjectWithRelations) => {
    // In a real app, this might navigate to a detailed project view
    toast({
      title: "Project Details",
      description: `Viewing details for project "${project.title}"`,
    });
  };
  
  const handleSaveProject = (project: ProjectWithRelations) => {
    setProjects(prevProjects => {
      // Check if project already exists (update case)
      const existingIndex = prevProjects.findIndex(p => p.id === project.id);
      
      if (existingIndex >= 0) {
        // Update existing project
        const updatedProjects = [...prevProjects];
        updatedProjects[existingIndex] = project;
        
        toast({
          title: "Project Updated",
          description: `Project "${project.title}" has been updated successfully.`,
        });
        
        return updatedProjects;
      } else {
        // Create new project
        toast({
          title: "Project Created",
          description: `Project "${project.title}" has been created successfully.`,
        });
        
        return [...prevProjects, project];
      }
    });
    
    setIsProjectDialogOpen(false);
  };
  
  const handleDeleteProject = (project: ProjectWithRelations) => {
    setProjects(prevProjects => prevProjects.filter(p => p.id !== project.id));
    
    toast({
      title: "Project Deleted",
      description: `Project "${project.title}" has been deleted.`,
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
          <h1 className="text-2xl font-bold tracking-tight">Project Management</h1>
          <Button className="gap-1" onClick={handleCreateProject}>
            <PlusCircle size={16} />
            New Project
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Projects</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="on-hold">On Hold</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <ProjectList
              projects={filteredProjects}
              onCreateProject={handleCreateProject}
              onEditProject={handleEditProject}
              onDeleteProject={handleDeleteProject}
              onViewProject={handleViewProject}
            />
          </TabsContent>
        </Tabs>
        
        <ProjectDetailDialog
          open={isProjectDialogOpen}
          onOpenChange={setIsProjectDialogOpen}
          project={selectedProject}
          onSave={handleSaveProject}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProjectManagement; 