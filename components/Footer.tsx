"use client";

import Link from "next/link";
import Image from "next/image";

const footerLinks = {
  Sections: [
    { label: "World", href: "/category/world" },
    { label: "HK Local", href: "/category/hk" },
    { label: "Science", href: "/category/science" },
    { label: "Technology", href: "/category/tech" },
    { label: "Environment", href: "/category/environment" },
    { label: "Space", href: "/category/space" },
  ],
  Platform: [
    { label: "Knowledge Graph", href: "/graph" },
    { label: "Daily Briefing", href: "/briefing" },
    { label: "Quizzes", href: "/quizzes" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  Trust: [
    { label: "Content Policy", href: "/policy" },
    { label: "How Filtering Works", href: "/how-filtering-works" },
    { label: "Privacy", href: "/privacy" },
    { label: "GitHub", href: "https://github.com/your-repo", external: true },
  ],
};

const Footer = () => {
  return (
    <footer className="border-t border-border px-4">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <Image
                alt="Zenith Logo"
                className="h-7 w-7"
                height={28}
                src="/logo_.png"
                width={28}
              />
              <h3 className="font-display text-xl font-bold">Zenith</h3>
            </div>
            <p className="font-body text-sm text-muted-foreground mt-2 leading-relaxed">
              Learn the news, don&apos;t just read it. AI-powered news &amp;
              knowledge platform — safe by default.
            </p>
            <p className="font-body text-xs text-muted-foreground mt-3">
              Built at HackTheEast 2026
              <br />
              Powered by MiniMax AI
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-body text-sm font-bold uppercase tracking-widest mb-4">
                {heading}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 Zenith. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
