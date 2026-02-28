"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo, useState } from "react";
import VideoCard from "@/components/workflow/VideoCard";

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export default function GeneratedVideoFeed() {
  const stories = useQuery(api.workflowTasks.listRenderedStories, {
    limit: 18,
  });
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [sceneIndexes, setSceneIndexes] = useState<Record<string, number>>({});

  const activeIndexes = useMemo(() => sceneIndexes, [sceneIndexes]);

  return (
    <section className="py-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          Generated Cartoon Stories
        </h2>
        <span className="text-sm text-muted-foreground">
          YouTube-style feed
        </span>
      </div>

      {stories === undefined && (
        <p className="text-sm text-muted-foreground">Loading videos...</p>
      )}

      {stories && stories.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No generated videos yet. Create a workflow task and render videos to
          populate this feed.
        </p>
      )}

      {stories && stories.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((story) => {
            const currentIndex = activeIndexes[story.taskId] ?? 0;
            const safeIndex = Math.min(
              Math.max(currentIndex, 0),
              Math.max(story.videos.length - 1, 0),
            );
            const currentVideo = story.videos[safeIndex];
            const isHovered = hoveredTaskId === story.taskId;

            return (
              <VideoCard
                key={story.taskId}
                story={story}
                isHovered={isHovered}
                currentVideo={currentVideo}
                relativeTimeLabel={formatRelativeTime(story.generatedAt)}
                onMouseEnter={() => setHoveredTaskId(story.taskId)}
                onMouseLeave={() => {
                  setHoveredTaskId(null);
                  setSceneIndexes((prev) => ({ ...prev, [story.taskId]: 0 }));
                }}
                onVideoEnd={() => {
                  setSceneIndexes((prev) => {
                    const prevIndex = prev[story.taskId] ?? 0;
                    const nextIndex =
                      prevIndex + 1 >= story.videos.length ? 0 : prevIndex + 1;
                    return { ...prev, [story.taskId]: nextIndex };
                  });
                }}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
