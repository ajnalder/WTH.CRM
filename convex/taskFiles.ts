import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";
import { api } from "./_generated/api";

// List files for a task
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
      throw new Error("Task not found or access denied");
    }

    const files = await ctx.db
      .query("task_files")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();

    // Return signed URLs for display/download
    const withUrls = await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.file_path),
      }))
    );

    // Newest first
    return withUrls.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

// Upload a file via action to accept File blobs
export const upload = action({
  args: {
    taskId: v.string(),
    userId: v.optional(v.string()),
    file: v.bytes(),
    fileName: v.string(),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const task = await ctx.runQuery(api.tasks.getById, {
      id: args.taskId,
      userId,
    });
    if (!task) throw new Error("Task not found or access denied");

    const timestamp = nowIso();
    const fileId = crypto.randomUUID();

    const blob = new Blob([args.file], {
      type: args.mimeType ?? "application/octet-stream",
    });

    const storageId = await ctx.storage.store(blob);

    const record = {
      id: fileId,
      task_id: args.taskId,
      user_id: userId,
      file_name: args.fileName,
      file_path: storageId,
      mime_type: args.mimeType ?? undefined,
      file_size: blob.size,
      created_at: timestamp,
    } as const;

    await ctx.runMutation(api.taskFiles.saveMetadata, {
      ...record,
      userId,
    });

    return {
      ...record,
      url: await ctx.storage.getUrl(storageId),
    };
  },
});

// Delete a file and its blob
export const remove = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const file = await ctx.db
      .query("task_files")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();
    if (!file) return null;

    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", file.task_id))
      .unique();
    if (!task || task.user_id !== userId) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.delete(file._id);
    await ctx.storage.delete(file.file_path);
    return file.id;
  },
});

export const saveMetadata = mutation({
  args: {
    id: v.string(),
    task_id: v.string(),
    user_id: v.string(),
    file_name: v.string(),
    file_path: v.string(),
    mime_type: v.optional(v.string()),
    file_size: v.optional(v.number()),
    created_at: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId ?? args.user_id);

    const task = await ctx.db
      .query("tasks")
      .withIndex("by_public_id", (q) => q.eq("id", args.task_id))
      .unique();
    if (!task || task.user_id !== userId) {
      throw new Error("Task not found or access denied");
    }

    await ctx.db.insert("task_files", {
      id: args.id,
      task_id: args.task_id,
      user_id: args.user_id,
      file_name: args.file_name,
      file_path: args.file_path,
      mime_type: args.mime_type ?? undefined,
      file_size: args.file_size ?? undefined,
      created_at: args.created_at,
    });
  },
});
