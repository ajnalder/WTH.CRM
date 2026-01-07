import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoiceTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';

export const useInvoices = (clientId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const invoicesData = useConvexQuery(
    api.invoices.list,
    user ? { userId: user.id, clientId } : undefined
  );
  const invoices = invoicesData ?? [];
  const isLoading = invoicesData === undefined;

  const createInvoiceMutation = useConvexMutation(api.invoices.create);
  const updateInvoiceMutation = useConvexMutation(api.invoices.update);
  const deleteInvoiceMutation = useConvexMutation(api.invoices.remove);

  const createInvoice = (invoiceData: Partial<Invoice> & { client_id: string; invoice_number: string; title: string }, callbacks?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!user) throw new Error('User not authenticated');

        const invoiceToCreate = {
          ...invoiceData,
          userId: user.id,
          subtotal: invoiceData.subtotal ?? 0,
          gst_rate: invoiceData.gst_rate ?? 0,
          gst_amount: invoiceData.gst_amount ?? 0,
          subtotal_incl_gst: invoiceData.subtotal_incl_gst ?? invoiceData.subtotal ?? 0,
          total_amount: invoiceData.total_amount ?? 0,
          deposit_percentage: invoiceData.deposit_percentage ?? 0,
          deposit_amount: invoiceData.deposit_amount ?? 0,
          balance_due: invoiceData.balance_due ?? invoiceData.total_amount ?? 0,
          status: invoiceData.status ?? 'draft',
        };

        const data = await createInvoiceMutation(invoiceToCreate);

        toast({
          title: "Success",
          description: "Invoice created successfully",
        });

        callbacks?.onSuccess?.(data);
        resolve(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create invoice",
          variant: "destructive",
        });
        console.error('Error creating invoice:', error);

        callbacks?.onError?.(error);
        reject(error);
      }
    });
  };

  const updateInvoice = async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const data = await updateInvoiceMutation({
        id,
        userId: user.id,
        updates,
      });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
      console.error('Error updating invoice:', error);
      throw error;
    }
  };

  const deleteInvoice = async (id: string) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await deleteInvoiceMutation({ id, userId: user.id });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      console.error('Error deleting invoice:', error);
      throw error;
    }
  };

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice,
    deleteInvoice,
  };
};
