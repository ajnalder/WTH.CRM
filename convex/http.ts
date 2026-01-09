import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

// Xero OAuth callback endpoint
http.route({
  path: "/xero/callback",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return new Response(
        `<html><body><h1>Xero Authorization Failed</h1><p>Error: ${error}</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    if (!code || !state) {
      return new Response(
        `<html><body><h1>Invalid Request</h1><p>Missing code or state parameter</p></body></html>`,
        { status: 400, headers: { "Content-Type": "text/html" } }
      );
    }

    try {
      // Get the state record to find the user
      const stateRecord = await ctx.runQuery(api.xero.getStateRecord, { state });

      if (!stateRecord) {
        return new Response(
          `<html><body><h1>Invalid State</h1><p>The authorization state is invalid or expired</p></body></html>`,
          { status: 400, headers: { "Content-Type": "text/html" } }
        );
      }

      // Exchange the code for tokens
      await ctx.runAction(api.xero.exchangeCode, {
        userId: stateRecord.user_id,
        code,
        state,
      });

      // Get the frontend origin for redirect
      const frontendOrigin = stateRecord.frontend_origin || "https://wth-crm.vercel.app";

      // Redirect back to the app
      return new Response(null, {
        status: 302,
        headers: {
          Location: `${frontendOrigin}/settings?xero=connected`,
        },
      });
    } catch (error: any) {
      console.error("Xero callback error:", error);
      return new Response(
        `<html><body><h1>Connection Failed</h1><p>${error.message || "An error occurred"}</p></body></html>`,
        { status: 500, headers: { "Content-Type": "text/html" } }
      );
    }
  }),
});

export default http;
