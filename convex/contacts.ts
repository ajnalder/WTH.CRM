import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const list = query({
  args: { clientId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const contacts = await ctx.db
      .query("contacts")
      .withIndex("by_client", (q) => q.eq("client_id", args.clientId))
      .collect();

    // Filter by user ownership via the parent client
    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.clientId))
      .unique();

    if (client && client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    return contacts.sort((a, b) => Number(b.is_primary) - Number(a.is_primary) || b.created_at.localeCompare(a.created_at));
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    is_primary: v.boolean(),
    email_subscribed: v.optional(v.boolean()),
    unsubscribed_at: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", args.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Client not found or forbidden");
    }

    const timestamp = nowIso();
    const contact = {
      id: crypto.randomUUID(),
      client_id: args.client_id,
      name: args.name,
      email: args.email,
      phone: args.phone ?? undefined,
      role: args.role ?? undefined,
      is_primary: args.is_primary,
      email_subscribed: args.email_subscribed ?? true,
      unsubscribed_at: args.unsubscribed_at ?? undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("contacts", contact);
    return (await ctx.db.get(_id)) ?? contact;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.optional(v.string()),
      is_primary: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const contact = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!contact) {
      throw new Error("Contact not found");
    }

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", contact.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = { ...contact, ...args.updates, updated_at: nowIso() };
    await ctx.db.replace(contact._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const contact = await ctx.db
      .query("contacts")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!contact) return null;

    const client = await ctx.db
      .query("clients")
      .withIndex("by_public_id", (q) => q.eq("id", contact.client_id))
      .unique();

    if (!client || client.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(contact._id);
    return contact._id;
  },
});
