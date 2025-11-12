
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface Domain {
  id: string;
  client_id: string;
  name: string;
  registrar: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'pending';
  renewal_cost: number;
  client_managed: boolean;
  notes?: string;
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
  client_managed: boolean;
  notes?: string;
}

export const useDomains = (clientId: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: domains = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['domains', clientId, user?.id],
    queryFn: async () => {
      if (!user || !clientId) {
        console.log('No authenticated user or client ID, returning empty domains array');
        return [];
      }

      // First verify the client belongs to the user
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', clientId)
        .eq('user_id', user.id)
        .single();

      if (clientError || !client) {
        console.error('Client not found or access denied:', clientError);
        throw new Error('Client not found or access denied');
      }

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
    enabled: !!clientId && !!user,
  });

  const createDomainMutation = useMutation({
    mutationFn: async (domainData: CreateDomainData) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Input validation
      if (!domainData.name || domainData.name.trim().length === 0) {
        throw new Error('Domain name is required');
      }

      if (domainData.name.length > 255) {
        throw new Error('Domain name must be less than 255 characters');
      }

      if (!domainData.registrar || domainData.registrar.trim().length === 0) {
        throw new Error('Registrar is required');
      }

      if (domainData.registrar.length > 100) {
        throw new Error('Registrar name must be less than 100 characters');
      }

      if (!domainData.expiry_date) {
        throw new Error('Expiry date is required');
      }

      if (domainData.renewal_cost < 0) {
        throw new Error('Renewal cost cannot be negative');
      }

      if (domainData.renewal_cost > 999999.99) {
        throw new Error('Renewal cost is too high');
      }

      // Verify the client belongs to the user
      const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('id')
        .eq('id', domainData.client_id)
        .eq('user_id', user.id)
        .single();

      if (clientError || !client) {
        throw new Error('Client not found or access denied');
      }

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
      queryClient.invalidateQueries({ queryKey: ['domains', clientId, user?.id] });
      toast({
        title: "Domain Added",
        description: "Domain has been successfully added.",
      });
    },
    onError: (error) => {
      console.error('Create domain error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create domain. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Verify the domain belongs to a client owned by the user
      const { data: domain, error: domainError } = await supabase
        .from('domains')
        .select(`
          id,
          clients!inner (
            user_id
          )
        `)
        .eq('id', domainId)
        .single();

      if (domainError || !domain || (domain.clients as any)?.user_id !== user.id) {
        throw new Error('Domain not found or access denied');
      }

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
      queryClient.invalidateQueries({ queryKey: ['domains', clientId, user?.id] });
      toast({
        title: "Domain Deleted",
        description: "Domain has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete domain error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete domain. Please try again.",
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
