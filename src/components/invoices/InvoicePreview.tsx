
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { InvoiceHeader } from './InvoiceHeader';
import { InvoiceClientInfo } from './InvoiceClientInfo';
import { InvoiceItemsTablePreview } from './InvoiceItemsTablePreview';
import { InvoiceTotalsPreview } from './InvoiceTotalsPreview';
import { InvoiceActions } from './InvoiceActions';
import { EmailLogs } from './EmailLogs';
import { generateInvoicePDF } from '@/utils/invoicePDF';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, client }) => {
  const { items } = useInvoiceItems(invoice.id);
  const { settings: companySettings } = useCompanySettings();

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    await generateInvoicePDF(invoice, client, items, companySettings);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <InvoiceActions 
        invoice={invoice}
        client={client}
        onPrint={handlePrint} 
        onDownloadPDF={handleDownloadPDF} 
      />

      <Card className="print:shadow-none print:border-none invoice-content">
        <CardContent className="p-8">
          <InvoiceHeader invoice={invoice} companySettings={companySettings} />
          <InvoiceClientInfo client={client} />

          {/* Project Description */}
          {invoice.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{invoice.description}</p>
            </div>
          )}

          <InvoiceItemsTablePreview items={items} />
          <InvoiceTotalsPreview invoice={invoice} />

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>

      {/* Email Logs Section */}
      <div className="no-print">
        <EmailLogs invoiceId={invoice.id} />
      </div>
    </div>
  );
};
