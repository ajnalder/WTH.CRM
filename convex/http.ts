import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();
const imageProxyHosts = new Set(["cdn.shopify.com"]);
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

      // Exchange the code for tokens - pass the user_id from the state record
      // This bypasses auth since we're in an HTTP callback without session
      await ctx.runAction(api.xero.exchangeCodeNoAuth, {
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

http.route({
  path: "/image-proxy",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const requestUrl = new URL(request.url);
    const target = requestUrl.searchParams.get("url");
    if (!target) {
      return new Response("Missing url", { status: 400 });
    }

    let targetUrl: URL;
    try {
      targetUrl = new URL(target);
    } catch {
      return new Response("Invalid url", { status: 400 });
    }

    if (!["https:", "http:"].includes(targetUrl.protocol)) {
      return new Response("Invalid protocol", { status: 400 });
    }
    if (!imageProxyHosts.has(targetUrl.hostname)) {
      return new Response("Host not allowed", { status: 403 });
    }

    let upstream: Response;
    try {
      upstream = await fetch(targetUrl.toString(), {
        headers: {
          Accept: "image/png,image/jpeg,image/*;q=0.8",
          "User-Agent": "Mozilla/5.0",
        },
      });
    } catch (error) {
      console.error("Image proxy fetch failed:", error);
      return new Response("Upstream fetch failed", { status: 502 });
    }

    if (!upstream.ok || !upstream.body) {
      return new Response("Upstream error", { status: 502 });
    }

    const headers = new Headers();
    headers.set(
      "Content-Type",
      upstream.headers.get("content-type") ?? "application/octet-stream"
    );
    headers.set(
      "Cache-Control",
      upstream.headers.get("cache-control") ?? "public, max-age=86400"
    );
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(upstream.body, { status: 200, headers });
  }),
});

http.route({
  path: "/promo/extension-add",
  method: "OPTIONS",
  handler: httpAction(async () => {
    return new Response(null, { status: 204, headers: corsHeaders });
  }),
});

http.route({
  path: "/promo/extension-add",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
    }

      const { clientId, token, promotionId, product } = payload ?? {};
      if (!clientId || !token || !promotionId || !product) {
      return new Response("Missing required fields", { status: 400, headers: corsHeaders });
      }

    try {
      const validation = await ctx.runQuery(api.promoClients.validatePortalToken, {
        clientId,
        token,
      });
      if (!validation?.valid) {
        return new Response(
          `Invalid token (clientId=${clientId})`,
          { status: 401, headers: corsHeaders }
        );
      }

      const promotion = await ctx.runQuery(api.promoPromotions.getPromotionForPortal, {
        clientId,
        token,
        promotionId,
      });
      if (!promotion?.promotion) {
        return new Response("Promotion not found", { status: 404, headers: corsHeaders });
      }

      if (promotion.promotion.status !== "draft") {
        return new Response("Promotion is locked", { status: 409, headers: corsHeaders });
      }

      const upserted = await ctx.runMutation(api.promoProducts.upsertProductFromExtension, {
        clientId,
        token,
        product,
      });

      await ctx.runMutation(api.promoPromotions.addPromotionItem, {
        clientId,
        token,
        promotionId,
        productId: upserted.productId,
      });

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } catch (error: any) {
      return new Response(error.message ?? "Server error", {
        status: 500,
        headers: corsHeaders,
      });
    }
  }),
});

export default http;
