
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientMutations } from './useClientMutations';
import type { Client } from '@/types/clientTypes';

export const useClients = () => {
  const { user } = useAuth();
  const mutations = useClientMutations();

  const {
    data: clients = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }

      return data as Client[];
    },
    enabled: !!user,
  });

  return {
    clients,
    isLoading,
    error,
    ...mutations
  };
};

// Re-export types for convenience
export type { Client, CreateClientData } from '@/types/clientTypes';
