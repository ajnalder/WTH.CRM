import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { nowIso, getUserId } from "./_utils";

export const list = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return ideas.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const create = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    content: v.optional(v.string()),
    priority: v.string(),
    status: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();

    const idea = {
      id: crypto.randomUUID(),
      user_id: userId,
      title: args.title,
      content: args.content ?? undefined,
      priority: args.priority,
      status: args.status,
      tags: args.tags ?? undefined,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("ideas", idea);
    const created = await ctx.db.get(_id);
    return created ?? idea;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    userId: v.optional(v.string()),
    updates: v.object({
      title: v.optional(v.string()),
      content: v.optional(v.string()),
      priority: v.optional(v.string()),
      status: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const idea = await ctx.db
      .query("ideas")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!idea) {
      throw new Error("Idea not found");
    }
    if (idea.user_id !== userId) {
      throw new Error("Forbidden");
    }

    const updated = {
      ...idea,
      ...args.updates,
      updated_at: nowIso(),
    };

    await ctx.db.replace(idea._id, updated);
    return updated;
  },
});

export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const idea = await ctx.db
      .query("ideas")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (!idea) return null;
    if (idea.user_id !== userId) {
      throw new Error("Forbidden");
    }

    await ctx.db.delete(idea._id);
    return idea._id;
  },
});
