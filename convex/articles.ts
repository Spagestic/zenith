// convex/articles.ts
import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_published")
      .order("desc")
      .collect();
  },
});

export const getByCategory = query({
  args: {
    category: v.union(
      v.literal("hong_kong"),
      v.literal("world"),
      v.literal("science"),
      v.literal("nature"),
      v.literal("tech"),
      v.literal("sports"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("articles")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});
