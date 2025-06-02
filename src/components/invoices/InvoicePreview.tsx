
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Invoice } from '@/hooks/useInvoices';
import { Client } from '@/hooks/useClients';
import { useInvoiceItems } from '@/hooks/useInvoices';
import jsPDF from 'jspdf';

interface InvoicePreviewProps {
  invoice: Invoice;
  client?: Client;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ invoice, client }) => {
  const { items } = useInvoiceItems(invoice.id);

  const generatePDF = () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    
    // Header with logo placeholder
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Tax Invoice - ' + invoice.invoice_number, 20, 30);
    
    // Business details on right
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('What the Heck', pageWidth - 20, 30, { align: 'right' });
    pdf.text('8 King Street', pageWidth - 20, 40, { align: 'right' });
    pdf.text('Te Puke 3119', pageWidth - 20, 50, { align: 'right' });
    pdf.text('NEW ZEALAND', pageWidth - 20, 60, { align: 'right' });
    
    pdf.text('GST Number', pageWidth - 20, 80, { align: 'right' });
    pdf.text('125-651-445', pageWidth - 20, 90, { align: 'right' });
    
    pdf.text('Invoice Date', pageWidth - 20, 110, { align: 'right' });
    pdf.text(invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString(), pageWidth - 20, 120, { align: 'right' });
    
    // Client info
    if (client) {
      pdf.text('Bill To:', 20, 80);
      pdf.text(client.company, 20, 90);
      if (client.name) pdf.text(client.name, 20, 100);
      if (client.email) pdf.text(client.email, 20, 110);
    }
    
    // Items table
    let yPos = 150;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Description', 20, yPos);
    pdf.text('Qty', 120, yPos);
    pdf.text('Rate', 140, yPos);
    pdf.text('Amount', 170, yPos);
    
    yPos += 10;
    pdf.line(20, yPos, 190, yPos);
    
    // Items
    pdf.setFont('helvetica', 'normal');
    items.forEach((item) => {
      yPos += 15;
      pdf.text(item.description, 20, yPos);
      pdf.text(item.quantity.toString(), 120, yPos);
      pdf.text(`$${item.rate.toLocaleString()}`, 140, yPos);
      pdf.text(`$${item.amount.toLocaleString()}`, 170, yPos);
    });
    
    // Totals
    yPos += 30;
    pdf.text(`Subtotal: $${invoice.subtotal.toLocaleString()}`, 120, yPos);
    yPos += 15;
    pdf.text(`GST (${invoice.gst_rate}%): $${invoice.gst_amount.toLocaleString()}`, 120, yPos);
    yPos += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Total: $${invoice.total_amount.toLocaleString()}`, 120, yPos);
    
    if (invoice.deposit_percentage > 0 && invoice.deposit_amount > 0) {
      yPos += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Deposit (${invoice.deposit_percentage}%): $${invoice.deposit_amount.toLocaleString()}`, 120, yPos);
      yPos += 15;
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Balance Due: $${invoice.balance_due.toLocaleString()}`, 120, yPos);
    }
    
    pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-bold">Invoice Preview</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer size={16} className="mr-2" />
            Print
          </Button>
          <Button onClick={generatePDF}>
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none invoice-content">
        <CardContent className="p-8">
          {/* Invoice Header with Logo and Business Details */}
          <div className="flex justify-between items-start mb-8">
            <div className="flex-1">
              <div className="mb-4">
                <img 
                  src="/lovable-uploads/66b04964-07c1-4620-a5a5-98c5bdae7fc7.png" 
                  alt="What the Heck Logo" 
                  className="h-16 w-auto"
                />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tax Invoice - {invoice.invoice_number}
              </h1>
            </div>
            
            <div className="text-right">
              <div className="mb-6">
                <div className="font-bold text-lg">What the Heck</div>
                <div className="text-sm text-gray-600">8 King Street</div>
                <div className="text-sm text-gray-600">Te Puke 3119</div>
                <div className="text-sm text-gray-600">NEW ZEALAND</div>
              </div>
              
              <div className="mb-4">
                <div className="font-semibold">GST Number</div>
                <div className="text-sm">125-651-445</div>
              </div>
              
              <div>
                <div className="font-semibold">Invoice Date</div>
                <div className="text-sm">
                  {invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Client Information */}
          {client && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">Bill To</h3>
              <div className="space-y-1 text-sm">
                <div className="font-medium">{client.company}</div>
                {client.name && <div>{client.name}</div>}
                {client.email && <div>{client.email}</div>}
                {client.phone && <div>{client.phone}</div>}
              </div>
            </div>
          )}

          {/* Project Description */}
          {invoice.description && (
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{invoice.description}</p>
            </div>
          )}

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 text-sm font-semibold text-gray-900">Description</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900 w-20">Qty</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900 w-24">Rate</th>
                  <th className="text-right py-3 text-sm font-semibold text-gray-900 w-28">Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">{item.description}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.quantity}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">${item.rate.toLocaleString()}</td>
                    <td className="py-3 text-sm text-gray-900 text-right font-medium">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${invoice.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST ({invoice.gst_rate}%):</span>
                  <span className="font-medium">${invoice.gst_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total Amount:</span>
                  <span className="font-bold text-lg">${invoice.total_amount.toLocaleString()}</span>
                </div>
                
                {invoice.deposit_percentage > 0 && invoice.deposit_amount > 0 && (
                  <>
                    <div className="flex justify-between mt-4 pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Deposit ({invoice.deposit_percentage}%):</span>
                      <span className="font-medium">${invoice.deposit_amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-orange-600">Balance Due:</span>
                      <span className="font-bold text-lg text-orange-600">${invoice.balance_due.toLocaleString()}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
            <p>Thank you for your business!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
