
import React from 'react';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InvoiceItemRow } from './InvoiceItemRow';
import { NewInvoiceItemRow } from './NewInvoiceItemRow';
import { InvoiceItem } from '@/hooks/useInvoices';

interface InvoiceItemsTableProps {
  items: InvoiceItem[];
  newItem: Omit<InvoiceItem, 'id' | 'created_at' | 'invoice_id'>;
  onItemUpdate: (itemId: string, field: keyof InvoiceItem, value: string | number) => void;
  onItemDelete: (itemId: string) => void;
  onNewItemChange: (field: keyof InvoiceItem, value: string | number) => void;
  onAddItem: () => void;
}

export const InvoiceItemsTable: React.FC<InvoiceItemsTableProps> = ({
  items,
  newItem,
  onItemUpdate,
  onItemDelete,
  onNewItemChange,
  onAddItem
}) => {
  return (
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
          <InvoiceItemRow
            key={item.id}
            item={item}
            onUpdate={(field, value) => onItemUpdate(item.id, field, value)}
            onDelete={() => onItemDelete(item.id)}
          />
        ))}
        <NewInvoiceItemRow
          newItem={newItem}
          onChange={onNewItemChange}
          onAdd={onAddItem}
        />
      </TableBody>
    </Table>
  );
};
