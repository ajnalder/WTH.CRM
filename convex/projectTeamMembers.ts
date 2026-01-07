import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

async function getOwnedProject(ctx: any, projectId: string, userId: string) {
  const project = await ctx.db
    .query("projects")
    .withIndex("by_public_id", (q: any) => q.eq("id", projectId))
    .unique();

  if (!project || project.user_id !== userId) {
    throw new Error("Project not found or forbidden");
  }
  return project;
}

export const listByProject = query({
  args: { projectId: v.optional(v.string()), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.projectId) return [];
    const userId = await getUserId(ctx, args.userId);
    await getOwnedProject(ctx, args.projectId, userId);

    const members = await ctx.db
      .query("project_team_members")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId as string))
      .collect();

    const profileIds = Array.from(new Set(members.map((m) => m.user_id)));
    const profiles = await Promise.all(
      profileIds.map((pid) =>
        ctx.db.query("profiles").filter((q) => q.eq(q.field("id"), pid)).first()
      )
    );

    const profileMap = new Map(
      profiles.filter(Boolean).map((p) => [p!.id, p!])
    );

    return members.map((m) => ({
      ...m,
      profile: profileMap.get(m.user_id) ?? null,
    }));
  },
});

export const listAllForUser = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    if (projects.length === 0) return [];

    const projectIds = projects.map((p) => p.id);
    const members: any[] = [];

    for (const projectId of projectIds) {
      const projectMembers = await ctx.db
        .query("project_team_members")
        .withIndex("by_project", (q) => q.eq("project_id", projectId))
        .collect();
      for (const m of projectMembers) {
        members.push({ ...m, project_id: projectId });
      }
    }

    const grouped = new Map<
      string,
      {
        user_id: string;
        assignments: { project_id: string }[];
        first_assigned_at: string;
      }
    >();

    for (const m of members) {
      const existing = grouped.get(m.user_id);
      if (existing) {
        existing.assignments.push({ project_id: m.project_id });
        if (m.assigned_at < existing.first_assigned_at) {
          existing.first_assigned_at = m.assigned_at;
        }
      } else {
        grouped.set(m.user_id, {
          user_id: m.user_id,
          assignments: [{ project_id: m.project_id }],
          first_assigned_at: m.assigned_at,
        });
      }
    }

    const profileIds = Array.from(grouped.keys());
    const profiles = await Promise.all(
      profileIds.map((pid) =>
        ctx.db.query("profiles").filter((q) => q.eq(q.field("id"), pid)).first()
      )
    );
    const profileMap = new Map(
      profiles.filter(Boolean).map((p) => [p!.id, p!])
    );

    return Array.from(grouped.values()).map((entry) => ({
      ...entry,
      profile: profileMap.get(entry.user_id) ?? null,
    }));
  },
});

export const add = mutation({
  args: {
    projectId: v.string(),
    userId: v.optional(v.string()),
    memberUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    await getOwnedProject(ctx, args.projectId, userId);

    const existing = await ctx.db
      .query("project_team_members")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId))
      .filter((q) => q.eq(q.field("user_id"), args.memberUserId))
      .first();

    if (existing) {
      return existing;
    }

    const member = {
      id: crypto.randomUUID(),
      project_id: args.projectId,
      user_id: args.memberUserId,
      assigned_at: nowIso(),
    };

    await ctx.db.insert("project_team_members", member);
    return member;
  },
});

export const remove = mutation({
  args: {
    projectId: v.string(),
    userId: v.optional(v.string()),
    memberUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    await getOwnedProject(ctx, args.projectId, userId);

    const existing = await ctx.db
      .query("project_team_members")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId))
      .filter((q) => q.eq(q.field("user_id"), args.memberUserId))
      .first();

    if (!existing) return null;

    await ctx.db.delete(existing._id);
    return existing._id;
  },
});
