import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { InvoicePayment } from '@/types/invoiceTypes';

export const useInvoicePayments = (invoiceId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const paymentsData = useConvexQuery(
    api.invoicePayments.listByInvoice,
    user && invoiceId ? { invoiceId, userId: user.id } : undefined
  ) as InvoicePayment[] | undefined;

  const payments = paymentsData ?? [];
  const isLoading = paymentsData === undefined;

  const addPaymentMutation = useConvexMutation(api.invoicePayments.create);

  const addPayment = async (paymentData: Omit<InvoicePayment, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');
    try {
      await addPaymentMutation({
        invoiceId,
        userId: user.id,
        amount: paymentData.amount,
        payment_method: paymentData.payment_method,
        payment_date: paymentData.payment_date,
        notes: paymentData.notes,
      });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
      console.error('Error recording payment:', error);
      throw error;
    }
  };

  return {
    payments,
    isLoading,
    addPayment,
  };
};
