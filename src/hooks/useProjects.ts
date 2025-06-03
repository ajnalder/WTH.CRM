import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Project {
  id: string;
  client_id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  start_date: string | null;
  due_date: string | null;
  budget: number | null;
  progress: number;
  is_retainer: boolean;
  is_billable: boolean;
  created_at: string;
  updated_at: string;
  team_members?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
    avatar: string;
    gradient: string;
  }>;
}

export interface CreateProjectData {
  client_id: string;
  name: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string | null;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  budget?: number;
  progress?: number;
  is_retainer?: boolean;
  is_billable?: boolean;
}

export const useProjects = (clientId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: projects = [],
    isLoading,
    error
  } = useQuery({
    queryKey: clientId ? ['projects', clientId] : ['projects'],
    queryFn: async () => {
      console.log('Fetching projects', clientId ? `for client ${clientId}` : 'for all clients');
      
      let query = supabase
        .from('projects')
        .select(`
          *,
          clients!inner(
            id,
            company
          ),
          project_team_members(
            user_id,
            profiles!inner(
              id,
              full_name,
              email,
              avatar_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        throw error;
      }

      // Transform the data to flatten team members
      const transformedData = data?.map((project, index) => {
        const gradients = [
          'from-blue-400 to-blue-600',
          'from-green-400 to-green-600',
          'from-purple-400 to-purple-600',
          'from-red-400 to-red-600',
          'from-yellow-400 to-yellow-600',
          'from-pink-400 to-pink-600',
          'from-indigo-400 to-indigo-600',
          'from-teal-400 to-teal-600',
        ];

        const team_members = project.project_team_members?.map((ptm: any, idx: number) => {
          const profile = ptm.profiles;
          const name = profile?.full_name || profile?.email || 'Unknown User';
          const initials = profile?.full_name 
            ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
            : (profile?.email || 'UN').slice(0, 2).toUpperCase();

          return {
            id: profile?.id || '',
            name,
            role: 'Team Member',
            email: profile?.email || '',
            avatar: initials,
            gradient: gradients[idx % gradients.length],
          };
        }) || [];

        return {
          ...project,
          team_members
        };
      }) || [];

      console.log('Projects fetched:', transformedData);
      return transformedData as Project[];
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: CreateProjectData) => {
      console.log('Creating project:', projectData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('projects')
        .insert([{
          ...projectData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        throw error;
      }

      console.log('Project created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project created successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create project",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, projectData }: { projectId: string; projectData: UpdateProjectData }) => {
      console.log('Updating project:', projectId, projectData);
      
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...projectData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('Error updating project:', error);
        throw error;
      }

      console.log('Project updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update project",
        variant: "destructive",
      });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (projectId: string) => {
      console.log('Deleting project:', projectId);
      
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('Error deleting project:', error);
        throw error;
      }

      console.log('Project deleted:', projectId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Success",
        description: "Project deleted successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  return {
    projects,
    isLoading,
    error,
    createProject: createProjectMutation.mutate,
    updateProject: updateProjectMutation.mutate,
    deleteProject: deleteProjectMutation.mutate,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
  };
};
