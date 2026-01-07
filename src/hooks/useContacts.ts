
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';

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
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const contactsData = useConvexQuery(
    api.contacts.list,
    user && clientId ? { clientId, userId: user.id } : undefined
  ) as Contact[] | undefined;
  const contacts = contactsData ?? [];
  const isLoading = contactsData === undefined;
  const error = null;

  const createContactMutation = useConvexMutation(api.contacts.create);
  const updateContactMutation = useConvexMutation(api.contacts.update);
  const deleteContactMutation = useConvexMutation(api.contacts.remove);

  const createContact = async (contactData: CreateContactData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsCreating(true);
      await createContactMutation({ ...contactData, userId: user.id });
      toast({
        title: "Contact Added",
        description: "Contact has been successfully added.",
      });
    } catch (error: any) {
      console.error('Create contact error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to create contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateContact = async ({ contactId, contactData }: { contactId: string; contactData: UpdateContactData }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsUpdating(true);
      await updateContactMutation({ id: contactId, userId: user.id, updates: contactData });
      toast({
        title: "Contact Updated",
        description: "Contact has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Update contact error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to update contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      setIsDeleting(true);
      await deleteContactMutation({ id: contactId, userId: user.id });
      toast({
        title: "Contact Deleted",
        description: "Contact has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Delete contact error:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    contacts,
    isLoading,
    error,
    createContact,
    updateContact,
    deleteContact,
    isCreating,
    isUpdating,
    isDeleting
  };
};
