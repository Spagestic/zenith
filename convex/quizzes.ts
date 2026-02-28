// convex/quizzes.ts
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByArticle = query({
  args: { articleId: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizzes")
      .withIndex("by_article", (q) => q.eq("articleId", args.articleId))
      .collect();
  },
});

export const submitAnswer = mutation({
  args: {
    quizId: v.id("quizzes"),
    articleId: v.id("articles"),
    sessionId: v.string(),
    selectedIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const quiz = await ctx.db.get(args.quizId);
    if (!quiz) throw new Error("Quiz not found");

    const isCorrect = quiz.correctIndex === args.selectedIndex;

    await ctx.db.insert("quizAttempts", {
      quizId: args.quizId,
      articleId: args.articleId,
      userId: undefined,
      sessionId: args.sessionId,
      selectedIndex: args.selectedIndex,
      isCorrect,
      completedAt: Date.now(),
    });

    return { isCorrect, correctIndex: quiz.correctIndex };
  },
});

export const getAttemptsBySession = query({
  args: { articleId: v.id("articles"), sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("quizAttempts")
      .withIndex("by_article_session", (q) =>
        q.eq("articleId", args.articleId).eq("sessionId", args.sessionId),
      )
      .collect();
  },
});
