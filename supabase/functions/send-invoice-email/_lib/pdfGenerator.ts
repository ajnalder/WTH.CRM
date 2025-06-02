
export const generateInvoicePDF = async (invoice: any, client: any, items: any[]): Promise<Uint8Array> => {
  // Import jsPDF dynamically
  const { jsPDF } = await import("https://esm.sh/jspdf@2.5.1");
  
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

  // Add company name as text since we can't easily load external images in Deno
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('What the Heck', marginLeft, marginTop + 15);

  // Header with invoice title
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Tax Invoice - ' + invoice.invoice_number, marginLeft, marginTop + 45);
  
  // Business details on right side
  const rightAlign = pageWidth - marginRight;
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('What the Heck', rightAlign, marginTop + 10, { align: 'right' });
  
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text('8 King Street', rightAlign, marginTop + 20, { align: 'right' });
  pdf.text('Te Puke 3119', rightAlign, marginTop + 28, { align: 'right' });
  pdf.text('NEW ZEALAND', rightAlign, marginTop + 36, { align: 'right' });
  
  // GST Number
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('GST Number', rightAlign, marginTop + 52, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text('125-651-445', rightAlign, marginTop + 60, { align: 'right' });
  
  // Due Date
  pdf.setFont('helvetica', 'bold');
  pdf.text('Due Date', rightAlign, marginTop + 76, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Upon receipt';
  pdf.text(dueDate, rightAlign, marginTop + 84, { align: 'right' });
  
  // Invoice Date
  pdf.setFont('helvetica', 'bold');
  pdf.text('Invoice Date', rightAlign, marginTop + 92, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(invoice.issued_date ? new Date(invoice.issued_date).toLocaleDateString() : new Date().toLocaleDateString(), rightAlign, marginTop + 100, { align: 'right' });
  
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
    
    if (client.name) {
      yPos += 8;
      pdf.text(client.name, marginLeft, yPos);
    }
    if (client.email) {
      yPos += 8;
      pdf.text(client.email, marginLeft, yPos);
    }
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
    const descriptionLines = pdf.splitTextToSize(invoice.description, pageWidth - marginLeft - marginRight - 20);
    pdf.text(descriptionLines, marginLeft, yPos);
    yPos += descriptionLines.length * 6;
  }
  
  // Items table header
  yPos += 25;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('Description', marginLeft, yPos);
  pdf.text('Qty', pageWidth - 80, yPos, { align: 'center' });
  pdf.text('Rate', pageWidth - 50, yPos, { align: 'center' });
  pdf.text('Amount', pageWidth - marginRight, yPos, { align: 'right' });
  
  // Underline for table header
  yPos += 2;
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);
  
  // Items
  pdf.setFont('helvetica', 'normal');
  items.forEach((item) => {
    yPos += 12;
    
    // Handle long descriptions with text wrapping - use smaller width to prevent overlap
    const descriptionLines = pdf.splitTextToSize(item.description, pageWidth - 140);
    pdf.text(descriptionLines, marginLeft, yPos);
    
    pdf.text(item.quantity.toString(), pageWidth - 80, yPos, { align: 'center' });
    pdf.text(`$${item.rate.toLocaleString()}`, pageWidth - 50, yPos, { align: 'center' });
    pdf.text(`$${item.amount.toLocaleString()}`, pageWidth - marginRight, yPos, { align: 'right' });
    
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
  pdf.text('Direct Credit - Mackay Distribution 2018 Limited', marginLeft, yPos);
  
  yPos += 8;
  pdf.text('06-0556-0955531-00', marginLeft, yPos);

  // Footer
  yPos = pageHeight - 30;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  return pdf.output('arraybuffer');
};
