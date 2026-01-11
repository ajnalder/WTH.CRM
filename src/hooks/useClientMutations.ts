
import { useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { getInitials, getRandomGradient } from '@/utils/clientGradients';
import type { CreateClientData, Client } from '@/types/clientTypes';
import { useState } from 'react';

export const useClientMutations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createClientMutation = useConvexMutation(api.clients.create);
  const updateClientMutation = useConvexMutation(api.clients.update);
  const deleteClientMutation = useConvexMutation(api.clients.remove);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createClient = async (clientData: CreateClientData) => {
    if (!user) throw new Error('User not authenticated');

    // Enhanced avatar generation - handle single word names
    const companyName = clientData.company.trim();
    const words = companyName.split(/\s+/);
    const avatar = getInitials(companyName);

    const selectedGradient = getRandomGradient();

    try {
      setIsCreating(true);
      await createClientMutation({
        userId: user.id,
        phone: clientData.phone,
        company: clientData.company,
        description: clientData.description,
        status: 'pending',
        // Optional fields not in Convex function args are ignored
        avatar,
        gradient: selectedGradient,
      } as any);

      toast({
        title: "Client Added",
        description: "Your client has been successfully added. Add contact details in the client detail page.",
      });
    } catch (error) {
      console.error('Create client error:', error);
      toast({
        title: "Error",
        description: "Failed to create client. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateClient = async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsUpdating(true);
      await updateClientMutation({ id, userId: user.id, updates });
      toast({
        title: "Client Updated",
        description: "Client information has been successfully updated.",
      });
    } catch (error) {
      console.error('Update client error:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteClient = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsDeleting(true);
      await deleteClientMutation({ id, userId: user.id });
      toast({
        title: "Client Deleted",
        description: "Client has been successfully deleted.",
      });
    } catch (error) {
      console.error('Delete client error:', error);
      toast({
        title: "Error",
        description: "Failed to delete client. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    createClient,
    updateClient,
    deleteClient,
    isCreating,
    isUpdating,
    isDeleting
  };
};
