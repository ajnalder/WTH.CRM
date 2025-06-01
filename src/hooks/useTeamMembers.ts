
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: string;
  current_task: string | null;
  hours_this_week: number;
  gradient: string;
}

export interface NewTeamMember {
  name: string;
  role: string;
  email: string;
}

export const useTeamMembers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const teamMembersQuery = useQuery({
    queryKey: ['team-members'],
    queryFn: async (): Promise<TeamMember[]> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
        throw error;
      }

      return data || [];
    },
  });

  const createTeamMember = useMutation({
    mutationFn: async (newMember: NewTeamMember) => {
      const gradients = [
        'from-blue-400 to-blue-600',
        'from-pink-400 to-pink-600',
        'from-green-400 to-green-600',
        'from-purple-400 to-purple-600',
        'from-yellow-400 to-yellow-600',
        'from-red-400 to-red-600',
        'from-indigo-400 to-indigo-600',
        'from-teal-400 to-teal-600',
      ];

      const getInitials = (name: string) => {
        return name
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2);
      };

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const currentCount = teamMembersQuery.data?.length || 0;

      const { data, error } = await supabase
        .from('team_members')
        .insert({
          user_id: user.id,
          name: newMember.name,
          role: newMember.role,
          email: newMember.email,
          avatar: getInitials(newMember.name),
          status: 'offline',
          current_task: 'Getting Started',
          hours_this_week: 0,
          gradient: gradients[currentCount % gradients.length],
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating team member:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Success",
        description: "Team member added successfully",
      });
    },
    onError: (error) => {
      console.error('Error creating team member:', error);
      toast({
        title: "Error",
        description: "Failed to add team member",
        variant: "destructive",
      });
    },
  });

  const updateTeamMember = useMutation({
    mutationFn: async (updatedMember: TeamMember) => {
      const { data, error } = await supabase
        .from('team_members')
        .update({
          name: updatedMember.name,
          role: updatedMember.role,
          email: updatedMember.email,
          status: updatedMember.status,
          current_task: updatedMember.current_task,
          hours_this_week: updatedMember.hours_this_week,
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
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
    onError: (error) => {
      console.error('Error updating team member:', error);
      toast({
        title: "Error",
        description: "Failed to update team member",
        variant: "destructive",
      });
    },
  });

  return {
    teamMembers: teamMembersQuery.data || [],
    isLoading: teamMembersQuery.isLoading,
    error: teamMembersQuery.error,
    createTeamMember: createTeamMember.mutate,
    updateTeamMember: updateTeamMember.mutate,
    isCreating: createTeamMember.isPending,
    isUpdating: updateTeamMember.isPending,
  };
};
