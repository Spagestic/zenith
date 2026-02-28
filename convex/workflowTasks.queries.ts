import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";

export const listMyTasks = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const limit = args.limit ?? 25;
    return await ctx.db
      .query("workflowTasks")
      .withIndex("by_user_created", (q) => q.eq("userId", userId))
      .order("desc")
      .take(limit);
  },
});

export const getMyTaskById = query({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const task = await ctx.db.get(args.taskId);
    if (!task || task.userId !== userId) {
      return null;
    }
    return task;
  },
});

export const getTaskInternal = internalQuery({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});
