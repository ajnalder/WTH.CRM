
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  user_id: string;
  assigned_at: string;
  user: {
    id: string;
    full_name: string;
    email: string;
    avatar_url?: string;
    // Computed fields for UI compatibility
    name: string;
    role: string;
    avatar: string;
    gradient: string;
  };
}

export const useProjectTeamMembers = (projectId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const projectTeamMembersQuery = useQuery({
    queryKey: ['project-team-members', projectId],
    queryFn: async (): Promise<ProjectTeamMember[]> => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('project_team_members')
        .select(`
          *,
          user:profiles(
            id,
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project team members:', error);
        throw error;
      }

      // Transform the data to match the expected interface
      const transformedData: ProjectTeamMember[] = (data || []).map((ptm, index) => {
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

        const user = ptm.user as any;
        const name = user?.full_name || user?.email || 'Unknown User';
        const initials = user?.full_name 
          ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          : (user?.email || 'UN').slice(0, 2).toUpperCase();

        return {
          id: ptm.id,
          project_id: ptm.project_id,
          user_id: ptm.user_id,
          assigned_at: ptm.assigned_at,
          user: {
            id: user?.id || '',
            full_name: user?.full_name || '',
            email: user?.email || '',
            avatar_url: user?.avatar_url,
            name,
            role: 'Team Member',
            avatar: initials,
            gradient: gradients[index % gradients.length],
          },
        };
      });

      return transformedData;
    },
    enabled: !!projectId,
  });

  const assignTeamMember = useMutation({
    mutationFn: async ({ projectId, teamMemberId }: { projectId: string; teamMemberId: string }) => {
      const { data, error } = await supabase
        .from('project_team_members')
        .insert({
          project_id: projectId,
          user_id: teamMemberId,
        })
        .select()
        .single();

      if (error) {
        console.error('Error assigning team member:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team-members'] });
      toast({
        title: "Success",
        description: "Team member assigned to project",
      });
    },
    onError: (error) => {
      console.error('Error assigning team member:', error);
      toast({
        title: "Error",
        description: "Failed to assign team member",
        variant: "destructive",
      });
    },
  });

  const removeTeamMember = useMutation({
    mutationFn: async ({ projectId, teamMemberId }: { projectId: string; teamMemberId: string }) => {
      const { error } = await supabase
        .from('project_team_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', teamMemberId);

      if (error) {
        console.error('Error removing team member:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-team-members'] });
      toast({
        title: "Success",
        description: "Team member removed from project",
      });
    },
    onError: (error) => {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
        variant: "destructive",
      });
    },
  });

  return {
    projectTeamMembers: projectTeamMembersQuery.data || [],
    isLoading: projectTeamMembersQuery.isLoading,
    error: projectTeamMembersQuery.error,
    assignTeamMember: assignTeamMember.mutate,
    removeTeamMember: removeTeamMember.mutate,
    isAssigning: assignTeamMember.isPending,
    isRemoving: removeTeamMember.isPending,
  };
};
