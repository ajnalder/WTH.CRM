
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';

interface InvoiceActionsProps {
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({ onPrint, onDownloadPDF }) => {
  return (
    <div className="flex justify-between items-center no-print">
      <h1 className="text-2xl font-bold">Invoice Preview</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPrint}>
          <Printer size={16} className="mr-2" />
          Print
        </Button>
        <Button onClick={onDownloadPDF}>
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};
