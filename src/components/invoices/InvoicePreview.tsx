
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
    
    // Header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INVOICE', pageWidth / 2, 30, { align: 'center' });
    
    // Invoice details
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Invoice #: ${invoice.invoice_number}`, 20, 60);
    pdf.text(`Date: ${invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : 'Not set'}`, 20, 70);
    pdf.text(`Due Date: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}`, 20, 80);
    
    // Client info
    if (client) {
      pdf.text('Bill To:', 20, 100);
      pdf.text(client.company, 20, 110);
      if (client.name) pdf.text(client.name, 20, 120);
      if (client.email) pdf.text(client.email, 20, 130);
    }
    
    // Items table
    let yPos = 160;
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
      <div className="flex justify-between items-center">
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

      <Card className="print:shadow-none print:border-none">
        <CardContent className="p-8">
          {/* Invoice Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h1>
            <div className="text-lg text-gray-600">
              Invoice #{invoice.invoice_number}
            </div>
          </div>

          {/* Invoice Details and Client Info */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Invoice Details</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="ml-2 font-mono">{invoice.invoice_number}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2">{invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Due Date:</span>
                  <span className="ml-2">{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not set'}</span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>

            {client && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Bill To</h3>
                <div className="space-y-1 text-sm">
                  <div className="font-medium">{client.company}</div>
                  {client.name && <div>{client.name}</div>}
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                </div>
              </div>
            )}
          </div>

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
