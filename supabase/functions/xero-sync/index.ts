
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const xeroClientId = Deno.env.get('XERO_CLIENT_ID')!;
const xeroClientSecret = Deno.env.get('XERO_CLIENT_SECRET')!;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    const { action, invoice_id } = await req.json();

    // Get user's Xero tokens
    const { data: tokenRecord } = await supabase
      .from('xero_tokens')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!tokenRecord) {
      throw new Error('Xero not connected');
    }

    let accessToken = tokenRecord.access_token;

    // Check if token needs refresh
    if (new Date(tokenRecord.expires_at) <= new Date()) {
      const refreshResponse = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${xeroClientId}:${xeroClientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: tokenRecord.refresh_token
        })
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Xero token');
      }

      const newTokens = await refreshResponse.json();
      accessToken = newTokens.access_token;

      // Update stored tokens
      await supabase
        .from('xero_tokens')
        .update({
          access_token: newTokens.access_token,
          refresh_token: newTokens.refresh_token,
          expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
    }

  if (action === 'sync_invoice') {
      // Get invoice details from database
      const { data: invoice } = await supabase
        .from('invoices')
        .select(`
          *,
          clients(*),
          invoice_items(*)
        `)
        .eq('id', invoice_id)
        .eq('user_id', user.id)
        .single();

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Get user's company settings for account code
      const { data: companySettings } = await supabase
        .from('company_settings')
        .select('xero_account_code')
        .eq('user_id', user.id)
        .single();

      const accountCode = companySettings?.xero_account_code || '200';
      console.log('Using Xero account code:', accountCode);

      // Create contact in Xero if needed
      const contactData = {
        Name: invoice.clients.company,
        EmailAddress: invoice.clients.email || '',
        Phones: invoice.clients.phone ? [{ PhoneType: 'DEFAULT', PhoneNumber: invoice.clients.phone }] : []
      };

      console.log('Creating contact in Xero:', contactData.Name);
      console.log('Using tenant_id:', tokenRecord.tenant_id);

      const contactResponse = await fetch(`https://api.xero.com/api.xro/2.0/Contacts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Xero-tenant-id': tokenRecord.tenant_id,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ Contacts: [contactData] })
      });

      console.log('Contact response status:', contactResponse.status);
      console.log('Contact response content-type:', contactResponse.headers.get('content-type'));

      const contactResponseText = await contactResponse.text();
      console.log('Contact response body (first 500 chars):', contactResponseText.substring(0, 500));

      if (!contactResponse.ok) {
        throw new Error(`Failed to create contact in Xero: ${contactResponse.status} - ${contactResponseText.substring(0, 200)}`);
      }

      // Parse as JSON only if we have valid JSON
      let contactResult;
      try {
        contactResult = JSON.parse(contactResponseText);
      } catch (parseError) {
        throw new Error(`Invalid JSON from Xero API: ${contactResponseText.substring(0, 200)}`);
      }
      
      console.log('Contact created successfully');
      const xeroContactId = contactResult.Contacts?.[0]?.ContactID;
      
      if (!xeroContactId) {
        throw new Error('Failed to get contact ID from Xero response');
      }

      // Create invoice in Xero
      const xeroInvoice = {
        Type: 'ACCREC',
        Contact: { ContactID: xeroContactId },
        Date: invoice.issued_date || new Date().toISOString().split('T')[0],
        DueDate: invoice.due_date,
        InvoiceNumber: invoice.invoice_number,
        Reference: invoice.title,
        Status: 'AUTHORISED',
        LineItems: invoice.invoice_items.map((item: any) => ({
          Description: item.description,
          Quantity: item.quantity,
          UnitAmount: item.rate,
          AccountCode: accountCode
        }))
      };

      const invoiceResponse = await fetch(`https://api.xero.com/api.xro/2.0/Invoices`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Xero-tenant-id': tokenRecord.tenant_id,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ Invoices: [xeroInvoice] })
      });

      if (!invoiceResponse.ok) {
        const errorText = await invoiceResponse.text();
        throw new Error(`Xero API error: ${errorText}`);
      }

      const invoiceResult = await invoiceResponse.json();
      const xeroInvoiceId = invoiceResult.Invoices[0].InvoiceID;

      // Update local invoice with Xero ID
      await supabase
        .from('invoices')
        .update({ xero_invoice_id: xeroInvoiceId })
        .eq('id', invoice_id);

      return new Response(JSON.stringify({ 
        success: true, 
        xero_invoice_id: xeroInvoiceId,
        message: 'Invoice synced to Xero successfully'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Xero sync error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
