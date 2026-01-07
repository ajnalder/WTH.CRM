
import { useToast } from '@/hooks/use-toast';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';

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
  const { user } = useAuth();

  const projectTeamMembersData = useConvexQuery(
    api.projectTeamMembers.listByProject,
    user && projectId ? { projectId, userId: user.id } : undefined
  );

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

  const projectTeamMembers: ProjectTeamMember[] =
    (projectTeamMembersData || []).map((ptm, index) => {
      const profile: any = (ptm as any).profile || {};
      const name = profile.full_name || profile.email || ptm.user_id;
      const initials = name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

      return {
        id: ptm.id,
        project_id: ptm.project_id,
        user_id: ptm.user_id,
        assigned_at: ptm.assigned_at,
        user: {
          id: ptm.user_id,
          full_name: profile.full_name || '',
          email: profile.email || '',
          avatar_url: profile.avatar_url,
          name,
          role: 'Team Member',
          avatar: initials || ptm.user_id.slice(0, 2).toUpperCase(),
          gradient: gradients[index % gradients.length],
        },
      };
    }) || [];

  const assignTeamMember = useConvexMutation(api.projectTeamMembers.add);
  const removeTeamMember = useConvexMutation(api.projectTeamMembers.remove);

  return {
    projectTeamMembers,
    isLoading: projectTeamMembersData === undefined && !!projectId,
    error: null,
    assignTeamMember: async ({ projectId, teamMemberId }: { projectId: string; teamMemberId: string }) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await assignTeamMember({ projectId, memberUserId: teamMemberId, userId: user.id });
        toast({
          title: "Success",
          description: "Team member assigned to project",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to assign team member",
          variant: "destructive",
        });
        throw error;
      }
    },
    removeTeamMember: async ({ projectId, teamMemberId }: { projectId: string; teamMemberId: string }) => {
      if (!user) throw new Error('User not authenticated');
      try {
        await removeTeamMember({ projectId, memberUserId: teamMemberId, userId: user.id });
        toast({
          title: "Success",
          description: "Team member removed from project",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message || "Failed to remove team member",
          variant: "destructive",
        });
        throw error;
      }
    },
    isAssigning: assignTeamMember.isPending,
    isRemoving: removeTeamMember.isPending,
  };
};
