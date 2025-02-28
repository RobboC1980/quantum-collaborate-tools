import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EpicList from '@/components/epic/EpicList';
import EpicDetailDialog from '@/components/epic/EpicDetailDialog';
import { EpicWithRelations } from '@/types/epic';
import { mockEpics } from '@/types/epic';
import { toast } from '@/components/ui/use-toast';

// Simple PageHeader component
const PageHeader: React.FC<{
  heading: string;
  subheading?: string;
  children?: React.ReactNode;
}> = ({ heading, subheading, children }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        {subheading && <p className="text-muted-foreground">{subheading}</p>}
      </div>
      <div className="flex items-center gap-2">
        {children}
      </div>
    </div>
  );
};

const EpicManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateEpicDialog, setShowCreateEpicDialog] = useState(false);
  const [epics, setEpics] = useState<EpicWithRelations[]>([]);
  const [epicToEdit, setEpicToEdit] = useState<EpicWithRelations | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Load mock data
  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 800));
        setEpics(mockEpics);
      } catch (error) {
        console.error('Error loading epics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load epics. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateEpic = () => {
    setEpicToEdit(undefined);
    setShowCreateEpicDialog(true);
  };

  const handleEditEpic = (epic: EpicWithRelations) => {
    setEpicToEdit(epic);
    setShowCreateEpicDialog(true);
  };

  const handleDeleteEpic = (epic: EpicWithRelations) => {
    setEpics(epics.filter(e => e.id !== epic.id));
    toast({
      title: 'Epic Deleted',
      description: `Epic ${epic.id} has been deleted successfully.`,
    });
  };

  const handleSaveEpic = (epic: EpicWithRelations) => {
    if (epicToEdit) {
      // Update existing epic
      setEpics(epics.map(e => e.id === epic.id ? epic : e));
      toast({
        title: 'Epic Updated',
        description: `Epic ${epic.id} has been updated successfully.`,
      });
    } else {
      // Add new epic
      setEpics([...epics, epic]);
      toast({
        title: 'Epic Created',
        description: `Epic ${epic.id} has been created successfully.`,
      });
    }
  };

  // Filter epics based on active tab
  const filteredEpics = epics.filter(epic => {
    switch (activeTab) {
      case 'active':
        return epic.status === 'in-progress' || epic.status === 'review';
      case 'completed':
        return epic.status === 'done';
      case 'upcoming':
        return epic.status === 'backlog' || epic.status === 'planning';
      default:
        return true;
    }
  });

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        <PageHeader
          heading="Epics"
          subheading="Manage and track large initiatives and features"
        >
          <Button onClick={handleCreateEpic}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Epic
          </Button>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle>Epic Management</CardTitle>
            <CardDescription>
              Epics are large bodies of work that can be broken down into multiple stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">All Epics</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              </TabsList>
              
              {isLoading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  <TabsContent value="all" className="space-y-4">
                    <EpicList 
                      epics={filteredEpics}
                      onCreateEpic={handleCreateEpic}
                      onEditEpic={handleEditEpic}
                      onDeleteEpic={handleDeleteEpic}
                      onViewEpic={(epic) => console.log('View epic:', epic)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="active" className="space-y-4">
                    <EpicList 
                      epics={filteredEpics}
                      onCreateEpic={handleCreateEpic}
                      onEditEpic={handleEditEpic}
                      onDeleteEpic={handleDeleteEpic}
                      onViewEpic={(epic) => console.log('View epic:', epic)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="completed" className="space-y-4">
                    <EpicList 
                      epics={filteredEpics}
                      onCreateEpic={handleCreateEpic}
                      onEditEpic={handleEditEpic}
                      onDeleteEpic={handleDeleteEpic}
                      onViewEpic={(epic) => console.log('View epic:', epic)}
                    />
                  </TabsContent>
                  
                  <TabsContent value="upcoming" className="space-y-4">
                    <EpicList 
                      epics={filteredEpics}
                      onCreateEpic={handleCreateEpic}
                      onEditEpic={handleEditEpic}
                      onDeleteEpic={handleDeleteEpic}
                      onViewEpic={(epic) => console.log('View epic:', epic)}
                    />
                  </TabsContent>
                </>
              )}
            </Tabs>
          </CardContent>
        </Card>

        {showCreateEpicDialog && (
          <EpicDetailDialog
            epic={epicToEdit}
            isOpen={showCreateEpicDialog}
            onClose={() => setShowCreateEpicDialog(false)}
            onSave={handleSaveEpic}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default EpicManagement; 