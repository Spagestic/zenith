"use client";

import { useState } from "react";
import { ArrowRight, Headphones, Video, Brain } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");

  return (
    <section className="bg-primary text-primary-foreground">
      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left */}
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              Your Morning Briefing, Delivered.
            </h2>
            <p className="font-body text-primary-foreground/70 mt-3 text-lg leading-relaxed">
              Get a personalized AI-generated news briefing every morning — as a
              video, audio podcast, or written summary. Free, forever.
            </p>

            <div className="flex gap-4 mt-6">
              <div className="flex items-center gap-2 text-primary-foreground/60">
                <Video className="h-4 w-4" />
                <span className="text-xs font-body">Video</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/60">
                <Headphones className="h-4 w-4" />
                <span className="text-xs font-body">Audio</span>
              </div>
              <div className="flex items-center gap-2 text-primary-foreground/60">
                <Brain className="h-4 w-4" />
                <span className="text-xs font-body">Mindmaps</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setEmail("");
              }}
            >
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-sm bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40 font-body text-sm focus:outline-none focus:border-primary-foreground/50 transition-colors"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-sm bg-accent text-accent-foreground font-body font-semibold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shrink-0"
              >
                Get Briefing <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            <p className="font-body text-primary-foreground/40 text-xs mt-3">
              No spam. Unsubscribe anytime. We never share your email.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
