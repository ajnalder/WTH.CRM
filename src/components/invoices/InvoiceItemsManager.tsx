
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash } from 'lucide-react';
import { useInvoiceItems } from '@/hooks/useInvoices';

interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceItemsManagerProps {
  invoiceId: string;
  onItemsChange?: () => void;
}

export const InvoiceItemsManager: React.FC<InvoiceItemsManagerProps> = ({
  invoiceId,
  onItemsChange
}) => {
  const { items, isLoading, addItem, updateItem, deleteItem } = useInvoiceItems(invoiceId);
  const [newItem, setNewItem] = useState<InvoiceItem>({
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
    if (!newItem.description.trim()) return;
    
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
    if (!item) return;
    
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
      
      onItemsChange?.();
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteItem(itemId);
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead className="w-24">Qty.</TableHead>
              <TableHead className="w-32">Price</TableHead>
              <TableHead className="w-32">Amount</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Textarea
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="min-h-[60px] resize-none"
                    placeholder="Item description"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    min="0"
                    step="0.01"
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">${item.amount.toFixed(2)}</div>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => handleNewItemChange('description', e.target.value)}
                  className="min-h-[60px] resize-none"
                  placeholder="Add item description..."
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => handleNewItemChange('quantity', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newItem.rate}
                  onChange={(e) => handleNewItemChange('rate', parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <div className="font-medium">${newItem.amount.toFixed(2)}</div>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAddItem}
                  disabled={!newItem.description.trim()}
                >
                  <Plus size={16} />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
