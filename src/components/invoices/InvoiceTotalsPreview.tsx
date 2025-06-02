
import React from 'react';
import { Invoice } from '@/hooks/useInvoices';

interface InvoiceTotalsPreviewProps {
  invoice: Invoice;
}

export const InvoiceTotalsPreview: React.FC<InvoiceTotalsPreviewProps> = ({ invoice }) => {
  return (
    <div className="flex justify-end">
      <div className="w-80">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">GST ({invoice.gst_rate}%):</span>
            <span className="font-medium">${invoice.gst_amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-2">
            <span className="font-semibold text-gray-900">Total Amount:</span>
            <span className="font-bold text-lg">${invoice.total_amount.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
