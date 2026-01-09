
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { InvoiceItem } from '@/types/invoiceTypes';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { InvoiceTotals } from './InvoiceTotals';
import { useMutation } from 'convex/react';
import { api } from '@/integrations/convex/api';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceItemsManagerProps {
  invoiceId: string;
  onItemsChange?: () => void;
}

export const InvoiceItemsManager: React.FC<InvoiceItemsManagerProps> = ({
  invoiceId,
  onItemsChange
}) => {
  const { user } = useAuth();
  const { items, isLoading, addItem, updateItem, deleteItem } = useInvoiceItems(invoiceId);
  const recalculateTotals = useMutation(api.invoices.recalculateTotals);
  const [newItem, setNewItem] = useState<Omit<InvoiceItem, 'id' | 'created_at' | 'invoice_id'>>({
    description: '',
    quantity: 1,
    rate: 0,
    amount: 0
  });

  const calculateAmount = (quantity: number, rate: number) => {
    return quantity * rate;
  };

  const handleNewItemChange = (field: keyof InvoiceItem, value: string | number) => {
    const updatedItem = { ...newItem, [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      updatedItem.amount = calculateAmount(updatedItem.quantity, updatedItem.rate);
    }
    
    setNewItem(updatedItem);
  };

  const handleAddItem = async () => {
    if (!newItem.description.trim() || !user) return;

    console.log('Adding item:', {
      invoice_id: invoiceId,
      description: newItem.description,
      quantity: newItem.quantity,
      rate: newItem.rate,
      amount: newItem.amount
    });

    try {
      await addItem({
        invoice_id: invoiceId,
        description: newItem.description,
        quantity: newItem.quantity,
        rate: newItem.rate,
        amount: newItem.amount
      });

      // Recalculate invoice totals
      await recalculateTotals({ invoiceId, userId: user.id });

      // Reset the form
      setNewItem({
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0
      });

      // Trigger callback
      onItemsChange?.();

      console.log('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateItem = async (itemId: string, field: keyof InvoiceItem, value: string | number) => {
    const item = items.find(i => i.id === itemId);
    if (!item || !user) return;

    const updatedItem = { ...item, [field]: value };

    if (field === 'quantity' || field === 'rate') {
      updatedItem.amount = calculateAmount(updatedItem.quantity, updatedItem.rate);
    }

    try {
      await updateItem({
        id: itemId,
        updates: {
          description: updatedItem.description,
          quantity: updatedItem.quantity,
          rate: updatedItem.rate,
          amount: updatedItem.amount
        }
      });

      // Recalculate invoice totals
      await recalculateTotals({ invoiceId, userId: user.id });

      onItemsChange?.();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;

    try {
      await deleteItem(itemId);

      // Recalculate invoice totals
      await recalculateTotals({ invoiceId, userId: user.id });

      onItemsChange?.();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  if (isLoading) {
    return <div>Loading items...</div>;
  }

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <InvoiceItemsTable
          items={items}
          newItem={newItem}
          onItemUpdate={handleUpdateItem}
          onItemDelete={handleDeleteItem}
          onNewItemChange={handleNewItemChange}
          onAddItem={handleAddItem}
        />
        <InvoiceTotals subtotal={subtotal} />
      </CardContent>
    </Card>
  );
};
