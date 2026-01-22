
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export interface Client {
  id: string;
  user_id: string;
  company: string;
  phone: string | null;
  description: string | null;
  status: 'active' | 'pending' | 'inactive';
  projects_count: number;
  total_value: number;
  joined_date: string;
  avatar: string | null;
  gradient: string | null;
  created_at: string;
  updated_at: string;
  xero_contact_id: string | null;
  klaviyo_from_email?: string | null;
  klaviyo_from_label?: string | null;
  klaviyo_default_audience_id?: string | null;
  klaviyo_audiences?: { id: string; label?: string }[] | null;
  klaviyo_placed_order_metric_id?: string | null;
}

export interface CreateClientData {
  company: string;
  phone?: string;
  description?: string;
}

export const useClients = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const clientsData = useConvexQuery(
    api.clients.list,
    user ? { userId: user.id } : undefined
  );
  const isLoading = clientsData === undefined;
  const clients = clientsData ?? [];

  useEffect(() => {
    console.log('useClients', { userId: user?.id, count: clients.length, loading: isLoading });
  }, [user?.id, clients.length, isLoading]);

  const createClient = useConvexMutation(api.clients.create);
  const updateClientMutation = useConvexMutation(api.clients.update);
  const deleteClientMutation = useConvexMutation(api.clients.remove);

  const handleCreate = async (clientData: CreateClientData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      console.log('createClient', { userId: user.id, clientData });
      const created = await createClient({
        userId: user.id,
        company: clientData.company,
        phone: clientData.phone?.trim() || undefined,
        description: clientData.description?.trim() || undefined,
      });
      toast({
        title: "Success",
        description: "Client created successfully",
      });
      return created;
    } catch (error: any) {
      console.error('Error creating client:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleUpdate = async ({ id, updates }: { id: string; updates: Partial<Client> }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      // Filter out fields that shouldn't be sent to the backend (id, user_id, timestamps, etc.)
      const { id: _id, user_id, created_at, updated_at, ...cleanUpdates } = updates as any;

      await updateClientMutation({ id, userId: user.id, updates: cleanUpdates });
      toast({
        title: "Success",
        description: "Client updated successfully",
      });
    } catch (error: any) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update client",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteClientMutation({ id, userId: user.id });
      toast({
        title: "Success",
        description: "Client deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting client:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete client",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    clients,
    isLoading,
    createClient: handleCreate,
    updateClient: handleUpdate,
    deleteClient: handleDelete,
  };
};
