
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  message: string;
  invoiceNumber: string;
  clientName: string;
  invoiceData: {
    invoice: any;
    client: any;
    items: any[];
  };
}

// PDF generation function
const generateInvoicePDF = async (invoice: any, client: any, items: any[]): Promise<Uint8Array> => {
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
  
  // Invoice Date
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
    pdf.text('Description', marginLeft, yPos);
    
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
    
    const descriptionLines = pdf.splitTextToSize(item.description, pageWidth - 120);
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

  // Footer
  yPos = pageHeight - 30;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text('Thank you for your business!', pageWidth / 2, yPos, { align: 'center' });
  
  return pdf.output('arraybuffer');
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, message, invoiceNumber, clientName, invoiceData }: EmailRequest = await req.json();

    console.log(`Sending invoice email with PDF to ${to} for invoice ${invoiceNumber}`);

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(
      invoiceData.invoice,
      invoiceData.client,
      invoiceData.items
    );

    const emailResponse = await resend.emails.send({
      from: "Andrew <andrew@whattheheck.co.nz>",
      to: [to],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin: 0 0 10px 0;">Invoice from What the Heck</h2>
            <p style="color: #666; margin: 0;">Invoice #${invoiceNumber}</p>
          </div>
          
          <div style="background-color: white; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
            ${message.split('\n').map(line => `<p style="margin: 10px 0; color: #333;">${line}</p>`).join('')}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; text-align: center; color: #666; font-size: 12px;">
            <p>This email was sent from What the Heck invoice system.</p>
          </div>
        </div>
      `,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: Array.from(new Uint8Array(pdfBuffer)),
        },
      ],
    });

    console.log("Email with PDF sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id,
      message: `Email with PDF attachment sent successfully to ${to}`
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Failed to send email"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
