import { useState } from 'react';
import { Plus, Lightbulb, Edit, Trash2, CheckCircle, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageLayout } from '@/components/PageLayout';
import { useIdeas } from '@/hooks/useIdeas';
import { Tables } from '@/integrations/supabase/types';
import { format } from 'date-fns';

type Idea = Tables<'ideas'>;

const Ideas = () => {
  const { ideas, isLoading, createIdea, updateIdea, deleteIdea } = useIdeas();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [newIdea, setNewIdea] = useState({
    title: '',
    content: '',
    priority: 'medium',
    status: 'new',
    tags: [] as string[]
  });

  const handleCreateIdea = () => {
    if (!newIdea.title.trim()) return;
    
    createIdea.mutate({
      title: newIdea.title,
      content: newIdea.content,
      priority: newIdea.priority,
      status: newIdea.status,
      tags: newIdea.tags
    });
    
    setNewIdea({
      title: '',
      content: '',
      priority: 'medium',
      status: 'new',
      tags: []
    });
    setIsCreateDialogOpen(false);
  };

  const handleEditIdea = () => {
    if (!selectedIdea) return;
    
    updateIdea.mutate({
      id: selectedIdea.id,
      updates: {
        title: selectedIdea.title,
        content: selectedIdea.content,
        priority: selectedIdea.priority,
        status: selectedIdea.status,
        tags: selectedIdea.tags
      }
    });
    setIsEditDialogOpen(false);
    setSelectedIdea(null);
  };

  const handleDeleteIdea = (id: string) => {
    if (confirm('Are you sure you want to delete this idea?')) {
      deleteIdea.mutate(id);
    }
  };

  const handleMarkAsImplemented = (idea: Idea) => {
    updateIdea.mutate({
      id: idea.id,
      updates: { status: 'implemented' }
    });
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'new': return 'default';
      case 'in_progress': return 'secondary';
      case 'implemented': return 'outline';
      default: return 'outline';
    }
  };

  const filteredIdeas = ideas?.filter(idea => {
    const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || idea.priority === filterPriority;
    return matchesStatus && matchesPriority;
  });

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-8 w-8 text-yellow-500" />
            <div>
              <h1 className="text-2xl font-bold">Ideas</h1>
              <p className="text-muted-foreground">
                Capture and manage your brilliant ideas
              </p>
            </div>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Idea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={newIdea.title}
                    onChange={(e) => setNewIdea({ ...newIdea, title: e.target.value })}
                    placeholder="Enter idea title..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newIdea.content}
                    onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                    placeholder="Describe your idea..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={newIdea.priority} onValueChange={(value) => setNewIdea({ ...newIdea, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={newIdea.status} onValueChange={(value) => setNewIdea({ ...newIdea, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateIdea} disabled={!newIdea.title.trim()}>
                    Create Idea
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Ideas Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredIdeas?.map((idea) => (
            <Card key={idea.id} className="hover:shadow-lg transition-shadow h-64">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{idea.title}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(idea.created_at), 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant={getPriorityVariant(idea.priority)}>
                      {idea.priority}
                    </Badge>
                    <Badge variant={getStatusVariant(idea.status)}>
                      {idea.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-full pb-4">
                <p className="text-sm text-muted-foreground mb-4 flex-1 overflow-hidden">
                  {idea.content}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIdea(idea);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteIdea(idea.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {idea.status !== 'implemented' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMarkAsImplemented(idea)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Done
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredIdeas?.length === 0 && (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No ideas yet</h3>
            <p className="text-muted-foreground mb-4">
              Start capturing your brilliant ideas! Use the voice button to quickly add ideas.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Idea
            </Button>
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Idea</DialogTitle>
            </DialogHeader>
            {selectedIdea && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    value={selectedIdea.title}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={selectedIdea.content || ''}
                    onChange={(e) => setSelectedIdea({ ...selectedIdea, content: e.target.value })}
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={selectedIdea.priority} onValueChange={(value) => setSelectedIdea({ ...selectedIdea, priority: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select value={selectedIdea.status} onValueChange={(value) => setSelectedIdea({ ...selectedIdea, status: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleEditIdea}>
                    Update Idea
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  );
};

export default Ideas;