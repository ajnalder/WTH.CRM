import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
import { api } from "./_generated/api";

const XERO_SCOPES = [
  "openid",
  "profile",
  "email",
  "offline_access",
  "accounting.transactions",
  "accounting.contacts",
  "accounting.settings",
].join(" ");

function getEnv(key: string) {
  const val = process.env[key];
  if (!val) throw new Error(`${key} is not set in Convex environment variables`);
  return val;
}

// Helper function to create Basic auth header
// Use Buffer in Node.js context (actions with "use node"), btoa otherwise
function createBasicAuthHeader(clientId: string, clientSecret: string): string {
  try {
    // Try Buffer first (available in Node.js / "use node" actions)
    if (typeof Buffer !== 'undefined') {
      return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`;
    }
  } catch (e) {
    // Fall back to btoa if Buffer not available
  }
  return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
}

export const getTokenRecord = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("xero_tokens")
      .withIndex("by_user", (q) => q.eq("user_id", args.userId))
      .first();
  },
});

export const saveTokenRecord = mutation({
  args: {
    id: v.optional(v.id("xero_tokens")),
    user_id: v.string(),
    access_token: v.string(),
    refresh_token: v.string(),
    tenant_id: v.string(),
    tenant_name: v.optional(v.string()),
    expires_at: v.string(),
  },
  handler: async (ctx, args) => {
    const record = {
      id: crypto.randomUUID(),
      user_id: args.user_id,
      access_token: args.access_token,
      refresh_token: args.refresh_token,
      tenant_id: args.tenant_id,
      tenant_name: args.tenant_name ?? undefined,
      expires_at: args.expires_at,
      created_at: nowIso(),
      updated_at: nowIso(),
    };

    if (args.id) {
      const existing = await ctx.db.get(args.id);
      if (existing) {
        await ctx.db.replace(args.id, { ...existing, ...record });
        return;
      }
    }

    await ctx.db.insert("xero_tokens", record);
  },
});

export const getStateRecord = query({
  args: { state: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("xero_oauth_states")
      .withIndex("by_state", (q) => q.eq("state", args.state))
      .first();
  },
});

export const insertStateRecord = mutation({
  args: {
    user_id: v.string(),
    state: v.string(),
    frontend_origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("xero_oauth_states", {
      id: crypto.randomUUID(),
      user_id: args.user_id,
      state: args.state,
      frontend_origin: args.frontend_origin ?? undefined,
      created_at: nowIso(),
    });
  },
});

export const deleteStateRecord = mutation({
  args: { id: v.id("xero_oauth_states") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

async function refreshIfNeeded(ctx: any, userId: string): Promise<any | null> {
  const token: any = await ctx.runQuery(api.xero.getTokenRecord, { userId });
  if (!token) return null;

  const expiresAt = new Date(token.expires_at).getTime();
  const now = Date.now();

  if (expiresAt > now + 60_000) {
    return token;
  }

  const clientId = getEnv("XERO_CLIENT_ID");
  const clientSecret = getEnv("XERO_CLIENT_SECRET");

  // For confidential clients, Xero requires Basic auth header for token refresh
  // Create auth string manually using Buffer (available in "use node" context)
  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const res = await fetch("https://identity.xero.com/connect/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${authString}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: token.refresh_token,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Xero refresh failed", { status: res.status, body: text });
    throw new Error(`Xero refresh failed: ${res.status} ${text}`);
  }

  const updated = await res.json();
  const refreshed = {
    ...token,
    access_token: updated.access_token,
    refresh_token: updated.refresh_token ?? token.refresh_token,
    expires_at: new Date(Date.now() + (updated.expires_in ?? 0) * 1000).toISOString(),
    updated_at: nowIso(),
  };

  await ctx.runMutation(api.xero.saveTokenRecord, {
    id: token._id,
    user_id: refreshed.user_id,
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    tenant_id: refreshed.tenant_id,
    tenant_name: refreshed.tenant_name ?? undefined,
    expires_at: refreshed.expires_at,
  });
  return refreshed;
}

export const getAuthUrl = action({
  args: {
    userId: v.optional(v.string()),
    frontendOrigin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    "use node";
    const userId = await getUserId(ctx, args.userId);
    const clientId = getEnv("XERO_CLIENT_ID");
    const redirectUri = getEnv("XERO_REDIRECT_URI");

    const state = crypto.randomUUID();

    const authUrl = new URL("https://login.xero.com/identity/connect/authorize");
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("scope", XERO_SCOPES);
    authUrl.searchParams.set("state", state);

    await ctx.runMutation(api.xero.insertStateRecord, {
      user_id: userId,
      state,
      frontend_origin: args.frontendOrigin ?? undefined,
    });

    return { authUrl: authUrl.toString(), state };
  },
});

// Version for HTTP callback that doesn't require auth context
export const exchangeCodeNoAuth = action({
  args: {
    userId: v.string(),
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    "use node";
    const userId = args.userId;
    const clientId = getEnv("XERO_CLIENT_ID");
    const clientSecret = getEnv("XERO_CLIENT_SECRET");
    const redirectUri = getEnv("XERO_REDIRECT_URI");

    const stateRecord = await ctx.runQuery(api.xero.getStateRecord, { state: args.state });

    if (!stateRecord || stateRecord.user_id !== userId) {
      throw new Error("Invalid state");
    }

    // For confidential clients, use Basic auth header
    const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${authString}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: args.code,
        redirect_uri: redirectUri,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Xero token exchange failed: ${res.status} ${text}`);
    }

    const tokens = await res.json();

    const connectionsRes = await fetch("https://api.xero.com/connections", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!connectionsRes.ok) {
      const text = await connectionsRes.text();
      throw new Error(`Failed to fetch Xero connections: ${text}`);
    }

    const connections = await connectionsRes.json();
    const primary = connections[0];

    const existing = await ctx.runQuery(api.xero.getTokenRecord, { userId });

    await ctx.runMutation(api.xero.saveTokenRecord, {
      id: existing?._id,
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      tenant_id: primary?.tenantId ?? "",
      tenant_name: primary?.tenantName,
      expires_at: new Date(Date.now() + (tokens.expires_in ?? 0) * 1000).toISOString(),
    });

    if (stateRecord) {
      await ctx.runMutation(api.xero.deleteStateRecord, { id: stateRecord._id });
    }

    return { tenantName: primary?.tenantName ?? null };
  },
});

