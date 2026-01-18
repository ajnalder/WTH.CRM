import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Quote } from '@/types/quote';
import { useState } from 'react';

export const useQuotes = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const quotesData = useConvexQuery(
    api.quotes.list,
    user ? { userId: user.id } : undefined
  ) as Quote[] | undefined;

  const quotes = quotesData ?? [];
  const isLoading = quotesData === undefined;

  const createQuoteMutation = useConvexMutation(api.quotes.create);
  const updateQuoteMutation = useConvexMutation(api.quotes.update);
  const deleteQuoteMutation = useConvexMutation(api.quotes.remove);

  const generateNextQuoteNumber = async (): Promise<string> => {
    if (quotes.length === 0) {
      return 'QUO-0001';
    }

    const numbers = quotes
      .map((q) => parseInt(q.quote_number.replace('QUO-', ''), 10))
      .filter((n) => !isNaN(n));

    if (numbers.length === 0) {
      return 'QUO-0001';
    }

    const lastNumber = Math.max(...numbers);
    return `QUO-${String(lastNumber + 1).padStart(4, '0')}`;
  };

  const createQuote = async (quoteData: {
    client_id: string;
    title: string;
    project_type?: string;
    valid_until?: string;
    deposit_percentage?: number;
    total_amount?: number;
    contact_name?: string;
    contact_email?: string;
    tone?: string;
    ai_transcript?: string;
  }) => {
    if (!user) throw new Error('Not authenticated');

    try {
      setIsCreating(true);
      const data = await createQuoteMutation({
        userId: user.id,
        client_id: quoteData.client_id,
        title: quoteData.title,
        project_type: quoteData.project_type,
        creator_name: user.fullName ?? undefined,
        tone: quoteData.tone,
        ai_transcript: quoteData.ai_transcript,
        valid_until: quoteData.valid_until,
        deposit_percentage: quoteData.deposit_percentage,
        total_amount: quoteData.total_amount,
        contact_name: quoteData.contact_name,
        contact_email: quoteData.contact_email,
      });
      toast({ title: 'Success', description: 'Quote created successfully' });
      return data;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to create quote', variant: 'destructive' });
      console.error('Error creating quote:', error);
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateQuote = async ({ id, updates }: { id: string; updates: Partial<Quote> }) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await updateQuoteMutation({ id, userId: user.id, updates });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update quote', variant: 'destructive' });
      console.error('Error updating quote:', error);
      throw error;
    }
  };

  const deleteQuote = async (id: string) => {
    if (!user) throw new Error('Not authenticated');

    try {
      await deleteQuoteMutation({ id, userId: user.id });
      toast({ title: 'Success', description: 'Quote deleted successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete quote', variant: 'destructive' });
      console.error('Error deleting quote:', error);
      throw error;
    }
  };

  return {
    quotes,
    isLoading,
    createQuote,
    updateQuote,
    deleteQuote,
    generateNextQuoteNumber,
  };
};

export const useQuote = (quoteId: string | undefined) => {
  const { user } = useAuth();

  const quoteData = useConvexQuery(
    api.quotes.getById,
    quoteId && user ? { id: quoteId, userId: user.id } : undefined
  );

  return {
    data: quoteData ?? null,
    isLoading: quoteData === undefined,
  };
};

export const useQuoteByToken = (token: string | undefined) => {
  const quoteData = useConvexQuery(
    api.quotes.getByToken,
    token ? { token } : undefined
  );

  const refetch = () => {
    // Convex auto-refetches, but we can return a function for compatibility
    return Promise.resolve();
  };

  return {
    data: quoteData ?? null,
    isLoading: quoteData === undefined,
    refetch,
  };
};
