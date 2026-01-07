import { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";

type AnyCtx = QueryCtx | MutationCtx | ActionCtx;

export async function getUserId(ctx: AnyCtx, fallbackUserId?: string) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity?.subject) {
    return identity.subject;
  }
  if (fallbackUserId) {
    return fallbackUserId;
  }
  throw new Error("Not authenticated");
}

export function nowIso() {
  return new Date().toISOString();
}
