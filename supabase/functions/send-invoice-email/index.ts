
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

  console.log('=== Starting send-invoice-email function ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  let invoiceId: string | null = null;
  let recipientEmail: string | null = null;

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);
    
    if (!authHeader) {
      console.error('Missing Authorization header');
      throw new Error('Authorization header is required');
    }

    // Get user ID from the auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    console.log('User authentication result:', { user: user?.id, error: authError?.message });
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Invalid authentication token');
    }

    const requestBody: EmailRequest = await req.json();
    console.log('Request body received:', {
      to: requestBody.to,
      subject: requestBody.subject,
      invoiceNumber: requestBody.invoiceNumber,
      clientName: requestBody.clientName,
    });

    const { to, subject, message, invoiceNumber, clientName, invoiceData } = requestBody;
    invoiceId = invoiceData.invoice.id;
    recipientEmail = to;

    console.log('Generating PDF for invoice:', invoiceNumber);

    // Fetch company settings for the user
    const { data: companySettings, error: settingsError } = await supabase
      .from('company_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (settingsError) {
      console.warn('Error fetching company settings:', settingsError);
    } else {
      console.log('Company settings loaded:', !!companySettings);
    }

    // Generate PDF with company settings
    console.log('Starting PDF generation...');
    const pdfBuffer = await generateInvoicePDF(
      invoiceData.invoice, 
      invoiceData.client, 
      invoiceData.items,
      companySettings
    );

    console.log('PDF generated successfully, size:', pdfBuffer.byteLength);

    // Create the email template with company settings
    const emailHtml = createEmailTemplate(message, clientName, companySettings);

    // Use the user's email address as the sender
    const senderEmail = user.email || 'andrew@whattheheck.co.nz';
    console.log('Using sender email:', senderEmail);

    // Send email with PDF attachment using the user's verified email
    console.log('Attempting to send email via Resend...');
    const emailResponse = await resend.emails.send({
      from: `What the Heck <${senderEmail}>`,
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

    console.log('Resend API response:', emailResponse);

    if (emailResponse.error) {
      console.error('Resend API error:', emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log('Email sent successfully with ID:', emailResponse.data?.id);

    // Log the successful email to the database
    const { error: logError } = await supabase.from('email_logs').insert({
      invoice_id: invoiceData.invoice.id,
      recipient_email: to,
      subject: subject,
      status: 'sent',
      sent_at: new Date().toISOString()
    });

    if (logError) {
      console.warn('Failed to log email to database:', logError);
    } else {
      console.log('Email logged to database successfully');
    }

    return new Response(
      JSON.stringify({ success: true, messageId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("=== Error in send-invoice-email function ===");
    console.error("Error details:", error);
    console.error("Error stack:", error.stack);

    // Log the failed email attempt to the database if we have the required info
    if (invoiceId && recipientEmail) {
      try {
        await supabase.from('email_logs').insert({
          invoice_id: invoiceId,
          recipient_email: recipientEmail,
          subject: 'Failed to send',
          status: 'failed',
          error_message: error.message || 'Unknown error',
          sent_at: new Date().toISOString()
        });
        console.log('Failed email attempt logged to database');
      } catch (logError) {
        console.error('Failed to log error to database:', logError);
      }
    }

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
