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
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 text-sm font-semibold text-gray-900">Description</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-20">Qty</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">Rate</th>
            <th className="text-right py-3 text-sm font-semibold text-gray-900 w-28">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-3 text-sm text-gray-900">{item.description}</td>
              <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
              <td className="py-3 text-sm text-gray-600 text-right">${item.rate.toLocaleString()}</td>
              <td className="py-3 text-sm text-gray-900 text-right font-medium">${item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
