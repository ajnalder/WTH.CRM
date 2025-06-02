
import { supabase } from '@/integrations/supabase/client';
import { shopifyChecklistItems } from './shopifyChecklist';

export const updateShopifyChecklistTemplate = async () => {
  try {
    const { error } = await supabase
      .from('checklist_templates')
      .update({
        items: shopifyChecklistItems,
        updated_at: new Date().toISOString()
      })
      .eq('name', 'Shopify');

    if (error) {
      console.error('Error updating Shopify checklist template:', error);
      throw error;
    }

    console.log('Shopify checklist template updated successfully');
  } catch (error) {
    console.error('Failed to update Shopify checklist template:', error);
    throw error;
  }
};
