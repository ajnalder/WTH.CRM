import React from 'react';
import { useParams } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { InvoiceEditForm } from '@/components/invoices/InvoiceEditForm';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';
import { InvoiceDetailLoading } from '@/components/invoices/InvoiceDetailLoading';
import { InvoiceNotFound } from '@/components/invoices/InvoiceNotFound';
import { InvoiceDetailHeader } from '@/components/invoices/InvoiceDetailHeader';

interface InvoiceDetailProps {
  editMode?: boolean;
}

const InvoiceDetail = ({ editMode = false }: InvoiceDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const { invoices, isLoading } = useInvoices();
  const { clients } = useClients();

  if (isLoading) {
    return <InvoiceDetailLoading />;
  }

  const invoice = invoices.find(inv => inv.id === id);
  const client = clients.find(c => c.id === invoice?.client_id);

  if (!invoice) {
    return <InvoiceNotFound />;
  }

  // If in edit mode, render the edit form
  if (editMode) {
    return <InvoiceEditForm invoice={invoice} />;
  }

  // Otherwise, render the invoice preview
  return (
    <div className="flex-1">
      <InvoiceDetailHeader />
      <InvoicePreview invoice={invoice} client={client} />
    </div>
  );
};

export default InvoiceDetail;
