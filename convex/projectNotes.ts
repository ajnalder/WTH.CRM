import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

const REMINDER_OPEN = "open";
const REMINDER_DONE = "done";
const REMINDER_SNOOZED = "snoozed";

function getNextReminderAt(note: any): string | null {
  if (!note.remind_at) return null;
  if (note.reminder_status === REMINDER_SNOOZED && note.reminder_snoozed_until) {
    return note.reminder_snoozed_until;
  }
  return note.remind_at;
}

export const listByProject = query({
  args: { projectId: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const notes = await ctx.db
      .query("project_notes")
      .withIndex("by_project", (q) => q.eq("project_id", args.projectId))
      .collect();

    return notes
      .filter((note) => note.user_id === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

export const listDueReminders = query({
  args: { userId: v.optional(v.string()), nowIso: v.string() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const notes = await ctx.db
      .query("project_notes")
      .withIndex("by_user", (q) => q.eq("user_id", userId))
      .collect();

    return notes.filter((note) => {
      const nextReminderAt = getNextReminderAt(note);
      if (!nextReminderAt) return false;
      if (note.reminder_status === REMINDER_DONE) return false;
      return nextReminderAt <= args.nowIso;
    });
  },
});

export const create = mutation({
  args: {
    projectId: v.string(),
    userId: v.optional(v.string()),
    content: v.string(),
    remindAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const timestamp = nowIso();
    const note = {
      id: crypto.randomUUID(),
      project_id: args.projectId,
      user_id: userId,
      content: args.content,
      created_at: timestamp,
      updated_at: timestamp,
      remind_at: args.remindAt ?? undefined,
      reminder_status: args.remindAt ? REMINDER_OPEN : undefined,
      reminder_snoozed_until: undefined,
      reminder_completed_at: undefined,
    };

    await ctx.db.insert("project_notes", note);
    return note;
  },
});

export const completeReminder = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const note = await ctx.db
      .query("project_notes")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!note || note.user_id !== userId) {
      throw new Error("Note not found or forbidden");
    }

    await ctx.db.replace(note._id, {
      ...note,
      reminder_status: REMINDER_DONE,
      reminder_completed_at: nowIso(),
      updated_at: nowIso(),
    });
  },
});

export const snoozeReminder = mutation({
  args: { id: v.string(), userId: v.optional(v.string()), minutes: v.number() },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);
    const note = await ctx.db
      .query("project_notes")
      .withIndex("by_public_id", (q) => q.eq("id", args.id))
      .unique();

    if (!note || note.user_id !== userId) {
      throw new Error("Note not found or forbidden");
    }

    const snoozeUntil = new Date(Date.now() + args.minutes * 60 * 1000).toISOString();

    await ctx.db.replace(note._id, {
      ...note,
      reminder_status: REMINDER_SNOOZED,
      reminder_snoozed_until: snoozeUntil,
      updated_at: nowIso(),
    });
  },
});
