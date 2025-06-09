
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mic } from 'lucide-react';
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
import { useFieldVoiceInput } from '@/hooks/useFieldVoiceInput';

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

  const { startFieldListening, isListening, currentField } = useFieldVoiceInput({
    onResult: (field, text) => setValue(field as keyof TaskFormData, text)
  });

  // Pre-fill form with voice command data
  useEffect(() => {
    if (open && prefilledData) {
      if (prefilledData.title) setValue('title', prefilledData.title);
      if (prefilledData.description) setValue('description', prefilledData.description);
      if (prefilledData.project) setValue('project', prefilledData.project);
      if (prefilledData.assignee) setValue('assignee', prefilledData.assignee);
      if (prefilledData.dueDate) setValue('dueDate', prefilledData.dueDate);
    }
  }, [open, prefilledData, setValue]);

  const onSubmit = async (data: TaskFormData) => {
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
    
    await createTask(taskData);
    onOpenChange(false);
    reset();
  };

  const VoiceButton = ({ fieldName }: { fieldName: string }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="ml-2 p-1 h-6 w-6"
      onClick={() => startFieldListening(fieldName)}
      disabled={isListening}
    >
      <Mic className={`h-3 w-3 ${isListening && currentField === fieldName ? 'text-red-500' : 'text-gray-400'}`} />
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Task from Voice Command</DialogTitle>
          <DialogDescription>
            I've filled in what I understood from your voice command. Complete any missing fields below or use the microphone buttons to speak the missing information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="title">Title *</Label>
              <VoiceButton fieldName="title" />
            </div>
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
            <div className="flex items-center">
              <Label htmlFor="description">Description</Label>
              <VoiceButton fieldName="description" />
            </div>
            <Textarea
              id="description"
              placeholder="Enter task description (optional)"
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Project</Label>
            <Select
              value={watch('project')}
              onValueChange={(value) => setValue('project', value)}
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Assignee</Label>
            <Select
              value={watch('assignee')}
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
            <div className="flex items-center">
              <Label htmlFor="dueDate">Due Date</Label>
              <VoiceButton fieldName="dueDate" />
            </div>
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
