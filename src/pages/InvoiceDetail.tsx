import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, FileText, DollarSign, Calendar, User } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { InvoiceEditForm } from '@/components/invoices/InvoiceEditForm';

interface InvoiceDetailProps {
  editMode?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800';
    case 'sent':
      return 'bg-blue-100 text-blue-800';
    case 'overdue':
      return 'bg-red-100 text-red-800';
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'cancelled':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/invoices')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 mt-1">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </Badge>
          <Button onClick={() => navigate(`/invoices/${id}/edit`)}>
            <Edit size={16} className="mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} />
                Invoice Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Invoice Number</label>
                  <p className="text-gray-900 font-mono">{invoice.invoice_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Issued Date</label>
                  <p className="text-gray-900">
                    {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Due Date</label>
                  <p className="text-gray-900">
                    {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
              </div>
              {invoice.description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Description</label>
                  <p className="text-gray-900">{invoice.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} />
                Client Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Company</label>
                    <p className="text-gray-900">{client.company}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Contact</label>
                    <p className="text-gray-900">{client.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-gray-900">{client.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-gray-900">{client.phone || 'Not provided'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Client information not available</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign size={20} />
                Financial Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GST ({invoice.gst_rate}%)</span>
                <span className="font-semibold">${invoice.gst_amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal incl. GST</span>
                <span className="font-semibold">${invoice.subtotal_incl_gst.toLocaleString()}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg">
                <span className="font-semibold">Total Amount</span>
                <span className="font-bold">${invoice.total_amount.toLocaleString()}</span>
              </div>
              {invoice.deposit_percentage > 0 && (
                <>
                  <hr />
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit ({invoice.deposit_percentage}%)</span>
                    <span className="font-semibold">${invoice.deposit_amount.toLocaleString()}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between text-lg">
                <span className="font-semibold text-orange-600">Balance Due</span>
                <span className="font-bold text-orange-600">${invoice.balance_due.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {invoice.paid_date && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar size={20} />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="text-sm font-medium text-gray-600">Paid Date</label>
                  <p className="text-gray-900">{new Date(invoice.paid_date).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetail;
