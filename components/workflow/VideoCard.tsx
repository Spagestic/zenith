/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";

type StoryVideo = {
  sceneNumber: number;
  sceneTitle: string;
  videoUrl: string;
  generatedAt: number;
};

type VideoCardStory = {
  taskId: string;
  storyTitle: string | null;
  input: string;
  thumbnailUrl: string | null;
  generatedAt: number;
  sceneCount: number;
  creator?: { userId: string; name: string | null; image: string | null };
  videos: StoryVideo[];
};

type VideoCardProps = {
  story: VideoCardStory;
  isHovered: boolean;
  currentVideo: StoryVideo | undefined;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onVideoEnd: () => void;
  relativeTimeLabel: string;
};

export default function VideoCard({
  story,
  isHovered,
  currentVideo,
  onMouseEnter,
  onMouseLeave,
  onVideoEnd,
  relativeTimeLabel,
}: VideoCardProps) {
  return (
    <article
      className="overflow-hidden rounded-xl bg-card transition-colors hover:bg-accent/20"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link href={`/watch/${story.taskId}`} className="block">
        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-black">
          {!isHovered && story.thumbnailUrl && (
            <img
              src={story.thumbnailUrl}
              alt={story.storyTitle ?? story.input}
              className="h-full w-full object-cover"
            />
          )}
          {isHovered && currentVideo && (
            <video
              autoPlay
              muted
              playsInline
              preload="metadata"
              className="h-full w-full object-cover"
              src={currentVideo.videoUrl}
              onEnded={onVideoEnd}
            />
          )}
        </div>
        <div className="space-y-1 px-1 pt-3">
          <p className="line-clamp-2 text-sm font-semibold leading-snug">
            {story.storyTitle ?? "Kids News Story"}
          </p>
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {story.creator?.name ?? "Anonymous"}
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>{relativeTimeLabel}</span>
            <span>•</span>
            <span>Scene {currentVideo?.sceneNumber ?? 1} preview</span>
          </div>
        </div>
      </Link>
      <div className="px-1 pb-2 pt-1">
        <p className="line-clamp-1 text-[11px] text-muted-foreground">
          {story.input}
        </p>
      </div>
    </article>
  );
}
