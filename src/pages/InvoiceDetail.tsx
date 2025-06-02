import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { InvoiceEditForm } from '@/components/invoices/InvoiceEditForm';
import { InvoicePreview } from '@/components/invoices/InvoicePreview';

interface InvoiceDetailProps {
  editMode?: boolean;
}

const InvoiceDetail = ({ editMode = false }: InvoiceDetailProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { invoices, isLoading } = useInvoices();
  const { clients } = useClients();

  if (isLoading) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const invoice = invoices.find(inv => inv.id === id);
  const client = clients.find(c => c.id === invoice?.client_id);

  if (!invoice) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
          <p className="text-gray-600 mb-4">The invoice you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  // If in edit mode, render the edit form
  if (editMode) {
    return <InvoiceEditForm invoice={invoice} />;
  }

  // Otherwise, render the invoice preview
  return (
    <div className="flex-1">
      <div className="p-6">
        <Button variant="ghost" onClick={() => navigate('/invoices')} className="mb-4">
          <ArrowLeft size={16} className="mr-2" />
          Back to Invoices
        </Button>
      </div>
      <InvoicePreview invoice={invoice} client={client} />
    </div>
  );
};

export default InvoiceDetail;
