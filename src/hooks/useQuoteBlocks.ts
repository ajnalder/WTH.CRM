import { useQuery as useConvexQuery, useMutation as useConvexMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useToast } from '@/hooks/use-toast';
import { QuoteBlock } from '@/types/quote';

export const useQuoteBlocks = (quoteId: string | undefined) => {
  const { toast } = useToast();

  const blocksData = useConvexQuery(
    api.quoteBlocks.listByQuote,
    quoteId ? { quoteId } : undefined
  ) as QuoteBlock[] | undefined;

  const blocks = blocksData ?? [];
  const isLoading = blocksData === undefined;

  const addBlockMutation = useConvexMutation(api.quoteBlocks.create);
  const updateBlockMutation = useConvexMutation(api.quoteBlocks.update);
  const deleteBlockMutation = useConvexMutation(api.quoteBlocks.remove);

  const addBlock = async (blockData: Omit<QuoteBlock, 'id' | 'created_at'>) => {
    try {
      const data = await addBlockMutation(blockData);
      return data;
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add block', variant: 'destructive' });
      console.error('Error adding block:', error);
      throw error;
    }
  };

  const updateBlock = async ({ id, updates }: { id: string; updates: Partial<QuoteBlock> }) => {
    try {
      await updateBlockMutation({ id, updates });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update block', variant: 'destructive' });
      console.error('Error updating block:', error);
      throw error;
    }
  };

  const deleteBlock = async (id: string) => {
    try {
      await deleteBlockMutation({ id });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete block', variant: 'destructive' });
      console.error('Error deleting block:', error);
      throw error;
    }
  };

  const reorderBlocks = async (reorderedBlocks: { id: string; order_index: number }[]) => {
    try {
      await Promise.all(
        reorderedBlocks.map(({ id, order_index }) =>
          updateBlockMutation({ id, updates: { order_index } })
        )
      );
    } catch (error) {
      console.error('Error reordering blocks:', error);
      throw error;
    }
  };

  return {
    blocks,
    isLoading,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
  };
};
