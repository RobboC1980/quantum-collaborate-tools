import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  CalendarDays,
  Clock,
  Tag,
  Link,
  User,
  MessageSquare,
  ListChecks,
  Paperclip,
  Flag,
  Hash,
  Sparkles,
  Loader2
} from 'lucide-react';
import { StoryType, StoryStatus, StoryPriority, RiskLevel } from '@/types/story';
import { User as UserType } from '@/types/user';
import StoryGenerator from '@/components/ai/StoryGenerator';
import { aiService } from '@/services/ai-service';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Tables } from '@/integrations/supabase/types';

// Define types for database tables
type ProfileData = Tables<'profiles'>;
type EpicData = Tables<'epics'>;
type SprintData = Tables<'sprints'>;
type StoryData = Tables<'stories'>;
type StoryTagData = Tables<'story_tags'>;
type AcceptanceCriteriaData = Tables<'acceptance_criteria'>;

interface StoryDetailDialogProps {
  story?: StoryWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (story: StoryWithRelations) => void;
}

// Add this type definition at the top of the file
interface AcceptanceCriterion {
  description: string;
  satisfied?: boolean;
}

// Define the User type
interface User {
  id: string;
  fullName: string;
  avatarUrl?: string;
  email: string;
  role?: string;
}

// Update the StoryWithRelations interface to use AcceptanceCriterion
interface StoryWithRelations {
  id: string;
  title: string;
  description: string;
  type: StoryType;
  status: StoryStatus;
  priority: StoryPriority;
  points: number;
  epicId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId: string;
  tags: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  attachments: string[];
  createdAt: Date;
  updatedAt: Date;
  dependencies: string[];
  childStoryIds: string[];
  businessValue: number;
  riskLevel: RiskLevel;
  epic?: {
    id: string;
    name: string;
  };
  sprint?: {
    id: string;
    name: string;
  };
  assignee?: User;
  reporter: User;
}

// Update the FormData type
interface FormData {
  title: string;
  description: string;
  type: StoryType;
  status: StoryStatus;
  priority: StoryPriority;
  points: number;
  epicId?: string;
  sprintId?: string;
  assigneeId?: string;
  reporterId: string;
  tags: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  dependencies: string[];
  businessValue: number;
  riskLevel: RiskLevel;
}

