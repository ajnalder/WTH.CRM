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
  // Create A4 PDF with reduced margins
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });
  
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginLeft = 10;
  const marginRight = 10;
  const marginTop = 10;
  
  // Add logo with proper aspect ratio
  try {
    if (companySettings?.logo_base64) {
      // Use stored logo from company settings
      const logoWidth = 60;
      const logoHeight = 9.8; // Maintain 6.1:1 aspect ratio (60/6.1 ≈ 9.8)
      pdf.addImage(companySettings.logo_base64, 'PNG', marginLeft, marginTop, logoWidth, logoHeight);
    } else {
      // Fallback to loading from public folder
      const logoImg = new Image();
      logoImg.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        logoImg.onload = () => {
          const logoWidth = 60;
          const logoHeight = 9.8;
          pdf.addImage(logoImg, 'PNG', marginLeft, marginTop, logoWidth, logoHeight);
          resolve(null);
        };
        logoImg.onerror = (error) => {
          console.warn('Could not load logo for PDF, using text fallback:', error);
          resolve(null);
        };
        logoImg.src = `${window.location.origin}/lovable-uploads/66b04964-07c1-4620-a5a5-98c5bdae7fc7.png`;
      });
    }
  } catch (error) {
    console.warn('Could not load logo for PDF, using text fallback:', error);
    // Add text fallback if logo fails to load
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companySettings?.company_name || 'What the Heck', marginLeft, marginTop + 15);
  }

  // Header with invoice title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Invoice - ' + invoice.invoice_number, marginLeft, marginTop + 45);
  
  // Business details on right side
  const rightAlign = pageWidth - marginRight;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text(companySettings?.company_name || 'What the Heck', rightAlign, marginTop + 10, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(companySettings?.address_line1 || '8 King Street', rightAlign, marginTop + 20, { align: 'right' });
  pdf.text(companySettings?.address_line2 || 'Te Puke 3119', rightAlign, marginTop + 28, { align: 'right' });
  pdf.text(companySettings?.address_line3 || 'NEW ZEALAND', rightAlign, marginTop + 36, { align: 'right' });
  
  // GST Number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('GST Number', rightAlign, marginTop + 52, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(companySettings?.gst_number || '125-651-445', rightAlign, marginTop + 60, { align: 'right' });
  
  // Invoice Date - positioned under GST Number
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date', rightAlign, marginTop + 76, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString(), rightAlign, marginTop + 84, { align: 'right' });
  
  // Client info (Bill To)
  let yPos = marginTop + 65;
  if (client) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Bill To:', marginLeft, yPos);
    
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    yPos += 10;
    pdf.text(client.company, marginLeft, yPos);
    
    if (client.phone) {
      yPos += 8;
      pdf.text(client.phone, marginLeft, yPos);
    }
  }

  // Project Description
  if (invoice.description) {
    yPos += 20;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Description:', marginLeft, yPos);
    
    yPos += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    // Handle long descriptions with proper text wrapping
    const descriptionLines = pdf.splitTextToSize(invoice.description, pageWidth - marginLeft - marginRight - 10);
    pdf.text(descriptionLines, marginLeft, yPos);
    yPos += descriptionLines.length * 6;
  }
  
  // Items table header
  yPos += 30;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Description', marginLeft, yPos);
  pdf.text('Qty', pageWidth - 95, yPos, { align: 'center' });
  pdf.text('Rate', pageWidth - 65, yPos, { align: 'center' });
  pdf.text('Amount', pageWidth - marginRight, yPos, { align: 'right' });
  
  // Underline for table header
  yPos += 2;
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  // Items
  pdf.setFont('helvetica', 'normal');
  items.forEach((item) => {
    yPos += 12;
    
    // Handle long descriptions with text wrapping
    const descriptionLines = pdf.splitTextToSize(item.description, pageWidth - 160);
    pdf.text(descriptionLines, marginLeft, yPos);
    
    pdf.text(item.quantity.toString(), pageWidth - 95, yPos, { align: 'center' });
    pdf.text(`$${item.rate.toLocaleString()}`, pageWidth - 65, yPos, { align: 'center' });
    pdf.text(`$${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
    
    // Add extra space for multi-line descriptions
    if (descriptionLines.length > 1) {
      yPos += (descriptionLines.length - 1) * 6;
    }
  });
  
  // Totals section
  yPos += 25;
  const totalsXPos = pageWidth - 80;
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('Subtotal:', totalsXPos, yPos);
  pdf.text(`$${invoice.subtotal.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
  
  yPos += 8;
  pdf.text(`GST (${invoice.gst_rate}%):`, totalsXPos, yPos);
  pdf.text(`$${invoice.gst_amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
  
  yPos += 12;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Total Amount:', totalsXPos, yPos);
  pdf.text(`$${invoice.total_amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });

  // Payment options section
  yPos += 30;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('PAYMENT OPTIONS:', marginLeft, yPos);
  
  yPos += 12;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(companySettings?.bank_details || 'Direct Credit - Mackay Distribution 2018 Limited', marginLeft, yPos);
  
  yPos += 8;
  pdf.text(companySettings?.bank_account || '06-0556-0955531-00', marginLeft, yPos);

  // Due Date - moved down to payment section
  yPos += 16;
  pdf.setFont('helvetica', 'bold');
  pdf.text('Due Date:', marginLeft, yPos);
  pdf.setFont('helvetica', 'normal');
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt';
  pdf.text(dueDate, marginLeft + 25, yPos);

  // Footer
  yPos = pageHeight - 30;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  pdf.save(`Invoice-${invoice.invoice_number}.pdf`);
};
