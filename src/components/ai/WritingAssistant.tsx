import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Check, RefreshCw, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { aiService, WritingAssistanceResult } from '@/services/ai-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Task } from '@/types/task';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';

interface WritingAssistantProps {
  task: Partial<Task> & { title: string; description: string };
  onApplyContent?: (content: string) => void;
}

type AssistanceType = 'contentDraft' | 'suggestions' | 'researchTopic';

const WritingAssistant: React.FC<WritingAssistantProps> = ({ 
  task, 
  onApplyContent 
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [assistanceType, setAssistanceType] = useState<AssistanceType>('contentDraft');
  const [result, setResult] = useState<WritingAssistanceResult | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const generationResult = await aiService.getWritingAssistance(task, assistanceType);
      setResult(generationResult);
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate writing assistance.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyContent = () => {
    if (result && onApplyContent) {
      onApplyContent(result.content);
    }
  };

  const handleCopyContent = () => {
    if (result?.content) {
      navigator.clipboard.writeText(result.content);
      toast({
        title: 'Copied to Clipboard',
        description: 'Content has been copied to your clipboard.',
      });
    }
  };

  const renderAssistanceTypeLabel = () => {
    switch (assistanceType) {
      case 'contentDraft':
        return 'Content Draft';
      case 'suggestions':
        return 'Creative Suggestions';
      case 'researchTopic':
        return 'Research Topics';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Writing Assistant
        </CardTitle>
        <CardDescription>
          Get AI assistance for your writing task: "{task.title}"
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs
          defaultValue="contentDraft"
          onValueChange={(value) => setAssistanceType(value as AssistanceType)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contentDraft">Content Draft</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="researchTopic">Research Topics</TabsTrigger>
          </TabsList>
          <div className="mt-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating {renderAssistanceTypeLabel()}...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate {renderAssistanceTypeLabel()}
                </>
              )}
            </Button>
          </div>
        </Tabs>

        {result && (
          <div className="mt-6 space-y-4">
            {result.content && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Generated Content:</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={handleCopyContent}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    {onApplyContent && (
                      <Button size="sm" variant="ghost" onClick={handleApplyContent}>
                        <Check className="h-4 w-4 mr-1" />
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
                <Textarea
                  value={result.content}
                  readOnly
                  className="h-48 resize-none font-mono text-sm"
                />
              </div>
            )}
            
            {result.suggestions.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Suggestions:</h3>
                <ul className="space-y-2 border rounded-md p-3 bg-muted/20">
                  {result.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5 shrink-0">
                        {index + 1}
                      </Badge>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {result && (
        <CardFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setResult(null)}>
            Reset
          </Button>
          <Button variant="outline" onClick={handleGenerate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default WritingAssistant; 