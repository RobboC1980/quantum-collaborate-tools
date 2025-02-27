
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
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

const StoryManagement = () => {
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryWithRelations | null>(null);
  const [stories, setStories] = useState<StoryWithRelations[]>(mockStories);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      console.log("StoryManagement: Data loaded");
    }, 300);
    
    console.log("Story Management Page:", { user: !!user, profile });
    
    return () => clearTimeout(timer);
  }, [user, profile]);
  
  useEffect(() => {
    console.log("Dialog open state:", isStoryDialogOpen);
    console.log("Selected story:", selectedStory);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Stories</h1>
          <Button onClick={handleCreateStory} className="gap-1">
            <PlusCircle size={16} />
            New Story
          </Button>
        </div>
        
        <StoryList 
          stories={stories}
          onCreateStory={handleCreateStory}
          onSelectStory={handleEditStory}
          onDeleteStory={handleDeleteClick}
        />
        
        {/* Story Creation/Edit Dialog */}
        <StoryDetailDialog 
          isOpen={isStoryDialogOpen}
          onClose={() => setIsStoryDialogOpen(false)}
          onSave={handleSaveStory}
          story={selectedStory || undefined}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the story "{selectedStory?.title}" and all associated tasks. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteStory} className="bg-destructive text-destructive-foreground">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default StoryManagement;
