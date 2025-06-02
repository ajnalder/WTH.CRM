import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableCell, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { InvoiceItem } from '@/types/invoiceTypes';

interface NewInvoiceItemRowProps {
  newItem: Omit<InvoiceItem, 'id' | 'created_at' | 'invoice_id'>;
  onChange: (field: keyof InvoiceItem, value: string | number) => void;
  onAdd: () => void;
}

export const NewInvoiceItemRow: React.FC<NewInvoiceItemRowProps> = ({
  newItem,
  onChange,
  onAdd
}) => {
  return (
    <TableRow>
      <TableCell>
        <Textarea
          value={newItem.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="min-h-[60px] resize-none"
          placeholder="Add item description..."
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={newItem.quantity}
          onChange={(e) => onChange('quantity', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={newItem.rate}
          onChange={(e) => onChange('rate', parseFloat(e.target.value) || 0)}
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
          onClick={onAdd}
          disabled={!newItem.description.trim()}
        >
          <Plus size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
};
