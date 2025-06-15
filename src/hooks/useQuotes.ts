
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Quote } from '@/types/quoteTypes';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseQuote, prepareQuoteForInsert } from '@/utils/quoteTypeHelpers';

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
      
      // Transform the data using our type helpers
      const transformedQuotes = (data || []).map(quote => {
        try {
          return transformSupabaseQuote(quote);
        } catch (transformError) {
          console.error('Error transforming quote:', transformError);
          // Return a safe fallback or skip invalid quotes
          return null;
        }
      }).filter(Boolean) as Quote[];
      
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

      // Prepare data using our helper function
      const insertData = prepareQuoteForInsert(quoteData, userData.user.id);

      const { data, error } = await supabase
        .from('quotes')
        .insert(insertData)
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
        description: error instanceof Error ? error.message : "Failed to create quote",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateQuote = async (id: string, updates: Partial<Quote>) => {
    try {
      // Filter out fields that shouldn't be updated directly
      const { id: _, created_at, updated_at, quote_number, public_link_token, ...safeUpdates } = updates;
      
      const { error } = await supabase
        .from('quotes')
        .update(safeUpdates)
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
