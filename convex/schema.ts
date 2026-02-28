// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  users: defineTable({
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.float64()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.float64()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  // ============ ARTICLES ============
  articles: defineTable({
    title: v.string(),
    slug: v.string(), // URL-friendly identifier
    originalText: v.string(), // Source article (for reference)
    kidSummary: v.string(), // AI-generated kid-friendly version
    imageUrl: v.optional(v.string()),
    audioUrl: v.optional(v.string()), // MiniMax TTS (stretch goal)
    category: v.union(
      v.literal("hong_kong"),
      v.literal("world"),
      v.literal("science"),
      v.literal("nature"),
      v.literal("tech"),
      v.literal("sports"),
    ),
    sourceUrl: v.optional(v.string()),
    sourceName: v.optional(v.string()),
    publishedAt: v.number(),
    readingTimeMinutes: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_published", ["publishedAt"]),

  // ============ QUIZZES ============
  quizzes: defineTable({
    articleId: v.id("articles"),
    question: v.string(),
    options: v.array(v.string()), // Always 4 options
    correctIndex: v.number(), // 0, 1, 2, or 3
    order: v.number(), // 1, 2, or 3 (question order)
  }).index("by_article", ["articleId"]),

  // ============ QUIZ ATTEMPTS ============
  quizAttempts: defineTable({
    quizId: v.id("quizzes"),
    articleId: v.id("articles"),
    userId: v.optional(v.id("users")), // null if anonymous
    sessionId: v.string(), // anonymous tracking (localStorage uuid)
    selectedIndex: v.number(),
    isCorrect: v.boolean(),
    completedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_article_session", ["articleId", "sessionId"]),

  // ============ WORKFLOW TASKS ============
  workflowTasks: defineTable({
    userId: v.id("users"),
    input: v.string(),
    inputType: v.union(v.literal("url"), v.literal("topic")),
    status: v.union(
      v.literal("queued"),
      v.literal("ingesting"),
      v.literal("ingested"),
      v.literal("planning"),
      v.literal("planned"),
      v.literal("prompting"),
      v.literal("prompted"),
      v.literal("rendering"),
      v.literal("rendered"),
      v.literal("failed"),
    ),
    stage: v.union(
      v.literal("created"),
      v.literal("ingesting"),
      v.literal("ingested"),
      v.literal("planning"),
      v.literal("planned"),
      v.literal("prompting"),
      v.literal("prompted"),
      v.literal("rendering"),
      v.literal("rendered"),
      v.literal("failed"),
    ),
    progress: v.optional(v.number()), // 0-100
    error: v.optional(v.string()),
    sourceUrls: v.array(v.string()),
    sourceDocuments: v.array(
      v.object({
        url: v.string(),
        title: v.optional(v.string()),
        publishedDate: v.optional(v.string()),
        author: v.optional(v.string()),
        text: v.optional(v.string()),
        summary: v.optional(v.string()),
        highlights: v.optional(v.array(v.string())),
      }),
    ),
    storyPlan: v.optional(
      v.object({
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
      }),
    ),
    scenePrompts: v.optional(
      v.array(
        v.object({
          sceneNumber: v.number(),
          sceneTitle: v.string(),
          imagePrompt: v.string(),
          startFramePrompt: v.string(),
          endFramePrompt: v.string(),
          transitionPrompt: v.string(),
          negativePrompt: v.optional(v.string()),
          camera: v.optional(v.string()),
          style: v.optional(v.string()),
        }),
      ),
    ),
    assets: v.optional(
      v.object({
        images: v.array(
          v.object({
            sceneNumber: v.number(),
            sceneTitle: v.string(),
            startImageUrl: v.string(),
            endImageUrl: v.string(),
            startPrompt: v.string(),
            endPrompt: v.string(),
            model: v.string(),
            aspectRatio: v.string(),
            generatedAt: v.number(),
          }),
        ),
      }),
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_created", ["userId", "createdAt"])
    .index("by_status_updated", ["status", "updatedAt"]),
});
