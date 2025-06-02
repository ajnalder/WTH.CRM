
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { EmailInvoiceDialog } from './EmailInvoiceDialog';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';

interface InvoiceActionsProps {
  invoice: Invoice;
  client?: Client;
  onPrint: () => void;
  onDownloadPDF: () => Promise<void>;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({ 
  invoice, 
  client, 
  onPrint, 
  onDownloadPDF 
}) => {
  const handleDownloadPDF = async () => {
    try {
      await onDownloadPDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div className="flex justify-between items-center no-print">
      <h1 className="text-2xl font-bold">Invoice Preview</h1>
      <div className="flex gap-2">
        <EmailInvoiceDialog invoice={invoice} client={client} />
        <Button variant="outline" onClick={onPrint}>
          <Printer size={16} className="mr-2" />
          Print
        </Button>
        <Button onClick={handleDownloadPDF}>
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>
      </div>
    </div>
  );
};
