import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "./_generated/server";

const sourceDocumentValidator = v.object({
  url: v.string(),
  title: v.optional(v.string()),
  publishedDate: v.optional(v.string()),
  author: v.optional(v.string()),
  text: v.optional(v.string()),
  summary: v.optional(v.string()),
  highlights: v.optional(v.array(v.string())),
});

function detectInputType(input: string): "url" | "topic" {
  try {
    const candidate = new URL(input);
    if (candidate.protocol === "http:" || candidate.protocol === "https:") {
      return "url";
    }
  } catch {
    // Input is not a URL, treat as topic.
  }
  return "topic";
}

function normalizeSourceDocuments(results: unknown[]): {
  sourceUrls: string[];
  sourceDocuments: {
    url: string;
    title?: string;
    publishedDate?: string;
    author?: string;
    text?: string;
    summary?: string;
    highlights?: string[];
  }[];
} {
  const sourceDocuments: {
    url: string;
    title?: string;
    publishedDate?: string;
    author?: string;
    text?: string;
    summary?: string;
    highlights?: string[];
  }[] = [];

  for (const entry of results) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const url = typeof obj.url === "string" ? obj.url : undefined;
    if (!url) continue;

    const highlights = Array.isArray(obj.highlights)
      ? obj.highlights.filter((item): item is string => typeof item === "string")
      : undefined;

    sourceDocuments.push({
      url,
      title: typeof obj.title === "string" ? obj.title : undefined,
      publishedDate:
        typeof obj.publishedDate === "string" ? obj.publishedDate : undefined,
      author: typeof obj.author === "string" ? obj.author : undefined,
      text: typeof obj.text === "string" ? obj.text : undefined,
      summary: typeof obj.summary === "string" ? obj.summary : undefined,
      highlights: highlights && highlights.length > 0 ? highlights : undefined,
    });
  }

  const sourceUrls = Array.from(new Set(sourceDocuments.map((doc) => doc.url)));

  return { sourceUrls, sourceDocuments };
}

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

export const getTaskInternal = internalQuery({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
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

export const runTaskIngestion = action({
  args: {
    taskId: v.id("workflowTasks"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const task = await ctx.runQuery(internal.workflowTasks.getTaskInternal, {
      taskId: args.taskId,
    });
    if (!task) {
      throw new Error("Task not found");
    }
    if (task.userId !== userId) {
      throw new Error("Not authorized to run this task");
    }

    await ctx.runMutation(internal.workflowTasks.setTaskIngesting, {
      taskId: args.taskId,
    });

    try {
      let rawResults: unknown[] = [];

      if (task.inputType === "url") {
        const scrapeResult = (await ctx.runAction(api.exa.getContents, {
          url: task.input,
          text: { maxCharacters: 12000 },
          summary: true,
          highlights: {
            maxCharacters: 1000,
            numSentences: 3,
            highlightsPerUrl: 5,
          },
        })) as { results?: unknown[] };
        rawResults = scrapeResult.results ?? [];
      } else {
        const searchResult = (await ctx.runAction(api.exa.searchAndContents, {
          query: task.input,
          category: "news",
          numResults: 6,
          text: { maxCharacters: 12000 },
          summary: true,
          highlights: {
            maxCharacters: 1000,
            numSentences: 3,
            highlightsPerUrl: 5,
          },
        })) as { results?: unknown[] };
        rawResults = searchResult.results ?? [];
      }

      const normalized = normalizeSourceDocuments(rawResults);
      if (normalized.sourceDocuments.length === 0) {
        throw new Error("No source documents were returned from Exa");
      }

      await ctx.runMutation(internal.workflowTasks.setTaskIngested, {
        taskId: args.taskId,
        sourceUrls: normalized.sourceUrls,
        sourceDocuments: normalized.sourceDocuments,
      });

      return {
        status: "ingested",
        sourceCount: normalized.sourceDocuments.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ingestion failed";
      await ctx.runMutation(internal.workflowTasks.setTaskFailed, {
        taskId: args.taskId,
        error: message,
      });
      throw new Error(message);
    }
  },
});
