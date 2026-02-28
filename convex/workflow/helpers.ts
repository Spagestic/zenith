export type SourceDocument = {
  url: string;
  title?: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  summary?: string;
  highlights?: string[];
};

export type StoryPlan = {
  scenes: {
    sceneNumber: number;
    title: string;
    summary: string;
    visualTone: string;
    durationSeconds: number;
  }[];
  script: {
    sceneNumber: number;
    narration: string;
    dialogue: { character: string; line: string }[];
  }[];
  characters: { name: string; description: string; voiceStyle: string }[];
  musicStyle: string;
};

export type ScenePrompt = {
  sceneNumber: number;
  sceneTitle: string;
  imagePrompt: string;
  startFramePrompt: string;
  endFramePrompt: string;
  transitionPrompt: string;
  negativePrompt?: string;
  camera?: string;
  style?: string;
};

export type ImageAsset = {
  sceneNumber: number;
  sceneTitle: string;
  startImageUrl: string;
  endImageUrl: string;
  startPrompt: string;
  endPrompt: string;
  model: string;
  aspectRatio: string;
  generatedAt: number;
};

export function detectInputType(input: string): "url" | "topic" {
  try {
    const candidate = new URL(input);
    if (candidate.protocol === "http:" || candidate.protocol === "https:") {
      return "url";
    }
  } catch {
    // Input is not a URL, treat as topic.
  }
  return "topic";
}

export function buildFallbackQueryFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const slug = decodeURIComponent(
      parsed.pathname.split("/").filter(Boolean).pop() ?? "",
    )
      .replace(/\.[a-zA-Z0-9]+$/, "")
      .replace(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g, " ")
      .replace(/[-_]+/g, " ")
      .replace(/\barticles?\b/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (slug.length > 0) {
      return `${slug} news`;
    }

    return `${parsed.hostname.replace(/^www\./, "")} latest news`;
  } catch {
    return `${url} news`;
  }
}

export function normalizeSourceDocuments(results: unknown[]): {
  sourceUrls: string[];
  sourceDocuments: SourceDocument[];
} {
  const sourceDocuments: SourceDocument[] = [];

  for (const entry of results) {
    if (!entry || typeof entry !== "object") continue;
    const obj = entry as Record<string, unknown>;
    const url = typeof obj.url === "string" ? obj.url : undefined;
    if (!url) continue;

    const highlights = Array.isArray(obj.highlights)
      ? obj.highlights.filter((item): item is string => typeof item === "string")
      : undefined;

    sourceDocuments.push({
      url,
      title: typeof obj.title === "string" ? obj.title : undefined,
      publishedDate:
        typeof obj.publishedDate === "string" ? obj.publishedDate : undefined,
      author: typeof obj.author === "string" ? obj.author : undefined,
      text: typeof obj.text === "string" ? obj.text : undefined,
      summary: typeof obj.summary === "string" ? obj.summary : undefined,
      highlights: highlights && highlights.length > 0 ? highlights : undefined,
    });
  }

  const sourceUrls = Array.from(new Set(sourceDocuments.map((doc) => doc.url)));
  return { sourceUrls, sourceDocuments };
}

export function buildStorySourceContext(sourceDocuments: SourceDocument[]): string {
  const maxDocs = 6;
  const maxTextPerDoc = 1600;
  const selected = sourceDocuments.slice(0, maxDocs);

  return selected
    .map((doc, index) => {
      const highlights = doc.highlights?.slice(0, 4).join(" | ") ?? "";
      const baseText = doc.summary || highlights || doc.text || "";
      const clippedText = baseText.slice(0, maxTextPerDoc);
      return [
        `Source ${index + 1}:`,
        `URL: ${doc.url}`,
        `Title: ${doc.title ?? "Untitled"}`,
        `Content: ${clippedText}`,
      ].join("\n");
    })
    .join("\n\n");
}

function stripCodeFences(input: string): string {
  const trimmed = input.trim();
  if (trimmed.startsWith("```")) {
    const lines = trimmed.split("\n");
    if (lines.length >= 3 && lines[lines.length - 1].trim() === "```") {
      return lines.slice(1, -1).join("\n").trim();
    }
  }
  return trimmed;
}

function parseJsonObjectLenient(text: string): Record<string, unknown> {
  const cleaned = stripCodeFences(text);

  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    // Continue with fallback extraction attempts.
  }

  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const sliced = cleaned.slice(start, end + 1);
    try {
      return JSON.parse(sliced) as Record<string, unknown>;
    } catch {
      // Attempt one light cleanup (remove trailing commas).
      const withoutTrailingCommas = sliced.replace(/,\s*([}\]])/g, "$1");
      return JSON.parse(withoutTrailingCommas) as Record<string, unknown>;
    }
  }

  throw new Error("Model response did not contain parseable JSON.");
}

