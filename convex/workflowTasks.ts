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

const storyPlanValidator = v.object({
  scenes: v.array(
    v.object({
      sceneNumber: v.number(),
      title: v.string(),
      summary: v.string(),
      visualTone: v.string(),
      durationSeconds: v.number(),
    }),
  ),
  script: v.array(
    v.object({
      sceneNumber: v.number(),
      narration: v.string(),
      dialogue: v.array(
        v.object({
          character: v.string(),
          line: v.string(),
        }),
      ),
    }),
  ),
  characters: v.array(
    v.object({
      name: v.string(),
      description: v.string(),
      voiceStyle: v.string(),
    }),
  ),
  musicStyle: v.string(),
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

function buildFallbackQueryFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop() ?? "")
      .replace(/\.[a-zA-Z0-9]+$/, "")
      .replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g, " ")
      .replace(/[-_]+/g, " ")
      .replace(/\barticles?\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (slug.length > 0) {
      return `${slug} news`;
    }

    return `${parsed.hostname.replace(/^www\./, "")} latest news`;
  } catch {
    return `${url} news`;
  }
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

function buildStorySourceContext(
  sourceDocuments: {
    url: string;
    title?: string;
    summary?: string;
    text?: string;
    highlights?: string[];
  }[],
): string {
  const maxDocs = 6;
  const maxTextPerDoc = 1600;
  const selected = sourceDocuments.slice(0, maxDocs);

  return selected
    .map((doc, index) => {
      const highlights = doc.highlights?.slice(0, 4).join(" | ") ?? "";
      const baseText = doc.summary || highlights || doc.text || "";
      const clippedText = baseText.slice(0, maxTextPerDoc);
      return [
        `Source ${index + 1}:`,
        `URL: ${doc.url}`,
        `Title: ${doc.title ?? "Untitled"}`,
        `Content: ${clippedText}`,
      ].join("\n");
    })
    .join("\n\n");
}

function stripCodeFences(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    if (lines.length >= 3 && lines[lines.length - 1].trim() === "```") {
      return lines.slice(1, -1).join("\n").trim();
    }
  }
  return trimmed;
}

