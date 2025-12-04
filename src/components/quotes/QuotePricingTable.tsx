import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { QuoteItem } from '@/types/quote';

interface QuotePricingTableProps {
  quoteId: string;
  items: QuoteItem[];
  onAddItem: (item: Omit<QuoteItem, 'id' | 'created_at'>) => Promise<any>;
  onUpdateItem: (params: { id: string; updates: Partial<QuoteItem> }) => void;
  onDeleteItem: (id: string) => void;
  total: number;
}

export const QuotePricingTable: React.FC<QuotePricingTableProps> = ({
  quoteId,
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  total,
}) => {
  const [newItem, setNewItem] = useState({
    description: '',
    quantity: 1,
    rate: 0,
    is_optional: false,
  });

  const handleAddItem = async () => {
    if (!newItem.description) return;
    
    await onAddItem({
      quote_id: quoteId,
      description: newItem.description,
      quantity: newItem.quantity,
      rate: newItem.rate,
      amount: newItem.quantity * newItem.rate,
      is_optional: newItem.is_optional,
      order_index: items.length,
    });
    
    setNewItem({
      description: '',
      quantity: 1,
      rate: 0,
      is_optional: false,
    });
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const updates: Partial<QuoteItem> = { [field]: value };
    
    if (field === 'quantity' || field === 'rate') {
      const quantity = field === 'quantity' ? value : item.quantity;
      const rate = field === 'rate' ? value : item.rate;
      updates.amount = quantity * rate;
    }
    
    onUpdateItem({ id, updates });
  };

  const optionalTotal = items
    .filter((i) => i.is_optional)
    .reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pricing</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Description</TableHead>
              <TableHead className="w-[10%]">Qty</TableHead>
              <TableHead className="w-[15%]">Rate</TableHead>
              <TableHead className="w-[15%]">Amount</TableHead>
              <TableHead className="w-[10%]">Optional</TableHead>
              <TableHead className="w-[5%]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className={item.is_optional ? 'opacity-60' : ''}>
                <TableCell>
                  <Input
                    value={item.description}
                    onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                    className="border-0 p-0 h-auto"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                    className="border-0 p-0 h-auto w-16"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                    className="border-0 p-0 h-auto w-24"
                  />
                </TableCell>
                <TableCell className="font-medium">
                  ${item.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <Checkbox
                    checked={item.is_optional}
                    onCheckedChange={(checked) => handleUpdateItem(item.id, 'is_optional', checked)}
                  />
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => onDeleteItem(item.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {/* New item row */}
            <TableRow>
              <TableCell>
                <Input
                  placeholder="Add new item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 1 })}
                  className="w-16"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={newItem.rate}
                  onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                  className="w-24"
                />
              </TableCell>
              <TableCell className="font-medium">
                ${(newItem.quantity * newItem.rate).toLocaleString()}
              </TableCell>
              <TableCell>
                <Checkbox
                  checked={newItem.is_optional}
                  onCheckedChange={(checked) => setNewItem({ ...newItem, is_optional: !!checked })}
                />
              </TableCell>
              <TableCell>
                <Button variant="ghost" size="icon" onClick={handleAddItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total (excl. optional)
              </TableCell>
              <TableCell className="font-bold text-lg">
                ${total.toLocaleString()}
              </TableCell>
              <TableCell colSpan={2}></TableCell>
            </TableRow>
            {optionalTotal > 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-right text-muted-foreground">
                  Optional items total
                </TableCell>
                <TableCell className="text-muted-foreground">
                  ${optionalTotal.toLocaleString()}
                </TableCell>
                <TableCell colSpan={2}></TableCell>
              </TableRow>
            )}
          </TableFooter>
        </Table>
        <p className="text-sm text-muted-foreground mt-4">
          All pricing excludes GST
        </p>
      </CardContent>
    </Card>
  );
};
