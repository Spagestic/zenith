import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";
import { action } from "./_generated/server";
import {
  buildFallbackQueryFromUrl,
  buildStorySourceContext,
  extractImageUrls,
  normalizeSourceDocuments,
  parsePromptPack,
  parseStoryPlan,
  type ImageAsset,
  type VideoAsset,
} from "./workflow/helpers";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractVideoTaskId(response: unknown): string | null {
  if (!response || typeof response !== "object") return null;
  const payload = response as { task_id?: unknown; taskId?: unknown };
  if (typeof payload.task_id === "string") return payload.task_id;
  if (typeof payload.taskId === "string") return payload.taskId;
  return null;
}

function extractVideoUrl(result: unknown): string | null {
  if (!result || typeof result !== "object") return null;
  const payload = result as {
    download_url?: unknown;
    file_details?: { download_url?: unknown };
  };
  if (typeof payload.download_url === "string") return payload.download_url;
  if (typeof payload.file_details?.download_url === "string") {
    return payload.file_details.download_url;
  }
  return null;
}

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

export const generatePromptPack = action({
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
      throw new Error("Not authorized to prompt this task");
    }
    if (!task.storyPlan || task.storyPlan.scenes.length === 0) {
      throw new Error("Task has no story plan. Generate story plan first.");
    }

    await ctx.runMutation(internal.workflowTasks.setTaskPrompting, {
      taskId: args.taskId,
    });

    try {
      const storyPlanJson = JSON.stringify(task.storyPlan);
      const response = await ctx.runAction(api.minimax.generateChat, {
        system:
          "You are an expert prompt designer for stylized animation. Return only strict JSON.",
        temperature: 0.4,
        max_tokens: 2400,
        messages: [
          {
            role: "user",
            content: `Generate scene-by-scene image and transition prompts from the story plan below.
Return ONLY valid JSON with this exact top-level shape:
{
  "scenePrompts": [
    {
      "sceneNumber": 1,
      "sceneTitle": "...",
      "imagePrompt": "...",
      "startFramePrompt": "...",
      "endFramePrompt": "...",
      "transitionPrompt": "...",
      "negativePrompt": "...",
      "camera": "...",
      "style": "..."
    }
  ]
}

Requirements:
- One entry per scene in the story plan.
- Keep character consistency across scenes.
- Each prompt should be production-ready for image/video generation.
- transitionPrompt should describe how to move from this scene to the next scene.
- Visual style target: whimsical flat 2D fantasy cartoon aesthetic inspired by modern TV animation.
- Keep recurring character design anchors in every scene prompt (silhouette, outfit colors, hairstyle, accessories).
- Use only original characters and original locations.
- Do NOT include brand names, franchise names, logos, or copyrighted character names.

Story plan:
${storyPlanJson}`,
          },
        ],
      });

      let scenePrompts;
      try {
        scenePrompts = parsePromptPack(response.text);
      } catch {
        // Automatic repair pass when model returns near-JSON but invalid syntax.
        const repairResponse = await ctx.runAction(api.minimax.generateChat, {
          system:
            "You fix malformed JSON. Return only valid JSON, no explanations.",
          temperature: 0,
          max_tokens: 2600,
          messages: [
            {
              role: "user",
              content: `Convert the following content into valid JSON only.
Required top-level shape:
{
  "scenePrompts": [
    {
      "sceneNumber": 1,
      "sceneTitle": "...",
      "imagePrompt": "...",
      "startFramePrompt": "...",
      "endFramePrompt": "...",
      "transitionPrompt": "...",
      "negativePrompt": "...",
      "camera": "...",
      "style": "..."
    }
  ]
}

Malformed content:
${response.text}`,
            },
          ],
        });
        scenePrompts = parsePromptPack(repairResponse.text);
      }

      await ctx.runMutation(internal.workflowTasks.setTaskPrompted, {
        taskId: args.taskId,
        scenePrompts,
      });

      return {
        status: "prompted",
        promptCount: scenePrompts.length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Prompt-pack generation failed";
      await ctx.runMutation(internal.workflowTasks.setTaskFailed, {
        taskId: args.taskId,
        error: message,
      });
      throw new Error(message);
    }
  },
});

export const generateSceneImages = action({
  args: {
    taskId: v.id("workflowTasks"),
    model: v.optional(v.string()),
    aspectRatio: v.optional(v.string()),
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
      throw new Error("Not authorized to render this task");
    }
    if (!task.scenePrompts || task.scenePrompts.length === 0) {
      throw new Error("Task has no scene prompts. Generate prompt pack first.");
    }

    await ctx.runMutation(internal.workflowTasks.setTaskRendering, {
      taskId: args.taskId,
    });

    const model = args.model ?? "image-01";
    const aspectRatio = args.aspectRatio ?? "16:9";

    try {
      const images: ImageAsset[] = [];
      const styleSuffix =
        " Whimsical flat 2D fantasy cartoon aesthetic, bold clean outlines, vibrant colors, consistent original characters across scenes, no brand names, no logos, no copyrighted characters.";

      for (const scene of task.scenePrompts) {
        const startPrompt = `${scene.startFramePrompt}${styleSuffix}`;
        const endPrompt = `${scene.endFramePrompt}${styleSuffix}`;

        const startRes = await ctx.runAction(api.minimax.generateImage, {
          model,
          prompt: startPrompt,
          aspect_ratio: aspectRatio,
          response_format: "url",
          n: 1,
          prompt_optimizer: false,
        });
        const endRes = await ctx.runAction(api.minimax.generateImage, {
          model,
          prompt: endPrompt,
          aspect_ratio: aspectRatio,
          response_format: "url",
          n: 1,
          prompt_optimizer: false,
        });

        const startUrls = extractImageUrls(startRes);
        const endUrls = extractImageUrls(endRes);

        if (startUrls.length === 0 || endUrls.length === 0) {
          throw new Error(
            `Image generation returned no URL for scene ${scene.sceneNumber}`,
          );
        }

        images.push({
          sceneNumber: scene.sceneNumber,
          sceneTitle: scene.sceneTitle,
          startImageUrl: startUrls[0],
          endImageUrl: endUrls[0],
          startPrompt,
          endPrompt,
          model,
          aspectRatio,
          generatedAt: Date.now(),
        });
      }

      await ctx.runMutation(internal.workflowTasks.setTaskRendered, {
        taskId: args.taskId,
        images,
      });

      return {
        status: "rendered",
        imagePairCount: images.length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Scene image generation failed";
      await ctx.runMutation(internal.workflowTasks.setTaskFailed, {
        taskId: args.taskId,
        error: message,
      });
      throw new Error(message);
    }
  },
});

