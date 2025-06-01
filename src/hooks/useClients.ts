
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientMutations } from './useClientMutations';
import { getRandomGradient } from '@/utils/clientGradients';
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

      // Check for clients without gradients and update them
      const clientsWithoutGradients = data.filter(client => !client.gradient);
      
      if (clientsWithoutGradients.length > 0) {
        console.log(`Found ${clientsWithoutGradients.length} clients without gradients, assigning random gradients...`);
        
        // Update each client with a random gradient
        const updatePromises = clientsWithoutGradients.map(async (client) => {
          const randomGradient = getRandomGradient();
          const { error: updateError } = await supabase
            .from('clients')
            .update({ gradient: randomGradient })
            .eq('id', client.id);
          
          if (updateError) {
            console.error(`Error updating gradient for client ${client.id}:`, updateError);
          } else {
            console.log(`Updated client ${client.company} with gradient: ${randomGradient}`);
          }
          
          return { ...client, gradient: randomGradient };
        });
        
        await Promise.all(updatePromises);
        
        // Return the updated data with gradients
        return data.map(client => {
          if (!client.gradient) {
            const updatedClient = clientsWithoutGradients.find(c => c.id === client.id);
            return updatedClient || client;
          }
          return client;
        }) as Client[];
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
