import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  // Add computed fields for UI compatibility
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
  const queryClient = useQueryClient();

  const teamMembersQuery = useQuery({
    queryKey: ['team_members', user?.id],
    queryFn: async (): Promise<TeamMember[]> => {
      if (!user) {
        console.log('No authenticated user, returning empty team members array');
        return [];
      }

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) {
        console.error('Error fetching team members (profiles):', error);
        throw error;
      }

      // Transform profiles into team members format for UI compatibility
      const teamMembers: TeamMember[] = (profiles || []).map((profile, index) => {
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

        const initials = profile.full_name 
          ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
          : profile.email.slice(0, 2).toUpperCase();

        return {
          id: profile.id,
          email: profile.email || '',
          full_name: profile.full_name || '',
          avatar_url: profile.avatar_url,
          name: profile.full_name || profile.email || 'Unknown User',
          avatar: initials,
          gradient: gradients[index % gradients.length],
          role: 'Team Member', // Default role for now
          status: 'online', // Default status
          current_task: undefined,
          hours_this_week: 0,
        };
      });

      return teamMembers;
    },
    enabled: !!user,
  });

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
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Only update the profile fields that are actually stored
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedMember.name,
          email: updatedMember.email,
          avatar_url: updatedMember.avatar_url,
        })
        .eq('id', updatedMember.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating team member:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team_members', user?.id] });
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    },
    onError: (error) => {
      console.error('Update team member error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  return {
    teamMembers: teamMembersQuery.data || [],
    isLoading: teamMembersQuery.isLoading,
    error: teamMembersQuery.error,
    refetch: teamMembersQuery.refetch,
    createTeamMember: createTeamMemberMutation.mutate,
    updateTeamMember: updateTeamMemberMutation.mutate,
    isCreating: createTeamMemberMutation.isPending,
    isUpdating: updateTeamMemberMutation.isPending,
  };
};
