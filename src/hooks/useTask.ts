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
      console.log('useTask - Fetching task with ID:', taskId);
      
      const { data: task, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .maybeSingle();

      if (error) {
        console.error('useTask - Error fetching task:', error);
        throw error;
      }

      if (!task) {
        console.error('useTask - Task not found for ID:', taskId);
        throw new Error('Task not found');
      }

      console.log('useTask - Fetched task:', task);

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
        console.error('useTask - Error fetching projects:', projectsError);
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

      console.log('useTask - Final task with client info:', taskWithClient);
      return taskWithClient;
    },
    enabled: !!taskId,
  });

  const updateTaskDetails = useMutation({
    mutationFn: async (updateData: { 
      title: string; 
      description: string; 
      assignee: string | null; 
      status: string; 
      due_date: string | null; 
      dropbox_url: string | null 
    }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updateData.title,
          description: updateData.description || null,
          assignee: updateData.assignee,
          status: updateData.status,
          due_date: updateData.due_date,
          dropbox_url: updateData.dropbox_url
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task details:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update task details error:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async (status: string) => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ status })
        .eq('id', taskId)
        .select()
        .single();

      if (error) {
        console.error('Error updating task status:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast({
        title: "Success",
        description: "Task status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update task status error:', error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    },
  });

  return {
    task: taskQuery.data,
    isLoading: taskQuery.isLoading,
    error: taskQuery.error,
    updateTaskDetails: updateTaskDetails.mutate,
    isUpdatingDetails: updateTaskDetails.isPending,
    updateTaskStatus: updateTaskStatus.mutate,
    isUpdatingStatus: updateTaskStatus.isPending,
  };
};
