// app/article/[slug]/_components/ArticleContent.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const timeAgo = formatDistanceToNow(article.publishedAt, {
    addSuffix: true,
  });

  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Main Article Card */}
        <Card className="pt-0 overflow-hidden border-border shadow-lg mb-8">
          {/* Hero Image */}
          {article.imageUrl && (
            <div className="relative aspect-video w-full overflow-hidden bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <CardHeader className="space-y-3">
            {/* Category Badge */}
            <div>
              <Badge className={`${categoryConfig.color} text-sm font-medium`}>
                {categoryConfig.emoji} {categoryConfig.label}
              </Badge>
            </div>

            {/* Title */}
            <CardTitle className="text-3xl md:text-4xl font-bold leading-tight">
              {article.title}
            </CardTitle>

            {/* Meta */}
            <CardDescription className="flex items-center gap-4 text-sm">
              <span>{timeAgo}</span>
              {article.sourceName && (
                <>
                  <span>•</span>
                  <span>Source: {article.sourceName}</span>
                </>
              )}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Kid-Friendly Summary Card */}
        <Card className="mb-8 border-2 border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
              <Sparkles className="h-5 w-5 text-amber-600" />
              Easy-to-Read Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              {article.kidSummary}
            </p>
          </CardContent>
        </Card>

        {/* Original Article (Collapsible Card) */}
        <Collapsible className="mb-8">
          <Card className="border-border">
            <CardHeader className="pb-0">
              <CollapsibleTrigger className="flex items-center gap-2 w-full cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                <BookOpen className="h-4 w-4" />
                <span>Show original article</span>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {article.originalText}
                </p>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Quiz Section */}
        <QuizSection articleId={article._id} />

        {/* Source Link Card */}
        {article.sourceUrl && (
          <Card className="mt-8 border-border">
            <CardFooter className="justify-center py-4">
              <a
                href={article.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-blue-600 transition-colors"
              >
                Read full article at {article.sourceName} →
              </a>
            </CardFooter>
          </Card>
        )}
      </main>
    </div>
  );
}

function ArticleSkeleton() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card className="pt-0 overflow-hidden border-border shadow-lg mb-8">
          <Skeleton className="aspect-video w-full" />
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
        </Card>
        <Card className="border-border mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
