import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTeamMembers';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  assignee: string;
  dueDate: string;
  multipleTasks: string;
}

interface TaskCreateDialogProps {
  triggerText?: string;
  triggerVariant?: 'default' | 'outline';
  prefilledProject?: string;
  multipleMode?: boolean;
  onTaskCreated?: () => void;
}

export const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({
  triggerText = "New Task",
  triggerVariant = "default",
  prefilledProject,
  multipleMode = false,
  onTaskCreated
}) => {
  const [open, setOpen] = useState(false);
  const { createTask, isCreating } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { teamMembers } = useTeamMembers();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    defaultValues: {
      title: '',
      description: '',
      project: prefilledProject || '',
      assignee: 'unassigned',
      dueDate: '',
      multipleTasks: ''
    }
  });

  const selectedProject = watch('project');
  const selectedAssignee = watch('assignee');

  React.useEffect(() => {
    if (open && prefilledProject) {
      setValue('project', prefilledProject);
    }
  }, [open, prefilledProject, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    console.log('TaskCreateDialog - Form submission:', { data, multipleMode });

    if (multipleMode) {
      // Handle multiple tasks
      if (!data.multipleTasks?.trim()) {
        console.error('Multiple tasks text is required');
        return;
      }

      const taskLines = data.multipleTasks
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      console.log('TaskCreateDialog - Creating multiple tasks:', taskLines);

      for (const taskTitle of taskLines) {
        const taskData = {
          title: taskTitle,
          description: data.description || null,
          project: data.project,
          assignee: data.assignee === 'unassigned' ? null : data.assignee,
          due_date: data.dueDate || null,
          status: 'To Do',
          progress: 0,
          tags: null,
          dropbox_url: null
        };
        
        console.log('TaskCreateDialog - Creating task:', taskData);
        await createTask(taskData);
      }
    } else {
      // Handle single task
      if (!data.title?.trim()) {
        console.error('Task title is required');
        return;
      }

      const taskData = {
        title: data.title,
        description: data.description || null,
        project: data.project,
        assignee: data.assignee === 'unassigned' ? null : data.assignee,
        due_date: data.dueDate || null,
        status: 'To Do',
        progress: 0,
        tags: null,
        dropbox_url: null
      };
      
      console.log('TaskCreateDialog - Creating single task:', taskData);
      await createTask(taskData);
    }

    // Close dialog and reset form
    setOpen(false);
    reset();
    onTaskCreated?.();
  };

  const renderTrigger = () => {
    if (!triggerText || triggerText.trim() === '') {
      return (
        <Button variant="outline" size="icon" className="h-8 w-8">
          <Plus className="w-4 h-4" />
        </Button>
      );
    }

    if (triggerVariant === 'outline') {
      return (
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          {triggerText}
        </Button>
      );
    }

    return (
      <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        <Plus size={20} className="mr-2" />
        {triggerText}
      </Button>
    );
  };

  const dialogTitle = multipleMode ? "Add Multiple Tasks" : "Create New Task";
  const dialogDescription = multipleMode 
    ? "Add multiple tasks to this project. Enter each task on a new line."
    : "Add a new task to track progress and assign to team members.";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {renderTrigger()}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>{dialogDescription}</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!multipleMode && (
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter task title"
                {...register('title', { required: 'Task title is required' })}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project *</Label>
            <Select
              value={selectedProject}
              onValueChange={(value) => setValue('project', value)}
              disabled={!!prefilledProject}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.name}>
                    <div className="flex flex-col">
                      <span className="font-medium">{project.name}</span>
                      <span className="text-xs text-gray-500">{project.client_name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project && (
              <p className="text-sm text-red-600">{errors.project.message}</p>
            )}
          </div>

          {multipleMode ? (
            <div className="space-y-2">
              <Label htmlFor="multipleTasks">Tasks *</Label>
              <Textarea
                id="multipleTasks"
                placeholder="Task 1&#10;Task 2&#10;Task 3"
                className="min-h-[120px]"
                {...register('multipleTasks', { required: 'Please enter at least one task' })}
              />
              {errors.multipleTasks && (
                <p className="text-sm text-red-600">{errors.multipleTasks.message}</p>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select
                  value={selectedAssignee}
                  onValueChange={(value) => setValue('assignee', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member (optional)" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                />
              </div>
            </>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : multipleMode ? 'Add Tasks' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
