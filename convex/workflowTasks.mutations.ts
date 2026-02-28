import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";
import { detectInputType } from "./workflow/helpers";
import {
  imageAssetValidator,
  scenePromptValidator,
  sourceDocumentValidator,
  storyPlanValidator,
  videoAssetValidator,
} from "./workflow/validators";

export const createTask = mutation({
  args: {
    input: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const input = args.input.trim();
    if (!input) {
      throw new Error("Input is required");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("workflowTasks", {
      userId,
      input,
      inputType: detectInputType(input),
      status: "queued",
      stage: "created",
      progress: 0,
      sourceUrls: [],
      sourceDocuments: [],
      createdAt: now,
      updatedAt: now,
    });

    return { taskId };
  },
});

export const setTaskIngesting = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "ingesting",
      stage: "ingesting",
      progress: 20,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskIngested = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    sourceUrls: v.array(v.string()),
    sourceDocuments: v.array(sourceDocumentValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "ingested",
      stage: "ingested",
      progress: 100,
      sourceUrls: args.sourceUrls,
      sourceDocuments: args.sourceDocuments,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskFailed = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "failed",
      stage: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskPlanning = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "planning",
      stage: "planning",
      progress: 80,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskPlanned = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    storyPlan: storyPlanValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "planned",
      stage: "planned",
      progress: 100,
      storyPlan: args.storyPlan,
      scenePrompts: undefined,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskPrompting = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "prompting",
      stage: "prompting",
      progress: 90,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskPrompted = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    scenePrompts: v.array(scenePromptValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "prompted",
      stage: "prompted",
      progress: 100,
      scenePrompts: args.scenePrompts,
      assets: undefined,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskRendering = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "rendering",
      stage: "rendering",
      progress: 95,
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskRendered = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    images: v.array(imageAssetValidator),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.taskId, {
      status: "rendered",
      stage: "rendered",
      progress: 100,
      assets: { images: args.images },
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});

export const setTaskRenderedVideos = internalMutation({
  args: {
    taskId: v.id("workflowTasks"),
    videos: v.array(videoAssetValidator),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    const existingImages = task?.assets?.images ?? [];

    await ctx.db.patch(args.taskId, {
      status: "rendered",
      stage: "rendered",
      progress: 100,
      assets: {
        images: existingImages,
        videos: args.videos,
      },
      error: undefined,
      updatedAt: Date.now(),
    });
  },
});
