import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import StoryList from '@/components/story/StoryList';
import StoryDetailDialog from '@/components/story/StoryDetailDialog';
import { 
  StoryWithRelations,
  Story
} from '@/types/story';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import TaskGenerator from '@/components/ai/TaskGenerator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Task } from '@/types/task';
import { supabase } from '@/integrations/supabase/client';

// Simple PageHeader component
const PageHeader: React.FC<{
  title: string;
  description?: string;
  children?: React.ReactNode;
}> = ({ title, description, children }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

const StoryManagement = () => {
  const mountedRef = useRef(true);
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTaskGeneratorOpen, setIsTaskGeneratorOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryWithRelations | null>(null);
  const [stories, setStories] = useState<StoryWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  // Fetch stories from Supabase
  const fetchStories = async () => {
    if (!user) return;
    
    setIsLoading(true);
    console.log("StoryManagement: Starting data load");
    
    try {
      // Fetch stories from Supabase with corrected foreign key references
      const { data, error } = await supabase
        .from('stories')
        .select(`
          *,
          epic:epics(id, title),
          assignee:profiles!stories_assignee_id_fkey(id, full_name, avatar_url, email),
          reporter:profiles!stories_reporter_id_fkey(id, full_name, avatar_url, email)
        `)
        .eq('reporter_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Transform the data to match StoryWithRelations format
      const transformedStories: StoryWithRelations[] = data.map(story => ({
        id: story.id,
        title: story.title,
        description: story.description || '',
        type: story.type,
        status: story.status,
        priority: story.priority,
        points: story.points || 0,
        epicId: story.epic_id,
        sprintId: story.sprint_id,
        assigneeId: story.assignee_id,
        reporterId: story.reporter_id,
        tags: story.tags || [],
        acceptanceCriteria: story.acceptance_criteria || [],
        attachments: story.attachments || [],
        createdAt: new Date(story.created_at),
        updatedAt: new Date(story.updated_at),
        dependencies: story.dependencies || [],
        originalStoryId: story.original_story_id,
        childStoryIds: story.child_story_ids || [],
        businessValue: story.business_value || 0,
        riskLevel: story.risk_level || 'low',
        epic: story.epic ? {
          id: story.epic.id,
          name: story.epic.title
        } : undefined,
        sprint: undefined, // Remove sprint reference since the table doesn't exist
        assignee: story.assignee ? {
          id: story.assignee.id,
          fullName: story.assignee.full_name,
          email: story.assignee.email,
          avatarUrl: story.assignee.avatar_url
        } : undefined,
        reporter: story.reporter ? {
          id: story.reporter.id,
          fullName: story.reporter.full_name,
          email: story.reporter.email,
          avatarUrl: story.reporter.avatar_url
        } : {
          id: user.id,
          fullName: profile?.full_name || user.email || '',
          email: user.email || '',
          avatarUrl: profile?.avatar_url || ''
        }
      }));
      
      console.log("StoryManagement: Setting stories data", transformedStories);
      setStories(transformedStories);
    } catch (error) {
      console.error("Error fetching stories:", error);
      toast({
        title: "Error",
        description: "Failed to load stories. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      console.log("StoryManagement: Data loaded");
    }
  };
  
  useEffect(() => {
    // Set the mounted ref to true when the component mounts
    mountedRef.current = true;
    
    // Fetch stories when the component mounts
    fetchStories();
    
    console.log("Story Management Page:", { user: !!user, profile });
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("StoryManagement: Component unmounting, cleaning up");
      mountedRef.current = false;
    };
  }, [user]); 
  
  useEffect(() => {
    if (mountedRef.current) {
      console.log("Dialog open state:", isStoryDialogOpen);
      console.log("Selected story:", selectedStory);
    }
  }, [isStoryDialogOpen, selectedStory]);
  
  // Create a new story
  const handleCreateStory = () => {
    console.log("Creating new story");
    setSelectedStory(null);
    setIsStoryDialogOpen(true);
  };
  
  // Open the edit dialog for a story
  const handleEditStory = (story: StoryWithRelations) => {
    console.log("Edit story called with:", story);
    setSelectedStory(story);
    setIsStoryDialogOpen(true);
  };
  
  // Open the delete confirmation dialog
  const handleDeleteClick = (story: StoryWithRelations) => {
    console.log("Delete story called with:", story);
    setSelectedStory(story);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle story save (both create and update)
  const handleSaveStory = async (story: StoryWithRelations) => {
    console.log("Saving story:", story);
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to save a story.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Prepare the story data for Supabase
      const storyData = {
        title: story.title,
        description: story.description,
        type: story.type,
        status: story.status,
        priority: story.priority,
        points: story.points,
        epic_id: story.epicId,
        sprint_id: story.sprintId,
        assignee_id: story.assigneeId,
        reporter_id: user.id,
        tags: story.tags,
        acceptance_criteria: story.acceptanceCriteria,
        business_value: story.businessValue,
        risk_level: story.riskLevel,
        dependencies: story.dependencies,
        child_story_ids: story.childStoryIds
      };
      
      let result;
      
      if (story.id && story.id.startsWith('QS-')) {
        // Update existing story
        result = await supabase
          .from('stories')
          .update(storyData)
          .eq('id', story.id)
          .select();
          
        toast({
          title: "Story updated",
          description: `"${story.title}" has been updated successfully.`,
        });
      } else {
        // Create new story
        result = await supabase
          .from('stories')
          .insert(storyData)
          .select();
          
        toast({
          title: "Story created",
          description: `"${story.title}" has been created successfully.`,
        });
      }
      
      if (result.error) {
        throw result.error;
      }
      
      // Refresh the stories list
      fetchStories();
    } catch (error) {
      console.error("Error saving story:", error);
      toast({
        title: "Error",
        description: "Failed to save story. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsStoryDialogOpen(false);
  };
  
  // Handle story deletion
  const handleDeleteStory = async () => {
    if (!selectedStory || !user) return;
    
    console.log("Deleting story:", selectedStory);
    
    try {
      const { error } = await supabase
        .from('stories')
        .delete()
        .eq('id', selectedStory.id)
        .eq('reporter_id', user.id);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Story deleted",
        description: `"${selectedStory.title}" has been deleted.`,
        variant: "destructive",
      });
      
      // Refresh the stories list
      fetchStories();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast({
        title: "Error",
        description: "Failed to delete story. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsDeleteDialogOpen(false);
    setSelectedStory(null);
  };

  // Handle generating tasks for a story
  const handleGenerateTasks = (story: StoryWithRelations) => {
    setSelectedStory(story);
    setIsTaskGeneratorOpen(true);
  };
  
  // Handle saving generated tasks
  const handleSaveTasks = (tasks: Task[]) => {
    // In a real application, you would save these tasks to your backend
    console.log('Saving generated tasks:', tasks);
    
    // Show success message
    toast({
      title: 'Tasks Generated',
      description: `${tasks.length} tasks have been created for story "${selectedStory?.title}"`,
    });
    
    // Close the dialog
    setIsTaskGeneratorOpen(false);
  };

  // Render a loading spinner while data is loading
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          title="Story Management"
          description="Create and manage your stories"
        />
        
        <StoryList
          stories={stories}
          onCreateStory={() => setIsStoryDialogOpen(true)}
          onSelectStory={handleEditStory}
          onDeleteStory={handleDeleteClick}
          onGenerateTasks={handleGenerateTasks}
        />
        
        {/* Story Creation/Edit Dialog */}
        <StoryDetailDialog 
          isOpen={isStoryDialogOpen}
          onClose={() => setIsStoryDialogOpen(false)}
          onSave={handleSaveStory}
          story={selectedStory}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Story</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this story? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        {/* Task Generator Dialog */}
        {selectedStory && (
          <TaskGenerator
            story={selectedStory}
            isOpen={isTaskGeneratorOpen}
            onClose={() => setIsTaskGeneratorOpen(false)}
            onSaveTasks={handleSaveTasks}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default StoryManagement;
