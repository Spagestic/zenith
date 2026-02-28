"use client";

import Link from "next/link";
import Image from "next/image";
import { Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SEED_ARTICLES } from "@/data";

// ── Helpers & Formatters ──────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  world: "text-blue-600 dark:text-blue-400",
  tech: "text-violet-600 dark:text-violet-400",
  hong_kong: "text-rose-600 dark:text-rose-400",
  science: "text-emerald-600 dark:text-emerald-400",
  sports: "text-amber-600 dark:text-amber-400",
  nature: "text-green-600 dark:text-green-400",
};

const formatCategory = (cat: string) => {
  if (cat === "hong_kong") return "Hong Kong";
  return cat.charAt(0).toUpperCase() + cat.slice(1);
};

const categoryStyle = (cat: string) =>
  CATEGORY_COLORS[cat] ?? "text-muted-foreground";

const formatTimeAgo = (timestamp: number) => {
  const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours === 1) return "1 hour ago";
  return `${hours} hours ago`;
};

// ── Sub-components ────────────────────────────────────────────────────────────

const CategoryPill = ({ category }: { category: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${categoryStyle(category)}`}
  >
    <span className="w-px h-3 bg-current opacity-70" />
    {formatCategory(category)}
  </span>
);

const Meta = ({
  source,
  publishedAt,
  readingTimeMinutes,
}: {
  source?: string;
  publishedAt: number;
  readingTimeMinutes: number;
}) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="font-medium text-foreground">{source || "News"}</span>
    <span>·</span>
    <span>{formatTimeAgo(publishedAt)}</span>
    <span>·</span>
    <Clock className="h-3 w-3" />
    <span>{readingTimeMinutes} min read</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const HeroSection = () => {
  if (!SEED_ARTICLES || SEED_ARTICLES.length === 0) return null;

  const featured = SEED_ARTICLES[0];
  const sideCards = SEED_ARTICLES.slice(1, 3);
  const wideCards = SEED_ARTICLES.slice(3, 5);

  return (
    <section className="container py-8 md:py-12 space-y-6">
      {/* ── ROW 1: Big feature (left) + 2 side cards (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured — spans 2 cols */}
        {featured && (
          <Link
            href={`/article/${featured.slug}`}
            className="lg:col-span-2 group"
          >
            <Card className="pt-0 overflow-hidden border-border transition-shadow hover:shadow-lg h-full">
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                <Image
                  src={featured.imageUrl || "/placeholder.png"}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  priority
                />
              </div>

              <CardHeader className="pb-2">
                <CategoryPill category={featured.category} />
                <CardTitle className="font-display text-2xl md:text-3xl font-bold leading-tight tracking-tight group-hover:text-muted-foreground transition-colors">
                  {featured.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="pb-2">
                <CardDescription className="text-base leading-relaxed line-clamp-2">
                  {featured.kidSummary}
                </CardDescription>
              </CardContent>

              <CardFooter className="flex items-center justify-between flex-wrap gap-2">
                <Meta
                  source={featured.sourceName}
                  publishedAt={featured.publishedAt}
                  readingTimeMinutes={featured.readingTimeMinutes}
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 gap-1.5 text-xs rounded-full"
                  onClick={(e) => {
                    e.preventDefault();
                    // TODO: Hook up MiniMax TTS audio play here
                  }}
                >
                  <Volume2 className="h-3 w-3" />
                  Listen
                </Button>
              </CardFooter>
            </Card>
          </Link>
        )}

        {/* Side cards — stacked vertically in the 3rd col */}
        <div className="flex flex-col gap-6">
          {sideCards.map((card) => (
            <Link
              key={card.slug}
              href={`/article/${card.slug}`}
              className="group flex-1"
            >
              <Card className="pt-0 overflow-hidden border-border transition-shadow hover:shadow-lg h-full flex flex-col">
                <div className="relative aspect-video w-full overflow-hidden bg-muted">
                  <Image
                    src={card.imageUrl || "/placeholder.png"}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <CardHeader className="pb-2 flex-1">
                  <CategoryPill category={card.category} />
                  <CardTitle className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-2">
                    {card.title}
                  </CardTitle>
                </CardHeader>

                <CardFooter className="pt-0">
                  <Meta
                    source={card.sourceName}
                    publishedAt={card.publishedAt}
                    readingTimeMinutes={card.readingTimeMinutes}
                  />
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-border" />

      {/* ── ROW 2: 2 wide horizontal cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {wideCards.map((card) => (
          <Link
            key={card.slug}
            href={`/article/${card.slug}`}
            className="group"
          >
            <Card className="overflow-hidden border-border transition-shadow hover:shadow-lg h-full">
              <CardContent className="flex flex-row gap-4 items-start p-4">
                {/* Thumbnail */}
                <div className="relative w-36 shrink-0 aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={card.imageUrl || "/placeholder.png"}
                    alt={card.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                {/* Text */}
                <div className="flex flex-col gap-2 min-w-0">
                  <CategoryPill category={card.category} />
                  <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-3">
                    {card.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {card.kidSummary}
                  </p>
                  <Meta
                    source={card.sourceName}
                    publishedAt={card.publishedAt}
                    readingTimeMinutes={card.readingTimeMinutes}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
