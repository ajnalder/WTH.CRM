
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Send, Download, MoreHorizontal, ExternalLink, Printer } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';
import { Invoice } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { XeroSyncButton } from './XeroSyncButton';
import { EmailInvoiceDialog } from './EmailInvoiceDialog';

interface InvoiceActionsProps {
  invoice: Invoice;
  client?: Client;
  onPrint: () => void;
  onDownloadPDF: () => void;
}

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
  invoice,
  client,
  onPrint,
  onDownloadPDF,
}) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sent':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
      <Badge variant="outline" className={getStatusColor(invoice.status)}>
        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
      </Badge>
      
      <div className="flex items-center gap-2 ml-auto">
        <EmailInvoiceDialog invoice={invoice} client={client} />

        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
        >
          <Printer size={16} className="mr-2" />
          Print
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onDownloadPDF}
        >
          <Download size={16} className="mr-2" />
          Download PDF
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
        >
          <Edit size={16} className="mr-2" />
          Edit
        </Button>

        <XeroSyncButton invoiceId={invoice.id} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => navigate(`/invoices/${invoice.id}`)}
            >
              <ExternalLink size={16} className="mr-2" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
