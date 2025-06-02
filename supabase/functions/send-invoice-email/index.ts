
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { generateInvoicePDF } from './_lib/pdfGenerator.ts';
import { createEmailTemplate } from './_lib/emailTemplate.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Get user ID from the auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { to, subject, message, invoiceNumber, clientName, invoiceData }: EmailRequest = await req.json();

    console.log('Generating PDF for invoice:', invoiceNumber);

    // Fetch company settings for the user
    const { data: companySettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.warn('Error fetching company settings:', settingsError);
    }

    // Generate PDF with company settings
    const pdfBuffer = await generateInvoicePDF(
      invoiceData.invoice, 
      invoiceData.client, 
      invoiceData.items,
      companySettings
    );

    console.log('PDF generated successfully, size:', pdfBuffer.byteLength);

    // Create the email template with company settings
    const emailHtml = createEmailTemplate(message, clientName, companySettings);

    // Send email with PDF attachment
    const emailResponse = await resend.emails.send({
      from: `${companySettings?.company_name || 'What the Heck'} <noreply@resend.dev>`,
      to: [to],
      subject: subject,
      html: emailHtml,
      attachments: [
        {
          filename: `Invoice-${invoiceNumber}.pdf`,
          content: Array.from(new Uint8Array(pdfBuffer)),
        },
      ],
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the email to the database
    await supabase.from('email_logs').insert({
      invoice_id: invoiceData.invoice.id,
      recipient_email: to,
      subject: subject,
      status: 'sent'
    });

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to send email' 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

