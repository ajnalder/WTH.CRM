import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

function startOfCurrentWeekIso() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const start = new Date(now);
  start.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  start.setHours(0, 0, 0, 0);
  return start.toISOString().split("T")[0];
}

export const listByTask = query({
  args: { taskId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    // Verify task belongs to user
    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.taskId))
      .unique();
    if (!task || task.user_id !== userId) {
      // When a task is deleted, allow stale queries to settle without crashing the UI
      return [];
    }

    const entries = await ctx.db
      .query("time_entries")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();

    return entries.sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const weeklyForUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const start = startOfCurrentWeekIso();

    const entries = await ctx.db
      .query("time_entries")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return entries.filter((entry) => entry.date >= start).sort((a, b) => b.date.localeCompare(a.date));
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    task_id: v.string(),
    description: v.string(),
    hours: v.number(),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.task_id))
      .unique();
    if (!task || task.user_id !== userId) {
      throw new Error("Task not found or access denied");
    }

    const timestamp = nowIso();
    console.log("timeEntries.create", { userId, taskId: args.task_id, hours: args.hours });

    const entry = {
      id: crypto.randomUUID(),
      task_id: args.task_id,
      user_id: userId,
      description: args.description,
      hours: args.hours,
      date: args.date ?? timestamp.split("T")[0],
      created_at: timestamp,
      updated_at: timestamp,
    };

    await ctx.db.insert("time_entries", entry);
    return entry;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      description: v.optional(v.string()),
      hours: v.optional(v.number()),
      date: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const entry = await ctx.db
      .query("time_entries")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!entry) {
      throw new Error("Time entry not found");
    }
    if (entry.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...entry,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(entry._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const entry = await ctx.db
      .query("time_entries")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!entry) {
      return null;
    }
    if (entry.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(entry._id);
    return entry._id;
  },
});
