
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface TaskPlanningData {
  id: string;
  task_id: string;
  allocated_minutes: number;
  order_index: number;
  is_scheduled: boolean;
  scheduled_date: string;
}

export const useTaskPlanningData = (selectedDate: Date = new Date()) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const dateString = selectedDate.toISOString().split('T')[0];

  const { data: taskPlanningData = [], isLoading } = useQuery({
    queryKey: ['task-planning', user?.id, dateString],
    queryFn: async (): Promise<TaskPlanningData[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('task_planning')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', dateString);

      if (error) {
        console.error('Error fetching task planning data:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const upsertTaskPlanningMutation = useMutation({
    mutationFn: async (data: Omit<TaskPlanningData, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('task_planning')
        .upsert({
          ...data,
          user_id: user.id,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,task_id,scheduled_date'
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-planning', user?.id, dateString] });
    },
    onError: (error) => {
      console.error('Error saving task planning data:', error);
      toast({
        title: "Error",
        description: "Failed to save task planning data",
        variant: "destructive",
      });
    },
  });

  const deleteTaskPlanningMutation = useMutation({
    mutationFn: async (taskId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('task_planning')
        .delete()
        .eq('user_id', user.id)
        .eq('task_id', taskId)
        .eq('scheduled_date', dateString);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task-planning', user?.id, dateString] });
    },
    onError: (error) => {
      console.error('Error deleting task planning data:', error);
      toast({
        title: "Error",
        description: "Failed to remove task from schedule",
        variant: "destructive",
      });
    },
  });

  return {
    taskPlanningData,
    isLoading,
    upsertTaskPlanning: upsertTaskPlanningMutation.mutate,
    deleteTaskPlanning: deleteTaskPlanningMutation.mutate,
    isUpdating: upsertTaskPlanningMutation.isPending || deleteTaskPlanningMutation.isPending,
  };
};
