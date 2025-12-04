
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  // Default frontend URL
  let frontendUrl = 'https://jnehwoaockudqsdqwfwl.lovable.app';

  // Try to get the frontend_origin from the stored state
  if (state) {
    try {
      const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
      const { data: stateRecord } = await supabase
        .from('xero_oauth_states')
        .select('frontend_origin')
        .eq('state', state)
        .single();
      
      if (stateRecord?.frontend_origin) {
        frontendUrl = stateRecord.frontend_origin;
      }
      console.log('Found frontend_origin for state:', state, '->', frontendUrl);
    } catch (e) {
      console.error('Error looking up state:', e);
    }
  }

  if (error) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${frontendUrl}/settings?xero_error=${encodeURIComponent(error)}`
      }
    });
  }

  if (code && state) {
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${frontendUrl}/settings?xero_code=${encodeURIComponent(code)}&xero_state=${encodeURIComponent(state)}`
      }
    });
  }

  return new Response(null, {
    status: 302,
    headers: {
      'Location': frontendUrl
    }
  });
};

serve(handler);