export function parseStoryPlan(text: string): StoryPlan {
  const raw = parseJsonObjectLenient(text);
  const scenesInput = Array.isArray(raw.scenes) ? raw.scenes : [];
  const scriptInput = Array.isArray(raw.script) ? raw.script : [];
  const charactersInput = Array.isArray(raw.characters) ? raw.characters : [];
  const musicStyle =
    typeof raw.musicStyle === "string" ? raw.musicStyle : "cinematic, hopeful";

  const scenes = scenesInput
    .map((scene, index) => {
      if (!scene || typeof scene !== "object") return null;
      const s = scene as Record<string, unknown>;
      return {
        sceneNumber:
          typeof s.sceneNumber === "number" ? s.sceneNumber : index + 1,
        title:
          typeof s.title === "string" && s.title.trim()
            ? s.title
            : `Scene ${index + 1}`,
        summary:
          typeof s.summary === "string" && s.summary.trim()
            ? s.summary
            : "Scene summary unavailable.",
        visualTone:
          typeof s.visualTone === "string" && s.visualTone.trim()
            ? s.visualTone
            : "documentary cinematic",
        durationSeconds:
          typeof s.durationSeconds === "number" ? s.durationSeconds : 8,
      };
    })
    .filter((scene): scene is NonNullable<typeof scene> => !!scene);

  const script = scriptInput
    .map((beat, index) => {
      if (!beat || typeof beat !== "object") return null;
      const b = beat as Record<string, unknown>;
      const dialogueRaw = Array.isArray(b.dialogue) ? b.dialogue : [];
      const dialogue = dialogueRaw
        .map((line) => {
          if (!line || typeof line !== "object") return null;
          const l = line as Record<string, unknown>;
          if (typeof l.character !== "string" || typeof l.line !== "string") {
            return null;
          }
          return { character: l.character, line: l.line };
        })
        .filter((line): line is NonNullable<typeof line> => !!line);

      return {
        sceneNumber:
          typeof b.sceneNumber === "number" ? b.sceneNumber : index + 1,
        narration:
          typeof b.narration === "string" ? b.narration : "Narration unavailable.",
        dialogue,
      };
    })
    .filter((beat): beat is NonNullable<typeof beat> => !!beat);

  const characters = charactersInput
    .map((character) => {
      if (!character || typeof character !== "object") return null;
      const c = character as Record<string, unknown>;
      if (typeof c.name !== "string" || typeof c.description !== "string") {
        return null;
      }
      return {
        name: c.name,
        description: c.description,
        voiceStyle:
          typeof c.voiceStyle === "string" ? c.voiceStyle : "natural narration",
      };
    })
    .filter((character): character is NonNullable<typeof character> => !!character);

  if (scenes.length === 0) {
    throw new Error("MiniMax returned an empty scenes plan");
  }

  return {
    scenes,
    script,
    characters,
    musicStyle,
  };
}

export function parsePromptPack(text: string): ScenePrompt[] {
  const raw = parseJsonObjectLenient(text);
  const promptsInput = Array.isArray(raw.scenePrompts) ? raw.scenePrompts : [];

  const prompts = promptsInput
    .map((prompt, index) => {
      if (!prompt || typeof prompt !== "object") return null;
      const p = prompt as Record<string, unknown>;
      const imagePrompt =
        typeof p.imagePrompt === "string" ? p.imagePrompt.trim() : "";
      const startFramePrompt =
        typeof p.startFramePrompt === "string" ? p.startFramePrompt.trim() : "";
      const endFramePrompt =
        typeof p.endFramePrompt === "string" ? p.endFramePrompt.trim() : "";
      const transitionPrompt =
        typeof p.transitionPrompt === "string" ? p.transitionPrompt.trim() : "";

      if (!imagePrompt || !startFramePrompt || !endFramePrompt || !transitionPrompt) {
        return null;
      }

      return {
        sceneNumber:
          typeof p.sceneNumber === "number" ? p.sceneNumber : index + 1,
        sceneTitle:
          typeof p.sceneTitle === "string" && p.sceneTitle.trim()
            ? p.sceneTitle
            : `Scene ${index + 1}`,
        imagePrompt,
        startFramePrompt,
        endFramePrompt,
        transitionPrompt,
        negativePrompt:
          typeof p.negativePrompt === "string" ? p.negativePrompt : undefined,
        camera: typeof p.camera === "string" ? p.camera : undefined,
        style: typeof p.style === "string" ? p.style : undefined,
      };
    })
    .filter((prompt): prompt is NonNullable<typeof prompt> => !!prompt);

  if (prompts.length === 0) {
    throw new Error("MiniMax returned an empty prompt pack");
  }
  return prompts;
}

export function extractImageUrls(response: unknown): string[] {
  if (!response || typeof response !== "object") return [];
  const payload = response as {
    data?:
      | { image_urls?: string[]; image_base64?: string[] }
      | { url: string }[];
    images?: { url: string }[];
  };

  if (Array.isArray(payload.data)) {
    return payload.data
      .map((item) => (item && typeof item.url === "string" ? item.url : null))
      .filter((url): url is string => !!url);
  }
  if (Array.isArray(payload.data?.image_urls)) {
    return payload.data.image_urls;
  }
  if (Array.isArray(payload.data?.image_base64)) {
    return payload.data.image_base64.map((b64) => `data:image/jpeg;base64,${b64}`);
  }
  if (Array.isArray(payload.images)) {
    return payload.images
      .map((item) => (item && typeof item.url === "string" ? item.url : null))
      .filter((url): url is string => !!url);
  }
  return [];
}
