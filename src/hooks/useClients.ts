
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useClientMutations } from './useClientMutations';
import { gradients } from '@/utils/clientGradients';
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

      // Check for clients without gradients and update them with unique colors
      const clientsWithoutGradients = data.filter(client => !client.gradient);
      const clientsWithGradients = data.filter(client => client.gradient);
      
      if (clientsWithoutGradients.length > 0) {
        console.log(`Found ${clientsWithoutGradients.length} clients without gradients, assigning unique gradients...`);
        
        // Get already used gradients
        const usedGradients = clientsWithGradients.map(client => client.gradient);
        
        // Get available gradients (ones not already used)
        const availableGradients = gradients.filter(gradient => !usedGradients.includes(gradient));
        
        // If we need more gradients than available, we'll cycle through all gradients
        const gradientsToUse = availableGradients.length >= clientsWithoutGradients.length 
          ? availableGradients 
          : [...availableGradients, ...gradients];
        
        // Update each client with a unique gradient
        const updatePromises = clientsWithoutGradients.map(async (client, index) => {
          const assignedGradient = gradientsToUse[index % gradientsToUse.length];
          const { error: updateError } = await supabase
            .from('clients')
            .update({ gradient: assignedGradient })
            .eq('id', client.id);
          
          if (updateError) {
            console.error(`Error updating gradient for client ${client.id}:`, updateError);
          } else {
            console.log(`Updated client ${client.company} with gradient: ${assignedGradient}`);
          }
          
          return { ...client, gradient: assignedGradient };
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
