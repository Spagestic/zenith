"use client";

import { useMemo, useState } from "react";
import { useAction, useQuery } from "convex/react";
import { useParams } from "next/navigation";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import Header from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

function statusVariant(
  status:
    | "queued"
    | "ingesting"
    | "ingested"
    | "planning"
    | "planned"
    | "prompting"
    | "prompted"
    | "failed",
) {
  if (status === "failed") return "destructive";
  if (status === "planned" || status === "prompted") return "secondary";
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
  const runTaskIngestion = useAction(api.workflowTasks.runTaskIngestion);
  const generateStoryPlan = useAction(api.workflowTasks.generateStoryPlan);
  const generatePromptPack = useAction(api.workflowTasks.generatePromptPack);

  const [isRunning, setIsRunning] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runNextStage = async () => {
    if (!task) return;
    setIsRunning(true);
    setMessage(null);
    setError(null);
    try {
      if (task.status === "queued" || task.status === "failed") {
        await runTaskIngestion({ taskId: task._id });
        setMessage("Ingestion started.");
      } else if (task.status === "ingested") {
        await generateStoryPlan({ taskId: task._id });
        setMessage("Story plan generated.");
      } else if (task.status === "planned") {
        await generatePromptPack({ taskId: task._id });
        setMessage("Prompt pack generated.");
      }
    } catch (stageError) {
      setError(
        stageError instanceof Error ? stageError.message : "Task action failed",
      );
    } finally {
      setIsRunning(false);
    }
  };

  const nextActionLabel = (() => {
    if (!task) return null;
    if (task.status === "queued" || task.status === "failed") return "Run Ingestion";
    if (task.status === "ingested") return "Generate Story Plan";
    if (task.status === "planned") return "Generate Prompt Pack";
    return null;
  })();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto w-full max-w-4xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">Task Details</h1>

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
                  <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Progress: {task.progress ?? 0}%
                  </span>
                </div>
                {nextActionLabel && (
                  <Button disabled={isRunning} onClick={() => void runNextStage()}>
                    {isRunning ? "Working..." : nextActionLabel}
                  </Button>
                )}
              </div>
              <p className="text-sm">
                <span className="font-medium">Input: </span>
                <span className="text-muted-foreground break-all">{task.input}</span>
              </p>
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
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {task.sourceDocuments.map((doc, idx) => (
                  <div key={`${doc.url}-${idx}`} className="rounded-md border p-2">
                    <p className="text-sm font-medium">{doc.title ?? "Untitled"}</p>
                    <p className="text-xs text-muted-foreground break-all">{doc.url}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border p-4 space-y-2">
              <h2 className="text-lg font-medium">Story Plan</h2>
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
                        <p className="text-xs text-muted-foreground">{scene.summary}</p>
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
              <h2 className="text-lg font-medium">Prompt Pack</h2>
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
          </>
        )}
      </main>
    </div>
  );
}
