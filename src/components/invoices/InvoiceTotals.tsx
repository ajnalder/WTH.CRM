
import React from 'react';

interface InvoiceTotalsProps {
  subtotal: number;
}

export const InvoiceTotals: React.FC<InvoiceTotalsProps> = ({ subtotal }) => {
  return (
    <div className="flex justify-end">
      <div className="w-64 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
