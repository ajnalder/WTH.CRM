import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

// Checklist Templates
export const listTemplates = query({
  args: {},
  handler: async (ctx) => {
    const templates = await ctx.db
      .query("checklist_templates")
      .collect();

    return templates.sort((a, b) => a.name.localeCompare(b.name));
  },
});

export const updateTemplate = mutation({
  args: {
    name: v.string(),
    items: v.any(),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db
      .query("checklist_templates")
      .filter((q) => q.eq(q.field("name"), args.name))
      .first();

    if (!template) {
      throw new Error("Template not found");
    }

    const updated = {
      ...template,
      items: args.items,
      updated_at: nowIso(),
    };

    await ctx.db.replace(template._id, updated);
    return updated;
  },
});

// Client Checklists
export const listByUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const checklists = await ctx.db
      .query("client_checklists")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    // Fetch client data for each checklist
    const checklistsWithClients = await Promise.all(
      checklists.map(async (checklist) => {
        const client = await ctx.db
          .query("clients")
          .withIndex("by_public_id", (q) => q.eq("id", checklist.client_id))
          .unique();

        return {
          ...checklist,
          client: client ? { id: client.id, company: client.company } : null,
        };
      })
    );

    return checklistsWithClients.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const createChecklist = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    template_id: v.string(),
    template_name: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();

    const checklist = {
      id: crypto.randomUUID(),
      client_id: args.client_id,
      template_id: args.template_id,
      template_name: args.template_name,
      user_id: userId,
      status: "in_progress",
      completed_at: undefined,
      completed_items: [],
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("client_checklists", checklist);
    const created = await ctx.db.get(_id);
    return created ?? checklist;
  },
});

export const updateChecklist = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    completed_items: v.any(),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const checklist = await ctx.db
      .query("client_checklists")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!checklist) {
      throw new Error("Checklist not found");
    }
    if (checklist.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...checklist,
      completed_items: args.completed_items,
      status: args.status ?? checklist.status,
      completed_at: args.status === "completed" ? nowIso() : checklist.completed_at,
      updated_at: nowIso(),
    };

    await ctx.db.replace(checklist._id, updated);
    return updated;
  },
});

export const removeChecklist = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const checklist = await ctx.db
      .query("client_checklists")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!checklist) return null;
    if (checklist.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(checklist._id);
    return checklist._id;
  },
});
