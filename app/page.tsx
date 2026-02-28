// app/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Search,
  Shield,
  Lock,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Brain,
  Map,
  Flame,
  Headphones,
  Compass,
  ChevronDown,
  Music,
  TreePine,
  Volume2,
  Sparkles,
  Landmark,
} from "lucide-react";

// ────────────────────────────────────────────────────────────
//  Mock data – replace with Convex queries later
//  e.g. const articles = useQuery(api.articles.listSafe);
// ────────────────────────────────────────────────────────────

const FEATURED = {
  id: "1",
  title: "Why the US Bank Changed the Rules",
  summary:
    "The central bank made a big change today! Think of it like a speed limit for money — to keep things balanced and help families save.",
  category: "Economy",
  emoji: "🏛️",
  gradient: "from-amber-400 to-orange-500",
  duration: "2 min",
};

const ARTICLES = [
  {
    id: "2",
    title: "A New Robot Heads to Space",
    summary:
      "Scientists just launched a new probe to look for ice on one of Jupiter's moons! It could help us understand if life exists beyond Earth.",
    tag: "Science",
    emoji: "🚀",
    gradient: "from-indigo-400 to-violet-500",
    duration: "3 min",
  },
  {
    id: "3",
    title: "Communities Plant 1 Million Trees",
    summary:
      "Communities around the world are teaming up to help the Amazon rainforest grow back. Each tree planted helps clean our air!",
    tag: "World",
    emoji: "🌍",
    gradient: "from-emerald-400 to-green-600",
    duration: "2 min",
  },
  {
    id: "4",
    title: "Oldest City Found Under Sand",
    summary:
      "Archaeologists dug up a city that is over 5,000 years old, hidden deep in the desert sand. It changes what we know about ancient history!",
    tag: "History",
    emoji: "🏛️",
    gradient: "from-yellow-400 to-amber-500",
    duration: "4 min",
  },
];

const TREE_NODES = {
  root: "Economy",
  child: "The Bank",
  leaves: ["Money", "Interest"],
};

