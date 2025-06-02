
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { generateInvoicePDF } from "./_lib/pdfGenerator.ts";
import { createEmailHTML } from "./_lib/emailTemplate.ts";
import { EmailRequest } from "./_lib/types.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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

    // Create email HTML
    const html = createEmailHTML(message, invoiceNumber, invoiceData.invoice);

    const emailResponse = await resend.emails.send({
      from: "Andrew <andrew@whattheheck.co.nz>",
      to: [to],
      subject: subject,
      html: html,
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