export const generateSceneVideos = action({
  args: {
    taskId: v.id("workflowTasks"),
    model: v.optional(v.string()),
    duration: v.optional(v.number()),
    resolution: v.optional(v.string()),
    pollIntervalMs: v.optional(v.number()),
    maxPollAttempts: v.optional(v.number()),
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
      throw new Error("Not authorized to render videos for this task");
    }
    if (!task.assets?.images?.length) {
      throw new Error("Task has no image pairs. Generate scene images first.");
    }

    await ctx.runMutation(internal.workflowTasks.setTaskRendering, {
      taskId: args.taskId,
    });

    const preferredModel = args.model ?? "MiniMax-Hailuo-02";
    const duration = args.duration ?? 6;
    const resolution = args.resolution;
    const pollIntervalMs = args.pollIntervalMs ?? 3000;
    const maxPollAttempts = args.maxPollAttempts ?? 40;

    try {
      const videos: VideoAsset[] = [];

      for (const imagePair of task.assets.images) {
        const videoPrompt = `${imagePair.sceneTitle}. Smooth animated transition in a whimsical flat 2D fantasy cartoon aesthetic with consistent original characters, no logos, no brand names, no copyrighted characters.`;
        const modelCandidates = Array.from(
          new Set(
            [
              preferredModel === "MiniMax-Hailuo-2.3"
                ? "MiniMax-Hailuo-02"
                : preferredModel,
              "MiniMax-Hailuo-02",
            ].filter((m): m is string => !!m),
          ),
        );

        let createRes: unknown = null;
        let modelUsed = modelCandidates[0];
        let createError: unknown = null;
        for (const candidate of modelCandidates) {
          try {
            createRes = await ctx.runAction(api.minimax.generateVideo, {
              model: candidate,
              duration,
              resolution,
              prompt: videoPrompt,
              first_frame_image: imagePair.startImageUrl,
              last_frame_image: imagePair.endImageUrl,
              prompt_optimizer: false,
            });
            modelUsed = candidate;
            createError = null;
            break;
          } catch (error) {
            createError = error;
            const message = error instanceof Error ? error.message : String(error);
            if (
              !message.includes(
                "does not support First-and-Last-Frame-Video mode",
              )
            ) {
              throw error;
            }
          }
        }
        if (createError || !createRes) {
          throw (
            createError ??
            new Error(
              `No compatible model available for first/last-frame video mode (scene ${imagePair.sceneNumber})`,
            )
          );
        }

        const videoTaskId = extractVideoTaskId(createRes);
        if (!videoTaskId) {
          throw new Error(
            `Video task id missing for scene ${imagePair.sceneNumber}`,
          );
        }

        let finalResult: unknown = null;
        for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
          const queryRes = await ctx.runAction(api.minimax.queryVideoTask, {
            task_id: videoTaskId,
          });
          finalResult = queryRes;
          const queryObj = queryRes as {
            status?: string;
            base_resp?: { status_code?: number; status_msg?: string };
          };

          if (
            queryObj.base_resp?.status_code &&
            queryObj.base_resp.status_code !== 0
          ) {
            throw new Error(
              queryObj.base_resp.status_msg ??
                `Video generation failed for scene ${imagePair.sceneNumber}`,
            );
          }

          if (queryObj.status === "Success") {
            break;
          }
          if (queryObj.status === "Fail" || queryObj.status === "Failed") {
            throw new Error(
              `Video generation failed for scene ${imagePair.sceneNumber}`,
            );
          }

          await sleep(pollIntervalMs);
        }

        const videoUrl = extractVideoUrl(finalResult);
        if (!videoUrl) {
          throw new Error(
            `Video URL not available for scene ${imagePair.sceneNumber} after polling`,
          );
        }

        videos.push({
          sceneNumber: imagePair.sceneNumber,
          sceneTitle: imagePair.sceneTitle,
          videoUrl,
          taskId: videoTaskId,
          model: modelUsed,
          duration,
          resolution,
          prompt: videoPrompt,
          generatedAt: Date.now(),
        });
      }

      await ctx.runMutation(internal.workflowTasks.setTaskRenderedVideos, {
        taskId: args.taskId,
        videos,
      });

      return {
        status: "rendered",
        videoCount: videos.length,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Scene video generation failed";
      await ctx.runMutation(internal.workflowTasks.setTaskFailed, {
        taskId: args.taskId,
        error: message,
      });
      throw new Error(message);
    }
  },
});
