import React from 'react';
import { useParams } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { InvoiceEditForm } from '@/components/invoices/InvoiceEditForm';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { InvoiceDetailLoading } from '@/components/invoices/InvoiceDetailLoading';
import { InvoiceNotFound } from '@/components/invoices/InvoiceNotFound';
import { InvoiceDetailHeader } from '@/components/invoices/InvoiceDetailHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface InvoiceDetailProps {
  editMode?: boolean;
}

const InvoiceDetail = ({ editMode = false }: InvoiceDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { clients, isLoading: clientsLoading } = useClients();

  console.log('InvoiceDetail rendering:', { id, editMode, invoicesLoading, clientsLoading });

  if (invoicesLoading || clientsLoading) {
    console.log('Loading state - invoices or clients still loading');
    return <InvoiceDetailLoading />;
  }

  if (!id) {
    console.log('No invoice ID provided');
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <InvoiceDetailHeader />
        <div className="max-w-4xl mx-auto p-6">
          <Alert>
            <AlertDescription>
              No invoice ID provided in the URL.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const invoice = invoices.find(inv => inv.id === id);
  const client = invoice ? clients.find(c => c.id === invoice.client_id) : undefined;

  console.log('Invoice data:', { invoice: !!invoice, client: !!client });

  if (!invoice) {
    console.log('Invoice not found with ID:', id);
    return <InvoiceNotFound />;
  }

  // If in edit mode, render the edit form
  if (editMode) {
    return (
      <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <InvoiceEditForm invoice={invoice} />
      </div>
    );
  }

  // Otherwise, render the invoice preview
  console.log('Rendering invoice preview for:', invoice.invoice_number);
  return (
    <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <InvoiceDetailHeader />
      <InvoicePreview invoice={invoice} client={client} />
    </div>
  );
};

export default InvoiceDetail;
