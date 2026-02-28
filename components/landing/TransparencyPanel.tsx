"use client";

import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";

const promises = [
  "No personal data collected without login",
  "All content AI-rated for age-appropriateness",
  "No ads · No algorithmic manipulation · No tracking",
  "Open source — inspect our filtering logic",
];

const TransparencyPanel = () => {
  return (
    <section className="border-t border-b border-border">
      <div className="container py-10 md:py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left */}
          <div>
            <span className="text-xs font-body font-bold uppercase tracking-widest text-accent">
              Trust & Safety
            </span>
            <h2 className="font-display text-2xl md:text-3xl font-bold mt-2">
              Built for Parents &amp; Educators
            </h2>
            <p className="font-body text-muted-foreground mt-3 leading-relaxed max-w-lg">
              Zenith is designed to be transparent, responsible, and safe. We
              believe children deserve a news experience that respects their
              privacy and supports their curiosity.
            </p>
          </div>

          {/* Right */}
          <div>
            <ul className="space-y-4">
              {promises.map((text, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 mt-0.5">
                    <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="font-body text-sm text-muted-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-4 mt-6">
              <Link
                href="/policy"
                className="font-body text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                Content Policy <ExternalLink className="h-3 w-3" />
              </Link>
              <a
                href="https://github.com/your-repo"
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                GitHub <ExternalLink className="h-3 w-3" />
              </a>
              <Link
                href="/how-filtering-works"
                className="font-body text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
              >
                How Filtering Works <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransparencyPanel;
