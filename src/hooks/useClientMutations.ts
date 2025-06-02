
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getInitials, gradients } from '@/utils/clientGradients';
import type { CreateClientData, Client } from '@/types/clientTypes';

export const useClientMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClientMutation = useMutation({
    mutationFn: async (clientData: CreateClientData) => {
      if (!user) throw new Error('User not authenticated');

      const avatar = getInitials(clientData.company);
      
      // Get existing clients to determine used gradients
      const { data: existingClients } = await supabase
        .from('clients')
        .select('gradient')
        .eq('user_id', user.id);

      const usedGradients = existingClients?.map(client => client.gradient).filter(Boolean) || [];
      
      // Find the first available gradient that's not already used
      let selectedGradient = gradients.find(gradient => !usedGradients.includes(gradient));
      
      // If all gradients are used, cycle through them starting from the beginning
      if (!selectedGradient) {
        selectedGradient = gradients[usedGradients.length % gradients.length];
      }

      const { data, error } = await supabase
        .from('clients')
        .insert({
          name: '',
          email: '',
          phone: clientData.phone,
          company: clientData.company,
          industry: clientData.industry,
          avatar,
          gradient: selectedGradient,
          user_id: user.id,
          status: 'pending',
          projects_count: 0,
          total_value: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating client:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Added",
        description: "Your client has been successfully added. Add contact details in the client detail page.",
      });
    },
    onError: (error) => {
      console.error('Create client error:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateClientMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating client:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Updated",
        description: "Client information has been successfully updated.",
      });
    }
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting client:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({
        title: "Client Deleted",
        description: "Client has been successfully deleted.",
      });
    }
  });

  return {
    createClient: createClientMutation.mutate,
    updateClient: updateClientMutation.mutate,
    deleteClient: deleteClientMutation.mutate,
    isCreating: createClientMutation.isPending,
    isUpdating: updateClientMutation.isPending,
    isDeleting: deleteClientMutation.isPending
  };
};
