
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { useInvoiceItems } from '@/hooks/useInvoiceItems';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { InvoiceHeader } from './InvoiceHeader';
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Upon receipt';
    return new Date(dateString).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      await generateInvoicePDF(invoice, client, items, companySettings);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  if (itemsLoading || settingsLoading) {
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
          <InvoiceHeader invoice={invoice} companySettings={companySettings} client={client} />

          {!client && (
            <Alert className="mb-8">
              <AlertDescription>
                Client information not available for this invoice.
              </AlertDescription>
            </Alert>
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

          {/* Due Date */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-sm">
              <span className="font-semibold text-gray-900">Due Date: </span>
              <span className="text-gray-900">{formatDate(invoice.due_date)}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mt-6 text-sm">
            <div className="font-semibold text-gray-900 mb-2">Payment Details</div>
            <div className="text-gray-700">{companySettings?.bank_details || 'Direct Credit - Mackay Distribution 2018 Limited'}</div>
            <div className="text-gray-700">{companySettings?.bank_account || '06-0556-0955531-00'}</div>
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
