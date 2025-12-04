import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  quote_id: string;
  action: "sent" | "viewed" | "accepted";
  accepted_by_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { quote_id, action, accepted_by_name }: NotificationRequest = await req.json();
    
    console.log(`Processing quote notification: ${action} for quote ${quote_id}`);

    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        clients (
          id,
          company
        )
      `)
      .eq("id", quote_id)
      .single();

    if (quoteError || !quote) {
      console.error("Error fetching quote:", quoteError);
      throw new Error("Quote not found");
    }

    // Fetch user profile to get notification email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", quote.user_id)
      .single();

    if (profileError || !profile?.email) {
      console.error("Error fetching profile:", profileError);
      throw new Error("User profile not found");
    }

    // Build email content based on action
    let subject: string;
    let htmlContent: string;

    const quoteUrl = `https://jnehwoaockudqsdqwfwl.supabase.co/functions/v1/send-quote-notification`; // This would be your app URL
    const clientName = quote.clients?.company || "Unknown Client";

    switch (action) {
      case "sent":
        subject = `Quote ${quote.quote_number} sent to ${clientName}`;
        htmlContent = `
          <h2>Quote Sent</h2>
          <p>Your quote <strong>${quote.quote_number}</strong> has been sent to <strong>${clientName}</strong>.</p>
          <p><strong>Title:</strong> ${quote.title}</p>
          <p><strong>Total:</strong> $${quote.total_amount.toLocaleString()} NZD</p>
        `;
        break;

      case "viewed":
        subject = `🔔 ${clientName} viewed your quote ${quote.quote_number}`;
        htmlContent = `
          <h2>Quote Viewed!</h2>
          <p><strong>${clientName}</strong> has just viewed your quote <strong>${quote.quote_number}</strong>.</p>
          <p><strong>Title:</strong> ${quote.title}</p>
          <p><strong>Total:</strong> $${quote.total_amount.toLocaleString()} NZD</p>
          <p>They may be reviewing your proposal right now!</p>
        `;
        break;

      case "accepted":
        subject = `✅ ${clientName} accepted your quote ${quote.quote_number}!`;
        htmlContent = `
          <h2>Quote Accepted! 🎉</h2>
          <p><strong>${clientName}</strong> has accepted your quote <strong>${quote.quote_number}</strong>.</p>
          <p><strong>Signed by:</strong> ${accepted_by_name || "Unknown"}</p>
          <p><strong>Title:</strong> ${quote.title}</p>
          <p><strong>Total:</strong> $${quote.total_amount.toLocaleString()} NZD</p>
          <p><strong>Deposit (${quote.deposit_percentage}%):</strong> $${(quote.total_amount * quote.deposit_percentage / 100).toLocaleString()} NZD</p>
          <br/>
          <p>Time to create the deposit invoice and get started!</p>
        `;
        break;

      default:
        throw new Error("Invalid action");
    }

    // Send email notification
    const emailResponse = await resend.emails.send({
      from: "What the Heck <notifications@whattheheck.co.nz>",
      to: [profile.email],
      subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-quote-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
