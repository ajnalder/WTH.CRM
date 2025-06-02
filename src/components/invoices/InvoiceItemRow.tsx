
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TableCell, TableRow } from '@/components/ui/table';
import { Trash } from 'lucide-react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface InvoiceItemRowProps {
  item: InvoiceItem;
  onUpdate: (field: keyof InvoiceItem, value: string | number) => void;
  onDelete: () => void;
}

export const InvoiceItemRow: React.FC<InvoiceItemRowProps> = ({
  item,
  onUpdate,
  onDelete
}) => {
  return (
    <TableRow>
      <TableCell>
        <Textarea
          value={item.description}
          onChange={(e) => onUpdate('description', e.target.value)}
          className="min-h-[60px] resize-none"
          placeholder="Item description"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.quantity}
          onChange={(e) => onUpdate('quantity', parseFloat(e.target.value) || 0)}
          min="0"
          step="0.01"
        />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={item.rate}
          onChange={(e) => onUpdate('rate', parseFloat(e.target.value) || 0)}
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
          onClick={onDelete}
        >
          <Trash size={16} />
        </Button>
      </TableCell>
    </TableRow>
  );
};
