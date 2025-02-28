import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { aiService, StoryGenerationResult } from '@/services/ai-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface StoryGeneratorProps {
  onGenerate: (result: { title: string, description: string, outline: string[] }) => void;
  initialTitle?: string;
}

const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onGenerate, initialTitle = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<StoryGenerationResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your story.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const generationResult = await aiService.generateStoryDescription(title);
      setResult(generationResult);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate story content.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAccept = () => {
    if (result) {
      onGenerate({
        title,
        description: result.description,
        outline: result.outline,
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Story Generator
        </CardTitle>
        <CardDescription>
          Enter a title for your writing project, and our AI will generate a description and outline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Story Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter a title for your writing project..."
            disabled={isGenerating}
          />
        </div>

        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !title.trim()}
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
              Generate Description & Outline
            </>
          )}
        </Button>

        {result && (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Generated Description:</h3>
              <Textarea
                value={result.description}
                readOnly
                className="h-24 resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Generated Outline:</h3>
              <ul className="space-y-1 border rounded-md p-3 bg-muted/20">
                {result.outline.map((item, index) => (
                  <li key={index} className="text-sm list-disc ml-4">{item}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      {result && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setResult(null)}>
            Reset
          </Button>
          <Button onClick={handleAccept}>
            <Check className="mr-2 h-4 w-4" />
            Use This
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default StoryGenerator; 