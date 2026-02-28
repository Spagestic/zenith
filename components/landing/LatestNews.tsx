// @/components/LatestNews.tsx
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { LATEST_ARTICLES } from "@/data";

const CATEGORY_COLORS: Record<string, string> = {
  World: "text-primary",
  Technology: "text-primary",
  "Hong Kong": "text-primary",
  Science: "text-primary",
  Business: "text-primary",
  Culture: "text-primary",
};

const CategoryPill = ({ label }: { label: string }) => (
  <span
    className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide ${
      CATEGORY_COLORS[label] ?? "text-muted-foreground"
    }`}
  >
    <span className="w-px h-3 bg-current opacity-70" />
    {label}
  </span>
);

export default function LatestNews() {
  return (
    <section className="container py-8 md:py-10">
      <div className="">

        {/* Section header */}
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
            Latest News
          </h2>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Article list */}
        <div className="flex flex-col divide-y divide-border">
          {LATEST_ARTICLES.map((item, i) => (
            <Link
              key={item.id}
              href={`/article/${item.id}`}
              className="group flex items-start gap-4 py-4"
            >
              {/* Index number */}
              <span className="text-2xl font-bold tabular-nums text-muted-foreground/20 w-7 shrink-0 leading-tight pt-0.5">
                {String(i + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                <CategoryPill label={item.category} />
                <h3 className="font-display text-base font-semibold leading-snug group-hover:text-muted-foreground transition-colors">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3 shrink-0" />
                  <span>{item.readTime}</span>
                  <span>·</span>
                  <span>{item.timeAgo}</span>
                </div>
              </div>

              {/* Hover arrow */}
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-all mt-1 -translate-x-1 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}