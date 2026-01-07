
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

export interface TeamMember {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  name: string;
  avatar: string;
  gradient: string;
  role: string;
  status: string;
  current_task?: string;
  hours_this_week: number;
}

export const useTeamMembers = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const teamMembersData = useConvexQuery(
    api.projectTeamMembers.listAllForUser,
    user ? { userId: user.id } : undefined
  );
  const updateProfile = useConvexMutation(api.profiles.updateTeamMember);

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

  const teamMembers: TeamMember[] =
    (teamMembersData || []).map((member, index) => {
      const profile: any = (member as any).profile || {};
      const name = profile.full_name || profile.email || member.user_id;
      const initials =
        (profile.full_name || member.user_id || 'UN')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'UN';

      return {
        id: member.user_id,
        email: profile.email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        name,
        avatar: initials,
        gradient: gradients[index % gradients.length],
        role: profile.role || 'Team Member',
        status: profile.status || 'online',
        current_task: profile.current_task,
        hours_this_week: profile.hours_this_week ?? 0,
      };
    }) || [];

  // For now, createTeamMember is not needed since users are created through auth
  // But we'll keep the interface for compatibility
  const createTeamMemberMutation = useMutation({
    mutationFn: async (memberData: { name: string; role: string; email: string }) => {
      throw new Error('Team members are now managed through user authentication. Please create users through the Supabase dashboard.');
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTeamMemberMutation = useMutation({
    mutationFn: async (updatedMember: TeamMember) => {
      await updateProfile({
        memberUserId: updatedMember.id,
        updates: {
          full_name: updatedMember.name,
          email: updatedMember.email,
          role: updatedMember.role,
          status: updatedMember.status,
          current_task: updatedMember.current_task,
          hours_this_week: updatedMember.hours_this_week,
        },
      });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to update team member.';
      toast({
        title: "Update unavailable",
        description: message,
        variant: "destructive",
      });
    },
  });

  return {
    teamMembers,
    isLoading: teamMembersData === undefined && !!user,
    error: null,
    refetch: () => {},
    createTeamMember: createTeamMemberMutation.mutate,
    updateTeamMember: updateTeamMemberMutation.mutate,
    isCreating: createTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
  };
};
