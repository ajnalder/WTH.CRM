import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getUserId, nowIso } from "./_utils";

/**
 * Generate a file upload URL for storing files in Convex
 * Use this to get a URL to upload files from the client
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Store file metadata after upload
 * Call this after successfully uploading a file using the upload URL
 */
export const storeFileMetadata = mutation({
  args: {
    storageId: v.string(),
    fileName: v.string(),
    fileType: v.string(), // 'logo', 'invoice_pdf', 'quote_pdf', etc.
    mimeType: v.string(),
    fileSize: v.number(),
    userId: v.optional(v.string()),
    relatedId: v.optional(v.string()), // invoice_id, quote_id, etc.
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const metadata = {
      id: crypto.randomUUID(),
      storage_id: args.storageId,
      user_id: userId,
      file_name: args.fileName,
      file_type: args.fileType,
      mime_type: args.mimeType,
      file_size: args.fileSize,
      related_id: args.relatedId,
      created_at: nowIso(),
    };

    const _id = await ctx.db.insert("files", metadata);
    return (await ctx.db.get(_id)) ?? metadata;
  },
});

/**
 * Get file URL for download/viewing
 */
export const getFileUrl = query({
  args: { storageId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.storageId) {
      return null;
    }
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * List files by type for a user
 */
export const listFiles = query({
  args: {
    userId: v.optional(v.string()),
    fileType: v.optional(v.string()),
    relatedId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    let query = ctx.db.query("files").filter((q) => q.eq(q.field("user_id"), userId));

    const files = await query.collect();

    // Filter by fileType if provided
    let filtered = files;
    if (args.fileType) {
      filtered = filtered.filter(f => f.file_type === args.fileType);
    }

    // Filter by relatedId if provided
    if (args.relatedId) {
      filtered = filtered.filter(f => f.related_id === args.relatedId);
    }

    return filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
  },
});

/**
 * Get file metadata by ID
 */
export const getFile = query({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();

    if (!file || file.user_id !== userId) {
      return null;
    }

    return file;
  },
});

/**
 * Delete a file from storage and metadata
 */
export const deleteFile = mutation({
  args: { id: v.string(), userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getUserId(ctx, args.userId);

    const file = await ctx.db
      .query("files")
      .filter((q) => q.eq(q.field("id"), args.id))
      .unique();

    if (!file || file.user_id !== userId) {
      throw new Error("File not found");
    }

    // Delete from storage
    await ctx.storage.delete(file.storage_id);

    // Delete metadata
    await ctx.db.delete(file._id);

    return file.id;
  },
});
