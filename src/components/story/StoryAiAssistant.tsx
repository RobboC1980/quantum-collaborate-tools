import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { useAiStoryGenerator } from '@/hooks';
import { GeneratedStory } from '@/services/ai/story-generator';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface StoryAiAssistantProps {
  projectContext?: string;
  onStoryGenerated?: (story: GeneratedStory) => void;
}

export function StoryAiAssistant({ 
  projectContext = '',
  onStoryGenerated 
}: StoryAiAssistantProps) {
  const [featureDescription, setFeatureDescription] = useState('');
  const [userPerspective, setUserPerspective] = useState('As a user');
  
  const { generateStories, stories, isGenerating, error, reset } = useAiStoryGenerator({
    onSuccess: (generatedStories) => {
      if (generatedStories.length > 0) {
        toast({
          title: "Story generated successfully",
          description: "AI has created a user story based on your description",
        });
      }
    },
    onError: (err) => {
      toast({
        title: "Error generating story",
        description: err.message,
        variant: "destructive",
      });
    }
  });

  const handleGenerateStory = async () => {
    if (!featureDescription.trim()) {
      toast({
        title: "Missing description",
        description: "Please provide a feature description",
        variant: "destructive",
      });
      return;
    }
    
    await generateStories({
      featureDescription,
      projectContext,
      userPerspective,
    });
  };

  const handleUseStory = (story: GeneratedStory) => {
    if (onStoryGenerated) {
      onStoryGenerated(story);
      toast({
        title: "Story applied",
        description: "The generated story has been applied",
      });
    }
  };

  const handleReset = () => {
    setFeatureDescription('');
    reset();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Story Generator
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="perspective">User Perspective</Label>
          <Select 
            value={userPerspective} 
            onValueChange={setUserPerspective}
          >
            <SelectTrigger id="perspective">
              <SelectValue placeholder="Select a perspective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="As a user">As a user</SelectItem>
              <SelectItem value="As a project manager">As a project manager</SelectItem>
              <SelectItem value="As a developer">As a developer</SelectItem>
              <SelectItem value="As a designer">As a designer</SelectItem>
              <SelectItem value="As a business analyst">As a business analyst</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="description">Feature Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the feature you want to create..."
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Be specific about what the feature should do. The more details you provide, the better the story will be.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleGenerateStory}
            disabled={isGenerating || !featureDescription.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate User Story
              </>
            )}
          </Button>
          
          {stories.length > 0 && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              disabled={isGenerating}
            >
              Reset
            </Button>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
            Error: {error.message}
          </div>
        )}
      </CardContent>
      
      {stories.length > 0 && (
        <CardFooter className="flex flex-col items-start p-4 bg-slate-50 rounded-b-lg">
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{stories[0].title}</h3>
                <Badge variant="outline">AI Generated</Badge>
              </div>
              <p className="text-sm">{stories[0].description}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-2">Acceptance Criteria:</h4>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {stories[0].acceptanceCriteria.map((criterion, index) => (
                  <li key={index}>{criterion}</li>
                ))}
              </ul>
            </div>
            
            {onStoryGenerated && (
              <Button 
                onClick={() => handleUseStory(stories[0])}
                className="w-full mt-4"
              >
                Use This Story
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}

export default StoryAiAssistant; 