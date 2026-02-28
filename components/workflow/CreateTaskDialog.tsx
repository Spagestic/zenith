"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CreateTaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

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
  if (
    status === "planned" ||
    status === "prompted" ||
    status === "rendered"
  ) {
    return "secondary";
  }
  return "outline";
}

export function CreateTaskDialog({
  open,
  onOpenChange,
}: CreateTaskDialogProps) {
  const router = useRouter();
  const user = useQuery(api.users.getCurrentUser);
  const tasks = useQuery(
    api.workflowTasks.listMyTasks,
    user ? { limit: 8 } : "skip",
  );
  const createTask = useMutation(api.workflowTasks.createTask);
  const runTaskIngestion = useAction(api.workflowTasks.runTaskIngestion);
  const generateStoryPlan = useAction(api.workflowTasks.generateStoryPlan);
  const generatePromptPack = useAction(api.workflowTasks.generatePromptPack);
  const generateSceneImages = useAction(api.workflowTasks.generateSceneImages);
  const generateSceneVideos = useAction(api.workflowTasks.generateSceneVideos);

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planningTaskId, setPlanningTaskId] =
    useState<Id<"workflowTasks"> | null>(null);
  const [promptingTaskId, setPromptingTaskId] =
    useState<Id<"workflowTasks"> | null>(null);
  const [renderingTaskId, setRenderingTaskId] =
    useState<Id<"workflowTasks"> | null>(null);
  const [videoTaskId, setVideoTaskId] = useState<Id<"workflowTasks"> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const trimmedInput = useMemo(() => input.trim(), [input]);
  const canSubmit = !!trimmedInput && !!user && !isSubmitting;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      setError("Please sign in to create a workflow task.");
      return;
    }
    if (!trimmedInput) {
      setError("Please enter a topic or a news URL.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    try {
      const result = await createTask({ input: trimmedInput });
      setInput("");
      setMessage("Task created. Ingestion started.");

      void runTaskIngestion({ taskId: result.taskId }).catch(
        (ingestionError) => {
          const ingestionMessage =
            ingestionError instanceof Error
              ? ingestionError.message
              : "Ingestion failed";
          setError(ingestionMessage);
        },
      );
    } catch (submitError) {
      const submitMessage =
        submitError instanceof Error
          ? submitError.message
          : "Could not create task";
      setError(submitMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onGenerateStoryPlan = async (taskId: Id<"workflowTasks">) => {
    setPlanningTaskId(taskId);
    setError(null);
    setMessage(null);
    try {
      await generateStoryPlan({ taskId });
      setMessage("Story plan generated.");
    } catch (planningError) {
      const planningMessage =
        planningError instanceof Error
          ? planningError.message
          : "Story planning failed";
      setError(planningMessage);
    } finally {
      setPlanningTaskId(null);
    }
  };

  const onGeneratePromptPack = async (taskId: Id<"workflowTasks">) => {
    setPromptingTaskId(taskId);
    setError(null);
    setMessage(null);
    try {
      await generatePromptPack({ taskId });
      setMessage("Prompt pack generated.");
    } catch (promptError) {
      const promptMessage =
        promptError instanceof Error
          ? promptError.message
          : "Prompt-pack generation failed";
      setError(promptMessage);
    } finally {
      setPromptingTaskId(null);
    }
  };

  const onGenerateSceneImages = async (taskId: Id<"workflowTasks">) => {
    setRenderingTaskId(taskId);
    setError(null);
    setMessage(null);
    try {
      await generateSceneImages({ taskId });
      setMessage("Scene images generated.");
    } catch (imageError) {
      const imageMessage =
        imageError instanceof Error
          ? imageError.message
          : "Scene image generation failed";
      setError(imageMessage);
    } finally {
      setRenderingTaskId(null);
    }
  };

  const onGenerateSceneVideos = async (taskId: Id<"workflowTasks">) => {
    setVideoTaskId(taskId);
    setError(null);
    setMessage(null);
    try {
      await generateSceneVideos({ taskId });
      setMessage("Scene videos generated.");
    } catch (videoError) {
      const videoMessage =
        videoError instanceof Error
          ? videoError.message
          : "Scene video generation failed";
      setError(videoMessage);
    } finally {
      setVideoTaskId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create News Workflow Task</DialogTitle>
          <DialogDescription>
            Enter a topic or paste a news URL. We auto-detect the input type,
            ingest sources with Exa, and track progress as a task.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Topic or URL (e.g. https://example.com/news or climate summit)"
            />
            {!user && (
              <p className="text-sm text-muted-foreground">
                Sign in to create and run workflow tasks.
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && (
              <p className="text-sm text-muted-foreground">{message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>

        <div className="space-y-2 border-t pt-4">
          <p className="text-sm font-medium">Recent tasks</p>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {tasks?.length ? (
              tasks.map((task) => (
                <div
                  key={task._id}
                  className="rounded-md border px-3 py-2 text-sm space-y-1 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => {
                    onOpenChange(false);
                    router.push(`/tasks/${task._id}`);
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={statusVariant(task.status)}>
                      {task.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {task.sourceDocuments.length} sources
                      {task.scenePrompts?.length
                        ? ` • ${task.scenePrompts.length} prompts`
                        : ""}
                      {task.assets?.images?.length
                        ? ` • ${task.assets.images.length} image pairs`
                        : ""}
                      {task.assets?.videos?.length
                        ? ` • ${task.assets.videos.length} videos`
                        : ""}
                    </span>
                  </div>
                  <p className="truncate text-muted-foreground">{task.input}</p>
                  {task.status === "ingested" && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          planningTaskId === task._id ||
                          promptingTaskId === task._id
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void onGenerateStoryPlan(task._id);
                        }}
                      >
                        {planningTaskId === task._id
                          ? "Planning..."
                          : "Generate Story Plan"}
                      </Button>
                    </div>
                  )}
                  {task.status === "planned" && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          promptingTaskId === task._id ||
                          planningTaskId === task._id
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void onGeneratePromptPack(task._id);
                        }}
                      >
                        {promptingTaskId === task._id
                          ? "Generating Prompts..."
                          : "Generate Prompt Pack"}
                      </Button>
                    </div>
                  )}
                  {task.status === "failed" &&
                    !!task.storyPlan &&
                    !task.scenePrompts?.length && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            promptingTaskId === task._id ||
                            planningTaskId === task._id ||
                            renderingTaskId === task._id ||
                            videoTaskId === task._id
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            void onGeneratePromptPack(task._id);
                          }}
                        >
                          {promptingTaskId === task._id
                            ? "Retrying Prompt Pack..."
                            : "Retry Generate Prompt Pack"}
                        </Button>
                      </div>
                    )}
                  {task.status === "failed" &&
                    !!task.scenePrompts?.length &&
                    !task.assets?.images?.length && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            renderingTaskId === task._id ||
                            promptingTaskId === task._id ||
                            planningTaskId === task._id ||
                            videoTaskId === task._id
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            void onGenerateSceneImages(task._id);
                          }}
                        >
                          {renderingTaskId === task._id
                            ? "Retrying Images..."
                            : "Retry Generate Scene Images"}
                        </Button>
                      </div>
                    )}
                  {task.status === "prompted" && (
                    <div className="pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={
                          renderingTaskId === task._id ||
                          promptingTaskId === task._id ||
                          planningTaskId === task._id ||
                          videoTaskId === task._id
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          void onGenerateSceneImages(task._id);
                        }}
                      >
                        {renderingTaskId === task._id
                          ? "Generating Images..."
                          : "Generate Scene Images"}
                      </Button>
                    </div>
                  )}
                  {(task.status === "rendered" || task.status === "failed") &&
                    !!task.assets?.images?.length &&
                    !task.assets?.videos?.length && (
                      <div className="pt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={
                            videoTaskId === task._id ||
                            renderingTaskId === task._id ||
                            promptingTaskId === task._id ||
                            planningTaskId === task._id
                          }
                          onClick={(event) => {
                            event.stopPropagation();
                            void onGenerateSceneVideos(task._id);
                          }}
                        >
                          {videoTaskId === task._id
                            ? "Generating Videos..."
                            : "Generate Scene Videos"}
                        </Button>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                No tasks yet. Create one to start ingestion.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
