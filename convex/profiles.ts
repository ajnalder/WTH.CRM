import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

const profileUpdatesValidator = v.object({
  full_name: v.optional(v.string()),
  email: v.optional(v.string()),
  role: v.optional(v.string()),
  status: v.optional(v.string()),
  current_task: v.optional(v.string()),
  hours_this_week: v.optional(v.number()),
});

export const updateTeamMember = mutation({
  args: {
    userId: v.optional(v.string()),
    memberUserId: v.string(),
    updates: profileUpdatesValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const ownedProjects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    if (ownedProjects.length === 0 && userId !== args.memberUserId) {
      throw new Error("No projects found for user.");
    }

    if (userId !== args.memberUserId) {
      const projectIds = new Set(ownedProjects.map((project) => project.id));
      const memberships = await ctx.db
        .query("project_team_members")
        .withIndex("by_user", (q) => q.eq("user_id", args.memberUserId))
        .collect();

      const isAssigned = memberships.some((membership) =>
        projectIds.has(membership.project_id)
      );

      if (!isAssigned) {
        throw new Error("Not authorized to update this team member.");
      }
    }

    const existing = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("id"), args.memberUserId))
      .first();

    const timestamp = nowIso();

    if (existing) {
      const updated = {
        ...existing,
        ...args.updates,
        updated_at: timestamp,
      };
      await ctx.db.replace(existing._id, updated);
      return updated;
    }

    const profile = {
      id: args.memberUserId,
      email: args.updates.email ?? undefined,
      full_name: args.updates.full_name ?? undefined,
      avatar_url: undefined,
      role: args.updates.role ?? undefined,
      status: args.updates.status ?? "online",
      current_task: args.updates.current_task ?? undefined,
      hours_this_week: args.updates.hours_this_week ?? 0,
      created_at: timestamp,
      updated_at: timestamp,
    };

    const _id = await ctx.db.insert("profiles", profile);
    return (await ctx.db.get(_id)) ?? profile;
  },
});

export const getById = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    if (args.id !== userId) {
      return null;
    }
    const profile = await ctx.db
      .query("profiles")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();
    return profile ?? null;
  },
});