export const exchangeCode = action({
  args: {
    userId: v.optional(v.string()),
    code: v.string(),
    state: v.string(),
  },
  handler: async (ctx, args) => {
    "use node";
    const userId = await getUserId(ctx, args.userId);
    const clientId = getEnv("XERO_CLIENT_ID");
    const clientSecret = getEnv("XERO_CLIENT_SECRET");
    const redirectUri = getEnv("XERO_REDIRECT_URI");

    const stateRecord = await ctx.runQuery(api.xero.getStateRecord, { state: args.state });

    if (!stateRecord || stateRecord.user_id !== userId) {
      throw new Error("Invalid state");
    }

    // Xero requires client_id and client_secret in the body, not Basic auth
    const res = await fetch("https://identity.xero.com/connect/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: args.code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Xero token exchange failed: ${res.status} ${text}`);
    }

    const tokens = await res.json();

    const connectionsRes = await fetch("https://api.xero.com/connections", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Content-Type": "application/json",
      },
    });

    if (!connectionsRes.ok) {
      const text = await connectionsRes.text();
      throw new Error(`Failed to fetch Xero connections: ${text}`);
    }

    const connections = await connectionsRes.json();
    const primary = connections[0];

    const existing = await ctx.runQuery(api.xero.getTokenRecord, { userId });

    await ctx.runMutation(api.xero.saveTokenRecord, {
      id: existing?._id,
      user_id: userId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      tenant_id: primary?.tenantId ?? "",
      tenant_name: primary?.tenantName,
      expires_at: new Date(Date.now() + (tokens.expires_in ?? 0) * 1000).toISOString(),
    });

    if (stateRecord) {
      await ctx.runMutation(api.xero.deleteStateRecord, { id: stateRecord._id });
    }

    return { tenantName: primary?.tenantName ?? null };
  },
});

export const getConnectionStatus = action({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ isConnected: boolean; tenantName: string | null }> => {
    "use node";
    const userId = await getUserId(ctx, args.userId);
    const token = await refreshIfNeeded(ctx, userId);
    if (!token) return { isConnected: false, tenantName: null };
    return { isConnected: true, tenantName: token.tenant_name ?? null };
  },
});

async function getAuthHeaders(ctx: any, userId: string): Promise<Record<string, string>> {
  const token: any = await refreshIfNeeded(ctx, userId);
  if (!token) throw new Error("No Xero token found. Connect to Xero first.");
  return {
    Authorization: `Bearer ${token.access_token}`,
    "xero-tenant-id": token.tenant_id,
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export const fetchAccounts = action({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ accounts: any[] }> => {
    "use node";
    const userId = await getUserId(ctx, args.userId);
    const headers = await getAuthHeaders(ctx, userId);
    const res: any = await fetch("https://api.xero.com/api.xro/2.0/Accounts", { headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch accounts: ${res.status} ${text}`);
    }
    const data: any = await res.json();
    return { accounts: data.Accounts ?? [] };
  },
});

export const fetchContacts = action({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args): Promise<{ contacts: any[] }> => {
    "use node";
    const userId = await getUserId(ctx, args.userId);
    const headers = await getAuthHeaders(ctx, userId);
    const res: any = await fetch("https://api.xero.com/api.xro/2.0/Contacts", { headers });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Failed to fetch contacts: ${res.status} ${text}`);
    }
    const data: any = await res.json();
    return { contacts: data.Contacts ?? [] };
  },
});

export const linkContact = mutation({
  args: {
    userId: v.optional(v.string()),
    clientId: v.string(),
    xeroContactId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q: any) => q.eq("id", args.clientId))
      .unique();
    if (!client || client.user_id !== userId) {
      throw new Error("Client not found or forbidden");
    }
    const updated = { ...client, xero_contact_id: args.xeroContactId, updated_at: nowIso() };
    await ctx.db.replace(client._id, updated);
    return updated;
  },
});

export const unlinkContact = mutation({
  args: {
    userId: v.optional(v.string()),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q: any) => q.eq("id", args.clientId))
      .unique();
    if (!client || client.user_id !== userId) {
      throw new Error("Client not found or forbidden");
    }
    const updated = { ...client, xero_contact_id: undefined, updated_at: nowIso() };
    await ctx.db.replace(client._id, updated);
    return updated;
  },
});

export const syncInvoice = action({
  args: { userId: v.optional(v.string()), invoiceId: v.string() },
  handler: async () => {
    "use node";
    throw new Error("Invoice sync not yet implemented in Convex Xero integration.");
  },
});
