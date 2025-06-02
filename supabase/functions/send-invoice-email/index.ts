
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { generateInvoicePDF } from "./_lib/pdfGenerator.ts";
import { createEmailHTML } from "./_lib/emailTemplate.ts";
import { EmailRequest } from "./_lib/types.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    // Create Supabase client with service role key for logging
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Log the email in the database
    try {
      const { error: logError } = await supabase
        .from('email_logs')
        .insert({
          invoice_id: invoiceData.invoice.id,
          recipient_email: to,
          subject: subject,
          status: 'sent'
        });

      if (logError) {
        console.error('Error logging email:', logError);
        // Don't fail the email send if logging fails
      }
    } catch (logErr) {
      console.error('Error logging email:', logErr);
    }

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

    // Log the error in the database if we have invoice data
    try {
      const requestBody = await req.clone().json();
      if (requestBody.invoiceData?.invoice?.id) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        await supabase
          .from('email_logs')
          .insert({
            invoice_id: requestBody.invoiceData.invoice.id,
            recipient_email: requestBody.to || 'unknown',
            subject: requestBody.subject || 'Invoice Email',
            status: 'failed',
            error_message: error.message
          });
      }
    } catch (logErr) {
      console.error('Error logging failed email:', logErr);
    }

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
