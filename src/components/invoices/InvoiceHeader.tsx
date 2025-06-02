
import React from 'react';
import { Invoice } from '@/types/invoiceTypes';
import { CompanySettings } from '@/hooks/useCompanySettings';

interface InvoiceHeaderProps {
  invoice: Invoice;
  companySettings?: CompanySettings | null;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, companySettings }) => {
  return (
    <div className="flex justify-between items-start mb-8">
      <div className="flex-1">
        <div className="mb-4">
          {companySettings?.logo_base64 ? (
            <img 
              src={companySettings.logo_base64} 
              alt={`${companySettings.company_name} Logo`}
              className="h-16 w-auto"
            />
          ) : (
            <img 
              src="/lovable-uploads/66b04964-07c1-4620-a5a5-98c5bdae7fc7.png" 
              alt="What the Heck Logo" 
              className="h-16 w-auto"
            />
          )}
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Tax Invoice - {invoice.invoice_number}
        </h1>
      </div>
      
      <div className="text-right">
        <div className="mb-6">
          <div className="font-bold text-lg">{companySettings?.company_name || 'What the Heck'}</div>
          <div className="text-sm text-gray-600">{companySettings?.address_line1 || '8 King Street'}</div>
          <div className="text-sm text-gray-600">{companySettings?.address_line2 || 'Te Puke 3119'}</div>
          <div className="text-sm text-gray-600">{companySettings?.address_line3 || 'NEW ZEALAND'}</div>
        </div>
        
        <div className="mb-4">
          <div className="font-semibold">GST Number</div>
          <div className="text-sm">{companySettings?.gst_number || '125-651-445'}</div>
        </div>
        
        <div>
          <div className="font-semibold">Invoice Date</div>
          <div className="text-sm">
            {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
};
