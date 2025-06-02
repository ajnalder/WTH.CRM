
import React from 'react';
import { Button } from '@/components/ui/button';
import { useChecklists } from '@/hooks/useChecklists';
import { shopifyChecklistItems } from '@/utils/shopifyChecklist';
import { RefreshCw } from 'lucide-react';

export const UpdateTemplateButton: React.FC = () => {
  const { updateTemplate, isUpdatingTemplate } = useChecklists();

  const handleUpdateShopifyTemplate = () => {
    updateTemplate({
      name: 'Shopify',
      items: shopifyChecklistItems
    });
  };

  return (
    <Button
      onClick={handleUpdateShopifyTemplate}
      disabled={isUpdatingTemplate}
      variant="outline"
      size="sm"
    >
      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdatingTemplate ? 'animate-spin' : ''}`} />
      Update Shopify Template
    </Button>
  );
};
