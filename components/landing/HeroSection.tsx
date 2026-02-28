"use client";

import Link from "next/link";
import Image from "next/image";
import { Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURED = {
  id: "1",
  category: "Breaking News",
  title: "Global Leaders Agree on Historic Climate Framework at Geneva Summit",
  summary:
    "Representatives from over 140 countries signed a landmark agreement to reduce carbon emissions by 50% before 2035, with new funding commitments for developing nations to transition to clean energy.",
  kidsSummary:
    "Leaders from around the world met in Geneva and agreed to work together to protect our planet! They promised to use cleaner energy and help every country take care of the environment.",
  readTime: "5 min read",
  timeAgo: "2 hours ago",
  source: "Reuters",
  gradient: "from-sky-600 to-indigo-700",
};

const SIDE_STORIES = [
  {
    id: "2",
    category: "Technology",
    title:
      "AI Breakthrough Enables Real-Time Translation Across 200+ Languages",
    timeAgo: "3 hours ago",
  },
  {
    id: "3",
    category: "Hong Kong",
    title:
      "West Kowloon Cultural District Opens New Interactive Science Exhibition",
    timeAgo: "5 hours ago",
  },
  {
    id: "4",
    category: "Science",
    title:
      "NASA Confirms Discovery of Water Molecules on Nearby Exoplanet Surface",
    timeAgo: "8 hours ago",
  },
  {
    id: "5",
    category: "Business",
    title:
      "Electric Vehicle Sales Surpass Traditional Cars for First Time in Asia",
    timeAgo: "10 hours ago",
  },
];

const HeroSection = () => {
  return (
    <section className="container py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main featured article */}
        <div className="lg:col-span-2 group">
          <Link href={`/article/${FEATURED.id}`}>
            <div className="overflow-hidden rounded-sm">
              <Image
                src="/global.png"
                alt="City skyline at golden hour"
                width={800}
                height={450}
                className="w-full h-75 md:h-112.5 object-cover transition-transform duration-500 group-hover:scale-105"
                priority
              />
            </div>
          </Link>

          <div className="mt-4">
            <span className="text-xs font-body font-bold uppercase tracking-widest text-accent">
              {FEATURED.category}
            </span>
            <Link href={`/article/${FEATURED.id}`}>
              <h2 className="font-display text-2xl md:text-4xl font-bold mt-2 leading-tight group-hover:text-muted-foreground transition-colors">
                {FEATURED.title}
              </h2>
            </Link>
            <p className="font-body text-muted-foreground mt-3 text-base md:text-lg leading-relaxed max-w-2xl">
              {FEATURED.kidsSummary}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                >
                  <Volume2 className="h-3 w-3" />
                  Listen
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 gap-1.5 text-xs"
                >
                  <Play className="h-3 w-3" />
                  Watch
                </Button>
              </div>
              <span className="text-sm font-body text-muted-foreground">
                {FEATURED.source} · {FEATURED.timeAgo}
              </span>
            </div>
          </div>
        </div>

        {/* Side stories */}
        <div className="flex flex-col gap-6 lg:border-l lg:border-border lg:pl-8">
          <div className="mb-1">
            <h3 className="text-xs font-body font-bold uppercase tracking-widest text-muted-foreground">
              📰 Top Stories
            </h3>
          </div>
          {SIDE_STORIES.map((story, i) => (
            <div key={story.id}>
              {i > 0 && <div className="border-t border-border mb-6" />}
              <SideStory
                id={story.id}
                category={story.category}
                title={story.title}
                time={story.timeAgo}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const SideStory = ({
  id,
  category,
  title,
  time,
}: {
  id: string;
  category: string;
  title: string;
  time: string;
}) => (
  <article className="group">
    <Link href={`/article/${id}`}>
      <span className="text-xs font-body font-bold uppercase tracking-widest text-accent">
        {category}
      </span>
      <h3 className="font-display text-lg font-semibold mt-1.5 leading-snug group-hover:text-muted-foreground transition-colors">
        {title}
      </h3>
      <div className="flex items-center gap-3 mt-2">
        <span className="text-xs font-body text-muted-foreground">{time}</span>
        <button className="text-xs font-body text-primary hover:underline">
          🔊 Listen
        </button>
      </div>
    </Link>
  </article>
);

export default HeroSection;
