
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

interface XeroTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token: string;
  scope: string;
}

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

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (action === 'get_auth_url') {
      // Generate Xero OAuth URL
      const redirectUri = `${url.origin}/xero-callback`;
      const state = crypto.randomUUID();
      const scope = 'accounting.transactions accounting.contacts accounting.settings';
      
      const authUrl = new URL('https://login.xero.com/identity/connect/authorize');
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('client_id', xeroClientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('state', state);

      // Store state for validation
      await supabase
        .from('xero_oauth_states')
        .upsert({
          user_id: user.id,
          state,
          created_at: new Date().toISOString()
        });

      return new Response(JSON.stringify({ auth_url: authUrl.toString() }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'exchange_code') {
      const { code, state } = await req.json();

      // Validate state
      const { data: stateRecord } = await supabase
        .from('xero_oauth_states')
        .select('*')
        .eq('user_id', user.id)
        .eq('state', state)
        .single();

      if (!stateRecord) {
        throw new Error('Invalid state parameter');
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${xeroClientId}:${xeroClientSecret}`)}`
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${url.origin}/xero-callback`
        })
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens: XeroTokenResponse = await tokenResponse.json();

      // Get tenant connections
      const connectionsResponse = await fetch('https://api.xero.com/connections', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      const connections = await connectionsResponse.json();

      // Store tokens and tenant info
      await supabase
        .from('xero_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          tenant_id: connections[0]?.tenantId,
          tenant_name: connections[0]?.tenantName,
          updated_at: new Date().toISOString()
        });

      // Clean up state
      await supabase
        .from('xero_oauth_states')
        .delete()
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ success: true, tenant_name: connections[0]?.tenantName }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    if (action === 'get_connection_status') {
      const { data: tokenRecord } = await supabase
        .from('xero_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const isConnected = !!tokenRecord && new Date(tokenRecord.expires_at) > new Date();

      return new Response(JSON.stringify({ 
        is_connected: isConnected,
        tenant_name: tokenRecord?.tenant_name 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    throw new Error('Invalid action');
  } catch (error) {
    console.error('Xero OAuth error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
