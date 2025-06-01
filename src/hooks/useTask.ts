
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { TaskWithClient } from '@/hooks/useTasks';

export const useTask = (taskId: string) => {
  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();

      if (error) {
        console.error('Error fetching task:', error);
        throw error;
      }

      // Get projects to map project names to client names
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select(`
          name,
          clients (
            company
          )
        `);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return task;
      }

      // Create a map of project names to client company names
      const projectClientMap = new Map();
      projects?.forEach(project => {
        if (project.clients && Array.isArray(project.clients) && project.clients[0]) {
          projectClientMap.set(project.name, project.clients[0].company);
        } else if (project.clients && !Array.isArray(project.clients)) {
          projectClientMap.set(project.name, project.clients.company);
        }
      });

      // Add client information to task
      const taskWithClient: TaskWithClient = {
        ...task,
        client_name: task.project ? projectClientMap.get(task.project) : undefined
      };

      return taskWithClient;
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
  };
};
