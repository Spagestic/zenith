"use client";

import {
  BookOpen,
  Video,
  Volume2,
  Brain,
  FileQuestion,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Read",
    description: "AI-curated news adapted to your reading level",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-950/40",
  },
  {
    icon: Video,
    title: "Watch",
    description: "Auto-generated video briefings powered by MiniMax",
    color: "text-purple-600",
    bg: "bg-purple-50 dark:bg-purple-950/40",
  },
  {
    icon: Volume2,
    title: "Listen",
    description: "Audio news summaries you can play on the go",
    color: "text-orange-600",
    bg: "bg-orange-50 dark:bg-orange-950/40",
  },
  {
    icon: Brain,
    title: "Explore",
    description: "Interactive knowledge graphs and story timelines",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
  },
  {
    icon: FileQuestion,
    title: "Learn",
    description: "Comprehension quizzes and adaptive difficulty",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-950/40",
  },
  {
    icon: Shield,
    title: "Safe",
    description: "Kids-safe by default with zero data tracking",
    color: "text-green-600",
    bg: "bg-green-50 dark:bg-green-950/40",
  },
];

const HowItWorks = () => {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="font-display text-2xl md:text-3xl font-bold">
          How Zenith Works
        </h2>
        <div className="flex-1 border-t border-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
        {features.map((f) => (
          <div key={f.title} className="text-center group cursor-default">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-lg ${f.bg} transition-transform group-hover:scale-110`}
            >
              <f.icon className={`h-6 w-6 ${f.color}`} />
            </div>
            <h3 className="font-display text-sm font-bold mt-4">{f.title}</h3>
            <p className="font-body text-xs text-muted-foreground mt-1.5 leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