const StoryDetailDialog: React.FC<StoryDetailDialogProps> = ({
  story,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAiGenerator, setShowAiGenerator] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [epics, setEpics] = useState<EpicData[]>([]);
  const [sprints, setSprints] = useState<SprintData[]>([]);
  const [newTag, setNewTag] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: story?.title || '',
    description: story?.description || '',
    type: story?.type || 'enhancement',
    status: story?.status || 'backlog',
    priority: story?.priority || 'medium',
    points: story?.points || 0,
    epicId: story?.epicId,
    sprintId: story?.sprintId,
    assigneeId: story?.assigneeId,
    reporterId: story?.reporterId || user?.id || '',
    tags: story?.tags || [],
    acceptanceCriteria: story?.acceptanceCriteria || [],
    dependencies: story?.dependencies || [],
    businessValue: story?.businessValue || 5,
    riskLevel: story?.riskLevel || 'low'
  });
  
  // Initialize form data when story changes
  useEffect(() => {
    if (story) {
      setFormData({
        ...story
      });
    } else {
      // Reset form for new story
      setFormData({
        title: '',
        description: '',
        type: 'enhancement',
        status: 'backlog',
        priority: 'medium',
        points: 0,
        epicId: undefined,
        sprintId: undefined,
        assigneeId: undefined,
        reporterId: user?.id,
        tags: [],
        acceptanceCriteria: [],
        businessValue: 5,
        riskLevel: 'low',
        dependencies: []
      });
    }
  }, [story, user?.id]);
  
  // Fetch users, epics, and sprints when dialog opens
  useEffect(() => {
    const fetchData = async () => {
      if (isOpen) {
        try {
          // Fetch users
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('*');
          
          if (userError) throw userError;
          
          if (userData) {
            // Convert ProfileData to UserType
            const mappedUsers: UserType[] = userData.map(profile => ({
              id: profile.id,
              fullName: profile.full_name || '',
              avatarUrl: profile.avatar_url || undefined,
              email: '',
              role: profile.role || undefined
            }));
            setUsers(mappedUsers);
          }
        } catch (userError) {
          console.error('Error fetching users:', userError);
          toast({
            title: 'Error',
            description: 'Failed to load users. Please try again.',
          });
        }
        
        try {
          // Fetch epics
          const { data: epicData, error: epicError } = await supabase
            .from('epics')
            .select('id, title');
          
          if (epicError) throw epicError;
          
          if (epicData) {
            setEpics(epicData as EpicData[]);
          }
        } catch (epicError) {
          console.error('Error fetching epics:', epicError);
          toast({
            title: 'Error',
            description: 'Failed to load epics. Please try again.',
          });
        }
        
        // Note: Sprints table doesn't exist in the database, so we're not fetching sprints
        // Setting empty array for sprints
        setSprints([]);
      }
    };
    
    fetchData();
  }, [isOpen, toast]);
  
  const handleChange = (field: string, value: unknown) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare story data for Supabase
      const storyData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        status: formData.status,
        priority: formData.priority,
        points: formData.points,
        epic_id: formData.epicId || null,
        sprint_id: formData.sprintId || null,
        assignee_id: formData.assigneeId || null,
        reporter_id: formData.reporterId,
        business_value: formData.businessValue,
        risk_level: formData.riskLevel,
        updated_at: new Date().toISOString()
      };

      let storyId = story?.id;

      // Insert or update the story in Supabase
      if (!storyId) {
        // Create new story
        const { data: newStory, error } = await supabase
          .from('stories')
          .insert({ ...storyData, created_at: new Date().toISOString() })
          .select('id')
          .single();

        if (error) throw error;
        storyId = newStory.id;
      } else {
        // Update existing story
        const { error } = await supabase
          .from('stories')
          .update(storyData)
          .eq('id', storyId);

        if (error) throw error;
      }

      // Handle tags
      if (formData.tags && formData.tags.length > 0) {
        // Delete existing tags
        await supabase
          .from('story_tags')
          .delete()
          .eq('story_id', storyId);

        // Insert new tags
        const tagData = formData.tags.map(tag => ({
          story_id: storyId,
          tag: tag
        }));

        const { error: tagError } = await supabase
          .from('story_tags')
          .insert(tagData);

        if (tagError) throw tagError;
      }

      // Handle acceptance criteria
      if (formData.acceptanceCriteria && formData.acceptanceCriteria.length > 0) {
        // Delete existing criteria
        await supabase
          .from('acceptance_criteria')
          .delete()
          .eq('story_id', storyId);

        // Insert new criteria
        const criteriaData = formData.acceptanceCriteria.map(criteria => ({
          story_id: storyId,
          criteria: criteria.description,
          is_satisfied: criteria.satisfied || false
        }));

        const { error: criteriaError } = await supabase
          .from('acceptance_criteria')
          .insert(criteriaData);

        if (criteriaError) throw criteriaError;
      }

      // Fetch the complete story with relations
      const { data: completeStory, error: fetchError } = await supabase
        .from('stories')
        .select(`
          *,
          epic:epic_id (*),
          sprint:sprint_id (*),
          assignee:profiles!stories_assignee_id_fkey(*),
          reporter:profiles!stories_reporter_id_fkey(*)
        `)
        .eq('id', storyId)
        .single();

      if (fetchError) throw fetchError;

      // Transform the data to match StoryWithRelations format
      const transformedStory: StoryWithRelations = {
        id: completeStory.id,
        title: completeStory.title,
        description: completeStory.description || '',
        type: completeStory.type as StoryType,
        status: completeStory.status as StoryStatus,
        priority: completeStory.priority as StoryPriority,
        points: completeStory.points || 0,
        epicId: completeStory.epic_id || undefined,
        sprintId: completeStory.sprint_id || undefined,
        assigneeId: completeStory.assignee_id || undefined,
        reporterId: completeStory.reporter_id,
        tags: formData.tags || [],
        acceptanceCriteria: formData.acceptanceCriteria || [],
        attachments: [],
        createdAt: new Date(completeStory.created_at),
        updatedAt: new Date(completeStory.updated_at),
        dependencies: formData.dependencies || [],
        childStoryIds: [],
        businessValue: completeStory.business_value || 5,
        riskLevel: completeStory.risk_level as RiskLevel || 'low',
        epic: completeStory.epic ? {
          id: completeStory.epic.id,
          name: completeStory.epic.title
        } : undefined,
        sprint: completeStory.sprint ? {
          id: completeStory.sprint.id,
          name: completeStory.sprint.name
        } : undefined,
        assignee: completeStory.assignee ? {
          id: completeStory.assignee.id,
          fullName: completeStory.assignee.full_name || '',
          avatarUrl: completeStory.assignee.avatar_url || undefined,
          email: '',
          role: completeStory.assignee.role || undefined
        } : undefined,
        reporter: {
          id: completeStory.reporter.id,
          fullName: completeStory.reporter.full_name || '',
          avatarUrl: completeStory.reporter.avatar_url || undefined,
          email: '',
          role: completeStory.reporter.role || undefined
        }
      };

      // Call onSave with the transformed story
      onSave?.(transformedStory);
      
      // Show success message
      toast({
        title: "Success",
        description: `Story ${storyId ? 'updated' : 'created'} successfully`,
        variant: "default"
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: "Error",
        description: `Failed to ${story?.id ? 'update' : 'create'} story: ${(error as Error).message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAcceptanceCriteria = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [...(formData.acceptanceCriteria || []), { description: '' }]
    });
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const newCriteria = [...(formData.acceptanceCriteria || [])];
    newCriteria[index] = { description: value };
    handleChange('acceptanceCriteria', newCriteria);
  };

  const removeAcceptanceCriteria = (index: number) => {
    const newCriteria = [...(formData.acceptanceCriteria || [])];
    newCriteria.splice(index, 1);
    handleChange('acceptanceCriteria', newCriteria);
  };

  const addTag = (tag: string) => {
    if (tag && !(formData.tags || []).includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', (formData.tags || []).filter(t => t !== tag));
  };

  // For Fibonacci sequence in story points
  const fibonacciPoints = [0, 1, 2, 3, 5, 8, 13, 21];

  // State for generating acceptance criteria
  const [isGeneratingCriteria, setIsGeneratingCriteria] = useState(false);

  // Handle AI generation
  const handleAiGeneration = (result: { title: string, description: string, outline: string[] }) => {
    // Update form with AI-generated content
    setFormData(prevState => ({
      ...prevState,
      title: result.title || prevState.title,
      description: result.description,
      acceptanceCriteria: [...(prevState.acceptanceCriteria || []), ...result.outline.map(o => ({ description: o }))]
    }));

    // Hide the AI generator
    setShowAiGenerator(false);
  };
  
  // Handle generating acceptance criteria
  const handleGenerateAcceptanceCriteria = async () => {
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description before generating acceptance criteria.",
      });
      return;
    }
    
    setIsGeneratingCriteria(true);
    try {
      const result = await aiService.generateAcceptanceCriteria({
        title: formData.title,
        description: formData.description
      });
      
      // Update form with AI-generated criteria
      setFormData(prevState => ({
        ...prevState,
        acceptanceCriteria: [...(prevState.acceptanceCriteria || []), ...result.criteria.map(c => ({ description: c }))]
      }));
      
      toast({
        title: "Success",
        description: "Acceptance criteria generated successfully.",
      });
    } catch (error) {
      console.error('Error generating acceptance criteria:', error);
      toast({
        title: "Error",
        description: "Failed to generate acceptance criteria. Please try again.",
      });
    } finally {
      setIsGeneratingCriteria(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{story ? 'Edit Story' : 'Create Story'}</DialogTitle>
          <DialogDescription>
            {story ? `Editing story ${story.id}` : 'Create a new story to track work in your project.'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value="details" className="space-y-4 py-4">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="acceptance">Acceptance Criteria</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="estimation">Estimation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            {/* AI Generation Button */}
            {!story && !showAiGenerator && (
              <Button 
                variant="outline" 
                className="w-full mb-4 border-dashed border-primary/50 flex gap-2 items-center"
                onClick={() => setShowAiGenerator(true)}
              >
                <Sparkles className="h-4 w-4 text-primary" />
                Use AI to Generate Story Details
              </Button>
            )}

            {/* AI Story Generator */}
            {!story && showAiGenerator && (
              <div className="mb-4">
                <StoryGenerator 
                  initialTitle={formData.title}
                  onGenerate={handleAiGeneration} 
                />
                <Button 
                  variant="ghost" 
                  className="mt-2"
                  onClick={() => setShowAiGenerator(false)}
                >
                  Cancel AI Generation
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter a concise title for this story"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide detailed explanation of the story"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enhancement">Enhancement</SelectItem>
                      <SelectItem value="bug">Bug</SelectItem>
                      <SelectItem value="technical-debt">Technical Debt</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="documentation">Documentation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={formData.priority} 
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessValue">Business Value (1-10)</Label>
                  <Input 
                    id="businessValue" 
                    type="number"
                    min="1"
                    max="10"
                    value={formData.businessValue || 5} 
                    onChange={(e) => handleChange('businessValue', parseInt(e.target.value) || 5)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="riskLevel">Risk Level</Label>
                  <Select 
                    value={formData.riskLevel} 
                    onValueChange={(value) => handleChange('riskLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select 
                    value={formData.assigneeId || 'unassigned'} 
                    onValueChange={(value) => handleChange('assigneeId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Assign to..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.fullName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(formData.tags || []).map((tag, index) => (
                    <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                      {tag} ×
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input 
                    placeholder="Add a tag" 
                    value={newTag} 
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newTag) {
                        e.preventDefault();
                        addTag(newTag);
                        setNewTag('');
                      }
                    }}
                  />
                  <Button type="button" onClick={() => {
                    if (newTag) {
                      addTag(newTag);
                      setNewTag('');
                    }
                  }}>
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="acceptance" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Acceptance Criteria</h3>
                <div className="flex space-x-2">
                  <Button 
                    type="button" 
                    onClick={handleGenerateAcceptanceCriteria} 
                    variant="outline" 
                    size="sm"
                    disabled={isGeneratingCriteria || !formData.title || !formData.description}
                  >
                    {isGeneratingCriteria ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Criteria
                      </>
                    )}
                  </Button>
                  <Button type="button" onClick={addAcceptanceCriteria} variant="outline" size="sm">
                    Add Criteria
                  </Button>
                </div>
              </div>
              
              {(formData.acceptanceCriteria || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
                  <ListChecks className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No acceptance criteria</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Acceptance criteria define when a story is complete. Add criteria to clarify what needs to be done.
                  </p>
                  <div className="flex space-x-2">
                    <Button 
                      type="button" 
                      onClick={handleGenerateAcceptanceCriteria}
                      disabled={isGeneratingCriteria || !formData.title || !formData.description}
                    >
                      {isGeneratingCriteria ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate with AI
                        </>
                      )}
                    </Button>
                    <Button type="button" onClick={addAcceptanceCriteria}>
                      Add Manually
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.acceptanceCriteria || []).map((criteria, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Input 
                        value={criteria.description} 
                        onChange={(e) => updateAcceptanceCriteria(index, e.target.value)}
                        placeholder="Enter acceptance criteria"
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => removeAcceptanceCriteria(index)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="relationships" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="epic">Epic</Label>
                  <Select 
                    value={formData.epicId || 'none'} 
                    onValueChange={(value) => handleChange('epicId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select epic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {epics.map(epic => (
                        <SelectItem key={epic.id} value={epic.id}>
                          {epic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sprint">Sprint</Label>
                  <Select 
                    value={formData.sprintId || 'none'} 
                    onValueChange={(value) => handleChange('sprintId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sprint" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {sprints.map(sprint => (
                        <SelectItem key={sprint.id} value={sprint.id}>
                          {sprint.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dependencies</Label>
                  <Select onValueChange={(value) => {
                    const newDeps = [...(formData.dependencies || [])];
                    if (!newDeps.includes(value)) {
                      newDeps.push(value);
                      handleChange('dependencies', newDeps);
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Add dependency..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="QS-101">QS-101: Implement user auth flow</SelectItem>
                      <SelectItem value="QS-102">QS-102: Dashboard widgets</SelectItem>
                      <SelectItem value="QS-103">QS-103: Login validation bug</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {(formData.dependencies || []).length > 0 ? (
                    <div className="mt-2 space-y-2">
                      {(formData.dependencies || []).map((dep, index) => (
                        <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                          <span>{dep}</span>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              const newDeps = (formData.dependencies || []).filter(d => d !== dep);
                              handleChange('dependencies', newDeps);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2">
                      No dependencies added yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="estimation" className="space-y-4 py-4">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Story Points (Fibonacci)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {fibonacciPoints.map(points => (
                    <Button
                      key={points}
                      type="button"
                      variant={formData.points === points ? "default" : "outline"}
                      className={`h-12 w-12 rounded-full p-0 text-center ${formData.points === points ? 'bg-quantum-600 hover:bg-quantum-700' : ''}`}
                      onClick={() => handleChange('points', points)}
                    >
                      {points}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Planning Poker (Team Estimation)</Label>
                <div className="border rounded-md p-4 bg-muted/20">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      In a real implementation, this would allow team members to submit estimates and calculate consensus.
                    </p>
                    <Button disabled variant="outline">Start Estimation Session</Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title}>
            {story ? 'Save Changes' : 'Create Story'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDetailDialog;
