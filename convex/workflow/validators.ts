import { v } from "convex/values";

export const sourceDocumentValidator = v.object({
  url: v.string(),
  title: v.optional(v.string()),
  publishedDate: v.optional(v.string()),
  author: v.optional(v.string()),
  text: v.optional(v.string()),
  summary: v.optional(v.string()),
  highlights: v.optional(v.array(v.string())),
});

export const storyPlanValidator = v.object({
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

export const scenePromptValidator = v.object({
  sceneNumber: v.number(),
  sceneTitle: v.string(),
  imagePrompt: v.string(),
  startFramePrompt: v.string(),
  endFramePrompt: v.string(),
  transitionPrompt: v.string(),
  negativePrompt: v.optional(v.string()),
  camera: v.optional(v.string()),
  style: v.optional(v.string()),
});

export const imageAssetValidator = v.object({
  sceneNumber: v.number(),
  sceneTitle: v.string(),
  startImageUrl: v.string(),
  endImageUrl: v.string(),
  startPrompt: v.string(),
  endPrompt: v.string(),
  model: v.string(),
  aspectRatio: v.string(),
  generatedAt: v.number(),
});
