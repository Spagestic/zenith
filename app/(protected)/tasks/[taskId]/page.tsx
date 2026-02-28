/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { CompanyLogo } from "@/components/CompanyLogo";

function getDomain(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}

function statusVariant(
  status:
    | "queued"
    | "ingesting"
    | "ingested"
    | "planning"
    | "planned"
    | "prompting"
    | "prompted"
    | "rendering"
    | "rendered"
    | "failed",
) {
  if (status === "failed") return "destructive";
  if (status === "planned" || status === "prompted" || status === "rendered") {
    return "secondary";
  }
  return "outline";
}

export default function TaskDetailsPage() {
  const params = useParams<{ taskId: string }>();
  const taskId = useMemo(
    () =>
      params?.taskId && typeof params.taskId === "string"
        ? (params.taskId as Id<"workflowTasks">)
        : null,
    [params?.taskId],
  );

  const task = useQuery(
    api.workflowTasks.getMyTaskById,
    taskId ? { taskId } : "skip",
  );
  const runWorkflowTask = useAction(api.workflowTasks.runWorkflowTask);
  const updateStoryTitle = useMutation(api.workflowTasks.updateStoryTitle);

  const [isRunning, setIsRunning] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");
  const [storyVideoIndex, setStoryVideoIndex] = useState(0);

  const sortedVideos = useMemo(
    () =>
      (task?.assets?.videos ?? [])
        .slice()
        .sort((a, b) => a.sceneNumber - b.sceneNumber),
    [task?.assets?.videos],
  );
  const activeVideoIndex =
    sortedVideos.length > 0
      ? Math.max(0, Math.min(storyVideoIndex, sortedVideos.length - 1))
      : 0;
  const activeStoryVideo = sortedVideos[activeVideoIndex];

  const baseTitle = task?.storyTitle?.trim() || "Kids News Story";
  const titleInputValue = titleDraft || baseTitle;

  useEffect(() => {
    if (!task || isRunning || task.status === "failed") return;
    const isComplete =
      !!task.storyPlan &&
      !!task.scenePrompts?.length &&
      !!task.assets?.images?.length &&
      !!task.assets?.videos?.length &&
      !!task.assets?.tts?.length;
    if (isComplete || task.status === "ingesting" || task.status === "planning" || task.status === "prompting" || task.status === "rendering") {
      return;
    }

    setIsRunning(true);
    setError(null);
    setMessage(null);
    void runWorkflowTask({ taskId: task._id })
      .then(() => setMessage("Workflow started."))
      .catch((stageError) =>
        setError(
          stageError instanceof Error ? stageError.message : "Task action failed",
        ),
      )
      .finally(() => setIsRunning(false));
  }, [isRunning, runWorkflowTask, task]);

  const onSaveTitle = async () => {
    if (!task) return;
    const nextTitle = titleInputValue.trim();
    if (!nextTitle) {
      setError("Title cannot be empty.");
      return;
    }
    setIsSavingTitle(true);
    setError(null);
    setMessage(null);
    try {
      await updateStoryTitle({ taskId: task._id, storyTitle: nextTitle });
      setTitleDraft(nextTitle);
      setMessage("Title updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save title");
    } finally {
      setIsSavingTitle(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">{baseTitle}</h1>

        {!taskId && (
          <p className="text-sm text-destructive">Invalid task id in URL.</p>
        )}

        {task === undefined && taskId && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            Loading task...
          </div>
        )}

        {task === null && taskId && (
          <p className="text-sm text-muted-foreground">
            Task not found or you do not have access.
          </p>
        )}

        {task && (
          <>
            <section className="rounded-lg border p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(task.status)} className="flex items-center gap-1.5">
                    {task.status}
                    {["queued", "ingesting", "planning", "prompting", "rendering"].includes(task.status) && (
                      <Spinner className="h-3 w-3" />
                    )}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Progress: {task.progress ?? 0}%
                  </span>
                </div>
              </div>
              <p className="text-sm">
                <span className="font-medium">Input: </span>
                <span className="text-muted-foreground break-all">
                  {task.input}
                </span>
              </p>
              <div className="space-y-2">
                <p className="text-sm font-medium">Story title</p>
                <div className="flex gap-2">
                  <Input
                    value={titleInputValue}
                    onChange={(event) => setTitleDraft(event.target.value)}
                    placeholder="Enter a title for this story"
                  />
                  <Button
                    variant="outline"
                    disabled={isSavingTitle || !titleInputValue.trim()}
                    onClick={() => void onSaveTitle()}
                  >
                    {isSavingTitle ? "Saving..." : "Save Title"}
                  </Button>
                </div>
              </div>
              {task.error && (
                <p className="text-sm text-destructive">Error: {task.error}</p>
              )}
              {error && <p className="text-sm text-destructive">{error}</p>}
              {message && (
                <p className="text-sm text-muted-foreground">{message}</p>
              )}
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium">Sources</h2>
              <p className="text-sm text-muted-foreground">
                {task.sourceDocuments.length} source documents
              </p>
              {task.status === "ingesting" && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Spinner />
                  Ingesting sources...
                </div>
              )}
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {task.sourceDocuments.map((doc, idx) => (
                  <Link
                    key={`${doc.url}-${idx}`}
                    href={doc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-start gap-3 rounded-md border p-3 bg-muted/20 hover:bg-muted/40 transition-colors group"
                  >
                    <CompanyLogo 
                      domain={getDomain(doc.url)} 
                      className="h-10 w-10 rounded-md object-contain bg-background border p-1 shrink-0" 
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium line-clamp-1 group-hover:underline">
                        {doc.title ?? "Untitled"}
                      </p>
                      <p className="text-xs text-muted-foreground break-all line-clamp-1">
                        {doc.url}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                Story Plan
                {task.status === "planning" && <Spinner className="h-4 w-4" />}
              </h2>
              {task.storyPlan ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {task.storyPlan.scenes.length} scenes,{" "}
                    {task.storyPlan.characters.length} characters
                  </p>
                  <div className="space-y-2">
                    {task.storyPlan.scenes.map((scene) => (
                      <div
                        key={`${scene.sceneNumber}-${scene.title}`}
                        className="rounded-md border p-2"
                      >
                        <p className="text-sm font-medium">
                          Scene {scene.sceneNumber}: {scene.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {scene.summary}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Story plan not generated yet.
                </p>
              )}
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                Prompt Pack
                {task.status === "prompting" && <Spinner className="h-4 w-4" />}
              </h2>
              {task.scenePrompts?.length ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {task.scenePrompts.length} prompts generated
                  </p>
                  <div className="space-y-2">
                    {task.scenePrompts.map((prompt) => (
                      <div
                        key={`${prompt.sceneNumber}-${prompt.sceneTitle}`}
                        className="rounded-md border p-2"
                      >
                        <p className="text-sm font-medium">
                          Scene {prompt.sceneNumber}: {prompt.sceneTitle}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-3">
                          {prompt.imagePrompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Prompt pack not generated yet.
                </p>
              )}
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                Image Assets
                {task.status === "rendering" && !task.assets?.images?.length && <Spinner className="h-4 w-4" />}
              </h2>
              {task.assets?.images?.length ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {task.assets.images.length} scene image pairs generated
                  </p>
                  <div className="space-y-3">
                    {task.assets.images.map((image) => (
                      <div
                        key={`${image.sceneNumber}-${image.sceneTitle}`}
                        className="rounded-md border p-3 space-y-2"
                      >
                        <div className="gap-4 flex">
                          <img
                            alt="Example scene image"
                            className="rounded-md border"
                            height={300}
                            src={image.startImageUrl}
                            width={300}
                          />
                          <img
                            alt="Example scene image"
                            className="rounded-md border"
                            height={300}
                            src={image.endImageUrl}
                            width={300}
                          />
                        </div>
                        <p className="text-sm font-medium">
                          Scene {image.sceneNumber}: {image.sceneTitle}
                        </p>
                        <div className="grid gap-2 md:grid-cols-2">
                          <a
                            href={image.startImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground break-all underline"
                          >
                            Start frame
                          </a>
                          <a
                            href={image.endImageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-muted-foreground break-all underline"
                          >
                            End frame
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Scene images not generated yet.
                </p>
              )}
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                Video Assets
                {task.status === "rendering" && !task.assets?.videos?.length && <Spinner className="h-4 w-4" />}
              </h2>
              {task.assets?.videos?.length ? (
                <>
                  <div className="rounded-md border p-3 space-y-3 bg-muted/30">
                    {activeStoryVideo && (
                      <>
                        <video
                          key={`${activeStoryVideo.taskId}-${activeVideoIndex}`}
                          controls
                          autoPlay
                          className="w-full max-w-2xl rounded-md border bg-black"
                          src={activeStoryVideo.videoUrl}
                          onEnded={() => {
                            if (activeVideoIndex < sortedVideos.length - 1) {
                              setStoryVideoIndex(activeVideoIndex + 1);
                            }
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Now playing: Scene {activeStoryVideo.sceneNumber} —{" "}
                          {activeStoryVideo.sceneTitle}
                        </p>
                      </>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeVideoIndex === 0}
                        onClick={() =>
                          setStoryVideoIndex((idx) => Math.max(0, idx - 1))
                        }
                      >
                        Previous Scene
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={activeVideoIndex >= sortedVideos.length - 1}
                        onClick={() =>
                          setStoryVideoIndex((idx) =>
                            Math.min(sortedVideos.length - 1, idx + 1),
                          )
                        }
                      >
                        Next Scene
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setStoryVideoIndex(0)}
                      >
                        Restart Story
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {task.assets.videos.length} scene videos generated
                  </p>
                  <div className="space-y-3">
                    {task.assets.videos.map((video) => (
                      <div
                        key={`${video.sceneNumber}-${video.taskId}`}
                        className="rounded-md border p-3 space-y-2"
                      >
                        <p className="text-sm font-medium">
                          Scene {video.sceneNumber}: {video.sceneTitle}
                        </p>
                        <video
                          controls
                          className="w-full max-w-xl rounded-md border"
                          src={video.videoUrl}
                        />
                        <a
                          href={video.videoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-muted-foreground break-all underline"
                        >
                          Open video URL
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Scene videos not generated yet.
                </p>
              )}
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium flex items-center gap-2">
                TTS Assets
                {task.status === "rendering" && !task.assets?.tts?.length && <Spinner className="h-4 w-4" />}
              </h2>
              {task.assets?.tts?.length ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    {task.assets.tts.length} scene narration tracks generated
                  </p>
                  <div className="space-y-3">
                    {task.assets.tts.map((tts) => (
                      <div
                        key={`${tts.sceneNumber}-${tts.generatedAt}`}
                        className="rounded-md border p-3 space-y-2"
                      >
                        <p className="text-sm font-medium">
                          Scene {tts.sceneNumber}: {tts.sceneTitle}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-4">
                          {tts.narrationText}
                        </p>
                        <audio controls src={tts.audioUrl} className="w-full" />
                        <p className="text-xs text-muted-foreground">
                          Voice: {tts.voiceId} · Model: {tts.model} · Speed:{" "}
                          {tts.speed}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Scene TTS not generated yet.
                </p>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
