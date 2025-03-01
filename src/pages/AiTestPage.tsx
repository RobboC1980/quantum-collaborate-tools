import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { useAiStoryGenerator, useAiTaskGenerator } from '@/hooks';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';

const QwenApiTestPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('story-test');
  const [apiKey, setApiKey] = useState(process.env.QWEN_API_KEY || '');
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
    data?: any;
  }>({
    status: 'idle',
    message: 'Run a test to check API connectivity',
  });

  // Story generation test states
  const [featureDescription, setFeatureDescription] = useState('');
  
  // Task generation test states
  const [storyTitle, setStoryTitle] = useState('');
  const [storyDescription, setStoryDescription] = useState('');

  // Get the hooks
  const { 
    generateStories, 
    stories, 
    isGenerating: isGeneratingStories, 
    error: storyError 
  } = useAiStoryGenerator({
    onSuccess: (generatedStories) => {
      setTestResult({
        status: 'success',
        message: 'Successfully generated stories!',
        data: generatedStories
      });
      
      toast({
        title: 'Success!',
        description: 'Story generated successfully',
      });
    },
    onError: (error) => {
      setTestResult({
        status: 'error',
        message: `Error: ${error.message}`,
      });
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const { 
    generateTasks, 
    tasks, 
    isGeneratingTasks, 
    error: taskError 
  } = useAiTaskGenerator({
    onTasksSuccess: (generatedTasks) => {
      setTestResult({
        status: 'success',
        message: 'Successfully generated tasks!',
        data: generatedTasks
      });
      
      toast({
        title: 'Success!',
        description: 'Tasks generated successfully',
      });
    },
    onError: (error) => {
      setTestResult({
        status: 'error',
        message: `Error: ${error.message}`,
      });
      
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  });

  const handleStoryTest = async () => {
    if (!featureDescription.trim()) {
      toast({
        title: 'Missing input',
        description: 'Please enter a feature description',
        variant: 'destructive',
      });
      return;
    }
    
    setTestResult({
      status: 'loading',
      message: 'Testing AI story generation...',
    });
    
    try {
      await generateStories({
        featureDescription,
        projectContext: 'API Test',
        userPerspective: 'As a user',
      });
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleTaskTest = async () => {
    if (!storyTitle.trim() || !storyDescription.trim()) {
      toast({
        title: 'Missing input',
        description: 'Please enter a story title and description',
        variant: 'destructive',
      });
      return;
    }
    
    setTestResult({
      status: 'loading',
      message: 'Testing AI task generation...',
    });
    
    try {
      await generateTasks({
        storyTitle,
        storyDescription,
        acceptanceCriteria: [],
        teamContext: 'API Test',
        taskType: 'development',
        numberOfTasks: 3,
      });
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const renderTestStatus = () => {
    switch (testResult.status) {
      case 'loading':
        return (
          <Alert className="mt-4 bg-blue-50 border-blue-200">
            <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            <AlertTitle>Testing in progress</AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        );
        
      case 'success':
        return (
          <Alert className="mt-4 bg-green-50 border-green-200">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        );
        
      case 'error':
        return (
          <Alert className="mt-4 bg-red-50 border-red-200">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        );
        
      default:
        return (
          <Alert className="mt-4">
            <Sparkles className="h-5 w-5" />
            <AlertTitle>Ready to test</AlertTitle>
            <AlertDescription>{testResult.message}</AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">QWEN AI API Test</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Integration Test Tool
            </CardTitle>
            <CardDescription>
              Test the connection to the QWEN AI API and verify that AI features are working correctly
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="story-test">Story Generation</TabsTrigger>
                <TabsTrigger value="task-test">Task Generation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="story-test" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feature-description">Feature Description</Label>
                  <Textarea
                    id="feature-description"
                    placeholder="Describe a feature for testing story generation..."
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter a brief description of a feature to test AI story generation
                  </p>
                </div>
                
                <Button 
                  onClick={handleStoryTest}
                  disabled={isGeneratingStories || !featureDescription.trim()}
                >
                  {isGeneratingStories ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Test Story Generation
                    </>
                  )}
                </Button>
                
                {stories.length > 0 && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Generated Story</h3>
                      <Badge variant="outline">AI Generated</Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="font-semibold">{stories[0].title}</p>
                      <p className="text-sm">{stories[0].description}</p>
                      <div>
                        <p className="text-sm font-medium mt-2">Acceptance Criteria:</p>
                        <ul className="list-disc list-inside text-sm pl-2">
                          {stories[0].acceptanceCriteria.map((criteria, index) => (
                            <li key={index}>{criteria}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="task-test" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="story-title">Story Title</Label>
                  <Input
                    id="story-title"
                    placeholder="Enter a story title..."
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="story-description">Story Description</Label>
                  <Textarea
                    id="story-description"
                    placeholder="Enter a story description for testing task generation..."
                    value={storyDescription}
                    onChange={(e) => setStoryDescription(e.target.value)}
                    rows={4}
                  />
                </div>
                
                <Button 
                  onClick={handleTaskTest}
                  disabled={isGeneratingTasks || !storyTitle.trim() || !storyDescription.trim()}
                >
                  {isGeneratingTasks ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Test Task Generation
                    </>
                  )}
                </Button>
                
                {tasks.length > 0 && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">Generated Tasks</h3>
                      <Badge variant="outline">AI Generated</Badge>
                    </div>
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <div key={index} className="p-2 border-b last:border-b-0">
                          <p className="font-medium">{task.title}</p>
                          <p className="text-sm">{task.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
            
            {renderTestStatus()}
          </CardContent>
          
          <CardFooter className="flex flex-col items-start">
            <div className="text-xs text-muted-foreground">
              <p>This page helps test the AI integration and demonstrates that the API is correctly configured.</p>
              <p className="mt-1">If you encounter errors, check your API key and configuration in the .env file.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default QwenApiTestPage; 