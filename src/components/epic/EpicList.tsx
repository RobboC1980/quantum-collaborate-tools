import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Search, 
  PlusCircle, 
  SortAsc, 
  SortDesc, 
  Filter 
} from 'lucide-react';
import { EpicWithRelations, EpicStatus } from '@/types/epic';
import EpicCard from './EpicCard';

interface EpicListProps {
  epics: EpicWithRelations[];
  onCreateEpic: () => void;
  onEditEpic: (epic: EpicWithRelations) => void;
  onDeleteEpic: (epic: EpicWithRelations) => void;
  onViewEpic: (epic: EpicWithRelations) => void;
}

const EpicList: React.FC<EpicListProps> = ({
  epics,
  onCreateEpic,
  onEditEpic,
  onDeleteEpic,
  onViewEpic
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [epicToDelete, setEpicToDelete] = useState<EpicWithRelations | null>(null);

  // Filter epics based on search term and status
  const filteredEpics = epics.filter(epic => {
    const matchesSearch = 
      epic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (epic.description && epic.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (epic.tags && epic.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    
    const matchesStatus = statusFilter === 'all' || epic.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort epics
  const sortedEpics = [...filteredEpics].sort((a, b) => {
    let valueA, valueB;
    
    switch (sortBy) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'priority':
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        valueA = priorityOrder[a.priority] || 0;
        valueB = priorityOrder[b.priority] || 0;
        break;
      case 'progress':
        valueA = a.progress || 0;
        valueB = b.progress || 0;
        break;
      case 'targetDate':
        valueA = a.targetDate ? new Date(a.targetDate).getTime() : 0;
        valueB = b.targetDate ? new Date(b.targetDate).getTime() : 0;
        break;
      case 'updatedAt':
      default:
        valueA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
        valueB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
    }
    
    const compareResult = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
    return sortDirection === 'asc' ? compareResult : -compareResult;
  });

  const handleDeleteClick = (epic: EpicWithRelations) => {
    setEpicToDelete(epic);
  };

  const confirmDelete = () => {
    if (epicToDelete) {
      onDeleteEpic(epicToDelete);
      setEpicToDelete(null);
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search epics..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="backlog">Backlog</SelectItem>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[130px]">
              {sortDirection === 'asc' ? (
                <SortAsc className="mr-2 h-4 w-4" />
              ) : (
                <SortDesc className="mr-2 h-4 w-4" />
              )}
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="targetDate">Target Date</SelectItem>
              <SelectItem value="updatedAt">Last Updated</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon" onClick={toggleSortDirection}>
            {sortDirection === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
          
          <Button onClick={onCreateEpic}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Epic
          </Button>
        </div>
      </div>
      
      {sortedEpics.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-md border-dashed">
          <h3 className="text-lg font-medium mb-2">No epics found</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Get started by creating your first epic.'}
          </p>
          <Button onClick={onCreateEpic}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Epic
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedEpics.map(epic => (
            <EpicCard
              key={epic.id}
              epic={epic}
              onEdit={onEditEpic}
              onDelete={handleDeleteClick}
              onView={onViewEpic}
            />
          ))}
        </div>
      )}
      
      <AlertDialog open={!!epicToDelete} onOpenChange={(open) => !open && setEpicToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the epic "{epicToDelete?.title}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EpicList; 