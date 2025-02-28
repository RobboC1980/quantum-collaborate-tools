import React, { useState } from 'react';
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
  Hash
} from 'lucide-react';
import { StoryWithRelations, StoryType, StoryStatus, StoryPriority, RiskLevel } from '@/types/story';
import { User as UserType, mockUsers } from '@/types/user';

interface StoryDetailDialogProps {
  story?: StoryWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (story: StoryWithRelations) => void;
}

const StoryDetailDialog: React.FC<StoryDetailDialogProps> = ({
  story,
  isOpen,
  onClose,
  onSave
}) => {
  const isNewStory = !story;
  const [activeTab, setActiveTab] = useState('details');
  
  // For a new story, create a default template
  const [formData, setFormData] = useState<Partial<StoryWithRelations>>(
    story || {
      title: '',
      description: '',
      type: 'enhancement' as StoryType,
      status: 'backlog' as StoryStatus,
      priority: 'medium' as StoryPriority,
      points: 0,
      tags: [],
      acceptanceCriteria: [''],
      businessValue: 5,
      riskLevel: 'low' as RiskLevel,
      childStoryIds: [],
      dependencies: [],
      assigneeId: 'unassigned',
      epicId: 'none',
      sprintId: 'none',
      reporterId: mockUsers[0].id, // Default to first user for now
    }
  );

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    if (onSave && formData.title) {
      // In a real app, we would create or update the story in the database
      // For now, we'll just mock this with the existing story data and form updates
      const updatedStory = {
        ...(story || {
          id: `QS-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
          attachments: [],
        }),
        ...formData,
        updatedAt: new Date()
      } as StoryWithRelations;
      
      onSave(updatedStory);
      onClose();
    }
  };

  const addAcceptanceCriteria = () => {
    setFormData({
      ...formData,
      acceptanceCriteria: [...(formData.acceptanceCriteria || []), '']
    });
  };

  const updateAcceptanceCriteria = (index: number, value: string) => {
    const newCriteria = [...(formData.acceptanceCriteria || [])];
    newCriteria[index] = value;
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

  // For new tag input
  const [newTag, setNewTag] = useState('');
  
  // For Fibonacci sequence in story points
  const fibonacciPoints = [0, 1, 2, 3, 5, 8, 13, 21];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewStory ? 'Create Story' : 'Edit Story'}</DialogTitle>
          <DialogDescription>
            {isNewStory 
              ? 'Create a new story to track work in your project.' 
              : `Editing story ${story?.id}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="acceptance">Acceptance Criteria</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="estimation">Estimation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
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
                      {mockUsers.map(user => (
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
                <Button type="button" onClick={addAcceptanceCriteria} variant="outline" size="sm">
                  Add Criteria
                </Button>
              </div>
              
              {(formData.acceptanceCriteria || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center border rounded-md border-dashed">
                  <ListChecks className="h-12 w-12 text-muted-foreground mb-2" />
                  <h3 className="font-medium text-lg">No acceptance criteria</h3>
                  <p className="text-muted-foreground mb-4 max-w-md">
                    Acceptance criteria define when a story is complete. Add criteria to clarify what needs to be done.
                  </p>
                  <Button type="button" onClick={addAcceptanceCriteria}>
                    Add First Criteria
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(formData.acceptanceCriteria || []).map((criteria, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Input 
                        value={criteria} 
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
                      <SelectItem value="EP-01">User Authentication & Authorization</SelectItem>
                      <SelectItem value="EP-02">Dashboard Experience</SelectItem>
                      <SelectItem value="EP-03">Platform Performance Optimization</SelectItem>
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
                      <SelectItem value="1">Sprint 23</SelectItem>
                      <SelectItem value="2">Sprint 24</SelectItem>
                      <SelectItem value="3">Sprint 22</SelectItem>
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
            {isNewStory ? 'Create Story' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StoryDetailDialog;
