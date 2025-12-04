import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Quote } from '@/types/quote';

export const useQuotes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: quotes = [], isLoading } = useQuery({
    queryKey: ['quotes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            id,
            company
          )
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Quote[];
    },
  });

  const generateNextQuoteNumber = async (): Promise<string> => {
    const { data } = await supabase
      .from('quotes')
      .select('quote_number')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (data && data.length > 0) {
      const lastNumber = parseInt(data[0].quote_number.replace('QUO-', ''), 10);
      return `QUO-${String(lastNumber + 1).padStart(4, '0')}`;
    }
    return 'QUO-0001';
  };

  const createQuote = useMutation({
    mutationFn: async (quoteData: {
      client_id: string;
      title: string;
      project_type?: string;
      valid_until?: string;
      deposit_percentage?: number;
      total_amount?: number;
      contact_name?: string;
      contact_email?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the user's profile to store creator name
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', user.id)
        .single();

      const quoteNumber = await generateNextQuoteNumber();
      
      const { data, error } = await supabase
        .from('quotes')
        .insert({
          client_id: quoteData.client_id,
          title: quoteData.title,
          project_type: quoteData.project_type,
          valid_until: quoteData.valid_until,
          deposit_percentage: quoteData.deposit_percentage ?? 50,
          total_amount: quoteData.total_amount ?? 0,
          user_id: user.id,
          quote_number: quoteNumber,
          creator_name: profile?.full_name || null,
          contact_name: quoteData.contact_name,
          contact_email: quoteData.contact_email,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Success', description: 'Quote created successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to create quote', variant: 'destructive' });
      console.error('Error creating quote:', error);
    },
  });

  const updateQuote = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Quote> }) => {
      const { data, error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update quote', variant: 'destructive' });
      console.error('Error updating quote:', error);
    },
  });

  const deleteQuote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quotes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast({ title: 'Success', description: 'Quote deleted successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete quote', variant: 'destructive' });
      console.error('Error deleting quote:', error);
    },
  });

  return {
    quotes,
    isLoading,
    createQuote: createQuote.mutateAsync,
    updateQuote: updateQuote.mutate,
    deleteQuote: deleteQuote.mutate,
    generateNextQuoteNumber,
  };
};

export const useQuote = (quoteId: string | undefined) => {
  return useQuery({
    queryKey: ['quote', quoteId],
    queryFn: async () => {
      if (!quoteId) return null;
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            id,
            company
          )
        `)
        .eq('id', quoteId)
        .single();
      if (error) throw error;
      return data as Quote;
    },
    enabled: !!quoteId,
  });
};

export const useQuoteByToken = (token: string | undefined) => {
  return useQuery({
    queryKey: ['quote-public', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          clients (
            id,
            company
          )
        `)
        .eq('public_token', token)
        .single();
      if (error) throw error;
      return data as Quote;
    },
    enabled: !!token,
  });
};
