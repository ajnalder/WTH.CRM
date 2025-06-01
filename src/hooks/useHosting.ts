
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HostingInfo {
  id: string;
  client_id: string;
  provider: string;
  plan: string;
  platform: string;
  renewal_date: string;
  login_url: string | null;
  notes: string | null;
  renewal_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateHostingData {
  client_id: string;
  provider: string;
  plan: string;
  platform: string;
  renewal_date: string;
  login_url?: string;
  notes?: string;
  renewal_cost: number;
}

export const useHosting = (clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: hosting = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['hosting', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hosting')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hosting:', error);
        throw error;
      }

      return data as HostingInfo[];
    },
    enabled: !!clientId,
  });

  const createHostingMutation = useMutation({
    mutationFn: async (hostingData: CreateHostingData) => {
      const { data, error } = await supabase
        .from('hosting')
        .insert(hostingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating hosting:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosting', clientId] });
      toast({
        title: "Hosting Added",
        description: "Hosting information has been successfully added.",
      });
    },
    onError: (error) => {
      console.error('Create hosting error:', error);
      toast({
        title: "Error",
        description: "Failed to create hosting information. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteHostingMutation = useMutation({
    mutationFn: async (hostingId: string) => {
      const { error } = await supabase
        .from('hosting')
        .delete()
        .eq('id', hostingId);

      if (error) {
        console.error('Error deleting hosting:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hosting', clientId] });
      toast({
        title: "Hosting Deleted",
        description: "Hosting information has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete hosting error:', error);
      toast({
        title: "Error",
        description: "Failed to delete hosting information. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    hosting,
    isLoading,
    error,
    createHosting: createHostingMutation.mutate,
    deleteHosting: deleteHostingMutation.mutate,
    isCreating: createHostingMutation.isPending,
    isDeleting: deleteHostingMutation.isPending
  };
};
