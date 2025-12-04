import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuoteItem } from '@/types/quote';

export const useQuoteItems = (quoteId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['quote-items', quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      const { data, error } = await supabase
        .from('quote_items')
        .select('*')
        .eq('quote_id', quoteId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as QuoteItem[];
    },
    enabled: !!quoteId,
  });

  const addItem = useMutation({
    mutationFn: async (itemData: Omit<QuoteItem, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quote_items')
        .insert(itemData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
      console.error('Error adding item:', error);
    },
  });

  const updateItem = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuoteItem> }) => {
      const { data, error } = await supabase
        .from('quote_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      console.error('Error updating item:', error);
    },
  });

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quote_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-items', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      console.error('Error deleting item:', error);
    },
  });

  const total = items.reduce((sum, item) => sum + (item.is_optional ? 0 : item.amount), 0);
  const optionalTotal = items.filter(i => i.is_optional).reduce((sum, item) => sum + item.amount, 0);

  return {
    items,
    isLoading,
    addItem: addItem.mutateAsync,
    updateItem: updateItem.mutate,
    deleteItem: deleteItem.mutate,
    total,
    optionalTotal,
  };
};
