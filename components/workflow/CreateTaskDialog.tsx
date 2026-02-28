"use client";

import { FormEvent, useMemo, useState } from "react";
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  if (status === "planned" || status === "prompted" || status === "rendered") {
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
  const runWorkflowTask = useAction(api.workflowTasks.runWorkflowTask);

  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      setMessage("Task created. Workflow started.");

      void runWorkflowTask({ taskId: result.taskId }).catch((workflowError) => {
        const workflowMessage =
          workflowError instanceof Error
            ? workflowError.message
            : "Workflow start failed";
        setError(workflowMessage);
      });
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
            <div className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Topic or URL (e.g. https://example.com/news or climate summit)"
              />
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? "Creating..." : "Create Task"}
              </Button>
            </div>
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
        </form>

        <div className="space-y-2 border-t pt-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Recent tasks</p>
            {/* <Button
              variant="link"
              size="xs"
              onClick={() => router.push("/tasks")}
            >
              View all
            </Button> */}
          </div>
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
