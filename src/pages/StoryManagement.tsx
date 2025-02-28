import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2, Sparkles } from 'lucide-react';
import StoryList from '@/components/story/StoryList';
import StoryDetailDialog from '@/components/story/StoryDetailDialog';
import { 
  mockStories, 
  StoryWithRelations 
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
  const [stories, setStories] = useState<StoryWithRelations[]>(mockStories);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  useEffect(() => {
    // Set the mounted ref to true when the component mounts
    mountedRef.current = true;
    
    // Indicate loading is in progress
    setIsLoading(true);
    console.log("StoryManagement: Starting data load");
    
    // Load the stories with a small delay to simulate fetching
    const timer = setTimeout(() => {
      // Only update state if the component is still mounted
      if (mountedRef.current) {
        console.log("StoryManagement: Setting stories data");
        setStories(mockStories);
        setIsLoading(false);
        console.log("StoryManagement: Data loaded");
      }
    }, 300);
    
    console.log("Story Management Page:", { user: !!user, profile });
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      console.log("StoryManagement: Component unmounting, cleaning up");
      mountedRef.current = false;
      clearTimeout(timer);
    };
  }, []); 
  
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
  const handleSaveStory = (story: StoryWithRelations) => {
    console.log("Saving story:", story);
    
    setStories(prevStories => {
      // Check if the story already exists (update case)
      const existingIndex = prevStories.findIndex(s => s.id === story.id);
      
      if (existingIndex >= 0) {
        // Update existing story
        const updatedStories = [...prevStories];
        updatedStories[existingIndex] = {
          ...story,
          updatedAt: new Date()
        };
        
        toast({
          title: "Story updated",
          description: `"${story.title}" has been updated successfully.`,
        });
        
        return updatedStories;
      } else {
        // Create new story with generated ID
        const newStory = {
          ...story,
          id: `QS-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          reporterId: user?.id || 'user-456', // Default to a mock user if no current user
        };
        
        toast({
          title: "Story created",
          description: `"${story.title}" has been created successfully.`,
        });
        
        return [...prevStories, newStory];
      }
    });
    
    setIsStoryDialogOpen(false);
  };
  
  // Handle story deletion
  const handleDeleteStory = () => {
    if (!selectedStory) return;
    
    console.log("Deleting story:", selectedStory);
    
    setStories(prevStories => prevStories.filter(story => story.id !== selectedStory.id));
    
    toast({
      title: "Story deleted",
      description: `"${selectedStory.title}" has been deleted.`,
      variant: "destructive",
    });
    
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
