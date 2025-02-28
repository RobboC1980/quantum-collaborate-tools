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
import { Calendar } from 'lucide-react';
import { EpicWithRelations, EpicStatus, EpicPriority } from '@/types/epic';
import { User as UserType, mockUsers } from '@/types/user';
import { StoryWithRelations } from '@/types/story';

interface EpicDetailDialogProps {
  epic?: EpicWithRelations;
  isOpen: boolean;
  onClose: () => void;
  onSave: (epic: EpicWithRelations) => void;
}

const EpicDetailDialog: React.FC<EpicDetailDialogProps> = ({
  epic,
  isOpen,
  onClose,
  onSave
}) => {
  const isNewEpic = !epic;
  const [activeTab, setActiveTab] = useState('details');
  
  // For a new epic, create a default template
  const [formData, setFormData] = useState<Partial<EpicWithRelations>>(
    epic || {
      title: '',
      description: '',
      status: 'backlog' as EpicStatus,
      priority: 'medium' as EpicPriority,
      progress: 0,
      ownerId: '',
      tags: [],
      stories: [],
    }
  );

  // Reset form data when epic changes
  useEffect(() => {
    setFormData(epic || {
      title: '',
      description: '',
      status: 'backlog' as EpicStatus,
      priority: 'medium' as EpicPriority,
      progress: 0,
      ownerId: '',
      tags: [],
      stories: [],
    });
  }, [epic]);

  const handleChange = (field: string, value: any) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const handleSubmit = () => {
    if (onSave && formData.title) {
      // In a real app, we would create or update the epic in the database
      const updatedEpic = {
        ...(epic || {
          id: `EP-${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(),
        }),
        ...formData,
        updatedAt: new Date()
      } as EpicWithRelations;
      
      onSave(updatedEpic);
      onClose();
    }
  };

  // Handle tags
  const [newTag, setNewTag] = useState('');
  
  const addTag = (tag: string) => {
    if (tag && !(formData.tags || []).includes(tag)) {
      handleChange('tags', [...(formData.tags || []), tag]);
    }
  };

  const removeTag = (tag: string) => {
    handleChange('tags', (formData.tags || []).filter(t => t !== tag));
  };

  // Format date for input
  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date instanceof Date 
      ? date.toISOString().split('T')[0]
      : new Date(date).toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewEpic ? 'Create Epic' : 'Edit Epic'}</DialogTitle>
          <DialogDescription>
            {isNewEpic 
              ? 'Create a new epic to track large initiatives and features.' 
              : `Editing epic ${epic?.id}`
            }
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input 
                  id="title" 
                  value={formData.title || ''} 
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter a concise title for this epic"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={formData.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Provide detailed explanation of the epic"
                  rows={5}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => handleChange('status', value as EpicStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="planning">Planning</SelectItem>
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
                    onValueChange={(value) => handleChange('priority', value as EpicPriority)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="progress">Progress (%)</Label>
                  <Input 
                    id="progress" 
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress || 0} 
                    onChange={(e) => handleChange('progress', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="owner">Owner</Label>
                <Select 
                  value={formData.ownerId || 'unassigned'} 
                  onValueChange={(value) => handleChange('ownerId', value === 'unassigned' ? undefined : value)}
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
          
          <TabsContent value="stories" className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
              <h3 className="text-lg font-medium mb-2">Story Management</h3>
              <p className="text-muted-foreground mb-4 max-w-md">
                After creating the epic, you can add stories to it from the Stories page.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="startDate" 
                    type="date"
                    className="pl-8"
                    value={formatDateForInput(formData.startDate)} 
                    onChange={(e) => handleChange('startDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetDate">Target Completion Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="targetDate" 
                    type="date"
                    className="pl-8"
                    value={formatDateForInput(formData.targetDate)} 
                    onChange={(e) => handleChange('targetDate', e.target.value ? new Date(e.target.value) : undefined)}
                  />
                </div>
              </div>
              
              {formData.status === 'done' && (
                <div className="space-y-2">
                  <Label htmlFor="completedDate">Actual Completion Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="completedDate" 
                      type="date"
                      className="pl-8"
                      value={formatDateForInput(formData.completedDate)} 
                      onChange={(e) => handleChange('completedDate', e.target.value ? new Date(e.target.value) : undefined)}
                    />
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.title}>
            {isNewEpic ? 'Create Epic' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EpicDetailDialog; 