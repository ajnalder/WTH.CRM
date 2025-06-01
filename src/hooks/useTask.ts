
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TaskWithClient } from '@/hooks/useTasks';

export const useTask = (taskId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<TaskWithClient> => {
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching task:', error);
        throw error;
      }

      if (!task) {
        throw new Error('Task not found');
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
        return {
          ...task,
          client_name: undefined
        };
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
    enabled: !!taskId,
  });

  const updateTaskAssignee = useMutation({
    mutationFn: async (assignee: string | null) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ assignee })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task assignee:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task assignee updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update task assignee error:', error);
      toast({
        title: "Error",
        description: "Failed to update task assignee",
        variant: "destructive",
      });
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
    updateTaskAssignee: updateTaskAssignee.mutate,
    isUpdating: updateTaskAssignee.isPending,
  };
};
