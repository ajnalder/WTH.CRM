import React from 'react';
import { Invoice } from '@/types/invoiceTypes';

interface InvoiceTotalsPreviewProps {
  invoice: Invoice;
}

export const InvoiceTotalsPreview: React.FC<InvoiceTotalsPreviewProps> = ({ invoice }) => {
  return (
    <div className="flex justify-end">
      <div className="w-72">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-gray-700">Subtotal</span>
            <span className="text-gray-900">{invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-700">TOTAL GST {invoice.gst_rate}%</span>
            <span className="text-gray-900">{(invoice.gst_amount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t-2 border-gray-400 pt-2 mt-2">
            <span className="font-bold text-gray-900">TOTAL NZD</span>
            <span className="font-bold text-gray-900 text-lg">{invoice.total_amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
