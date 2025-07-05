import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface TaskTimeEntry {
  task_id: string;
  task_title: string;
  total_hours: number;
  entry_count: number;
  entries: Array<{
    id: string;
    date: string;
    hours: number;
    description: string;
  }>;
}

interface ClientTimeData {
  tasks: TaskTimeEntry[];
  totalHours: number;
  totalEntries: number;
}

export const useClientTimeEntries = (clientId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['client_time_entries', clientId, user?.id],
    queryFn: async (): Promise<ClientTimeData> => {
      if (!user || !clientId) {
        return { tasks: [], totalHours: 0, totalEntries: 0 };
      }

      // Get time entries for all tasks belonging to this client
      const { data: timeEntries, error } = await supabase
        .from('time_entries')
        .select(`
          id,
          task_id,
          date,
          hours,
          description,
          tasks (
            id,
            title,
            client_id
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching client time entries:', error);
        throw error;
      }

      // Filter entries for this client and group by task
      const clientEntries = timeEntries?.filter(entry => 
        entry.tasks && entry.tasks.client_id === clientId
      ) || [];

      const taskMap = new Map<string, TaskTimeEntry>();

      clientEntries.forEach(entry => {
        if (!entry.tasks) return;

        const taskId = entry.task_id;
        const taskTitle = entry.tasks.title;

        if (!taskMap.has(taskId)) {
          taskMap.set(taskId, {
            task_id: taskId,
            task_title: taskTitle,
            total_hours: 0,
            entry_count: 0,
            entries: []
          });
        }

        const taskData = taskMap.get(taskId)!;
        taskData.total_hours += Number(entry.hours);
        taskData.entry_count += 1;
        taskData.entries.push({
          id: entry.id,
          date: entry.date,
          hours: Number(entry.hours),
          description: entry.description
        });
      });

      const tasks = Array.from(taskMap.values()).sort((a, b) => b.total_hours - a.total_hours);
      const totalHours = tasks.reduce((sum, task) => sum + task.total_hours, 0);
      const totalEntries = tasks.reduce((sum, task) => sum + task.entry_count, 0);

      return {
        tasks,
        totalHours,
        totalEntries
      };
    },
    enabled: !!user && !!clientId,
  });
};