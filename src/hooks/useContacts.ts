
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Contact {
  id: string;
  client_id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateContactData {
  client_id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
}

export interface UpdateContactData {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
}

export const useContacts = (clientId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: contacts = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['contacts', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('client_id', clientId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching contacts:', error);
        throw error;
      }

      return data as Contact[];
    },
    enabled: !!clientId,
  });

  const createContactMutation = useMutation({
    mutationFn: async (contactData: CreateContactData) => {
      const { data, error } = await supabase
        .from('contacts')
        .insert(contactData)
        .select()
        .single();

      if (error) {
        console.error('Error creating contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', clientId] });
      toast({
        title: "Contact Added",
        description: "Contact has been successfully added.",
      });
    },
    onError: (error) => {
      console.error('Create contact error:', error);
      toast({
        title: "Error",
        description: "Failed to create contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, contactData }: { contactId: string; contactData: UpdateContactData }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) {
        console.error('Error updating contact:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', clientId] });
      toast({
        title: "Contact Updated",
        description: "Contact has been successfully updated.",
      });
    },
    onError: (error) => {
      console.error('Update contact error:', error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId);

      if (error) {
        console.error('Error deleting contact:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts', clientId] });
      toast({
        title: "Contact Deleted",
        description: "Contact has been successfully deleted.",
      });
    },
    onError: (error) => {
      console.error('Delete contact error:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    contacts,
    isLoading,
    error,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending
  };
};