// ────────────────────────────────────────────────────────────

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [progress, setProgress] = useState([0]);

  const play = (title: string) => {
    setNowPlaying(title);
    setIsPlaying(true);
    setProgress([0]);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* ═══════════════ NAVBAR ═══════════════ */}
      <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-md dark:bg-slate-950/80">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:h-16">
          {/* Logo */}
          <div className="flex shrink-0 items-center gap-2">
            <Compass className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              EduStream
            </span>
          </div>

          {/* Search */}
          <div className="relative hidden w-full max-w-md md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Badge
              variant="secondary"
              className="hidden gap-1.5 px-2.5 py-1 sm:inline-flex"
            >
              <Shield className="h-3.5 w-3.5 text-green-600" />
              <span className="text-xs font-medium">SAFE MODE</span>
            </Badge>

            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <Lock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Login &gt;18</span>
              <span className="sm:hidden">Login</span>
              <span className="hidden sm:inline">🔒</span>
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="border-t px-4 py-2 md:hidden">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </nav>

      {/* ═══════════════ MAIN ═══════════════ */}
      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-28 pt-8">
        {/* ──── HERO: TODAY'S BIG STORY ──── */}
        <Card className="overflow-hidden border-2 border-primary/10 shadow-sm">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              {/* Image placeholder */}
              <div
                className={`flex min-h-[200px] w-full items-center justify-center bg-gradient-to-br ${FEATURED.gradient} md:w-2/5`}
              >
                <span className="text-7xl drop-shadow-lg md:text-8xl">🌟</span>
              </div>

              {/* Copy */}
              <div className="flex flex-1 flex-col justify-center gap-4 p-6 md:p-8">
                <Badge
                  variant="outline"
                  className="w-fit text-xs uppercase tracking-widest"
                >
                  🌟 Today&apos;s Big Story
                </Badge>

                <h1 className="text-2xl font-bold leading-tight md:text-3xl">
                  {FEATURED.title}
                </h1>

                <p className="leading-relaxed text-muted-foreground md:text-lg">
                  {FEATURED.summary}
                </p>

                <div className="flex flex-wrap gap-3 pt-1">
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={() => play(FEATURED.title)}
                  >
                    <Headphones className="h-4 w-4" />
                    Listen ({FEATURED.duration})
                  </Button>
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Brain className="h-4 w-4" />
                    View Mindmap
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ──── TWO-COL LAYOUT ──── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          {/* ── LEFT: LATEST DISCOVERIES ── */}
          <section>
            <div className="mb-5 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">Latest Discoveries</h2>
            </div>

            <div className="space-y-4">
              {ARTICLES.map((a) => (
                <Card
                  key={a.id}
                  className="group overflow-hidden transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      {/* Thumbnail */}
                      <div
                        className={`flex min-h-[120px] w-full shrink-0 items-center justify-center bg-gradient-to-br ${a.gradient} sm:w-36`}
                      >
                        <span className="text-5xl">{a.emoji}</span>
                      </div>

                      {/* Body */}
                      <div className="flex flex-1 flex-col gap-2.5 p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-base font-semibold leading-snug transition-colors group-hover:text-primary sm:text-lg">
                            {a.emoji} {a.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-[11px]"
                          >
                            🏷️ {a.tag}
                          </Badge>
                        </div>

                        <p className="text-sm leading-relaxed text-muted-foreground">
                          {a.summary}
                        </p>

                        <div className="flex gap-1 pt-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1.5 text-xs"
                            onClick={() => play(a.title)}
                          >
                            <Play className="h-3.5 w-3.5" />
                            Play
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 gap-1.5 text-xs"
                          >
                            <Map className="h-3.5 w-3.5" />
                            Explore
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load more */}
            <div className="mt-8 flex justify-center">
              <Button variant="outline" className="gap-2">
                <ChevronDown className="h-4 w-4" />
                Load More Adventures…
              </Button>
            </div>
          </section>

          {/* ── RIGHT: SIDEBAR ── */}
          <aside className="space-y-5">
            {/* ▸ Knowledge Tree */}
            <Card>
              <CardContent className="pt-6">
                <div className="mb-1 flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Your Knowledge Tree</h3>
                </div>
                <p className="mb-5 text-xs text-muted-foreground">
                  Local Storage · Zero-Tracking
                </p>

                {/* ── Mini tree visualisation ── */}
                <div className="flex flex-col items-center">
                  {/* Root */}
                  <span className="rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                    {TREE_NODES.root}
                  </span>

                  <div className="h-5 w-px bg-border" />

                  {/* Child */}
                  <span className="rounded-full bg-amber-100 px-4 py-1 text-sm font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {TREE_NODES.child}
                  </span>

                  <div className="h-4 w-px bg-border" />

                  {/* Branches */}
                  <div className="relative flex w-44 justify-between">
                    {/* horizontal bar */}
                    <div className="absolute inset-x-[22px] top-0 h-px bg-border" />

                    {/* left leaf */}
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-px bg-border" />
                      <span className="rounded-full bg-green-100 px-3 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {TREE_NODES.leaves[0]}
                      </span>
                    </div>

                    {/* right leaf */}
                    <div className="flex flex-col items-center">
                      <div className="h-4 w-px bg-border" />
                      <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {TREE_NODES.leaves[1]}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ▸ Streak / Stats */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <Flame className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none">3</p>
                      <p className="text-xs text-muted-foreground">
                        Day Streak
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Brain className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold leading-none">12</p>
                      <p className="text-xs text-muted-foreground">Concepts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ▸ For Grown-Ups CTA */}
            <Card className="border-2 border-dashed border-muted-foreground/20 bg-muted/30">
              <CardContent className="pt-6">
                <div className="mb-2 flex items-center gap-2">
                  <Landmark className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-semibold">For the Grown-Ups</h3>
                </div>

                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                  Need the full picture? Log in to unlock detailed finance,
                  geopolitics, and expert-level mindmaps.
                </p>

                <Button className="w-full gap-2">
                  <Lock className="h-4 w-4" />
                  Verify Age &amp; Login
                </Button>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* ═══════════════ STICKY AUDIO PLAYER ═══════════════ */}
      {nowPlaying && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white/95 backdrop-blur-md dark:bg-slate-950/95">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
            {/* Track info */}
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Music className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{nowPlaying}</p>
                <p className="text-[11px] text-muted-foreground">
                  🎵 Now Playing
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex shrink-0 items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9 rounded-full"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="ml-0.5 h-4 w-4" />
                )}
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress bar */}
            <div className="hidden flex-1 items-center gap-2 sm:flex">
              <span className="w-8 text-right text-[11px] tabular-nums text-muted-foreground">
                0:{String(progress[0]).padStart(2, "0")}
              </span>
              <Slider
                value={progress}
                onValueChange={setProgress}
                max={100}
                step={1}
                className="flex-1"
              />
              <span className="w-8 text-[11px] tabular-nums text-muted-foreground">
                2:00
              </span>
            </div>

            {/* Volume */}
            <div className="hidden items-center gap-2 lg:flex">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <Slider defaultValue={[75]} max={100} step={1} className="w-20" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
