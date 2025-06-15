
import React, { useEffect } from 'react';
import { QuoteElement, LineItemContent } from '@/types/quoteTypes';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Trash2 } from 'lucide-react';

interface InvestmentBreakdownProps {
  elements: QuoteElement[];
  onUpdateElement: (elementId: string, content: any) => void;
  onRemoveElement: (elementId: string) => void;
  onTotalChange: (total: number) => void;
  isEditable?: boolean;
}

export const InvestmentBreakdown: React.FC<InvestmentBreakdownProps> = ({
  elements,
  onUpdateElement,
  onRemoveElement,
  onTotalChange,
  isEditable = true
}) => {
  const lineItems = elements.filter(el => el.element_type === 'line_item');

  const calculateTotal = () => {
    return lineItems.reduce((total, item) => {
      const content = item.content as LineItemContent;
      return total + (content.amount || 0);
    }, 0);
  };

  const total = calculateTotal();

  useEffect(() => {
    onTotalChange(total);
  }, [total, onTotalChange]);

  const handleItemUpdate = (elementId: string, field: keyof LineItemContent, value: any) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const content = element.content as LineItemContent;
    const updatedContent = { ...content, [field]: value };

    // Auto-calculate amount when quantity or rate changes
    if (field === 'quantity' || field === 'rate') {
      updatedContent.amount = updatedContent.quantity * updatedContent.rate;
    }

    onUpdateElement(elementId, updatedContent);
  };

  if (lineItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-blue-600">Investment Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">No line items added yet. Add some line items to see the investment breakdown.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-blue-600">Investment Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {lineItems.map((item) => {
          const content = item.content as LineItemContent;
          return (
            <div key={item.id} className="border-b border-gray-200 pb-4 last:border-b-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  {isEditable ? (
                    <Textarea
                      value={content.description}
                      onChange={(e) => handleItemUpdate(item.id, 'description', e.target.value)}
                      placeholder="Service description"
                      className="border-none p-0 text-base font-medium resize-none"
                      rows={1}
                    />
                  ) : (
                    <h3 className="text-base font-medium">{content.description}</h3>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    ${(content.amount || 0).toLocaleString()}
                  </div>
                  {isEditable && (
                    <div className="flex gap-2 mt-2 text-sm">
                      <Input
                        type="number"
                        value={content.quantity}
                        onChange={(e) => handleItemUpdate(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        placeholder="Qty"
                        className="w-16 h-8"
                        min="0"
                        step="0.01"
                      />
                      <span className="self-center">×</span>
                      <Input
                        type="number"
                        value={content.rate}
                        onChange={(e) => handleItemUpdate(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="Rate"
                        className="w-24 h-8"
                        min="0"
                        step="0.01"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveElement(item.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="border-t border-gray-300 pt-4 mt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">Total Investment</h3>
            <div className="text-3xl font-bold text-blue-600">
              ${total.toLocaleString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
