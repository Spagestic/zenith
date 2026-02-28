// convex/seed.ts
import { mutation } from "./_generated/server";
import { SEED_ARTICLES, SEED_QUIZZES } from "../data";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing data (optional, for re-seeding)
    const existingArticles = await ctx.db.query("articles").collect();
    for (const article of existingArticles) {
      await ctx.db.delete(article._id);
    }
    const existingQuizzes = await ctx.db.query("quizzes").collect();
    for (const quiz of existingQuizzes) {
      await ctx.db.delete(quiz._id);
    }

    // Insert articles and collect IDs
    const articleIds: string[] = [];
    for (const article of SEED_ARTICLES) {
      const id = await ctx.db.insert("articles", {
        title: article.title,
        slug: article.slug,
        originalText: article.originalText,
        kidSummary: article.kidSummary,
        imageUrl: article.imageUrl,
        audioUrl: undefined,
        category: article.category,
        sourceUrl: article.sourceUrl,
        sourceName: article.sourceName,
        publishedAt: article.publishedAt,
        readingTimeMinutes: article.readingTimeMinutes,
      });
      articleIds.push(id);
    }

    // Insert quizzes (map to article IDs by index)
    const quizMapping = [0, 1, 3]; // Quiz 0 -> Article 0, Quiz 1 -> Article 1, Quiz 2 -> Article 3 (NASA)
    for (let i = 0; i < SEED_QUIZZES.length; i++) {
      const quiz = SEED_QUIZZES[i];
      const articleIndex = quizMapping[i];
      await ctx.db.insert("quizzes", {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        articleId: articleIds[articleIndex] as any,
        question: quiz.question,
        options: quiz.options,
        correctIndex: quiz.correctIndex,
        order: quiz.order,
      });
    }

    return {
      articlesCreated: articleIds.length,
      quizzesCreated: SEED_QUIZZES.length,
    };
  },
});
