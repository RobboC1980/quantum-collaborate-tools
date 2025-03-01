import { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AIProvider, AIModel, AI_PROVIDERS, getModelsByProvider, getModelConfig } from '@/integrations/ai-config';
import { defaultAIConfig } from '@/integrations/ai-config';
import { switchAiModel } from '@/integrations/openai/client';
import { toast } from 'react-hot-toast';

interface ModelSelectorProps {
  onModelChange?: (provider: AIProvider, model: AIModel) => void;
}

export function ModelSelector({ onModelChange }: ModelSelectorProps) {
  const [provider, setProvider] = useState<AIProvider>(defaultAIConfig.provider);
  const [model, setModel] = useState<AIModel>(defaultAIConfig.model);
  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [modelDetails, setModelDetails] = useState(getModelConfig(model));

  // Update available models when provider changes
  useEffect(() => {
    const models = getModelsByProvider(provider);
    setAvailableModels(models);
    
    // If current model doesn't belong to the selected provider, select the first model
    if (!models.includes(model)) {
      setModel(models[0]);
    }
  }, [provider]);

  // Update model details when model changes
  useEffect(() => {
    setModelDetails(getModelConfig(model));
  }, [model]);

  const handleProviderChange = (value: string) => {
    setProvider(value as AIProvider);
  };

  const handleModelChange = (value: string) => {
    const newModel = value as AIModel;
    setModel(newModel);
    
    // Update the AI client
    try {
      switchAiModel(newModel);
      if (onModelChange) {
        onModelChange(provider, newModel);
      }
      toast.success(`AI model switched to ${newModel}`);
    } catch (error) {
      toast.error('Failed to switch AI model');
      console.error('Error switching model:', error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Model Settings</CardTitle>
        <CardDescription>
          Choose the AI provider and model for content generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={provider} onValueChange={handleProviderChange}>
          <TabsList className="grid w-full grid-cols-2">
            {Object.keys(AI_PROVIDERS).map((providerKey) => (
              <TabsTrigger key={providerKey} value={providerKey}>
                {AI_PROVIDERS[providerKey as AIProvider].name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.keys(AI_PROVIDERS).map((providerKey) => (
            <TabsContent key={providerKey} value={providerKey} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="model-select">Select Model</Label>
                <Select value={model} onValueChange={handleModelChange}>
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableModels.map((modelOption) => (
                      <SelectItem key={modelOption} value={modelOption}>
                        {modelOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {modelDetails && (
                <div className="rounded-md border p-4 mt-4">
                  <h4 className="font-medium mb-2">{modelDetails.description}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">Max tokens:</span>
                      <span>{modelDetails.maxTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {modelDetails.capabilities.map((capability) => (
                        <Badge key={capability} variant="secondary">{capability}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
} 