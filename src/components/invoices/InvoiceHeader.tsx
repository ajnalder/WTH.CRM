
import React from 'react';
import { Invoice } from '@/types/invoiceTypes';
import { CompanySettings } from '@/hooks/useCompanySettings';
import { Client } from '@/hooks/useClients';

interface InvoiceHeaderProps {
  invoice: Invoice;
  companySettings?: CompanySettings | null;
  client?: Client;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, companySettings, client }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="mb-8">
      {/* Top section: TAX INVOICE title and company address */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-wide mb-2">TAX INVOICE</h1>
          {client && (
            <div className="text-lg font-semibold text-gray-800">{client.company}</div>
          )}
        </div>
        
        <div className="text-right text-sm">
          {companySettings?.logo_base64 && (
            <img 
              src={companySettings.logo_base64} 
              alt="Company Logo" 
              className="h-10 ml-auto mb-2 object-contain"
            />
          )}
          <div className="font-semibold text-gray-900">{companySettings?.company_name || 'What the Heck'}</div>
          <div className="text-gray-600">{companySettings?.address_line1 || '8 King Street'}</div>
          <div className="text-gray-600">{companySettings?.address_line2 || 'Te Puke 3119'}</div>
          <div className="text-gray-600">{companySettings?.address_line3 || 'NEW ZEALAND'}</div>
        </div>
      </div>

      {/* Invoice details row */}
      <div className="border-t border-gray-300 pt-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Invoice Date</div>
            <div className="text-gray-900">{formatDate(invoice.issued_date)}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Invoice Number</div>
            <div className="text-gray-900">{invoice.invoice_number}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Reference</div>
            <div className="text-gray-900">{invoice.title || '-'}</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">GST Number</div>
            <div className="text-gray-900">{companySettings?.gst_number || '125-651-445'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
