import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendCampaignRequest {
  campaignId: string;
  testEmail?: string; // If provided, send only to this email for testing
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: { persistSession: false },
      }
    );

    const { campaignId, testEmail }: SendCampaignRequest = await req.json();

    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      throw new Error('Campaign not found');
    }

    // Get recipients - either test email or all subscribed contacts
    let recipients: any[] = [];
    
    if (testEmail) {
      recipients = [{ email: testEmail, name: 'Test User', id: 'test' }];
    } else {
      const { data: contacts, error: contactsError } = await supabase
        .from('contacts')
        .select('id, name, email')
        .eq('email_subscribed', true)
        .is('unsubscribed_at', null);

      if (contactsError) {
        throw new Error('Failed to fetch contacts');
      }

      recipients = contacts || [];
    }

    if (recipients.length === 0) {
      throw new Error('No recipients found');
    }

    // Update campaign status to sending
    await supabase
      .from('email_campaigns')
      .update({ 
        status: 'sending',
        recipient_count: recipients.length 
      })
      .eq('id', campaignId);

    let successCount = 0;
    let errorCount = 0;

    // Send emails in batches to avoid rate limiting
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (contact) => {
        try {
          // Generate unsubscribe link with secure token
          const unsubscribeToken = crypto.randomUUID();
          const unsubscribeUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/unsubscribe?token=${unsubscribeToken}&contact=${contact.id}`;
          
          // Add unsubscribe link to email content
          const emailContent = campaign.content_html + `
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; font-size: 12px; color: #999;">
              <p>You received this email because you're subscribed to our mailing list.</p>
              <p><a href="${unsubscribeUrl}" style="color: #999; text-decoration: underline;">Unsubscribe</a></p>
            </div>
          `;

          // Track email send
          const { data: campaignSend, error: trackError } = await supabase
            .from('campaign_sends')
            .insert({
              campaign_id: campaignId,
              contact_id: contact.id,
              email_address: contact.email,
              status: 'pending'
            })
            .select()
            .single();

          if (trackError) {
            console.error('Failed to track email send:', trackError);
            return;
          }

          // Send email via Resend
          const emailResponse = await resend.emails.send({
            from: "Campaign <campaign@resend.dev>",
            to: [contact.email],
            subject: campaign.subject,
            html: emailContent,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
          });

          if (emailResponse.error) {
            // Update campaign send status
            await supabase
              .from('campaign_sends')
              .update({
                status: 'failed',
                error_message: emailResponse.error.message
              })
              .eq('id', campaignSend.id);
            
            errorCount++;
            console.error(`Failed to send to ${contact.email}:`, emailResponse.error);
          } else {
            // Update campaign send status
            await supabase
              .from('campaign_sends')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString(),
                delivered_at: new Date().toISOString()
              })
              .eq('id', campaignSend.id);
            
            successCount++;
            console.log(`Email sent successfully to ${contact.email}`);
          }

        } catch (error) {
          console.error(`Error sending email to ${contact.email}:`, error);
          errorCount++;
        }
      }));

      // Add delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Update campaign final status
    const finalStatus = errorCount === 0 ? 'sent' : 'sending';
    await supabase
      .from('email_campaigns')
      .update({
        status: finalStatus,
        sent_at: new Date().toISOString(),
        delivered_count: successCount
      })
      .eq('id', campaignId);

    console.log(`Campaign ${campaignId} completed. Success: ${successCount}, Errors: ${errorCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        totalRecipients: recipients.length,
        successCount,
        errorCount,
        message: `Campaign sent to ${successCount} recipients${errorCount > 0 ? ` with ${errorCount} errors` : ''}`
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error in send-email-campaign function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);