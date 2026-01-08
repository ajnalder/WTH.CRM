import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { QuoteItem } from '@/types/quote';

export const useQuoteItems = (quoteId: string | undefined) => {
  const { toast } = useToast();

  const itemsData = useConvexQuery(
    api.quoteItems.listByQuote,
    quoteId ? { quoteId } : undefined
  ) as QuoteItem[] | undefined;

  const items = itemsData ?? [];
  const isLoading = itemsData === undefined;

  const addItemMutation = useConvexMutation(api.quoteItems.create);
  const updateItemMutation = useConvexMutation(api.quoteItems.update);
  const deleteItemMutation = useConvexMutation(api.quoteItems.remove);

  const addItem = async (itemData: Omit<QuoteItem, 'id' | 'created_at'>) => {
    try {
      const data = await addItemMutation(itemData);
      return data;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add item', variant: 'destructive' });
      console.error('Error adding item:', error);
      throw error;
    }
  };

  const updateItem = async ({ id, updates }: { id: string; updates: Partial<QuoteItem> }) => {
    try {
      await updateItemMutation({ id, updates });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
      console.error('Error updating item:', error);
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteItemMutation({ id });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      console.error('Error deleting item:', error);
      throw error;
    }
  };

  const total = items.reduce((sum, item) => sum + (item.is_optional ? 0 : item.amount), 0);
  const optionalTotal = items.filter(i => i.is_optional).reduce((sum, item) => sum + item.amount, 0);

  return {
    items,
    isLoading,
    addItem,
    updateItem,
    deleteItem,
    total,
    optionalTotal,
  };
};
