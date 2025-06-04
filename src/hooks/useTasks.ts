
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Task = Tables<'tasks'>;
type TaskInsert = TablesInsert<'tasks'>;

export interface TaskWithClient extends Task {
  client_name?: string;
  notes?: string | null;
}

export const useTasks = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const tasksQuery = useQuery({
    queryKey: ['tasks', user?.id],
    queryFn: async (): Promise<TaskWithClient[]> => {
      if (!user) {
        console.log('No authenticated user, returning empty tasks array');
        return [];
      }

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
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
        `)
        .eq('user_id', user.id);

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        return (tasks || []).map(task => ({
          ...task,
          client_name: undefined
        }));
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

      // Add client information to tasks
      const tasksWithClients: TaskWithClient[] = (tasks || []).map(task => ({
        ...task,
        client_name: task.project ? projectClientMap.get(task.project) : undefined
      }));

      return tasksWithClients;
    },
    enabled: !!user,
  });

  const createTaskMutation = useMutation({
    mutationFn: async (taskData: Omit<TaskInsert, 'user_id'>) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Input validation
      if (!taskData.title || taskData.title.trim().length === 0) {
        throw new Error('Task title is required');
      }
      
      if (taskData.title.length > 255) {
        throw new Error('Task title must be less than 255 characters');
      }

      if (taskData.description && taskData.description.length > 2000) {
        throw new Error('Task description must be less than 2000 characters');
      }

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();

      if (error) {
        console.error('Error creating task:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Task created successfully",
      });
    },
    onError: (error) => {
      console.error('Create task error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Input validation
      if (updates.title !== undefined && (!updates.title || updates.title.trim().length === 0)) {
        throw new Error('Task title is required');
      }
      
      if (updates.title && updates.title.length > 255) {
        throw new Error('Task title must be less than 255 characters');
      }

      if (updates.description && updates.description.length > 2000) {
        throw new Error('Task description must be less than 2000 characters');
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating task:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update task error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update task",
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting task:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', user?.id] });
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete task error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete task",
        variant: "destructive",
      });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};
