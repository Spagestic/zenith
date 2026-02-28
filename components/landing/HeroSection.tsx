"use client";

import Link from "next/link";
import Image from "next/image";
import { Volume2, Clock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURED = {
  id: "1",
  category: "World",
  title: "Germany's Merz Meets China's Tech Vanguard, Including Alibaba and Unitree CEOs",
  summary:
    "German Chancellor Friedrich Merz visited Hangzhou and met leaders from Alibaba, Unitree Robotics, and other AI and EV companies — signalling growing global recognition of China's technology rise.",
  kidsSummary:
    "Germany's leader visited China to meet the people behind some of the world's coolest robots and apps! He watched robots dance and even tried on special AI glasses that can see and understand the world.",
  readTime: "2 min read",
  timeAgo: "2 hours ago",
  source: "SCMP",
  image: "/articles/merz-china.jpg",
};

const SIDE_STORIES = [
  {
    id: "2",
    category: "Technology",
    title: "AI Breakthrough Enables Real-Time Translation Across 200+ Languages",
    timeAgo: "3 hours ago",
    readTime: "3 min read",
  },
  {
    id: "3",
    category: "Hong Kong",
    title: "West Kowloon Cultural District Opens New Interactive Science Exhibition",
    timeAgo: "5 hours ago",
    readTime: "4 min read",
  },
  {
    id: "4",
    category: "Science",
    title: "NASA Confirms Discovery of Water Molecules on Nearby Exoplanet Surface",
    timeAgo: "8 hours ago",
    readTime: "3 min read",
  },
  {
    id: "5",
    category: "Business",
    title: "Electric Vehicle Sales Surpass Traditional Cars for First Time in Asia",
    timeAgo: "10 hours ago",
    readTime: "4 min read",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  World: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Technology: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  "Hong Kong": "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  Science: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Business: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "Breaking News": "bg-red-500/10 text-red-600 dark:text-red-400",
};

const getCategoryStyle = (category: string) =>
  CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground";

const HeroSection = () => {
  return (
    <section className="container py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

        {/* ── Main featured article ── */}
        <div className="lg:col-span-2 group flex flex-col gap-5">
          {/* Image */}
          <Link href={`/article/${FEATURED.id}`} className="block overflow-hidden rounded-xl border border-border">
            <div className="relative aspect-[16/9] w-full bg-muted">
              <Image
                src={FEATURED.image}
                alt={FEATURED.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
              {/* dark gradient at bottom for text legibility if needed */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            </div>
          </Link>

          {/* Content */}
          <div className="flex flex-col gap-3">
            {/* Category badge */}
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${getCategoryStyle(FEATURED.category)}`}
              >
                {FEATURED.category}
              </span>
            </div>

            {/* Title */}
            <Link href={`/article/${FEATURED.id}`}>
              <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold leading-tight tracking-tight hover:text-muted-foreground transition-colors">
                {FEATURED.title}
              </h2>
            </Link>

            {/* Summary */}
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
              {FEATURED.kidsSummary}
            </p>

            {/* Meta + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              {/* Meta */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{FEATURED.source}</span>
                <span className="text-border">·</span>
                <span>{FEATURED.timeAgo}</span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {FEATURED.readTime}
                </span>
              </div>

              {/* Actions */}
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs rounded-full"
              >
                <Volume2 className="h-3 w-3" />
                Listen
              </Button>
            </div>
          </div>
        </div>

        {/* ── Side stories ── */}
        <div className="flex flex-col lg:border-l lg:border-border lg:pl-8">
          {/* Header */}
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-5">
            Top Stories
          </h3>

          <div className="flex flex-col divide-y divide-border">
            {SIDE_STORIES.map((story) => (
              <SideStory key={story.id} {...story} />
            ))}
          </div>

          {/* View all */}
          <Link
            href="/top"
            className="mt-5 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View all top stories
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

      </div>
    </section>
  );
};

const SideStory = ({
  id,
  category,
  title,
  timeAgo,
  readTime,
}: {
  id: string;
  category: string;
  title: string;
  timeAgo: string;
  readTime: string;
}) => (
  <article className="group py-4 first:pt-0 last:pb-0">
    <Link href={`/article/${id}`} className="flex flex-col gap-2">
      <span
        className={`inline-block w-fit rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${
          CATEGORY_COLORS[category] ?? "bg-muted text-muted-foreground"
        }`}
      >
        {category}
      </span>

      <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors line-clamp-2">
        {title}
      </h3>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>{readTime}</span>
        <span className="text-border">·</span>
        <span>{timeAgo}</span>
      </div>
    </Link>
  </article>
);

export default HeroSection;