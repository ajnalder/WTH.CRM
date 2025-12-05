
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Edit, FileText, Check, Mail, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Invoice } from '@/types/invoiceTypes';
import { useInvoices } from '@/hooks/useInvoices';
import { useNavigate } from 'react-router-dom';

interface InvoiceTableProps {
  invoices: Invoice[];
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

export const InvoiceTable: React.FC<InvoiceTableProps> = ({ invoices }) => {
  const navigate = useNavigate();
  const { updateInvoice, deleteInvoice } = useInvoices();

  const handleMarkAsPaid = (invoiceId: string) => {
    updateInvoice({
      id: invoiceId,
      updates: {
        status: 'paid',
        paid_date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleDelete = (invoiceId: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoiceId);
    }
  };

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {invoice.invoice_number}
                  {invoice.last_emailed_at && (
                    <Tooltip>
                      <TooltipTrigger>
                        <Mail size={14} className="text-blue-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Last emailed: {new Date(invoice.last_emailed_at).toLocaleString()}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {(invoice as any).clients?.company || 'Unknown Client'}
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{invoice.title}</div>
                  {invoice.description && (
                    <div className="text-sm text-gray-600">{invoice.description}</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">${invoice.total_amount.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">
                    Inc. GST: ${invoice.subtotal_incl_gst.toLocaleString()}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                {invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'No due date'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/invoices/${invoice.id}`)}
                  >
                    <Eye size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                  >
                    <Edit size={14} />
                  </Button>
                  {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsPaid(invoice.id)}
                      className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      title="Mark as Paid"
                    >
                      <Check size={14} />
                    </Button>
                  )}
                  {(invoice.status === 'draft' || invoice.status === 'cancelled') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(invoice.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete Invoice"
                    >
                      <Trash2 size={14} />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
          {invoices.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8">
                <div className="text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No invoices found</p>
                  <p className="text-sm">Create your first invoice to get started</p>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
};
