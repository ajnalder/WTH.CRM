
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { InvoicePayment } from '@/types/invoiceTypes';

export const useInvoicePayments = (invoiceId: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['invoice-payments', invoiceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoice_payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data as InvoicePayment[];
    },
    enabled: !!invoiceId,
  });

  const addPayment = useMutation({
    mutationFn: async (paymentData: Omit<InvoicePayment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('invoice_payments')
        .insert(paymentData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice-payments', invoiceId] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
      console.error('Error recording payment:', error);
    },
  });

  return {
    payments,
    isLoading,
    addPayment: addPayment.mutate,
  };
};
