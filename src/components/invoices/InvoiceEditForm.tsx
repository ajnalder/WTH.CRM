import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Invoice, useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { InvoiceItemsManager } from './InvoiceItemsManager';

interface InvoiceEditFormProps {
  invoice: Invoice;
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

export const InvoiceEditForm: React.FC<InvoiceEditFormProps> = ({ invoice }) => {
  const navigate = useNavigate();
  const { updateInvoice } = useInvoices();
  const { clients } = useClients();
  
  const [formData, setFormData] = useState({
    client_id: invoice.client_id,
    invoice_number: invoice.invoice_number,
    title: invoice.title,
    status: invoice.status,
    issued_date: invoice.issued_date || '',
    due_date: invoice.due_date || '',
    gst_rate: invoice.gst_rate
  });

  const client = clients.find(c => c.id === formData.client_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateInvoice({
      id: invoice.id,
      updates: formData
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/invoices/${invoice.id}`)}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Invoice
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Invoice {invoice.invoice_number}
            </h1>
            <p className="text-gray-600 mt-1">{invoice.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(formData.status)}>
            {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
          </Badge>
          <Button onClick={handleSubmit}>
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={formData.client_id}
                      onValueChange={(value) => handleInputChange('client_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.company}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice_number">Invoice Number</Label>
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) => handleInputChange('invoice_number', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Invoice Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="sent">Sent</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="overdue">Overdue</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="issued_date">Issue Date</Label>
                    <Input
                      id="issued_date"
                      type="date"
                      value={formData.issued_date}
                      onChange={(e) => handleInputChange('issued_date', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange('due_date', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_rate">GST Rate (%)</Label>
                  <Input
                    id="gst_rate"
                    type="number"
                    min="0"
                    max="30"
                    step="0.01"
                    value={formData.gst_rate}
                    onChange={(e) => handleInputChange('gst_rate', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </form>
            </CardContent>
          </Card>

          <InvoiceItemsManager invoiceId={invoice.id} />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              {client ? (
                <div className="space-y-2">
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
      </div>
    </div>
  );
};
