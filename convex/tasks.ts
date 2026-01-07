import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    console.log("tasks.list", { userId });

    let tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    tasks.sort((a, b) => b.created_at.localeCompare(a.created_at));

    const clientIds = Array.from(
      new Set(tasks.map((t) => t.client_id).filter((id): id is string => Boolean(id)))
    );

    const clients = await Promise.all(
      clientIds.map((clientId) =>
        ctx.db
          .query("clients")
          .withIndex("by_public_id", (q) => q.eq("id", clientId))
          .unique()
      )
    );

    const clientMap = new Map(clients.filter(Boolean).map((c) => [c!.id, c!.company]));

    return tasks.map((task) => ({
      ...task,
      client_name: task.client_id ? clientMap.get(task.client_id) : undefined,
    }));
  },
});

export const getById = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!task || task.user_id !== userId) {
      return null;
    }

    let clientName: string | undefined;
    if (task.client_id) {
      const client = await ctx.db
        .query("clients")
        .withIndex("by_public_id", (q) => q.eq("id", task.client_id!))
        .unique();
      clientName = client?.company ?? undefined;
    }

    return { ...task, client_name: clientName };
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    client_id: v.optional(v.string()),
    assignee: v.optional(v.string()),
    billable_amount: v.optional(v.number()),
    billing_description: v.optional(v.string()),
    progress: v.optional(v.number()),
    dropbox_url: v.optional(v.string()),
    notes: v.optional(v.string()),
    due_date: v.optional(v.string()),
    project: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();
    console.log("tasks.create", { userId, title: args.title });

    const task = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: args.title,
      description: args.description ?? undefined,
      status: args.status ?? "To Do",
      client_id: args.client_id ?? undefined,
      assignee: args.assignee ?? undefined,
      billable_amount: args.billable_amount ?? undefined,
      billing_description: args.billing_description ?? undefined,
      progress: args.progress ?? 0,
      dropbox_url: args.dropbox_url ?? undefined,
      notes: args.notes ?? undefined,
      due_date: args.due_date ?? undefined,
      project: args.project ?? undefined,
      tags: args.tags ?? undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    await ctx.db.insert("tasks", task);
    return task;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.string()),
      client_id: v.optional(v.string()),
      assignee: v.optional(v.string()),
      billable_amount: v.optional(v.number()),
      billing_description: v.optional(v.string()),
      progress: v.optional(v.number()),
      dropbox_url: v.optional(v.string()),
      notes: v.optional(v.string()),
      due_date: v.optional(v.string()),
      project: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!task) {
      throw new Error("Task not found");
    }
    if (task.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...task,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(task._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!task) {
      return null;
    }
    if (task.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(task._id);
    return task._id;
  },
});
