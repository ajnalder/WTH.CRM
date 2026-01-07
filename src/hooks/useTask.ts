
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import type { TaskWithClient } from '@/hooks/useTasks';

export const useTask = (taskId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const taskData = useConvexQuery(
    api.tasks.getById,
    user && taskId ? { id: taskId, userId: user.id } : undefined
  ) as TaskWithClient | null | undefined;

  const updateTaskMutation = useConvexMutation(api.tasks.update);

  const isLoading = taskData === undefined;
  const task = taskData ?? null;

  const normalize = (updates: Partial<TaskWithClient>) => ({
    ...updates,
    description: updates.description ?? undefined,
    assignee: updates.assignee ?? undefined,
    due_date: updates.due_date ?? undefined,
    dropbox_url: updates.dropbox_url ?? undefined,
    client_id: updates.client_id ?? undefined,
    project: updates.project ?? undefined,
    billable_amount: updates.billable_amount ?? undefined,
    billing_description: updates.billing_description ?? undefined,
    tags: updates.tags ?? undefined,
  });

  const updateTaskDetails = async (updateData: {
    title: string;
    description: string;
    assignee: string | null;
    status: string;
    due_date: string | null;
    dropbox_url: string | null;
    client_id: string | null;
    project: string | null;
    billable_amount?: number | null;
    billing_description?: string | null;
  }) => {
    if (!user) throw new Error('User not authenticated');
    await updateTaskMutation({
      id: taskId,
      userId: user.id,
      updates: normalize(updateData),
    });
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  const updateTaskStatus = async (status: string) => {
    if (!user) throw new Error('User not authenticated');
    await updateTaskMutation({
      id: taskId,
      userId: user.id,
      updates: { status },
    });
    toast({
      title: "Success",
      description: "Task status updated successfully",
    });
  };

  const updateTaskNotes = async (notes: string) => {
    if (!user) throw new Error('User not authenticated');
    await updateTaskMutation({
      id: taskId,
      userId: user.id,
      updates: { notes: notes ?? undefined },
    });
  };

  return {
    task,
    isLoading,
    error: null,
    updateTaskDetails,
    isUpdatingDetails: updateTaskMutation.isPending,
    updateTaskStatus,
    isUpdatingStatus: updateTaskMutation.isPending,
    updateTaskNotes,
    isUpdatingNotes: updateTaskMutation.isPending,
  };
};