function parseStoryPlan(text: string): {
  scenes: {
    sceneNumber: number;
    title: string;
    summary: string;
    visualTone: string;
    durationSeconds: number;
  }[];
  script: {
    sceneNumber: number;
    narration: string;
    dialogue: { character: string; line: string }[];
  }[];
  characters: { name: string; description: string; voiceStyle: string }[];
  musicStyle: string;
} {
  const raw = JSON.parse(stripCodeFences(text)) as Record<string, unknown>;
  const scenesInput = Array.isArray(raw.scenes) ? raw.scenes : [];
  const scriptInput = Array.isArray(raw.script) ? raw.script : [];
  const charactersInput = Array.isArray(raw.characters) ? raw.characters : [];
  const musicStyle =
    typeof raw.musicStyle === "string" ? raw.musicStyle : "cinematic, hopeful";

  const scenes = scenesInput
    .map((scene, index) => {
      if (!scene || typeof scene !== "object") return null;
      const s = scene as Record<string, unknown>;
      return {
        sceneNumber:
          typeof s.sceneNumber === "number" ? s.sceneNumber : index + 1,
        title:
          typeof s.title === "string" && s.title.trim()
            ? s.title
            : `Scene ${index + 1}`,
        summary:
          typeof s.summary === "string" && s.summary.trim()
            ? s.summary
            : "Scene summary unavailable.",
        visualTone:
          typeof s.visualTone === "string" && s.visualTone.trim()
            ? s.visualTone
            : "documentary cinematic",
        durationSeconds:
          typeof s.durationSeconds === "number" ? s.durationSeconds : 8,
      };
    })
    .filter((scene): scene is NonNullable<typeof scene> => !!scene);

  const script = scriptInput
    .map((beat, index) => {
      if (!beat || typeof beat !== "object") return null;
      const b = beat as Record<string, unknown>;
      const dialogueRaw = Array.isArray(b.dialogue) ? b.dialogue : [];
      const dialogue = dialogueRaw
        .map((line) => {
          if (!line || typeof line !== "object") return null;
          const l = line as Record<string, unknown>;
          if (typeof l.character !== "string" || typeof l.line !== "string") {
            return null;
          }
          return { character: l.character, line: l.line };
        })
        .filter((line): line is NonNullable<typeof line> => !!line);

      return {
        sceneNumber:
          typeof b.sceneNumber === "number" ? b.sceneNumber : index + 1,
        narration:
          typeof b.narration === "string" ? b.narration : "Narration unavailable.",
        dialogue,
      };
    })
    .filter((beat): beat is NonNullable<typeof beat> => !!beat);

  const characters = charactersInput
    .map((character) => {
      if (!character || typeof character !== "object") return null;
      const c = character as Record<string, unknown>;
      if (typeof c.name !== "string" || typeof c.description !== "string") {
        return null;
      }
      return {
        name: c.name,
        description: c.description,
        voiceStyle:
          typeof c.voiceStyle === "string" ? c.voiceStyle : "natural narration",
      };
    })
    .filter((character): character is NonNullable<typeof character> => !!character);

  if (scenes.length === 0) {
    throw new Error("MiniMax returned an empty scenes plan");
  }

  return {
    scenes,
    script,
    characters,
    musicStyle,
  };
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
      error: undefined,
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

        // Some pages (e.g. paywalled publishers) return empty extractable content.
        // Fallback to related-news search so the workflow can continue.
        const normalizedScrape = normalizeSourceDocuments(rawResults);
        if (normalizedScrape.sourceDocuments.length === 0) {
          const fallbackQuery = buildFallbackQueryFromUrl(task.input);
          const searchResult = (await ctx.runAction(api.exa.searchAndContents, {
            query: fallbackQuery,
            category: "news",
            numResults: 6,
            text: { maxCharacters: 12000 },
            summary: true,
            highlights: {
              maxCharacters: 1000,
              numSentences: 3,
              highlightsPerUrl: 5,
            },
            excludeDomains: ["facebook.com", "instagram.com", "x.com"],
          })) as { results?: unknown[] };
          rawResults = searchResult.results ?? [];
        }
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
        throw new Error(
          "No source documents were returned from Exa. The URL may be paywalled or blocked.",
        );
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

export const generateStoryPlan = action({
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
      throw new Error("Not authorized to plan this task");
    }
    if (task.sourceDocuments.length === 0) {
      throw new Error("Task has no sources. Run ingestion first.");
    }

    await ctx.runMutation(internal.workflowTasks.setTaskPlanning, {
      taskId: args.taskId,
    });

    try {
      const context = buildStorySourceContext(task.sourceDocuments);
      const response = await ctx.runAction(api.minimax.generateChat, {
        system:
          "You are a news-to-video planning assistant. Return only strict JSON.",
        temperature: 0.3,
        max_tokens: 2200,
        messages: [
          {
            role: "user",
            content: `Using the sources below, generate a story plan for a short video.
Return ONLY valid JSON with this exact shape:
{
  "scenes": [{"sceneNumber":1,"title":"...","summary":"...","visualTone":"...","durationSeconds":8}],
  "script": [{"sceneNumber":1,"narration":"...","dialogue":[{"character":"...","line":"..."}]}],
  "characters": [{"name":"...","description":"...","voiceStyle":"..."}],
  "musicStyle": "..."
}

Constraints:
- 4 to 7 scenes.
- Keep factual alignment with sources.
- Keep language concise and production-ready.

Sources:
${context}`,
          },
        ],
      });

      const storyPlan = parseStoryPlan(response.text);
      await ctx.runMutation(internal.workflowTasks.setTaskPlanned, {
        taskId: args.taskId,
        storyPlan,
      });

      return {
        status: "planned",
        sceneCount: storyPlan.scenes.length,
        characterCount: storyPlan.characters.length,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Story planning failed";
      await ctx.runMutation(internal.workflowTasks.setTaskFailed, {
        taskId: args.taskId,
        error: message,
      });
      throw new Error(message);
    }
  },
});
