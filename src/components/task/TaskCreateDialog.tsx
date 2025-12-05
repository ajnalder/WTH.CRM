
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, User, Tag, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useClients } from '@/hooks/useClients';
import { useAuth } from '@/contexts/AuthContext';

interface TaskCreateDialogProps {
  onTaskCreated?: () => void;
  prefilledProject?: string;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
}

export const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({ 
  onTaskCreated, 
  prefilledProject,
  triggerText = "New Task",
  triggerVariant = "default"
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createTask, isCreating } = useTasks();
  const { projects } = useProjects();
  const { teamMembers } = useTeamMembers();
  const { clients } = useClients();
  
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: prefilledProject || '',
    assignee: '',
    due_date: '',
    status: 'To Do' as 'To Do' | 'In Progress' | 'Review' | 'Done',
    tags: [] as string[],
    client_id: ''
  });

  // Set default assignee to logged-in user when dialog opens
  useEffect(() => {
    if (open && user && teamMembers) {
      const currentUserMember = teamMembers.find(m => m.id === user.id);
      if (currentUserMember && !formData.assignee) {
        setFormData(prev => ({ ...prev, assignee: user.id }));
      }
    }
  }, [open, user, teamMembers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const taskData = {
      title: formData.title,
      description: formData.description || null,
      project: formData.project || null,
      assignee: formData.assignee || null,
      due_date: formData.due_date || null,
      status: formData.status,
      tags: formData.tags.length > 0 ? formData.tags : null,
      client_id: formData.client_id || null
    };

    createTask(taskData, {
      onSuccess: (newTask) => {
        setOpen(false);
        setFormData({
          title: '',
          description: '',
          project: prefilledProject || '',
          assignee: user?.id || '',
          due_date: '',
          status: 'To Do',
          tags: [],
          client_id: ''
        });
        onTaskCreated?.();
        // Navigate to the new task's detail page
        navigate(`/tasks/${newTask.id}`);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="mr-2" />
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Task
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Task description..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={formData.client_id} onValueChange={(value) => setFormData(prev => ({ ...prev, client_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Project</Label>
              <Select value={formData.project} onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.name}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Select value={formData.assignee} onValueChange={(value) => setFormData(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  {teamMembers?.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 bg-gradient-to-r ${member.gradient} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
                          {member.avatar}
                        </div>
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: 'To Do' | 'In Progress' | 'Review' | 'Done') => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Due Date</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !formData.title.trim()}>
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
