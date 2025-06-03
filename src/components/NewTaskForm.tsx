
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
} from '@/components/ui/form';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { NewTaskFormTrigger } from '@/components/forms/NewTaskFormTrigger';
import { NewTaskFormFields } from '@/components/forms/NewTaskFormFields';
import { NewTaskTeamMemberSection } from '@/components/forms/NewTaskTeamMemberSection';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  dueDate: string;
  tags: string;
  dropboxUrl: string;
}

interface NewTaskFormProps {
  onTaskCreated?: () => void;
  prefilledProject?: string;
  prefilledTitle?: string;
  prefilledDescription?: string;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ 
  onTaskCreated, 
  prefilledProject, 
  prefilledTitle = '',
  prefilledDescription = '',
  triggerText = "New Task",
  triggerVariant = "default"
}) => {
  const [open, setOpen] = React.useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = React.useState<string[]>([]);
  const { createTask, isCreating } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  
  const form = useForm<TaskFormData>({
    defaultValues: {
      title: prefilledTitle,
      description: prefilledDescription,
      project: prefilledProject || '',
      dueDate: '',
      tags: '',
      dropboxUrl: '',
    },
  });

  // Update form when dialog opens with prefilled values
  React.useEffect(() => {
    if (open) {
      console.log('NewTaskForm - Dialog opened, setting form values:', {
        project: prefilledProject,
        title: prefilledTitle,
        description: prefilledDescription
      });
      
      form.reset({
        title: prefilledTitle || '',
        description: prefilledDescription || '',
        project: prefilledProject || '',
        dueDate: '',
        tags: '',
        dropboxUrl: '',
      });
    }
  }, [open, prefilledProject, prefilledTitle, prefilledDescription, form]);

  const handleTeamMemberToggle = (memberId: string) => {
    console.log('NewTaskForm - Team member toggle:', memberId);
    setSelectedTeamMembers(prev => {
      const newSelection = prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId];
      console.log('NewTaskForm - Updated selected team members:', newSelection);
      return newSelection;
    });
  };

  const handleRemoveTeamMember = (memberId: string) => {
    console.log('NewTaskForm - Removing team member:', memberId);
    setSelectedTeamMembers(prev => {
      const newSelection = prev.filter(id => id !== memberId);
      console.log('NewTaskForm - Updated selected team members after removal:', newSelection);
      return newSelection;
    });
  };

  const onSubmit = (data: TaskFormData) => {
    console.log('NewTaskForm - Form submission started with data:', data);
    console.log('NewTaskForm - Selected team members at submission:', selectedTeamMembers);
    
    // Validate required fields
    if (!data.title || data.title.trim() === '') {
      console.error('NewTaskForm - Task title is required');
      return;
    }
    
    if (!data.project || data.project.trim() === '') {
      console.error('NewTaskForm - Project is required');
      return;
    }
    
    const tagsArray = data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    // For now, we'll store the first selected team member as assignee
    // Later we can enhance this to support multiple assignees
    const assignee = selectedTeamMembers.length > 0 ? selectedTeamMembers[0] : null;
    console.log('NewTaskForm - Assignee being set:', assignee);
    
    const taskData = {
      title: data.title.trim(),
      description: data.description?.trim() || null,
      assignee: assignee,
      due_date: data.dueDate || null,
      tags: tagsArray.length > 0 ? tagsArray : null,
      project: data.project.trim(),
      status: 'To Do',
      progress: 0,
      dropbox_url: data.dropboxUrl?.trim() || null,
    };
    
    console.log('NewTaskForm - Final task data being submitted:', taskData);
    
    createTask(taskData);
    
    // Close dialog and reset form
    setOpen(false);
    form.reset({
      title: '',
      description: '',
      project: prefilledProject || '',
      dueDate: '',
      tags: '',
      dropboxUrl: '',
    });
    setSelectedTeamMembers([]);
    
    if (onTaskCreated) {
      onTaskCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <NewTaskFormTrigger 
          triggerText={triggerText}
          triggerVariant={triggerVariant}
        />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Add a new task to track progress and assign to team members.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <NewTaskFormFields
              control={form.control}
              projects={projects}
              isLoadingProjects={isLoadingProjects}
              prefilledProject={prefilledProject}
            />
            
            <NewTaskTeamMemberSection
              selectedTeamMembers={selectedTeamMembers}
              onMemberToggle={handleTeamMemberToggle}
              onRemoveMember={handleRemoveTeamMember}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
