
import jsPDF from 'jspdf';
import { Invoice, InvoiceItem } from '@/hooks/useInvoices';
import { Client } from '@/hooks/useClients';

export const generateInvoicePDF = (invoice: Invoice, client: Client | undefined, items: InvoiceItem[]) => {
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
