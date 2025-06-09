import React, { useState, useEffect } from 'react';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useTeamMembers } from '@/hooks/useTeamMembers';
import { useToast } from '@/hooks/use-toast';
import { toSentenceCase, formatDescription } from '@/utils/textFormatting';

interface TaskFormData {
  title: string;
  description: string;
  project: string;
  assignee: string;
  dueDate: string;
}

interface VoiceTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData: Record<string, any>;
}

export const VoiceTaskDialog: React.FC<VoiceTaskDialogProps> = ({
  open,
  onOpenChange,
  prefilledData
}) => {
  const { createTask, isCreating } = useTasks();
  const { projects, isLoading: isLoadingProjects } = useProjects();
  const { teamMembers } = useTeamMembers();
  const { toast } = useToast();
  const [isTemporaryMode, setIsTemporaryMode] = useState(false);
  
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
      project: '',
      assignee: 'unassigned',
      dueDate: ''
    }
  });

  // Enhanced debugging logs
  useEffect(() => {
    console.log('VoiceTaskDialog - Props changed:', { 
      open, 
      prefilledDataKeys: Object.keys(prefilledData),
      prefilledData 
    });
  }, [open, prefilledData]);

  // Check if we should enable temporary mode
  useEffect(() => {
    if (open && prefilledData) {
      const hasProjectInfo = prefilledData.availableProjects && prefilledData.availableProjects.length > 0;
      const hasDirectProject = prefilledData.project;
      
      if (!hasProjectInfo && !hasDirectProject && prefilledData.title) {
        console.log('VoiceTaskDialog - Enabling temporary mode - no project specified');
        setIsTemporaryMode(true);
        toast({
          title: "Task Ready for Completion",
          description: "I've created a temporary task. Please select a project or provide more details.",
        });
      } else {
        setIsTemporaryMode(false);
      }
    }
  }, [open, prefilledData, toast]);

  // Filter projects based on client context
  const getAvailableProjects = () => {
    if (prefilledData.availableProjects && prefilledData.availableProjects.length > 0) {
      // Use projects from voice command context
      return prefilledData.availableProjects.map((p: any) => ({
        id: p.id,
        name: p.name,
        client_name: prefilledData.clientName || 'Unknown'
      }));
    }
    return projects; // Fall back to all projects
  };

  // Pre-fill form with voice command data and format it properly
  useEffect(() => {
    if (open && prefilledData) {
      console.log('VoiceTaskDialog - Pre-filling form with data:', prefilledData);
      
      if (prefilledData.title) setValue('title', toSentenceCase(prefilledData.title));
      if (prefilledData.description) setValue('description', formatDescription(prefilledData.description));
      if (prefilledData.project) setValue('project', prefilledData.project);
      if (prefilledData.assignee) setValue('assignee', prefilledData.assignee);
      if (prefilledData.dueDate) setValue('dueDate', prefilledData.dueDate);
    }
  }, [open, prefilledData, setValue]);

  const onSubmit = async (data: TaskFormData) => {
    console.log('VoiceTaskDialog - Submitting task with data:', data);
    
    // Validate required fields
    if (!data.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Task title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!data.project?.trim()) {
      toast({
        title: "Validation Error", 
        description: "Please select a project for this task.",
        variant: "destructive",
      });
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
    
    try {
      console.log('VoiceTaskDialog - Creating task:', taskData);
      await createTask(taskData);
      
      toast({
        title: "Task Created",
        description: `Task "${data.title}" has been created successfully.`,
      });
      
      onOpenChange(false);
      reset();
      setIsTemporaryMode(false);
    } catch (error) {
      console.error('VoiceTaskDialog - Error creating task:', error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const availableProjects = getAvailableProjects();

  console.log('VoiceTaskDialog - Rendering dialog, open:', open);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white border border-gray-200 shadow-lg">
        <DialogHeader>
          <DialogTitle>
            {isTemporaryMode ? "Complete Your Task" : "Create Task from Voice Command"}
          </DialogTitle>
          <DialogDescription>
            {isTemporaryMode 
              ? "I've started creating your task. Please complete the missing information below."
              : prefilledData.clientName 
                ? `Creating a task for ${prefilledData.clientName}. Complete any missing fields below.`
                : "I've filled in what I understood from your voice command. Complete any missing fields below."
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            {prefilledData.clientName && (
              <p className="text-sm text-gray-600 mb-2">
                Showing projects for: <strong>{prefilledData.clientName}</strong>
              </p>
            )}
            <Select
              value={watch('project')}
              onValueChange={(value) => {
                console.log('VoiceTaskDialog - Project selected:', value);
                setValue('project', value);
              }}
            >
              <SelectTrigger className="bg-white border border-gray-300">
                <SelectValue placeholder={isLoadingProjects ? "Loading projects..." : "Select a project"} />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                {availableProjects.map((project) => (
                  <SelectItem key={project.id || project.name} value={project.name}>
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

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={watch('assignee')}
              onValueChange={(value) => setValue('assignee', value)}
            >
              <SelectTrigger className="bg-white border border-gray-300">
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
