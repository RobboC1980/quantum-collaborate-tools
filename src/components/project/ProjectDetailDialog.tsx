import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  CalendarIcon, 
  X, 
  Plus, 
  Info, 
  ListChecks, 
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { 
  ProjectWithRelations, 
  ProjectStatus, 
  ProjectPriority 
} from '@/types/project';
import { mockUsers } from '@/types/user';

interface ProjectDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: ProjectWithRelations | null;
  onSave: (project: ProjectWithRelations) => void;
}

const ProjectDetailDialog: React.FC<ProjectDetailDialogProps> = ({
  open,
  onOpenChange,
  project,
  onSave
}) => {
  const [activeTab, setActiveTab] = useState('details');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  // Initialize form with react-hook-form
  const form = useForm<ProjectWithRelations>({
    defaultValues: {
      id: '',
      title: '',
      description: '',
      status: ProjectStatus.PLANNING,
      priority: ProjectPriority.MEDIUM,
      progress: 0,
      startDate: new Date(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: mockUsers[0].id,
      tags: [],
      epicIds: [],
      owner: mockUsers[0],
      epics: []
    }
  });
  
  // Update form when project changes
  useEffect(() => {
    if (project) {
      form.reset(project);
      setTags(project.tags);
    } else {
      // Reset to default values for new project
      form.reset({
        id: `P-${Math.floor(Math.random() * 1000)}`,
        title: '',
        description: '',
        status: ProjectStatus.PLANNING,
        priority: ProjectPriority.MEDIUM,
        progress: 0,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
        ownerId: mockUsers[0].id,
        tags: [],
        epicIds: [],
        owner: mockUsers[0],
        epics: []
      });
      setTags([]);
    }
    setActiveTab('details');
  }, [project, form]);
  
  // Handle form submission
  const onSubmit = (data: ProjectWithRelations) => {
    // Update timestamps
    data.updatedAt = new Date();
    if (!project) {
      data.createdAt = new Date();
    }
    
    // Add tags
    data.tags = tags;
    
    onSave(data);
  };
  
  // Handle tag input
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput) {
      e.preventDefault();
      if (!tags.includes(tagInput.toLowerCase())) {
        setTags([...tags, tagInput.toLowerCase()]);
      }
      setTagInput('');
    }
  };
  
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {project ? 'Edit Project' : 'Create New Project'}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <Info size={16} />
              <span>Details</span>
            </TabsTrigger>
            <TabsTrigger value="epics" className="flex items-center gap-2">
              <ListChecks size={16} />
              <span>Epics</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users size={16} />
              <span>Team</span>
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <TabsContent value="details" className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: 'Title is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter project description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProjectStatus.PLANNING}>Planning</SelectItem>
                            <SelectItem value={ProjectStatus.ACTIVE}>Active</SelectItem>
                            <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                            <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                            <SelectItem value={ProjectStatus.CANCELLED}>Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value={ProjectPriority.LOW}>Low</SelectItem>
                            <SelectItem value={ProjectPriority.MEDIUM}>Medium</SelectItem>
                            <SelectItem value={ProjectPriority.HIGH}>High</SelectItem>
                            <SelectItem value={ProjectPriority.CRITICAL}>Critical</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="targetDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Target Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="progress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Progress ({field.value}%)</FormLabel>
                      <FormControl>
                        <Slider
                          defaultValue={[field.value]}
                          max={100}
                          step={1}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          className="py-4"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Owner</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          // Also update the owner object
                          const selectedUser = mockUsers.find(user => user.id === value);
                          if (selectedUser) {
                            form.setValue('owner', selectedUser);
                          }
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select owner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <FormLabel>Tags</FormLabel>
                  <div className="flex flex-wrap gap-2 mt-2 mb-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="gap-1 px-3 py-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTag(tag)} 
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag and press Enter"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="flex-grow"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon"
                      onClick={() => {
                        if (tagInput && !tags.includes(tagInput.toLowerCase())) {
                          setTags([...tags, tagInput.toLowerCase()]);
                          setTagInput('');
                        }
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormDescription className="text-xs mt-1">
                    Press Enter to add a tag. Tags help categorize and find projects.
                  </FormDescription>
                </div>
              </TabsContent>
              
              <TabsContent value="epics" className="py-4">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Epic Management</h3>
                  <p className="text-muted-foreground mb-4">
                    You can link epics to this project after saving.
                  </p>
                  {project && (
                    <div className="text-left">
                      <p className="font-medium mb-2">Linked Epics ({project.epicIds.length})</p>
                      {project.epicIds.length === 0 ? (
                        <p className="text-muted-foreground">No epics linked to this project yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {/* This would be populated with actual epic data in a real implementation */}
                          {project.epicIds.map((epicId, index) => (
                            <div key={index} className="p-3 border rounded-md">
                              Epic ID: {epicId}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="team" className="py-4">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium mb-2">Team Management</h3>
                  <p className="text-muted-foreground mb-4">
                    You can assign team members to this project after saving.
                  </p>
                  {project && (
                    <div className="text-left">
                      <p className="font-medium mb-2">Project Owner</p>
                      <div className="p-3 border rounded-md">
                        {project.owner.fullName} ({project.owner.role})
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {project ? 'Update Project' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailDialog; 