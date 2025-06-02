
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvoiceItem } from '@/types/invoiceTypes';

export const useInvoiceItems = (invoiceId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['invoice-items', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as InvoiceItem[];
    },
    enabled: !!invoiceId,
  });

  const addItem = useMutation({
    mutationFn: async (itemData: Omit<InvoiceItem, 'id' | 'created_at'>) => {
      console.log('Mutation: Adding item to database', itemData);
      const { data, error } = await supabase
        .from('invoice_items')
        .insert(itemData)
        .select()
        .single();
      if (error) {
        console.error('Database error adding item:', error);
        throw error;
      }
      console.log('Successfully added item to database:', data);
      return data;
    },
    onSuccess: (data) => {
      console.log('Add item mutation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['invoice-items', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Item added successfully",
      });
    },
    onError: (error) => {
      console.error('Add item mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to add item",
        variant: "destructive",
      });
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<InvoiceItem> }) => {
      console.log('Mutation: Updating item', { id, updates });
      const { data, error } = await supabase
        .from('invoice_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('Database error updating item:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error) => {
      console.error('Update item mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      });
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      console.log('Mutation: Deleting item', id);
      const { error } = await supabase
        .from('invoice_items')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('Database error deleting item:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-items', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: (error) => {
      console.error('Delete item mutation failed:', error);
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  return {
    items,
    isLoading,
    addItem: addItem.mutateAsync,
    updateItem: updateItem.mutateAsync,
    deleteItem: deleteItem.mutateAsync,
  };
};
