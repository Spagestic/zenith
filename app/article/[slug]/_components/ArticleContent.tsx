// app/article/[slug]/_components/ArticleContent.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { QuizSection } from "./QuizSection";
import { formatDistanceToNow } from "date-fns";

interface ArticleContentProps {
  slug: string;
}

const CATEGORY_CONFIG = {
  hong_kong: {
    label: "Hong Kong",
    color: "bg-red-100 text-red-700",
    emoji: "🏙️",
  },
  world: { label: "World", color: "bg-blue-100 text-blue-700", emoji: "🌍" },
  science: {
    label: "Science",
    color: "bg-purple-100 text-purple-700",
    emoji: "🔬",
  },
  nature: {
    label: "Nature",
    color: "bg-green-100 text-green-700",
    emoji: "🌿",
  },
  tech: {
    label: "Technology",
    color: "bg-amber-100 text-amber-700",
    emoji: "💡",
  },
  sports: {
    label: "Sports",
    color: "bg-orange-100 text-orange-700",
    emoji: "⚽",
  },
} as const;

export function ArticleContent({ slug }: ArticleContentProps) {
  const article = useQuery(api.articles.getBySlug, { slug });

  // Loading state
  if (article === undefined) {
    return <ArticleSkeleton />;
  }

  // Not found
  if (article === null) {
    notFound();
  }

  const categoryConfig = CATEGORY_CONFIG[article.category];
  const timeAgo = formatDistanceToNow(article.publishedAt, { addSuffix: true });

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to News
            </Button>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {article.readingTimeMinutes} min read
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Category Badge */}
        <div className="mb-4">
          <Badge className={`${categoryConfig.color} text-sm font-medium`}>
            {categoryConfig.emoji} {categoryConfig.label}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {article.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <span>{timeAgo}</span>
          {article.sourceName && (
            <>
              <span>•</span>
              <span>Source: {article.sourceName}</span>
            </>
          )}
        </div>

        {/* Hero Image */}
        {article.imageUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-8 shadow-lg">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Kid-Friendly Summary Box */}
        <div className="bg-linear-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-amber-600" />
            <h2 className="text-lg font-semibold text-amber-800">
              Easy-to-Read Summary
            </h2>
          </div>
          <div className="prose prose-lg prose-amber max-w-none">
            <p className="text-gray-700 leading-relaxed text-lg">
              {article.kidSummary}
            </p>
          </div>
        </div>

        {/* Original Article (Collapsible) */}
        <details className="mb-8 group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-gray-900 transition-colors">
            <BookOpen className="h-4 w-4" />
            <span>Show original article</span>
          </summary>
          <div className="mt-4 p-4 bg-gray-50 rounded-xl text-sm text-gray-600 leading-relaxed">
            {article.originalText}
          </div>
        </details>

        {/* Quiz Section */}
        <QuizSection articleId={article._id} />

        {/* Source Link */}
        {article.sourceUrl && (
          <div className="mt-8 pt-6 border-t text-center">
            <a
              href={article.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-blue-600 transition-colors"
            >
              Read full article at {article.sourceName} →
            </a>
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      <div className="bg-emerald-600 h-10" />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Skeleton className="h-6 w-24 mb-4" />
        <Skeleton className="h-12 w-full mb-2" />
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="aspect-video w-full rounded-2xl mb-8" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
