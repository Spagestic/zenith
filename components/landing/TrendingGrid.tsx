"use client";

import Link from "next/link";
import { Volume2, Brain, FileQuestion, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";

const articles = [
  {
    id: "10",
    gradient: "from-violet-500 to-purple-600",
    emoji: "🔭",
    category: "Space",
    title: "New Telescope Discovers Three Planets That May Have Water",
    excerpt:
      "Astronomers spotted planets far away from Earth that could have oceans — a key ingredient for life as we know it!",
    funFact:
      "There are more stars in the universe than grains of sand on all of Earth's beaches!",
    readTime: "4 min",
    source: "NASA",
  },
  {
    id: "11",
    gradient: "from-emerald-500 to-teal-600",
    emoji: "🌊",
    category: "Environment",
    title: "Tiny Ocean Robots Clean Up Plastic Without Harming Sea Life",
    excerpt:
      "A team of engineers created small robots that swim through the ocean collecting waste while keeping fish and coral safe.",
    funFact:
      "8 million tons of plastic enter our oceans each year — that's like dumping a garbage truck every minute!",
    readTime: "5 min",
    source: "BBC",
  },
  {
    id: "12",
    gradient: "from-orange-500 to-red-600",
    emoji: "🤖",
    category: "Technology",
    title: "Students in Japan Build Dancing Robots That Move in Perfect Sync",
    excerpt:
      "A group of kids programmed small robots to dance together at a science fair, wowing thousands of visitors.",
    funFact:
      'The word "robot" comes from a Czech word meaning "forced labor" — it was invented in a play in 1920!',
    readTime: "3 min",
    source: "NHK",
  },
  {
    id: "13",
    gradient: "from-green-500 to-emerald-700",
    emoji: "🐼",
    category: "Science",
    title: "Giant Panda Population Grows Thanks to Conservation Efforts",
    excerpt:
      "Great news for nature! The number of wild giant pandas has increased for the first time in decades.",
    funFact:
      "A giant panda eats up to 38 kg of bamboo every day — that's about the weight of a 10-year-old child!",
    readTime: "4 min",
    source: "WWF",
  },
];

interface TrendingGridProps {
  activeCategory?: string;
}

const TrendingGrid = ({ activeCategory = "all" }: TrendingGridProps) => {
  const filtered =
    activeCategory === "all"
      ? articles
      : articles.filter((a) => a.category.toLowerCase() === activeCategory);

  const displayArticles = filtered.length > 0 ? filtered : articles;

  return (
    <section className="container py-10 md:py-16">
      <div className="flex items-center gap-4 mb-8">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          Trending Now
        </h2>
        <div className="flex-1 border-t border-border" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayArticles.map((article, i) => (
          <article
            key={article.id}
            className="group cursor-pointer"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <Link href={`/article/${article.id}`}>
              {/* Image placeholder */}
              <div className="overflow-hidden rounded-sm shadow-sm group-hover:shadow-md transition-shadow duration-300">
                <div
                  className={`w-full h-48 bg-linear-to-br ${article.gradient} flex items-center justify-center transition-transform duration-500 group-hover:scale-105`}
                >
                  <span className="text-5xl drop-shadow-md">
                    {article.emoji}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-xs font-body font-bold uppercase tracking-widest text-accent">
                  {article.category}
                </span>
                <h3 className="font-display text-base font-semibold mt-1.5 leading-snug group-hover:text-muted-foreground transition-colors">
                  {article.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </div>
            </Link>

            {/* Action buttons */}
            <div className="flex gap-1 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs px-2"
              >
                <Volume2 className="h-3 w-3" />
                {article.readTime}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs px-2"
              >
                <Brain className="h-3 w-3" />
                Map
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 text-xs px-2"
              >
                <FileQuestion className="h-3 w-3" />
                Quiz
              </Button>
            </div>

            {/* Fun fact */}
            <div className="mt-3 rounded-sm bg-amber-50 dark:bg-amber-950/30 p-2.5">
              <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
                <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                <span>{article.funFact}</span>
              </p>
            </div>

            <span className="text-xs font-body text-muted-foreground mt-2 block">
              {article.source}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
};

export default TrendingGrid;
