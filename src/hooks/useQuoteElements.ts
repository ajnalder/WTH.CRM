
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuoteElement } from '@/types/quoteTypes';
import { useToast } from '@/hooks/use-toast';
import { transformSupabaseQuoteElement } from '@/utils/quoteTypeHelpers';
import { QuoteElementInsertData } from '@/types/supabaseQuoteTypes';

export const useQuoteElements = (quoteId: string | null) => {
  const [elements, setElements] = useState<QuoteElement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchElements = async () => {
    if (!quoteId) {
      setElements([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quote_elements')
        .select('*')
        .eq('quote_id', quoteId)
        .order('position_order', { ascending: true });

      if (error) throw error;
      
      // Transform the data using our type helpers
      const transformedElements = (data || []).map(element => {
        try {
          return transformSupabaseQuoteElement(element);
        } catch (transformError) {
          console.error('Error transforming quote element:', transformError);
          return null;
        }
      }).filter(Boolean) as QuoteElement[];
      
      setElements(transformedElements);
    } catch (error) {
      console.error('Error fetching quote elements:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quote elements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createElement = async (elementData: Partial<QuoteElement>) => {
    if (!quoteId) return;

    try {
      const maxOrder = elements.length > 0 ? Math.max(...elements.map(e => e.position_order)) : -1;
      
      const insertData: QuoteElementInsertData = {
        quote_id: quoteId,
        element_type: elementData.element_type!,
        content: elementData.content || {},
        position_order: maxOrder + 1
      };

      const { data, error } = await supabase
        .from('quote_elements')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      fetchElements();
      return data;
    } catch (error) {
      console.error('Error creating quote element:', error);
      toast({
        title: "Error",
        description: "Failed to create quote element",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateElement = async (id: string, updates: Partial<QuoteElement>) => {
    try {
      // Filter out fields that shouldn't be updated directly
      const { id: _, created_at, updated_at, ...safeUpdates } = updates;
      
      const { error } = await supabase
        .from('quote_elements')
        .update(safeUpdates)
        .eq('id', id);

      if (error) throw error;
      fetchElements();
    } catch (error) {
      console.error('Error updating quote element:', error);
      toast({
        title: "Error",
        description: "Failed to update quote element",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteElement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('quote_elements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchElements();
    } catch (error) {
      console.error('Error deleting quote element:', error);
      toast({
        title: "Error",
        description: "Failed to delete quote element",
        variant: "destructive",
      });
      throw error;
    }
  };

  const reorderElements = async (newOrder: QuoteElement[]) => {
    try {
      const updates = newOrder.map((element, index) => ({
        id: element.id,
        position_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('quote_elements')
          .update({ position_order: update.position_order })
          .eq('id', update.id);
      }

      fetchElements();
    } catch (error) {
      console.error('Error reordering quote elements:', error);
      toast({
        title: "Error",
        description: "Failed to reorder quote elements",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchElements();
  }, [quoteId]);

  return {
    elements,
    isLoading,
    createElement,
    updateElement,
    deleteElement,
    reorderElements,
    refetch: fetchElements,
  };
};
