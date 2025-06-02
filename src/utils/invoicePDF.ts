
import jsPDF from 'jspdf';
import { Invoice, InvoiceItem } from '@/hooks/useInvoices';
import { Client } from '@/hooks/useClients';

export const generateInvoicePDF = async (invoice: Invoice, client: Client | undefined, items: InvoiceItem[]) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  
  // Add logo
  try {
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    
    await new Promise((resolve, reject) => {
      logoImg.onload = () => {
        // Add logo to PDF (resize to match web preview)
        pdf.addImage(logoImg, 'PNG', 20, 20, 40, 16);
        resolve(null);
      };
      logoImg.onerror = reject;
      logoImg.src = '/lovable-uploads/66b04964-07c1-4620-a5a5-98c5bdae7fc7.png';
    });
  } catch (error) {
    console.warn('Could not load logo for PDF:', error);
  }

  // Header with invoice title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Invoice - ' + invoice.invoice_number, 20, 50);
  
  // Business details on right side
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('What the Heck', pageWidth - 20, 30, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('8 King Street', pageWidth - 20, 40, { align: 'right' });
  pdf.text('Te Puke 3119', pageWidth - 20, 47, { align: 'right' });
  pdf.text('NEW ZEALAND', pageWidth - 20, 54, { align: 'right' });
  
  // GST Number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('GST Number', pageWidth - 20, 70, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text('125-651-445', pageWidth - 20, 77, { align: 'right' });
  
  // Invoice Date
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date', pageWidth - 20, 93, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString(), pageWidth - 20, 100, { align: 'right' });
  
  // Client info (Bill To)
  let yPos = 70;
  if (client) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Bill To:', 20, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    yPos += 10;
    pdf.text(client.company, 20, yPos);
    
    if (client.name) {
      yPos += 7;
      pdf.text(client.name, 20, yPos);
    }
    if (client.email) {
      yPos += 7;
      pdf.text(client.email, 20, yPos);
    }
    if (client.phone) {
      yPos += 7;
      pdf.text(client.phone, 20, yPos);
    }
  }

  // Project Description
  if (invoice.description) {
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Description', 20, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(invoice.description, 20, yPos);
  }
  
  // Items table header
  yPos += 30;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Description', 20, yPos);
  pdf.text('Qty', 120, yPos, { align: 'right' });
  pdf.text('Rate', 145, yPos, { align: 'right' });
  pdf.text('Amount', 170, yPos, { align: 'right' });
  
  // Underline for table header
  yPos += 3;
  pdf.line(20, yPos, 180, yPos);
  
  // Items
  pdf.setFont('helvetica', 'normal');
  items.forEach((item) => {
    yPos += 15;
    
    // Handle long descriptions with text wrapping
    const descriptionLines = pdf.splitTextToSize(item.description, 90);
    pdf.text(descriptionLines, 20, yPos);
    
    pdf.text(item.quantity.toString(), 120, yPos, { align: 'right' });
    pdf.text(`$${item.rate.toLocaleString()}`, 145, yPos, { align: 'right' });
    pdf.text(`$${item.amount.toLocaleString()}`, 170, yPos, { align: 'right' });
    
    // Add extra space for multi-line descriptions
    if (descriptionLines.length > 1) {
      yPos += (descriptionLines.length - 1) * 5;
    }
  });
  
  // Totals section
  yPos += 30;
  const totalsXPos = 120;
  
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal:', totalsXPos, yPos);
  pdf.text(`$${invoice.subtotal.toLocaleString()}`, 170, yPos, { align: 'right' });
  
  yPos += 10;
  pdf.text(`GST (${invoice.gst_rate}%):`, totalsXPos, yPos);
  pdf.text(`$${invoice.gst_amount.toLocaleString()}`, 170, yPos, { align: 'right' });
  
  yPos += 15;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount:', totalsXPos, yPos);
  pdf.text(`$${invoice.total_amount.toLocaleString()}`, 170, yPos, { align: 'right' });
  
  // Deposit and balance if applicable
  if (invoice.deposit_percentage > 0 && invoice.deposit_amount > 0) {
    yPos += 15;
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Deposit (${invoice.deposit_percentage}%):`, totalsXPos, yPos);
    pdf.text(`$${invoice.deposit_amount.toLocaleString()}`, 170, yPos, { align: 'right' });
    
    yPos += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Balance Due:', totalsXPos, yPos);
    pdf.text(`$${invoice.balance_due.toLocaleString()}`, 170, yPos, { align: 'right' });
  }

  // Footer
  yPos += 40;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
};
