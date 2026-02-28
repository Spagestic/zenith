import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
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

export const listRenderedStories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 18;

    const renderedTasks = await ctx.db
      .query("workflowTasks")
      .withIndex("by_status_updated", (q) => q.eq("status", "rendered"))
      .order("desc")
      .take(100);

    const stories: Array<{
      taskId: Id<"workflowTasks">;
      storyTitle: string | null;
      input: string;
      thumbnailUrl: string | null;
      generatedAt: number;
      sceneCount: number;
      creator: { userId: Id<"users">; name: string | null; image: string | null };
      videos: Array<{ sceneNumber: number; sceneTitle: string; videoUrl: string; generatedAt: number }>;
    }> = [];

    for (const task of renderedTasks) {
      const sceneVideos = (task.assets?.videos ?? [])
        .slice()
        .sort((a, b) => a.sceneNumber - b.sceneNumber);
      if (sceneVideos.length === 0) continue;

      const firstImage = (task.assets?.images ?? [])
        .slice()
        .sort((a, b) => a.sceneNumber - b.sceneNumber)[0];
      const latestGeneratedAt =
        sceneVideos[sceneVideos.length - 1]?.generatedAt ?? task.updatedAt;
      const creator = await ctx.db.get(task.userId);

      stories.push({
        taskId: task._id,
        storyTitle: task.storyTitle ?? null,
        input: task.input,
        thumbnailUrl: firstImage?.startImageUrl ?? null,
        generatedAt: latestGeneratedAt,
        sceneCount: sceneVideos.length,
        creator: {
          userId: task.userId,
          name: creator?.name ?? null,
          image: creator?.image ?? null,
        },
        videos: sceneVideos.map((video) => ({
          sceneNumber: video.sceneNumber,
          sceneTitle: video.sceneTitle,
          videoUrl: video.videoUrl,
          generatedAt: video.generatedAt,
        })),
      });
    }

    return stories
      .sort((a, b) => b.generatedAt - a.generatedAt)
      .slice(0, limit);
  },
});

export const getRenderedStoryById = query({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task || task.status !== "rendered") {
      return null;
    }

    const sceneVideos = (task.assets?.videos ?? [])
      .slice()
      .sort((a, b) => a.sceneNumber - b.sceneNumber);
    const sceneTTS = (task.assets?.tts ?? [])
      .slice()
      .sort((a, b) => a.sceneNumber - b.sceneNumber);
    if (sceneVideos.length === 0) {
      return null;
    }

    const firstImage = (task.assets?.images ?? [])
      .slice()
      .sort((a, b) => a.sceneNumber - b.sceneNumber)[0];
    const latestGeneratedAt =
      sceneVideos[sceneVideos.length - 1]?.generatedAt ?? task.updatedAt;
    const creator = await ctx.db.get(task.userId);

    return {
      taskId: task._id,
      storyTitle: task.storyTitle ?? null,
      input: task.input,
      thumbnailUrl: firstImage?.startImageUrl ?? null,
      generatedAt: latestGeneratedAt,
      sceneCount: sceneVideos.length,
      creator: {
        userId: task.userId,
        name: creator?.name ?? null,
        image: creator?.image ?? null,
      },
      videos: sceneVideos.map((video) => ({
        sceneNumber: video.sceneNumber,
        sceneTitle: video.sceneTitle,
        videoUrl: video.videoUrl,
        generatedAt: video.generatedAt,
      })),
      tts: sceneTTS.map((audio) => ({
        sceneNumber: audio.sceneNumber,
        sceneTitle: audio.sceneTitle,
        narrationText: audio.narrationText,
        audioUrl: audio.audioUrl,
        generatedAt: audio.generatedAt,
      })),
    };
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

export const listResumableTasksInternal = internalQuery({
  args: {
    limit: v.optional(v.number()),
    includeFailed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 25, 100));
    const includeFailed = args.includeFailed ?? true;
    const candidateStatuses: Array<
      | "queued"
      | "ingested"
      | "planned"
      | "prompted"
      | "rendered"
      | "failed"
    > = includeFailed
      ? ["failed", "queued", "ingested", "planned", "prompted", "rendered"]
      : ["queued", "ingested", "planned", "prompted", "rendered"];

    const gathered = await Promise.all(
      candidateStatuses.map((status) =>
        ctx.db
          .query("workflowTasks")
          .withIndex("by_status_updated", (q) => q.eq("status", status))
          .order("desc")
          .take(100),
      ),
    );

    const merged = gathered
      .flat()
      .sort((a, b) => b.updatedAt - a.updatedAt);
    const unique = new Map(merged.map((task) => [task._id, task]));

    return Array.from(unique.values()).slice(0, limit);
  },
});
