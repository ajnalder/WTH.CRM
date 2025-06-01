
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Domain {
  id: string;
  client_id: string;
  name: string;
  registrar: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending';
  renewal_cost: number;
  created_at: string;
  updated_at: string;
}

export interface CreateDomainData {
  client_id: string;
  name: string;
  registrar: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending';
  renewal_cost: number;
}

export const useDomains = (clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: domains = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['domains', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('domains')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching domains:', error);
        throw error;
      }

      return data as Domain[];
    },
    enabled: !!clientId,
  });

  const createDomainMutation = useMutation({
    mutationFn: async (domainData: CreateDomainData) => {
      const { data, error } = await supabase
        .from('domains')
        .insert(domainData)
        .select()
        .single();

      if (error) {
        console.error('Error creating domain:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', clientId] });
      toast({
        title: "Domain Added",
        description: "Domain has been successfully added.",
      });
    },
    onError: (error) => {
      console.error('Create domain error:', error);
      toast({
        title: "Error",
        description: "Failed to create domain. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const { error } = await supabase
        .from('domains')
        .delete()
        .eq('id', domainId);

      if (error) {
        console.error('Error deleting domain:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains', clientId] });
      toast({
        title: "Domain Deleted",
        description: "Domain has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete domain error:', error);
      toast({
        title: "Error",
        description: "Failed to delete domain. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    domains,
    isLoading,
    error,
    createDomain: createDomainMutation.mutate,
    deleteDomain: deleteDomainMutation.mutate,
    isCreating: createDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending
  };
};
