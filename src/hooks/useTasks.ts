import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useState } from 'react';

export interface TaskWithClient extends Task {
  client_name?: string;
}

export const useTasks = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const tasksData = useConvexQuery(
    api.tasks.list,
    user ? { userId: user.id } : undefined
  ) as TaskWithClient[] | undefined;

  const tasks = tasksData ?? [];
  console.log('useTasks', { userId: user?.id, count: tasks.length, loading: tasksData === undefined });
  const isLoading = tasksData === undefined;
  const error = null;

  const createTaskMutation = useConvexMutation(api.tasks.create);
  const updateTaskMutation = useConvexMutation(api.tasks.update);
  const deleteTaskMutation = useConvexMutation(api.tasks.remove);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createTask = async (taskData: Omit<TaskInsert, 'user_id'>, options?: { onSuccess?: (data: TaskWithClient) => void }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    if (taskData.title.length > 255) {
      throw new Error('Task title must be less than 255 characters');
    }

    if (taskData.description && taskData.description.length > 2000) {
      throw new Error('Task description must be less than 2000 characters');
    }

    try {
      console.log('createTask', { userId: user.id, taskData });
      setIsCreating(true);
      const payload = {
        userId: user.id,
        title: taskData.title,
        description: taskData.description ?? undefined,
        status: taskData.status ?? undefined,
        client_id: taskData.client_id ?? undefined,
        assignee: taskData.assignee ?? undefined,
        billable_amount: taskData.billable_amount ?? undefined,
        billing_description: taskData.billing_description ?? undefined,
        progress: taskData.progress ?? undefined,
        dropbox_url: taskData.dropbox_url ?? undefined,
        notes: taskData.notes ?? undefined,
        due_date: taskData.due_date ?? undefined,
        project: taskData.project ?? undefined,
        tags: taskData.tags ?? undefined,
      };
      const created = await createTaskMutation({
        ...payload,
      });
      options?.onSuccess?.(created as TaskWithClient);
      toast({
        title: "Success",
        description: "Task created successfully",
      });
      return created as TaskWithClient;
    } catch (error: any) {
      console.error('Create task error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create task",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateTask = async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    if (updates.title !== undefined && (!updates.title || updates.title.trim().length === 0)) {
      throw new Error('Task title is required');
    }
    
    if (updates.title && updates.title.length > 255) {
      throw new Error('Task title must be less than 255 characters');
    }

    if (updates.description && updates.description.length > 2000) {
      throw new Error('Task description must be less than 2000 characters');
    }

    try {
      setIsUpdating(true);
      const normalizedUpdates: Partial<Task> = {
        ...updates,
        client_id: updates.client_id ?? undefined,
        project: updates.project ?? undefined,
        description: updates.description ?? undefined,
        assignee: updates.assignee ?? undefined,
        billable_amount: updates.billable_amount ?? undefined,
        billing_description: updates.billing_description ?? undefined,
        progress: updates.progress ?? undefined,
        dropbox_url: updates.dropbox_url ?? undefined,
        notes: updates.notes ?? undefined,
        due_date: updates.due_date ?? undefined,
        tags: updates.tags ?? undefined,
      };
      await updateTaskMutation({ id, userId: user.id, updates: normalizedUpdates });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (error: any) {
      console.error('Update task error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update task",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteTask = async (id: string) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setIsDeleting(true);
      await deleteTaskMutation({ id, userId: user.id });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (error: any) {
      console.error('Delete task error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete task",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };


  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
