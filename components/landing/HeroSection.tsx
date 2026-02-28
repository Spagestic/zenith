"use client";

import Link from "next/link";
import Image from "next/image";
import { Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
// Assuming you exported the array as SEED_ARTICLES from your data file
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
  // Safety check in case data is empty during development
  if (!SEED_ARTICLES || SEED_ARTICLES.length === 0) return null;

  // Dynamically slice the articles based on the UI layout
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
            className="group lg:col-span-2 flex flex-col gap-4"
          >
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
              <Image
                src={featured.imageUrl || "/placeholder.png"}
                alt={featured.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>

            <div className="flex flex-col gap-2.5">
              <CategoryPill category={featured.category} />
              <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight tracking-tight group-hover:text-muted-foreground transition-colors">
                {featured.title}
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed line-clamp-2">
                {featured.kidSummary}
              </p>
              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
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
              </div>
            </div>
          </Link>
        )}

        {/* Side cards — stacked vertically in the 3rd col */}
        <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-6">
          {sideCards.map((card) => (
            <Link
              key={card.slug}
              href={`/article/${card.slug}`}
              className="group flex flex-col gap-3 flex-1"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={card.imageUrl || "/placeholder.png"}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <CategoryPill category={card.category} />
                <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-2">
                  {card.title}
                </h3>
                <Meta
                  source={card.sourceName}
                  publishedAt={card.publishedAt}
                  readingTimeMinutes={card.readingTimeMinutes}
                />
              </div>
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
            className="group flex flex-row gap-4 items-start"
          >
            {/* Thumbnail */}
            <div className="relative w-36 shrink-0 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
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
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
