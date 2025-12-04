import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { QuoteBlock } from '@/types/quote';

export const useQuoteBlocks = (quoteId: string | undefined) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['quote-blocks', quoteId],
    queryFn: async () => {
      if (!quoteId) return [];
      const { data, error } = await supabase
        .from('quote_blocks')
        .select('*')
        .eq('quote_id', quoteId)
        .order('order_index', { ascending: true });
      if (error) throw error;
      return data as QuoteBlock[];
    },
    enabled: !!quoteId,
  });

  const addBlock = useMutation({
    mutationFn: async (blockData: Omit<QuoteBlock, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('quote_blocks')
        .insert(blockData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-blocks', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to add block', variant: 'destructive' });
      console.error('Error adding block:', error);
    },
  });

  const updateBlock = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<QuoteBlock> }) => {
      const { data, error } = await supabase
        .from('quote_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-blocks', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to update block', variant: 'destructive' });
      console.error('Error updating block:', error);
    },
  });

  const deleteBlock = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('quote_blocks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-blocks', quoteId] });
    },
    onError: (error) => {
      toast({ title: 'Error', description: 'Failed to delete block', variant: 'destructive' });
      console.error('Error deleting block:', error);
    },
  });

  const reorderBlocks = useMutation({
    mutationFn: async (reorderedBlocks: { id: string; order_index: number }[]) => {
      const updates = reorderedBlocks.map(({ id, order_index }) =>
        supabase.from('quote_blocks').update({ order_index }).eq('id', id)
      );
      await Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-blocks', quoteId] });
    },
  });

  return {
    blocks,
    isLoading,
    addBlock: addBlock.mutateAsync,
    updateBlock: updateBlock.mutate,
    deleteBlock: deleteBlock.mutate,
    reorderBlocks: reorderBlocks.mutate,
  };
};
