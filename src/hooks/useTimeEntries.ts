
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type TimeEntry = Tables<'time_entries'>;
type TimeEntryInsert = TablesInsert<'time_entries'>;

export const useTimeEntries = (taskId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const timeEntriesQuery = useQuery({
    queryKey: ['time_entries', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('time_entries')
        .select('*')
        .eq('task_id', taskId)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching time entries:', error);
        throw error;
      }

      return data || [];
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: Omit<TimeEntryInsert, 'user_id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
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
      queryClient.invalidateQueries({ queryKey: ['time_entries', taskId] });
      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
    },
    onError: (error) => {
      console.error('Create time entry error:', error);
      toast({
        title: "Error",
        description: "Failed to log time entry",
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
