
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  multipleTasks?: string; // For multiple tasks mode
}

interface NewTaskFormProps {
  onTaskCreated?: () => void;
  prefilledProject?: string;
  prefilledTitle?: string;
  prefilledDescription?: string;
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
  multipleMode?: boolean; // New prop for multiple tasks mode
}

export const NewTaskForm: React.FC<NewTaskFormProps> = ({ 
  onTaskCreated, 
  prefilledProject, 
  prefilledTitle = '',
  prefilledDescription = '',
  triggerText = "New Task",
  triggerVariant = "default",
  multipleMode = false
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
      multipleTasks: '',
    },
  });

  // Update form when dialog opens with prefilled values
  React.useEffect(() => {
    if (open) {
      console.log('NewTaskForm - Dialog opened, setting form values:', {
        project: prefilledProject,
        title: prefilledTitle,
        description: prefilledDescription,
        multipleMode
      });
      
      form.reset({
        title: prefilledTitle || '',
        description: prefilledDescription || '',
        project: prefilledProject || '',
        dueDate: '',
        tags: '',
        dropboxUrl: '',
        multipleTasks: '',
      });
    }
  }, [open, prefilledProject, prefilledTitle, prefilledDescription, multipleMode, form]);

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
    console.log('NewTaskForm - Multiple mode:', multipleMode);
    
    if (multipleMode) {
      // Handle multiple tasks creation
      if (!data.multipleTasks || data.multipleTasks.trim() === '') {
        console.error('NewTaskForm - Multiple tasks text is required');
        return;
      }
      
      if (!data.project || data.project.trim() === '') {
        console.error('NewTaskForm - Project is required');
        return;
      }

      const taskLines = data.multipleTasks
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      taskLines.forEach((taskTitle, index) => {
        // For now, we'll store the first selected team member as assignee
        // Later we can enhance this to support multiple assignees or rotate through them
        const assignee = selectedTeamMembers.length > 0 ? selectedTeamMembers[index % selectedTeamMembers.length] : null;
        
        const taskData = {
          title: taskTitle,
          description: data.description?.trim() || null,
          assignee: assignee,
          due_date: data.dueDate || null,
          tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : null,
          project: data.project.trim(),
          status: 'To Do',
          progress: 0,
          dropbox_url: data.dropboxUrl?.trim() || null,
        };
        
        console.log('NewTaskForm - Creating multiple task:', taskData);
        createTask(taskData);
      });
    } else {
      // Handle single task creation
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
    }
    
    // Close dialog and reset form
    setOpen(false);
    form.reset({
      title: '',
      description: '',
      project: prefilledProject || '',
      dueDate: '',
      tags: '',
      dropboxUrl: '',
      multipleTasks: '',
    });
    setSelectedTeamMembers([]);
    
    if (onTaskCreated) {
      onTaskCreated();
    }
  };

  const dialogTitle = multipleMode ? "Add Multiple Tasks" : "Create New Task";
  const dialogDescription = multipleMode 
    ? "Add multiple tasks to this project. Enter each task on a new line."
    : "Add a new task to track progress and assign to team members.";

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
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            {dialogDescription}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {multipleMode ? (
              <>
                {/* Project and description fields for multiple mode */}
                <NewTaskFormFields
                  control={form.control}
                  projects={projects}
                  isLoadingProjects={isLoadingProjects}
                  prefilledProject={prefilledProject}
                  hideFields={['title', 'dueDate', 'tags', 'dropboxUrl']} // Hide single task fields
                />
                
                {/* Multiple tasks input */}
                <div className="space-y-2">
                  <Label htmlFor="multipleTasks">Tasks</Label>
                  <Textarea
                    id="multipleTasks"
                    placeholder="Task 1&#10;Task 2&#10;Task 3"
                    {...form.register('multipleTasks', { required: 'Please enter at least one task' })}
                    className="min-h-[120px]"
                  />
                </div>
              </>
            ) : (
              <NewTaskFormFields
                control={form.control}
                projects={projects}
                isLoadingProjects={isLoadingProjects}
                prefilledProject={prefilledProject}
              />
            )}
            
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
                {isCreating ? 'Creating...' : multipleMode ? 'Add Tasks' : 'Create Task'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
