
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, client }) => {
  const { items, isLoading: itemsLoading } = useInvoiceItems(invoice.id);
  const { settings: companySettings, isLoading: settingsLoading } = useCompanySettings();

  console.log('InvoicePreview rendering:', { 
    invoiceId: invoice.id, 
    itemsLoading, 
    settingsLoading,
    itemsCount: items?.length || 0,
    hasClient: !!client 
  });

  const handlePrint = () => {
    console.log('Print button clicked');
    window.print();
  };

  const handleDownloadPDF = async () => {
    console.log('Download PDF button clicked');
    try {
      await generateInvoicePDF(invoice, client, items, companySettings);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (itemsLoading || settingsLoading) {
    console.log('Loading invoice items or company settings');
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

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
          
          {client ? (
            <InvoiceClientInfo client={client} />
          ) : (
            <Alert className="mb-8">
              <AlertDescription>
                Client information not available for this invoice.
              </AlertDescription>
            </Alert>
          )}

          {/* Project Description */}
          {invoice.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{invoice.description}</p>
            </div>
          )}

          {items && items.length > 0 ? (
            <InvoiceItemsTablePreview items={items} />
          ) : (
            <Alert className="mb-8">
              <AlertDescription>
                No items found for this invoice.
              </AlertDescription>
            </Alert>
          )}
          
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
