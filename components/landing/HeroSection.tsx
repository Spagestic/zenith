"use client";

import Link from "next/link";
import Image from "next/image";
import { Volume2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FEATURED, SIDE_CARDS, WIDE_CARDS } from "@/data";

// ── Category colours ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  World: "text-blue-600 dark:text-blue-400",
  Technology: "text-violet-600 dark:text-violet-400",
  "Hong Kong": "text-rose-600 dark:text-rose-400",
  Science: "text-emerald-600 dark:text-emerald-400",
  Business: "text-amber-600 dark:text-amber-400",
};

const categoryStyle = (cat: string) =>
  CATEGORY_COLORS[cat] ?? "bg-muted text-muted-foreground";

// ── Sub-components ────────────────────────────────────────────────────────────

const CategoryPill = ({ label }: { label: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${categoryStyle(label)}`}
  >
    <span className="w-px h-3 bg-current opacity-70" />
    {label}
  </span>
);

const Meta = ({
  source,
  timeAgo,
  readTime,
}: {
  source: string;
  timeAgo: string;
  readTime: string;
}) => (
  <div className="flex items-center gap-2 text-xs text-muted-foreground">
    <span className="font-medium text-foreground">{source}</span>
    <span>·</span>
    <span>{timeAgo}</span>
    <span>·</span>
    <Clock className="h-3 w-3" />
    <span>{readTime}</span>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────

const HeroSection = () => {
  return (
    <section className="container py-8 md:py-12 space-y-6">
      {/* ── ROW 1: Big feature (left) + 2 side cards (right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured — spans 2 cols */}
        <Link
          href={`/article/${FEATURED.id}`}
          className="group lg:col-span-2 flex flex-col gap-4"
        >
          <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted">
            <Image
              src={FEATURED.image}
              alt={FEATURED.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              priority
            />
          </div>

          <div className="flex flex-col gap-2.5">
            <CategoryPill label={FEATURED.category} />
            <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight tracking-tight group-hover:text-muted-foreground transition-colors">
              {FEATURED.title}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed line-clamp-2">
              {FEATURED.kidsSummary}
            </p>
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <Meta
                source={FEATURED.source}
                timeAgo={FEATURED.timeAgo}
                readTime={FEATURED.readTime}
              />
              <Button
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs rounded-full"
                onClick={(e) => e.preventDefault()}
              >
                <Volume2 className="h-3 w-3" />
                Listen
              </Button>
            </div>
          </div>
        </Link>

        {/* Side cards — stacked vertically in the 3rd col */}
        <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-6">
          {SIDE_CARDS.map((card) => (
            <Link
              key={card.id}
              href={`/article/${card.id}`}
              className="group flex flex-col gap-3 flex-1"
            >
              <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <CategoryPill label={card.category} />
                <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-2">
                  {card.title}
                </h3>
                <Meta
                  source={card.source}
                  timeAgo={card.timeAgo}
                  readTime={card.readTime}
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
        {WIDE_CARDS.map((card) => (
          <Link
            key={card.id}
            href={`/article/${card.id}`}
            className="group flex flex-row gap-4 items-start"
          >
            {/* Thumbnail */}
            <div className="relative w-36 shrink-0 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
              <Image
                src={card.image}
                alt={card.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </div>

            {/* Text */}
            <div className="flex flex-col gap-2 min-w-0">
              <CategoryPill label={card.category} />
              <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-3">
                {card.title}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {card.kidsSummary}
              </p>
              <Meta
                source={card.source}
                timeAgo={card.timeAgo}
                readTime={card.readTime}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
