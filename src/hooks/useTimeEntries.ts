
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type TimeEntry = Tables<'time_entries'>;
type TimeEntryInsert = TablesInsert<'time_entries'>;

export const useTimeEntries = (taskId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const timeEntriesQuery = useQuery({
    queryKey: ['time_entries', taskId, user?.id],
    queryFn: async () => {
      if (!user || !taskId) {
        console.log('No authenticated user or task ID, returning empty time entries array');
        return [];
      }

      // First verify the task belongs to the user
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', taskId)
        .eq('user_id', user.id)
        .single();

      if (taskError || !task) {
        console.error('Task not found or access denied:', taskError);
        throw new Error('Task not found or access denied');
      }

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId)
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user && !!taskId,
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: Omit<TimeEntryInsert, 'user_id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Input validation
      if (!timeEntryData.description || timeEntryData.description.trim().length === 0) {
        throw new Error('Time entry description is required');
      }
      
      if (timeEntryData.description.length > 500) {
        throw new Error('Time entry description must be less than 500 characters');
      }

      if (!timeEntryData.hours || timeEntryData.hours <= 0) {
        throw new Error('Hours must be greater than 0');
      }

      if (timeEntryData.hours > 24) {
        throw new Error('Hours cannot exceed 24 for a single entry');
      }

      if (!timeEntryData.task_id) {
        throw new Error('Task ID is required');
      }

      // Verify the task belongs to the user
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .select('id')
        .eq('id', timeEntryData.task_id)
        .eq('user_id', user.id)
        .single();

      if (taskError || !task) {
        throw new Error('Task not found or access denied');
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert([{ ...timeEntryData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating time entry:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time_entries', taskId, user?.id] });
      queryClient.invalidateQueries({ queryKey: ['weekly_time_entries', user?.id] });
      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
    },
    onError: (error) => {
      console.error('Create time entry error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to log time entry",
        variant: "destructive",
      });
    },
  });

  const totalHours = timeEntriesQuery.data?.reduce((sum, entry) => sum + Number(entry.hours), 0) || 0;

  return {
    timeEntries: timeEntriesQuery.data || [],
    isLoading: timeEntriesQuery.isLoading,
    error: timeEntriesQuery.error,
    createTimeEntry: createTimeEntryMutation.mutate,
    isCreating: createTimeEntryMutation.isPending,
    totalHours,
  };
};

// New hook for getting weekly time entries for dashboard
export const useWeeklyTimeEntries = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['weekly_time_entries', user?.id],
    queryFn: async () => {
      if (!user) {
        console.log('No authenticated user, returning empty weekly time entries');
        return [];
      }

      // Get the start of the current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      startOfWeek.setHours(0, 0, 0, 0);

      console.log('Fetching weekly time entries from:', startOfWeek.toISOString().split('T')[0]);

      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startOfWeek.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching weekly time entries:', error);
        throw error;
      }

      console.log('Weekly time entries fetched:', data?.length || 0, 'entries');
      console.log('Total hours:', data?.reduce((sum, entry) => sum + Number(entry.hours), 0) || 0);

      return data || [];
    },
    enabled: !!user,
  });
};
