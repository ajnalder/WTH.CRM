import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Invoice } from '@/types/invoiceTypes';

export const useInvoices = (clientId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['invoices', clientId],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          clients(company),
          projects(name)
        `)
        .order('created_at', { ascending: false });

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Invoice[];
    },
  });

  const createInvoice = (invoiceData: Partial<Invoice> & { client_id: string; invoice_number: string; title: string }, callbacks?: { onSuccess?: (data: any) => void; onError?: (error: any) => void }) => {
    return new Promise(async (resolve, reject) => {
      try {
        const { data: user } = await supabase.auth.getUser();
        if (!user.user) throw new Error('User not authenticated');

        const invoiceToCreate = {
          ...invoiceData,
          user_id: user.user.id,
        };

        const { data, error } = await supabase
          .from('invoices')
          .insert(invoiceToCreate)
          .select()
          .single();
        
        if (error) throw error;

        queryClient.invalidateQueries({ queryKey: ['invoices'] });
        toast({
          title: "Success",
          description: "Invoice created successfully",
        });
        
        if (callbacks?.onSuccess) callbacks.onSuccess(data);
        resolve(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to create invoice",
          variant: "destructive",
        });
        console.error('Error creating invoice:', error);
        
        if (callbacks?.onError) callbacks.onError(error);
        reject(error);
      }
    });
  };

  const updateInvoice = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Invoice> }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
      console.error('Error updating invoice:', error);
    },
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: "Success",
        description: "Invoice deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
      console.error('Error deleting invoice:', error);
    },
  });

  return {
    invoices,
    isLoading,
    createInvoice,
    updateInvoice: updateInvoice.mutate,
    deleteInvoice: deleteInvoice.mutate,
  };
};
