
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
import { useProjects } from '@/hooks/useProjects';
import { useClients } from '@/hooks/useClients';
import { useFieldVoiceInput } from '@/hooks/useFieldVoiceInput';

interface ProjectFormData {
  name: string;
  client_id: string;
  description: string;
  due_date: string;
  priority: 'Low' | 'Medium' | 'High';
  budget: number;
}

interface VoiceProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData: Record<string, any>;
}

export const VoiceProjectDialog: React.FC<VoiceProjectDialogProps> = ({
  open,
  onOpenChange,
  prefilledData
}) => {
  const { createProject, isCreating } = useProjects();
  const { clients } = useClients();
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<ProjectFormData>({
    defaultValues: {
      name: '',
      client_id: '',
      description: '',
      due_date: '',
      priority: 'Medium',
      budget: 0
    }
  });

  const { startFieldListening, isListening, currentField } = useFieldVoiceInput({
    onResult: (field, text) => setValue(field as keyof ProjectFormData, text)
  });

  // Pre-fill form with voice command data
  useEffect(() => {
    if (open && prefilledData) {
      if (prefilledData.name) setValue('name', prefilledData.name);
      if (prefilledData.client_id) setValue('client_id', prefilledData.client_id);
      if (prefilledData.description) setValue('description', prefilledData.description);
      if (prefilledData.due_date) setValue('due_date', prefilledData.due_date);
      if (prefilledData.priority) setValue('priority', prefilledData.priority);
      if (prefilledData.budget) setValue('budget', prefilledData.budget);
    }
  }, [open, prefilledData, setValue]);

  const onSubmit = async (data: ProjectFormData) => {
    createProject({
      client_id: data.client_id,
      name: data.name,
      description: data.description,
      due_date: data.due_date || null,
      priority: data.priority,
      budget: data.budget,
      status: 'Planning',
      progress: 0,
      is_retainer: false
    });
    
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
          <DialogTitle>Create Project from Voice Command</DialogTitle>
          <DialogDescription>
            I've filled in what I understood from your voice command. Complete any missing required fields below.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="name">Project Name *</Label>
              <VoiceButton fieldName="name" />
            </div>
            <Input
              id="name"
              placeholder="Enter project name"
              {...register('name', { required: 'Project name is required' })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="client_id">Client *</Label>
            <select 
              {...register('client_id', { required: 'Client is required' })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Select a client</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company}
                </option>
              ))}
            </select>
            {errors.client_id && (
              <p className="text-sm text-red-600">{errors.client_id.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="description">Description</Label>
              <VoiceButton fieldName="description" />
            </div>
            <Textarea
              id="description"
              placeholder="Brief description of the project..."
              className="min-h-[80px]"
              {...register('description')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Label htmlFor="due_date">Due Date</Label>
                <VoiceButton fieldName="due_date" />
              </div>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select 
                {...register('priority')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center">
              <Label htmlFor="budget">Budget ($)</Label>
              <VoiceButton fieldName="budget" />
            </div>
            <Input
              id="budget"
              type="number"
              placeholder="25000"
              {...register('budget', { valueAsNumber: true })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
