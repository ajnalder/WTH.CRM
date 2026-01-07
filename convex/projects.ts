import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { clientId: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    let projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    if (args.clientId) {
      projects = projects.filter((p) => p.client_id === args.clientId);
    }

    projects.sort((a, b) => b.created_at.localeCompare(a.created_at));

    // Attach client name for convenience
    const clientIds = Array.from(new Set(projects.map((p) => p.client_id)));
    const clients = await Promise.all(
      clientIds.map((clientId) =>
        ctx.db
          .query("clients")
          .withIndex("by_public_id", (q) => q.eq("id", clientId))
          .unique()
      )
    );
    const clientMap = new Map(
      clients.filter(Boolean).map((c) => [c!.id, c!.company])
    );

    return projects.map((p) => ({
      ...p,
      client_name: clientMap.get(p.client_id) ?? null,
      clients: { company: clientMap.get(p.client_id) ?? null },
      team_members: [], // will be populated once team member support is ported
    }));
  },
});

export const getById = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const project = await ctx.db
      .query("projects")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!project) return null;
    if (project.user_id !== userId) {
      throw new Error("Forbidden");
    }

    return project;
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    client_id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    start_date: v.optional(v.string()),
    due_date: v.optional(v.string()),
    budget: v.optional(v.number()),
    progress: v.optional(v.number()),
    is_retainer: v.optional(v.boolean()),
    is_billable: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();

    const project = {
      id: crypto.randomUUID(),
      client_id: args.client_id,
      user_id: userId,
      name: args.name,
      description: args.description ?? undefined,
      status: args.status ?? "active",
      priority: args.priority ?? "medium",
      start_date: args.start_date ?? undefined,
      due_date: args.due_date ?? undefined,
      budget: args.budget ?? undefined,
      progress: args.progress ?? 0,
      is_retainer: args.is_retainer ?? false,
      is_billable: args.is_billable ?? true,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await ctx.db.insert("projects", project);
    return project;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      start_date: v.optional(v.string()),
      due_date: v.optional(v.string()),
      budget: v.optional(v.number()),
      progress: v.optional(v.number()),
      is_retainer: v.optional(v.boolean()),
      is_billable: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!project) {
      throw new Error("Project not found");
    }
    if (project.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...project,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(project._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const project = await ctx.db
      .query("projects")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!project) {
      return null;
    }
    if (project.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(project._id);
    return project._id;
  },
});
