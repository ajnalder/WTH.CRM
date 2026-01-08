import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

// Time entry types
type TimeEntry = {
  id: string;
  task_id: string;
  user_id: string;
  date: string;
  description: string;
  hours: number;
  created_at: string;
  updated_at: string;
};

type TimeEntryInsert = Omit<TimeEntry, 'id' | 'created_at' | 'updated_at' | 'user_id'>;

export const useTimeEntries = (taskId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const timeEntriesData = useConvexQuery(
    api.timeEntries.listByTask,
    user && taskId ? { taskId, userId: user.id } : undefined
  ) as TimeEntry[] | undefined;
  const timeEntries = timeEntriesData ?? [];
  const isLoading = timeEntriesData === undefined;
  const error = null;

  const createTimeEntryMutation = useConvexMutation(api.timeEntries.create);

  const createTimeEntry = async (timeEntryData: Omit<TimeEntryInsert, 'user_id'>) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

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

    try {
      console.log('createTimeEntry', { userId: user.id, timeEntryData });
      setIsCreating(true);
      await createTimeEntryMutation({
        userId: user.id,
        ...timeEntryData,
      });
      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
    } catch (error: any) {
      console.error('Create time entry error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to log time entry",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const totalHours = timeEntries.reduce((sum, entry) => sum + Number(entry.hours), 0);

  return {
    timeEntries,
    isLoading,
    error,
    createTimeEntry,
    isCreating,
    totalHours,
  };
};

// New hook for getting weekly time entries for dashboard
export const useWeeklyTimeEntries = () => {
  const { user } = useAuth();

  const weeklyEntries = useConvexQuery(
    api.timeEntries.weeklyForUser,
    user ? { userId: user.id } : undefined
  );

  return {
    data: weeklyEntries ?? [],
    isLoading: weeklyEntries === undefined,
    error: null,
  };
};
