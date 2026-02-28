"use client";

import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

// ─── Chat Tab ────────────────────────────────────────────────────────────────

function ChatTest() {
  const chatModels = useQuery(api.minimax.listChatModels);
  const generateChat = useAction(api.minimax.generateChat);

  const [model, setModel] = useState("MiniMax-M2.5");
  const [system, setSystem] = useState("You are a helpful assistant.");
  const [userMsg, setUserMsg] = useState("Say hello in one sentence.");
  const [maxTokens, setMaxTokens] = useState(500);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    thinking: string;
    text: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await generateChat({
        model,
        system,
        max_tokens: maxTokens,
        messages: [{ role: "user", content: userMsg }],
      });
      setResult({ thinking: res.thinking, text: res.text });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Available models:
        </span>
        {(chatModels?.models ?? []).map((m) => (
          <Badge
            key={m}
            variant={m === model ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setModel(m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">System prompt</label>
          <Textarea
            value={system}
            onChange={(e) => setSystem(e.target.value)}
            rows={2}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">User message</label>
          <Textarea
            value={userMsg}
            onChange={(e) => setUserMsg(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">
            Max tokens
          </label>
          <Input
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(Number(e.target.value))}
            className="w-28"
          />
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Generate
      </Button>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          {result.thinking && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Thinking
              </p>
              <pre className="whitespace-pre-wrap rounded-md bg-muted p-3 text-xs">
                {result.thinking}
              </pre>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Response
            </p>
            <div className="rounded-md bg-muted p-3 text-sm">{result.text}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Image Tab ───────────────────────────────────────────────────────────────

function ImageTest() {
  const imageModels = useQuery(api.minimax.listImageModels);
  const generateImage = useAction(api.minimax.generateImage);

  const [model, setModel] = useState("image-01");
  const [prompt, setPrompt] = useState(
    "A futuristic cityscape at sunset, cinematic.",
  );
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [n, setN] = useState(1);
  const [loading, setLoading] = useState(false);
  const [urls, setUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setUrls([]);
    try {
      const res = await generateImage({
        model,
        prompt,
        aspect_ratio: aspectRatio,
        response_format: "url",
        n,
      });

      // MiniMax API returns data.image_urls (string[]) when response_format is "url",
      // or data.image_base64 (string[]) when "base64". Legacy formats: data[] or images[].
      const r = res as {
        data?:
          | { image_urls?: string[]; image_base64?: string[] }
          | { url: string }[];
        images?: { url: string }[];
      };
      const images: string[] = Array.isArray(r.data)
        ? r.data.map((i) => i.url)
        : Array.isArray(r.data?.image_urls)
          ? r.data.image_urls
          : Array.isArray(r.data?.image_base64)
            ? r.data.image_base64.map((b) => `data:image/jpeg;base64,${b}`)
            : Array.isArray(r.images)
              ? r.images.map((i) => i.url)
              : [];
      setUrls(images);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const RATIOS = ["1:1", "4:3", "3:4", "16:9", "9:16", "2:3", "3:2"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Model:
        </span>
        {(imageModels?.models ?? []).map((m) => (
          <Badge
            key={m}
            variant={m === model ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setModel(m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <label className="text-sm font-medium">Aspect ratio:</label>
          {RATIOS.map((r) => (
            <Badge
              key={r}
              variant={r === aspectRatio ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setAspectRatio(r)}
            >
              {r}
            </Badge>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">
            Count (n)
          </label>
          <Input
            type="number"
            min={1}
            max={4}
            value={n}
            onChange={(e) => setN(Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Generate Image
      </Button>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {urls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={url}
              alt={`Generated ${i + 1}`}
              className="w-full rounded-lg border object-contain"
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Video Tab ───────────────────────────────────────────────────────────────

function VideoTest() {
  const videoModels = useQuery(api.minimax.listVideoModels);
  const generateVideo = useAction(api.minimax.generateVideo);
  const queryVideoTask = useAction(api.minimax.queryVideoTask);

  const [model, setModel] = useState("MiniMax-Hailuo-2.3");
  const [prompt, setPrompt] = useState("A serene ocean wave at golden hour.");
  const [duration, setDuration] = useState(6);
  const [loading, setLoading] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoLoadError, setVideoLoadError] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [polling, setPolling] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setTaskId(null);
    setVideoUrl(null);
    setVideoLoadError(null);
    setTaskStatus(null);
    try {
      const res = await generateVideo({ model, prompt, duration });
      const id = (res as { task_id?: string }).task_id ?? null;
      setTaskId(id);
      setTaskStatus("Submitted");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function pollStatus() {
    if (!taskId) return;
    setPolling(true);
    setError(null);
    try {
      const res = (await queryVideoTask({ task_id: taskId })) as {
        status?: string;
        download_url?: string;
        base_resp?: { status_code?: number; status_msg?: string };
      };
      const status = res.status ?? "Unknown";
      setTaskStatus(status);
      const url = res.download_url ?? null;
      if (url) {
        setVideoUrl(url);
        setVideoLoadError(null);
      }
      // Show friendly message for content moderation errors
      if (res.base_resp?.status_code !== 0 && res.base_resp?.status_msg) {
        const msg = res.base_resp.status_msg;
        const friendly =
          msg === "output new_sensitive"
            ? "Your video was flagged by content moderation. Please try a different prompt."
            : msg === "input new_sensitive"
              ? "Your prompt was flagged by content moderation. Please try different wording."
              : msg;
        setError(friendly);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPolling(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Model:
        </span>
        {(videoModels?.models ?? []).map((m) => (
          <Badge
            key={m}
            variant={m === model ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setModel(m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">Prompt</label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={3}
            className="mt-1"
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium whitespace-nowrap">
            Duration (s)
          </label>
          <Input
            type="number"
            min={1}
            max={10}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>

      <Button onClick={generate} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Submit Video Job
      </Button>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {taskId && (
        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Task ID:</span>
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              {taskId}
            </code>
          </div>
          {taskStatus && (
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">Status:</span>
              <Badge
                variant={
                  taskStatus === "Success"
                    ? "default"
                    : taskStatus === "Fail"
                      ? "destructive"
                      : "secondary"
                }
              >
                {taskStatus}
              </Badge>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={pollStatus}
            disabled={polling || taskStatus === "Success"}
          >
            {polling && <Spinner className="mr-2 h-3 w-3" />}
            Check Status
          </Button>

          {videoUrl && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Generated Video
              </p>
              <video
                src={videoUrl}
                controls
                className="w-full rounded-lg border"
                onError={() =>
                  setVideoLoadError(
                    "Video failed to load. The URL may have expired (valid 1 hour) or there may be a network issue. Try opening in a new tab.",
                  )
                }
                onLoadedData={() => setVideoLoadError(null)}
              />
              {videoLoadError && (
                <p className="mt-2 text-sm text-destructive">{videoLoadError}</p>
              )}
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-xs text-blue-500 underline"
              >
                Open in new tab
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Music Tab ─────────────────────────────────────────────────────────────────

function MusicTest() {
  const musicModels = useQuery(api.minimax.listMusicModels);
  const generateLyrics = useAction(api.minimax.generateLyrics);
  const generateMusic = useAction(api.minimax.generateMusic);

  const [lyricsPrompt, setLyricsPrompt] = useState(
    "A soulful blues song about a rainy night",
  );
  const [musicPrompt, setMusicPrompt] = useState(
    "Soulful Blues, Rainy Night, Melancholy, Male Vocals, Slow Tempo",
  );
  const [lyrics, setLyrics] = useState("");
  const [generateLyricsFirst, setGenerateLyricsFirst] = useState(true);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      let finalLyrics = lyrics;
      if (generateLyricsFirst && lyricsPrompt.trim()) {
        const res = await generateLyrics({ prompt: lyricsPrompt });
        finalLyrics = res.lyrics ?? "";
        setLyrics(finalLyrics);
      } else if (!lyrics.trim()) {
        throw new Error("Lyrics are required. Generate them first or paste your own.");
      }

      const res = await generateMusic({
        lyrics: finalLyrics,
        prompt: musicPrompt.trim() || undefined,
        output_format: "url",
      });
      if (res.audio_url) setAudioUrl(res.audio_url);
      else throw new Error("No audio URL returned. Try again.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Model:
        </span>
        {(musicModels?.models ?? []).map((m) => (
          <Badge key={m} variant="outline">
            {m}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="gen-lyrics"
            checked={generateLyricsFirst}
            onChange={(e) => setGenerateLyricsFirst(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="gen-lyrics" className="text-sm font-medium">
            Generate lyrics from prompt first
          </label>
        </div>
        {generateLyricsFirst ? (
          <div>
            <label className="text-sm font-medium">Lyrics theme prompt</label>
            <Textarea
              value={lyricsPrompt}
              onChange={(e) => setLyricsPrompt(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="A cheerful love song about a summer day at the beach"
            />
          </div>
        ) : (
          <div>
            <label className="text-sm font-medium">Lyrics (paste or edit)</label>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={8}
              className="mt-1 font-mono text-xs"
              placeholder="[Verse 1]&#10;Your lyrics here..."
            />
          </div>
        )}
        <div>
          <label className="text-sm font-medium">Music style prompt</label>
          <Textarea
            value={musicPrompt}
            onChange={(e) => setMusicPrompt(e.target.value)}
            rows={2}
            className="mt-1"
            placeholder="Indie folk, melancholic, acoustic guitar"
          />
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Generate Music
      </Button>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Generated Music
          </p>
          <audio
            src={audioUrl}
            controls
            className="w-full"
          />
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-blue-500 underline"
          >
            Open in new tab
          </a>
          <p className="text-xs text-muted-foreground">
            Use this as background music for your video. URLs expire in 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Speech Tab ───────────────────────────────────────────────────────────────

function SpeechTest() {
  const speechModels = useQuery(api.minimax.listSpeechModels);
  const generateSpeech = useAction(api.minimax.generateSpeech);

  const [model, setModel] = useState("speech-2.8-turbo");
  const [text, setText] = useState(
    "The real danger is not that computers start thinking like people, but that people start thinking like computers.",
  );
  const [voiceId, setVoiceId] = useState("English_expressive_narrator");
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setAudioUrl(null);
    try {
      const res = await generateSpeech({
        text,
        model,
        voice_id: voiceId,
        output_format: "url",
        speed,
      });
      if (res.audio_url) setAudioUrl(res.audio_url);
      else throw new Error("No audio URL returned. Try again.");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const VOICES = [
    "English_expressive_narrator",
    "English_female_gentle",
    "English_male_calm",
    "presenter_male",
    "presenter_female",
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Model:
        </span>
        {(speechModels?.models ?? []).map((m) => (
          <Badge
            key={m}
            variant={m === model ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setModel(m)}
          >
            {m}
          </Badge>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <label className="text-sm font-medium">Text to speak</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="Enter text for voiceover..."
          />
        </div>
        <div>
          <label className="text-sm font-medium">Voice</label>
          <select
            value={voiceId}
            onChange={(e) => setVoiceId(e.target.value)}
            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {VOICES.map((v) => (
              <option key={v} value={v}>
                {v.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Speed</label>
          <Input
            type="number"
            min={0.5}
            max={2}
            step={0.1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="w-24"
          />
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Generate Speech
      </Button>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Generated Speech
          </p>
          <audio
            src={audioUrl}
            controls
            className="w-full"
          />
          <a
            href={audioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-blue-500 underline"
          >
            Open in new tab
          </a>
          <p className="text-xs text-muted-foreground">
            Use as voiceover for your video. URLs expire in 24 hours.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MinimaxTestPage() {
  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          MiniMax API Tester
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Test Convex actions for chat, image, video, music, and speech via MiniMax.
        </p>
      </div>

      <Tabs defaultValue="chat">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="chat">Chat</TabsTrigger>
          <TabsTrigger value="image">Image</TabsTrigger>
          <TabsTrigger value="video">Video</TabsTrigger>
          <TabsTrigger value="music">Music</TabsTrigger>
          <TabsTrigger value="speech">Speech</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Chat Completion</CardTitle>
              <CardDescription>
                Calls <code>api.minimax.generateChat</code> via the MiniMax
                Anthropic-compatible endpoint.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChatTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="image">
          <Card>
            <CardHeader>
              <CardTitle>Image Generation</CardTitle>
              <CardDescription>
                Calls <code>api.minimax.generateImage</code> — returns image
                URLs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="video">
          <Card>
            <CardHeader>
              <CardTitle>Video Generation</CardTitle>
              <CardDescription>
                Submits a job via <code>api.minimax.generateVideo</code>, then
                polls with <code>api.minimax.queryVideoTask</code>. Videos are
                silent — add music or voiceover from the Music/Speech tabs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VideoTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="music">
          <Card>
            <CardHeader>
              <CardTitle>Music Generation</CardTitle>
              <CardDescription>
                Generates background music via <code>api.minimax.generateLyrics</code>{" "}
                and <code>api.minimax.generateMusic</code>. Use with videos for
                sound.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MusicTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speech">
          <Card>
            <CardHeader>
              <CardTitle>Text-to-Speech</CardTitle>
              <CardDescription>
                Generates voiceover via <code>api.minimax.generateSpeech</code>.
                Use as narration for videos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SpeechTest />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
