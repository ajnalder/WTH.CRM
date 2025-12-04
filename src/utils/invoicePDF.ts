import jsPDF from 'jspdf';
import { Invoice, InvoiceItem } from '@/types/invoiceTypes';
import { Client } from '@/hooks/useClients';
import { CompanySettings } from '@/hooks/useCompanySettings';

export const generateInvoicePDF = async (
  invoice: Invoice, 
  client: Client | undefined, 
  items: InvoiceItem[],
  companySettings?: CompanySettings | null
) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 15;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return new Date().toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
    return new Date(dateString).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Company logo on right (if available)
  const rightAlign = pageWidth - marginRight;
  let logoBottomY = marginTop;
  
  if (companySettings?.logo_base64) {
    try {
      const logoWidth = 50;
      const logoHeight = 15;
      pdf.addImage(
        companySettings.logo_base64,
        'PNG',
        rightAlign - logoWidth,
        marginTop,
        logoWidth,
        logoHeight
      );
      logoBottomY = marginTop + logoHeight + 2;
    } catch (e) {
      console.error('Failed to add logo to PDF:', e);
      logoBottomY = marginTop;
    }
  }

  // TAX INVOICE title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('TAX INVOICE', marginLeft, marginTop + 10);

  // Client company name under title
  if (client) {
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(client.company, marginLeft, marginTop + 20);
  }

  // Company address on right (below logo)
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companySettings?.company_name || 'What the Heck', rightAlign, logoBottomY + 4, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.text(companySettings?.address_line1 || '8 King Street', rightAlign, logoBottomY + 10, { align: 'right' });
  pdf.text(companySettings?.address_line2 || 'Te Puke 3119', rightAlign, logoBottomY + 16, { align: 'right' });
  pdf.text(companySettings?.address_line3 || 'NEW ZEALAND', rightAlign, logoBottomY + 22, { align: 'right' });

  // Dark line separator
  let yPos = marginTop + 38;
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);

  // Invoice details row
  yPos += 8;
  const colWidth = (pageWidth - marginLeft - marginRight) / 4;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date', marginLeft, yPos);
  pdf.text('Invoice Number', marginLeft + colWidth, yPos);
  pdf.text('Reference', marginLeft + colWidth * 2, yPos);
  pdf.text('GST Number', marginLeft + colWidth * 3, yPos);

  yPos += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.text(formatDate(invoice.issued_date), marginLeft, yPos);
  pdf.text(invoice.invoice_number, marginLeft + colWidth, yPos);
  pdf.text(invoice.title || '-', marginLeft + colWidth * 2, yPos);
  pdf.text(companySettings?.gst_number || '125-651-445', marginLeft + colWidth * 3, yPos);

  // Items table
  yPos += 20;
  
  // Dark line above header
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.8);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  yPos += 6;
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Description', marginLeft, yPos);
  pdf.text('Quantity', pageWidth - 85, yPos, { align: 'right' });
  pdf.text('Unit Price', pageWidth - 50, yPos, { align: 'right' });
  pdf.text('Amount NZD', pageWidth - marginRight, yPos, { align: 'right' });
  
  // Light line below header
  yPos += 3;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);

  // Items
  pdf.setFont('helvetica', 'normal');
  items.forEach((item, index) => {
    yPos += 8;
    
    // Alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(marginLeft, yPos - 5, pageWidth - marginLeft - marginRight, 8, 'F');
    }
    
    // Handle long descriptions with text wrapping
    const descriptionLines = pdf.splitTextToSize(item.description, pageWidth - 120);
    pdf.text(descriptionLines, marginLeft, yPos);
    
    pdf.text(item.quantity.toFixed(2), pageWidth - 85, yPos, { align: 'right' });
    pdf.text(item.rate.toFixed(2), pageWidth - 50, yPos, { align: 'right' });
    pdf.text(item.amount.toFixed(2), pageWidth - marginRight, yPos, { align: 'right' });
    
    if (descriptionLines.length > 1) {
      yPos += (descriptionLines.length - 1) * 5;
    }
  });

  // Totals section
  yPos += 15;
  const totalsXPos = pageWidth - 80;
  
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Subtotal', totalsXPos, yPos);
  pdf.text(invoice.subtotal.toFixed(2), pageWidth - marginRight, yPos, { align: 'right' });
  
  yPos += 6;
  pdf.text(`TOTAL GST ${invoice.gst_rate}%`, totalsXPos, yPos);
  pdf.text((invoice.gst_amount || 0).toFixed(2), pageWidth - marginRight, yPos, { align: 'right' });
  
  // Dark line before total
  yPos += 5;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.8);
  pdf.line(totalsXPos - 5, yPos, pageWidth - marginRight, yPos);
  
  yPos += 8;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('TOTAL NZD', totalsXPos, yPos);
  pdf.text(invoice.total_amount.toFixed(2), pageWidth - marginRight, yPos, { align: 'right' });

  // Due Date
  yPos += 20;
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Due Date: ', marginLeft, yPos);
  pdf.setFont('helvetica', 'normal');
  const dueDate = invoice.due_date ? formatDate(invoice.due_date) : 'Upon receipt';
  pdf.text(dueDate, marginLeft + 22, yPos);

  // Payment Details
  yPos += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Payment Details', marginLeft, yPos);
  
  yPos += 6;
  pdf.setFont('helvetica', 'normal');
  pdf.text(companySettings?.bank_details || 'Direct Credit - Mackay Distribution 2018 Limited', marginLeft, yPos);
  
  yPos += 5;
  pdf.text(companySettings?.bank_account || '06-0556-0955531-00', marginLeft, yPos);
  
  pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
};
