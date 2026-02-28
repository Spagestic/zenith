/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";

function formatRelativeTime(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "Just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  return `${Math.floor(diff / day)}d ago`;
}

export default function WatchPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = useMemo(
    () =>
      params?.taskId && typeof params.taskId === "string"
        ? (params.taskId as Id<"workflowTasks">)
        : null,
    [params?.taskId],
  );

  const story = useQuery(
    api.workflowTasks.getRenderedStoryById,
    taskId ? { taskId } : "skip",
  );
  const relatedStories = useQuery(api.workflowTasks.listRenderedStories, {
    limit: 12,
  });
  const creatorId = story?.creator?.userId ?? null;
  const subscriberCount = useQuery(
    api.subscriptions.getSubscriberCount,
    creatorId ? { creatorId } : "skip",
  );
  const isSubscribed = useQuery(
    api.subscriptions.isSubscribed,
    creatorId ? { creatorId } : "skip",
  );
  const subscribeMutation = useMutation(api.subscriptions.subscribe);
  const unsubscribeMutation = useMutation(api.subscriptions.unsubscribe);
  const currentUser = useQuery(api.users.getCurrentUser);
  const isOwnChannel = Boolean(
    creatorId && currentUser && currentUser._id === creatorId,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [copied, setCopied] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);

  const currentVideo =
    story?.videos?.[Math.min(activeIndex, (story?.videos?.length ?? 1) - 1)];
  const currentTTS =
    story && currentVideo
      ? (story.tts ?? []).find((clip) => clip.sceneNumber === currentVideo.sceneNumber)
      : null;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentVideo) return;

    const audio = ttsAudioRef.current;
    video.currentTime = 0;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const playInSync = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }

      if (audio) {
        try {
          await audio.play();
        } catch {
          // Browser autoplay policy can block audio until user interaction.
        }
      }
    };

    void playInSync();
  }, [currentVideo, currentTTS?.audioUrl]);

  const onShare = async () => {
    if (typeof window === "undefined") return;
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const onSubscribeToggle = () => {
    if (!creatorId) return;
    if (isSubscribed) {
      unsubscribeMutation({ creatorId });
    } else {
      subscribeMutation({ creatorId });
    }
  };

  const togglePlayback = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      const audio = ttsAudioRef.current;
      if (audio) {
        audio.currentTime = video.currentTime;
        void audio.play().catch(() => {});
      }
      return;
    }

    video.pause();
    ttsAudioRef.current?.pause();
    setIsPlaying(false);
  };

  const related = useMemo(
    () => (relatedStories ?? []).filter((item) => item.taskId !== story?.taskId),
    [relatedStories, story?.taskId],
  );

  const DESCRIPTION_PREVIEW_LENGTH = 120;
  const description = story?.input ?? "";
  const showMoreButton = description.length > DESCRIPTION_PREVIEW_LENGTH;
  const descriptionText = descriptionExpanded
    ? description
    : description.slice(0, DESCRIPTION_PREVIEW_LENGTH) +
      (showMoreButton ? "..." : "");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-[1920px] px-4 py-4 md:px-6">
        {!taskId && (
          <p className="text-sm text-destructive">Invalid story URL.</p>
        )}

        {story === undefined && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {story === null && taskId && (
          <p className="text-sm text-muted-foreground">
            Story not found or not available for sharing.
          </p>
        )}

        {story && (
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
            {/* Main content — YouTube-style left column */}
            <section className="min-w-0 flex-1 lg:max-w-[calc(100%-420px)]">
              {/* Video player */}
              {currentVideo && (
                <div className="rounded-xl overflow-hidden bg-black">
                  <video
                    key={`${story.taskId}-${activeIndex}`}
                    ref={videoRef}
                    controls
                    autoPlay
                    className="aspect-video w-full"
                    src={currentVideo.videoUrl}
                    onPlay={() => {
                      setIsPlaying(true);
                      const audio = ttsAudioRef.current;
                      const video = videoRef.current;
                      if (audio && video) {
                        audio.currentTime = video.currentTime;
                        void audio.play().catch(() => {});
                      }
                    }}
                    onPause={() => {
                      setIsPlaying(false);
                      ttsAudioRef.current?.pause();
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      ttsAudioRef.current?.pause();
                      if (activeIndex < story.videos.length - 1) {
                        setActiveIndex(activeIndex + 1);
                      }
                    }}
                  />
                  {currentTTS?.audioUrl && (
                    <audio
                      key={`${story.taskId}-${currentTTS.sceneNumber}`}
                      ref={ttsAudioRef}
                      src={currentTTS.audioUrl}
                      preload="auto"
                    />
                  )}
                </div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => void togglePlayback()}>
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!story || activeIndex >= story.videos.length - 1}
                  onClick={() =>
                    setActiveIndex((idx) =>
                      story ? Math.min(story.videos.length - 1, idx + 1) : idx,
                    )
                  }
                >
                  Next Scene
                </Button>
                {!currentTTS?.audioUrl && (
                  <span className="self-center text-xs text-muted-foreground">
                    This scene has no TTS track yet (video-only playback).
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="mt-4 text-xl font-semibold text-foreground md:text-2xl">
                {story.storyTitle ?? "Kids News Story"}
              </h1>

              {/* Action bar — creator row + buttons */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  {story.creator.image ? (
                    <img
                      src={story.creator.image}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                      {(story.creator.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {story.creator.name ?? "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {typeof subscriberCount === "number" &&
                        `${subscriberCount} subscriber${subscriberCount === 1 ? "" : "s"}`}
                      {typeof subscriberCount === "number" && " · "}
                      Scene {Math.min(activeIndex + 1, story.videos.length)} of{" "}
                      {story.videos.length}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {creatorId &&
                    isSubscribed !== undefined &&
                    !isOwnChannel && (
                      <Button
                        size="sm"
                        variant={isSubscribed ? "secondary" : "default"}
                        onClick={() => void onSubscribeToggle()}
                      >
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                      </Button>
                    )}
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => void onShare()}
                  >
                    {copied ? "Link copied" : "Share"}
                  </Button>
                </div>
              </div>

              {/* Description */}
              <div className="mt-4 rounded-xl bg-muted/30 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>
                    {formatRelativeTime(story.generatedAt)}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                  {descriptionText}
                </p>
                {showMoreButton && (
                  <button
                    type="button"
                    className="mt-1 text-sm font-medium text-primary hover:underline"
                    onClick={() => setDescriptionExpanded((e) => !e)}
                  >
                    {descriptionExpanded ? "Show less" : "Show more"}
                  </button>
                )}
              </div>

              {/* Chapters / scenes */}
              <div className="mt-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">
                  Chapters
                </h2>
                <div className="flex flex-col gap-1">
                  {story.videos.map((video, idx) => (
                    <button
                      key={`${video.sceneNumber}-${video.generatedAt}`}
                      type="button"
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-muted/60 ${
                        idx === activeIndex ? "bg-muted" : ""
                      }`}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                        {video.sceneNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {video.sceneTitle}
                        </p>
                      </div>
                      {idx === activeIndex && (
                        <span className="text-xs text-primary">Playing</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Right sidebar — other videos */}
            <aside className="w-full shrink-0 lg:w-[402px]">
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                Other videos
              </h2>
              {related.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No other videos right now. Check back later for more stories.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  {related.slice(0, 12).map((item) => (
                    <Link
                      key={item.taskId}
                      href={`/watch/${item.taskId}`}
                      className="group flex gap-3 rounded-lg p-1 transition-colors hover:bg-muted/50"
                    >
                      <div className="relative aspect-video w-[168px] shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt=""
                            className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            No thumbnail
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          {item.sceneCount} scene{item.sceneCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <p className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-primary">
                          {item.storyTitle ?? "Kids News Story"}
                        </p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {item.creator?.name ?? "Anonymous"}
                          {" · "}
                          {formatRelativeTime(item.generatedAt)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}
