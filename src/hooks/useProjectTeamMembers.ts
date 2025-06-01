
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ProjectTeamMember {
  id: string;
  project_id: string;
  team_member_id: string;
  assigned_at: string;
  team_member: {
    id: string;
    name: string;
    role: string;
    email: string;
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
          team_member:team_members(
            id,
            name,
            role,
            email,
            avatar,
            gradient
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching project team members:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!projectId,
  });

  const assignTeamMember = useMutation({
    mutationFn: async ({ projectId, teamMemberId }: { projectId: string; teamMemberId: string }) => {
      const { data, error } = await supabase
        .from('project_team_members')
        .insert({
          project_id: projectId,
          team_member_id: teamMemberId,
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
        .eq('team_member_id', teamMemberId);

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
