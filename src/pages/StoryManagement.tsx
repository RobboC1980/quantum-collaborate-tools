
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import StoryList from '@/components/story/StoryList';
import StoryDetailDialog from '@/components/story/StoryDetailDialog';
import { mockStories } from '@/types/story';

const StoryManagement = () => {
  const [isStoryDialogOpen, setIsStoryDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<any>(null);
  
  const handleCreateStory = () => {
    setSelectedStory(null);
    setIsStoryDialogOpen(true);
  };
  
  const handleEditStory = (story: any) => {
    setSelectedStory(story);
    setIsStoryDialogOpen(true);
  };
  
  const handleSaveStory = (story: any) => {
    console.log('Story saved:', story);
    // In a real app, we would save to the database
    // For now, we'll just close the dialog
    setIsStoryDialogOpen(false);
  };

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
          stories={mockStories}
          onCreateStory={handleCreateStory}
          onSelectStory={handleEditStory}
        />
        
        {/* Story Creation/Edit Dialog */}
        <StoryDetailDialog 
          isOpen={isStoryDialogOpen}
          onClose={() => setIsStoryDialogOpen(false)}
          onSave={handleSaveStory}
          story={selectedStory}
        />
      </div>
    </DashboardLayout>
  );
};

export default StoryManagement;
