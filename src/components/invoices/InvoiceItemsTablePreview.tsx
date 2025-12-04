import React from 'react';
import { InvoiceItem } from '@/types/invoiceTypes';

interface InvoiceItemsTablePreviewProps {
  items: InvoiceItem[];
}

export const InvoiceItemsTablePreview: React.FC<InvoiceItemsTablePreviewProps> = ({ items }) => {
  return (
    <div className="mb-8">
      <table className="w-full">
        <thead>
          <tr className="border-t-2 border-gray-400">
            <th className="text-left py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">Description</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-20 border-b border-gray-200">Quantity</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-28 border-b border-gray-200">Unit Price</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-32 border-b border-gray-200">Amount NZD</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={item.id} className={index % 2 === 1 ? 'bg-gray-50' : ''}>
              <td className="py-3 text-sm text-gray-900 pr-4">{item.description}</td>
              <td className="py-3 text-sm text-gray-900 text-right">{item.quantity.toFixed(2)}</td>
              <td className="py-3 text-sm text-gray-900 text-right">{item.rate.toFixed(2)}</td>
              <td className="py-3 text-sm text-gray-900 text-right font-medium">{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
