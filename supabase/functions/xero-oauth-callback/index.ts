
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const handler = async (req: Request): Promise<Response> => {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    // Redirect back to the app with error
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.origin}/?xero_error=${encodeURIComponent(error)}`
      }
    });
  }

  if (code && state) {
    // Redirect back to the app with success parameters
    return new Response(null, {
      status: 302,
      headers: {
        'Location': `${url.origin}/?xero_code=${encodeURIComponent(code)}&xero_state=${encodeURIComponent(state)}`
      }
    });
  }

  // If no code or error, redirect to homepage
  return new Response(null, {
    status: 302,
    headers: {
      'Location': url.origin
    }
  });
};

serve(handler);
