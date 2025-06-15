import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from '@/types/quoteTypes';
import { useToast } from '@/hooks/use-toast';

export const useQuotes = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchQuotes = async () => {
    try {
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
      
      // Transform the data to match our Quote type
      const transformedQuotes = (data || []).map(quote => ({
        ...quote,
        status: quote.status as Quote['status'],
        client_id: quote.client_id as string | null,
        description: quote.description as string | null,
        valid_until: quote.valid_until as string | null,
        terms_and_conditions: quote.terms_and_conditions as string | null,
        public_link_token: quote.public_link_token as string | null
      }));
      
      setQuotes(transformedQuotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quotes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createQuote = async (quoteData: Partial<Quote>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('quotes')
        .insert({
          title: quoteData.title!,
          description: quoteData.description || null,
          client_id: quoteData.client_id || null,
          valid_until: quoteData.valid_until || null,
          terms_and_conditions: quoteData.terms_and_conditions || null,
          user_id: userData.user.id,
          status: 'draft',
          subtotal: 0,
          gst_rate: 15.00,
          gst_amount: 0,
          total_amount: 0
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote created successfully",
      });

      fetchQuotes();
      return data;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast({
        title: "Error",
        description: "Failed to create quote",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote updated successfully",
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error updating quote:', error);
      toast({
        title: "Error",
        description: "Failed to update quote",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });

      fetchQuotes();
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast({
        title: "Error",
        description: "Failed to delete quote",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    refetch: fetchQuotes,
  };
};
