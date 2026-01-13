import { jsPDF } from "jspdf";

export function createEmailTemplate(message: string, clientName: string, companySettings?: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice Email</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 40px 20px;
          background-color: #ffffff;
        }
        .message-content {
          white-space: pre-line;
          margin: 0 0 30px 0;
        }
        .attachment-note {
          color: #666;
          font-size: 14px;
          margin: 30px 0;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e5e5;
          font-size: 14px;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="message-content">${message.replace(/\n/g, '<br>')}</div>
      
      <div class="attachment-note">
        Your invoice is attached as a PDF.
      </div>
      
      <div class="footer">
        <strong>${companySettings?.company_name || 'What the Heck'}</strong><br>
        ${companySettings?.address_line1 || '8 King Street'}<br>
        ${companySettings?.address_line2 || 'Te Puke 3119'}<br>
        ${companySettings?.address_line3 || 'NEW ZEALAND'}
      </div>
    </body>
    </html>
  `;
}

export async function generateInvoicePDF(
  invoice: any,
  client: any,
  items: any[],
  companySettings?: any,
  storageContext?: { storage: { getUrl: (storageId: string) => Promise<string | null> } }
): Promise<Uint8Array> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const marginTop = 15;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) {
      return new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
    }
    return new Date(dateString).toLocaleDateString("en-NZ", { day: "numeric", month: "short", year: "numeric" });
  };

  // Company logo on right (if available)
  const rightAlign = pageWidth - marginRight;
  let logoBottomY = marginTop;

  // Try to get logo from storage first, fall back to base64
  let logoBase64 = companySettings?.logo_base64;

  if (companySettings?.logo_storage_id && storageContext) {
    try {
      const logoUrl = await storageContext.storage.getUrl(companySettings.logo_storage_id);
      if (logoUrl) {
        // Fetch the image from storage and convert to base64
        const response = await fetch(logoUrl);
        const arrayBuffer = await response.arrayBuffer();
        // Convert ArrayBuffer to base64 using Uint8Array and btoa
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        logoBase64 = `data:image/png;base64,${base64}`;
      }
    } catch (e) {
      console.error("Failed to fetch logo from storage:", e);
      // Fall back to base64 if storage fetch fails
    }
  }

  if (logoBase64) {
    try {
      let logoWidth = 50;
      let logoHeight = 15;

      const base64Data = logoBase64.split(",")[1] || logoBase64;

      // Convert base64 to Uint8Array without using Buffer
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // PNG width/height from bytes 16-23 / 20-23
      if (bytes.length > 24 &&
          bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71) { // Check for "PNG"
        // Read big-endian 32-bit integers for width and height
        const width = (bytes[16] << 24) | (bytes[17] << 16) | (bytes[18] << 8) | bytes[19];
        const height = (bytes[20] << 24) | (bytes[21] << 16) | (bytes[22] << 8) | bytes[23];
        if (width > 0 && height > 0) {
          const aspectRatio = width / height;
          logoHeight = logoWidth / aspectRatio;
        }
      }

      pdf.addImage(
        logoBase64,
        "PNG",
        rightAlign - logoWidth,
        marginTop,
        logoWidth,
        logoHeight,
      );
      logoBottomY = marginTop + logoHeight + 2;
    } catch (e) {
      console.error("Failed to add logo to PDF:", e);
      logoBottomY = marginTop;
    }
  }

  // Title and client name
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("TAX INVOICE", marginLeft, marginTop + 10);

  if (client) {
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(client.company ?? "", marginLeft, marginTop + 20);
  }

  // Company address on right (below logo)
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text(companySettings?.company_name || "What the Heck", rightAlign, logoBottomY + 4, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.text(companySettings?.address_line1 || "8 King Street", rightAlign, logoBottomY + 10, { align: "right" });
  pdf.text(companySettings?.address_line2 || "Te Puke 3119", rightAlign, logoBottomY + 16, { align: "right" });
  pdf.text(companySettings?.address_line3 || "NEW ZEALAND", rightAlign, logoBottomY + 22, { align: "right" });

  // Line separator
  let yPos = marginTop + 38;
  pdf.setDrawColor(150, 150, 150);
  pdf.setLineWidth(0.5);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);

  // Invoice details row
  yPos += 8;
  const colWidth = (pageWidth - marginLeft - marginRight) / 4;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Invoice Date", marginLeft, yPos);
  pdf.text("Invoice Number", marginLeft + colWidth, yPos);
  pdf.text("Reference", marginLeft + colWidth * 2, yPos);
  pdf.text("GST Number", marginLeft + colWidth * 3, yPos);

  yPos += 5;
  pdf.setFont("helvetica", "normal");
  pdf.text(formatDate(invoice.issued_date), marginLeft, yPos);
  pdf.text(invoice.invoice_number, marginLeft + colWidth, yPos);
  pdf.text(invoice.title || "-", marginLeft + colWidth * 2, yPos);
  pdf.text(companySettings?.gst_number || "125-651-445", marginLeft + colWidth * 3, yPos);

  // Items table
  yPos += 20;

  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.8);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);

  yPos += 6;
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("Description", marginLeft, yPos);
  pdf.text("Quantity", pageWidth - 85, yPos, { align: "right" });
  pdf.text("Unit Price", pageWidth - 50, yPos, { align: "right" });
  pdf.text("Amount NZD", pageWidth - marginRight, yPos, { align: "right" });

  yPos += 3;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.3);
  pdf.line(marginLeft, yPos, pageWidth - marginRight, yPos);

  pdf.setFont("helvetica", "normal");
  items.forEach((item: any, index: number) => {
    yPos += 8;

    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(marginLeft, yPos - 5, pageWidth - marginLeft - marginRight, 8, "F");
    }

    const descriptionLines = pdf.splitTextToSize(item.description, pageWidth - 120);
    pdf.text(descriptionLines, marginLeft, yPos);

    pdf.text(Number(item.quantity).toFixed(2), pageWidth - 85, yPos, { align: "right" });
    pdf.text(Number(item.rate).toFixed(2), pageWidth - 50, yPos, { align: "right" });
    pdf.text(Number(item.amount).toFixed(2), pageWidth - marginRight, yPos, { align: "right" });

    if (descriptionLines.length > 1) {
      yPos += (descriptionLines.length - 1) * 5;
    }
  });

  // Totals
  yPos += 15;
  const totalsXPos = pageWidth - 80;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Subtotal", totalsXPos, yPos);
  pdf.text(Number(invoice.subtotal).toFixed(2), pageWidth - marginRight, yPos, { align: "right" });

  yPos += 6;
  const isZeroRated = invoice.gst_mode === "zero_rated" || invoice.gst_rate === 0;
  pdf.text(
    isZeroRated ? "TOTAL GST (Zero-rated)" : `TOTAL GST ${invoice.gst_rate ?? 0}%`,
    totalsXPos,
    yPos
  );
  pdf.text(Number(invoice.gst_amount ?? 0).toFixed(2), pageWidth - marginRight, yPos, { align: "right" });

  yPos += 5;
  pdf.setDrawColor(100, 100, 100);
  pdf.setLineWidth(0.8);
  pdf.line(totalsXPos - 5, yPos, pageWidth - marginRight, yPos);

  yPos += 8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("TOTAL NZD", totalsXPos, yPos);
  pdf.text(Number(invoice.total_amount).toFixed(2), pageWidth - marginRight, yPos, { align: "right" });

  // Due Date
  yPos += 20;
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "bold");
  pdf.text("Due Date: ", marginLeft, yPos);
  pdf.setFont("helvetica", "normal");
  const dueDate = invoice.due_date ? formatDate(invoice.due_date) : "Upon receipt";
  pdf.text(dueDate, marginLeft + 22, yPos);

  // Payment Details
  yPos += 12;
  pdf.setFont("helvetica", "bold");
  pdf.text("Payment Details", marginLeft, yPos);

  yPos += 6;
  pdf.setFont("helvetica", "normal");
  pdf.text(companySettings?.bank_details || "Direct Credit - Mackay Distribution 2018 Limited", marginLeft, yPos);

  yPos += 5;
  pdf.text(companySettings?.bank_account || "06-0556-0955531-00", marginLeft, yPos);

  const buffer = pdf.output("arraybuffer");
  return new Uint8Array(buffer);
}
