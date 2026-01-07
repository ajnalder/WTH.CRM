import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InvoiceItem } from '@/types/invoiceTypes';

export const useInvoiceItems = (invoiceId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const shouldFetch = Boolean(user && invoiceId);
  const itemsData = useConvexQuery(
    api.invoiceItems.listByInvoice,
    shouldFetch ? { invoiceId: invoiceId!, userId: user!.id } : undefined
  ) as InvoiceItem[] | undefined;

  const items = shouldFetch ? itemsData ?? [] : [];
  const isLoading = shouldFetch ? itemsData === undefined : false;
  const error = null;

  const addItemMutation = useConvexMutation(api.invoiceItems.create);
  const updateItemMutation = useConvexMutation(api.invoiceItems.update);
  const deleteItemMutation = useConvexMutation(api.invoiceItems.remove);

  const addItem = async (itemData: Omit<InvoiceItem, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addItemMutation({
        invoiceId,
        userId: user.id,
        description: itemData.description,
        quantity: itemData.quantity,
        rate: itemData.rate,
        amount: itemData.amount,
      });
      toast({ title: "Success", description: "Item added successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add item", variant: "destructive" });
      throw err;
    }
  };

  const updateItem = async ({ id, updates }: { id: string; updates: Partial<InvoiceItem> }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await updateItemMutation({ id, userId: user.id, updates });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update item", variant: "destructive" });
      throw err;
    }
  };

  const deleteItem = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteItemMutation({ id, userId: user.id });
      toast({ title: "Success", description: "Item deleted successfully" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete item", variant: "destructive" });
      throw err;
    }
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
  };
};
