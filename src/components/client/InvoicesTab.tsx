
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, DollarSign } from 'lucide-react';
import { useInvoices } from '@/hooks/useInvoices';
import { Client } from '@/types/client';
import { CreateInvoiceDialog } from '@/components/invoices/CreateInvoiceDialog';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';

interface InvoicesTabProps {
  client: Client;
}

const InvoicesTab = ({ client }: InvoicesTabProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { invoices, isLoading } = useInvoices(client.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const totalOutstanding = invoices
    .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
    .reduce((sum, invoice) => sum + invoice.balance_due, 0);
  const paidInvoices = invoices.filter(invoice => invoice.status === 'paid').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Client Invoices</h3>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoiced</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {invoices.length} total invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">${totalOutstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Amount due
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{paidInvoices}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable invoices={invoices} />
        </CardContent>
      </Card>

      <CreateInvoiceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        clients={[client]}
      />
    </div>
  );
};

export default InvoicesTab;
