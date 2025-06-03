
import React, { useState } from 'react';
import { ShadowBox } from '@/components/ui/shadow-box';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { CreateInvoiceDialog } from '@/components/invoices/CreateInvoiceDialog';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';

const Invoices = () => {
  const navigate = useNavigate();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { invoices, isLoading } = useInvoices();
  const { clients } = useClients();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const totalOutstanding = invoices
    .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;
  const pendingInvoices = invoices.filter(invoice => 
    invoice.status === 'sent' || invoice.status === 'overdue'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-1">Manage your client invoices and track payments</p>
        </div>
        <Button 
          onClick={() => navigate('/invoices/new')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg"
        >
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ShadowBox className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Invoiced</h3>
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {invoices.length} total invoices
          </p>
        </ShadowBox>

        <ShadowBox className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Outstanding</h3>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {pendingInvoices} pending invoices
          </p>
        </ShadowBox>

        <ShadowBox className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Paid Invoices</h3>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Successfully completed
          </p>
        </ShadowBox>

        <ShadowBox className="p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Pending</h3>
            <Clock className="h-4 w-4 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-yellow-600">{pendingInvoices}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting payment
          </p>
        </ShadowBox>
      </div>

      <ShadowBox className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">All Invoices</h2>
        <InvoiceTable invoices={invoices} />
      </ShadowBox>

      <CreateInvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        clients={clients}
      />
    </div>
  );
};

export default Invoices;
