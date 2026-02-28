import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Get the number of subscribers for a creator.
 */
export const getSubscriberCount = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const subs = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();
    return subs.length;
  },
});

/**
 * Whether the current user is subscribed to the given creator.
 */
export const isSubscribed = query({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    if (userId === args.creatorId) return false; // don't show "subscribed" to own channel
    const sub = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_and_subscriber", (q) =>
        q.eq("creatorId", args.creatorId).eq("subscriberId", userId),
      )
      .unique();
    return sub !== null;
  },
});

/**
 * Subscribe the current user to a creator.
 */
export const subscribe = mutation({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("You must be signed in to subscribe");
    }
    if (userId === args.creatorId) {
      throw new Error("You cannot subscribe to yourself");
    }
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_and_subscriber", (q) =>
        q.eq("creatorId", args.creatorId).eq("subscriberId", userId),
      )
      .unique();
    if (existing) return null;
    await ctx.db.insert("subscriptions", {
      creatorId: args.creatorId,
      subscriberId: userId,
    });
    return null;
  },
});

/**
 * Unsubscribe the current user from a creator.
 */
export const unsubscribe = mutation({
  args: { creatorId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_creator_and_subscriber", (q) =>
        q.eq("creatorId", args.creatorId).eq("subscriberId", userId),
      )
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
    return null;
  },
});
