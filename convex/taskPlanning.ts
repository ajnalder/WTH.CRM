import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

export const listByDate = query({
  args: { date: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const items = await ctx.db
      .query("task_planning")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .filter((q) => q.eq(q.field("scheduled_date"), args.date))
      .collect();

    return items.sort((a, b) => a.order_index - b.order_index);
  },
});

export const upsert = mutation({
  args: {
    task_id: v.string(),
    allocated_minutes: v.number(),
    order_index: v.number(),
    is_scheduled: v.boolean(),
    scheduled_date: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();

    const existing = await ctx.db
      .query("task_planning")
      .withIndex("by_task", (q) => q.eq("task_id", args.task_id))
      .filter((q) => q.eq(q.field("scheduled_date"), args.scheduled_date))
      .unique();

    const record = {
      id: existing?.id ?? crypto.randomUUID(),
      task_id: args.task_id,
      user_id: userId,
      allocated_minutes: args.allocated_minutes,
      order_index: args.order_index,
      is_scheduled: args.is_scheduled,
      scheduled_date: args.scheduled_date,
      created_at: existing?.created_at ?? timestamp,
      updated_at: timestamp,
    };

    if (existing) {
      await ctx.db.replace(existing._id, record);
      return record;
    }

    await ctx.db.insert("task_planning", record);
    return record;
  },
});

export const remove = mutation({
  args: { task_id: v.string(), date: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const existing = await ctx.db
      .query("task_planning")
      .withIndex("by_task", (q) => q.eq("task_id", args.task_id))
      .filter((q) => q.eq(q.field("scheduled_date"), args.date))
      .unique();

    if (!existing || existing.user_id !== userId) return null;

    await ctx.db.delete(existing._id);
    return existing.id;
  },
});
