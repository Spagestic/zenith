import { action, query } from "./_generated/server";
import { v } from "convex/values";

const MINIMAX_BASE = "https://api.minimax.io";
const MINIMAX_ANTHROPIC_BASE = "https://api.minimax.io/anthropic";

function getApiKey(): string {
  const key = process.env.MINIMAX_API_KEY;
  if (!key) {
    throw new Error("MINIMAX_API_KEY is not configured");
  }
  return key;
}

// ============ Model list queries (static data) ============

export const listChatModels = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      models: [
        "MiniMax-M2.5",
        "MiniMax-M2.5-highspeed",
        "MiniMax-M2.1",
        "MiniMax-M2.1-highspeed",
        "MiniMax-M2",
      ],
    };
  },
});

export const listImageModels = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      models: ["image-01", "image-01-live"],
    };
  },
});

export const listVideoModels = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      models: [
        "MiniMax-Hailuo-2.3",
        "MiniMax-Hailuo-02",
        "I2V-01-live",
        "S2V-01",
      ],
    };
  },
});

export const listMusicModels = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      models: ["music-2.5"],
    };
  },
});

export const listSpeechModels = query({
  args: {},
  handler: async () => {
    return {
      status: "ok",
      models: [
        "speech-2.8-hd",
        "speech-2.8-turbo",
        "speech-2.6-hd",
        "speech-2.6-turbo",
        "speech-02-hd",
        "speech-02-turbo",
      ],
    };
  },
});

// ============ Chat completion action ============

const messageValidator = v.object({
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.union(v.string(), v.array(v.any())),
});

export const generateChat = action({
  args: {
    messages: v.array(messageValidator),
    model: v.optional(v.string()),
    max_tokens: v.optional(v.number()),
    system: v.optional(v.string()),
    temperature: v.optional(v.number()),
    top_p: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();
    const model = args.model ?? "MiniMax-M2.5";
    const max_tokens = args.max_tokens ?? 1000;
    const system = args.system ?? "You are a helpful assistant.";

    const response = await fetch(`${MINIMAX_ANTHROPIC_BASE}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system,
        messages: args.messages,
        ...(args.temperature !== undefined && { temperature: args.temperature }),
        ...(args.top_p !== undefined && { top_p: args.top_p }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error?.message ?? data.message ?? "MiniMax chat API error"
      );
    }

    // Parse thinking and text blocks from response
    let thinking = "";
    let text = "";
    const content = data.content ?? [];
    for (const block of content) {
      if (block.type === "thinking") {
        thinking = block.thinking ?? "";
      } else if (block.type === "text") {
        text = block.text ?? "";
      }
    }

    return {
      thinking,
      text,
      fullResponse: data,
    };
  },
});

// ============ Image generation action ============

export const generateImage = action({
  args: {
    prompt: v.string(),
    model: v.optional(v.string()),
    aspect_ratio: v.optional(v.string()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    response_format: v.optional(v.string()),
    n: v.optional(v.number()),
    prompt_optimizer: v.optional(v.boolean()),
    seed: v.optional(v.number()),
    subject_reference: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();
    const model = args.model ?? "image-01";
    const response_format = args.response_format ?? "url";
    const n = args.n ?? 1;
    const prompt_optimizer = args.prompt_optimizer ?? false;

    const payload: Record<string, unknown> = {
      model,
      prompt: args.prompt,
      response_format,
      n,
      prompt_optimizer,
    };

    if (args.width && args.height) {
      payload.width = args.width;
      payload.height = args.height;
    } else if (args.aspect_ratio) {
      payload.aspect_ratio = args.aspect_ratio;
    } else {
      payload.aspect_ratio = "1:1";
    }

    if (args.seed !== undefined) {
      payload.seed = args.seed;
    }
    if (args.subject_reference !== undefined) {
      payload.subject_reference = args.subject_reference;
    }

    const response = await fetch(`${MINIMAX_BASE}/v1/image_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.base_resp?.status_code !== 0) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax image API error"
      );
    }

    return data;
  },
});

// ============ Video generation action ============

export const generateVideo = action({
  args: {
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    first_frame_image: v.optional(v.any()),
    last_frame_image: v.optional(v.any()),
    subject_reference: v.optional(v.any()),
    duration: v.optional(v.number()),
    resolution: v.optional(v.string()),
    prompt_optimizer: v.optional(v.boolean()),
    fast_pretreatment: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();

    if (
      !args.prompt &&
      !args.first_frame_image &&
      !args.subject_reference &&
      !args.last_frame_image
    ) {
      throw new Error(
        "At least one of prompt, first_frame_image, or subject_reference is required"
      );
    }

    const model = args.model ?? "MiniMax-Hailuo-2.3";
    const duration = args.duration ?? 6;

    const payload: Record<string, unknown> = {
      model,
      duration,
    };

    if (args.prompt) payload.prompt = args.prompt;
    if (args.resolution) payload.resolution = args.resolution;
    if (args.prompt_optimizer !== undefined)
      payload.prompt_optimizer = args.prompt_optimizer;
    if (args.fast_pretreatment !== undefined)
      payload.fast_pretreatment = args.fast_pretreatment;
    if (args.first_frame_image)
      payload.first_frame_image = args.first_frame_image;
    if (args.last_frame_image) payload.last_frame_image = args.last_frame_image;
    if (args.subject_reference)
      payload.subject_reference = args.subject_reference;

    const response = await fetch(`${MINIMAX_BASE}/v1/video_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax video API error"
      );
    }

    return data;
  },
});

// ============ Video task query action ============

export const queryVideoTask = action({
  args: {
    task_id: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();

    const response = await fetch(
      `${MINIMAX_BASE}/v1/query/video_generation?task_id=${args.task_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax video query error"
      );
    }

    // When status_code !== 0 (e.g. content moderation), return data so client can show status + message
    if (data.base_resp && data.base_resp.status_code !== 0) {
      return data;
    }

    // If task succeeded, retrieve file details and inject download URL
    if (data.status === "Success" && data.file_id) {
      const fileResponse = await fetch(
        `${MINIMAX_BASE}/v1/files/retrieve?file_id=${data.file_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );

      const fileData = await fileResponse.json();

      if (
        fileResponse.ok &&
        (!fileData.base_resp || fileData.base_resp.status_code === 0)
      ) {
        data.file_details = fileData.file;
        data.download_url = fileData.file?.download_url;
      }
    }

    return data;
  },
});

// ============ Lyrics generation action ============

export const generateLyrics = action({
  args: {
    prompt: v.string(),
    mode: v.optional(v.union(v.literal("write_full_song"), v.literal("edit"))),
    lyrics: v.optional(v.string()),
    title: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();
    const mode = args.mode ?? "write_full_song";

    const payload: Record<string, unknown> = {
      mode,
      prompt: args.prompt,
    };
    if (args.lyrics) payload.lyrics = args.lyrics;
    if (args.title) payload.title = args.title;

    const response = await fetch(`${MINIMAX_BASE}/v1/lyrics_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax lyrics API error"
      );
    }

    return {
      song_title: data.song_title,
      style_tags: data.style_tags,
      lyrics: data.lyrics,
    };
  },
});

// ============ Music generation action ============

export const generateMusic = action({
  args: {
    lyrics: v.string(),
    prompt: v.optional(v.string()),
    model: v.optional(v.string()),
    output_format: v.optional(v.union(v.literal("url"), v.literal("hex"))),
    audio_setting: v.optional(
      v.object({
        sample_rate: v.optional(v.number()),
        bitrate: v.optional(v.number()),
        format: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();
    const model = args.model ?? "music-2.5";
    const output_format = args.output_format ?? "url";

    const payload: Record<string, unknown> = {
      model,
      lyrics: args.lyrics,
      output_format,
      audio_setting: args.audio_setting ?? {
        sample_rate: 44100,
        bitrate: 256000,
        format: "mp3",
      },
    };
    if (args.prompt) payload.prompt = args.prompt;

    const response = await fetch(`${MINIMAX_BASE}/v1/music_generation`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax music API error"
      );
    }

    // Response: data.audio (hex or url string), data.status, extra_info
    const audioUrl =
      output_format === "url" && typeof data.data?.audio === "string"
        ? data.data.audio
        : null;

    return {
      audio_url: audioUrl,
      extra_info: data.extra_info,
      fullResponse: data,
    };
  },
});

// ============ Text-to-Speech action ============

export const generateSpeech = action({
  args: {
    text: v.string(),
    model: v.optional(v.string()),
    voice_id: v.optional(v.string()),
    output_format: v.optional(v.union(v.literal("url"), v.literal("hex"))),
    speed: v.optional(v.number()),
    language_boost: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = getApiKey();
    const model = args.model ?? "speech-2.8-turbo";
    const output_format = args.output_format ?? "url";

    const payload: Record<string, unknown> = {
      model,
      text: args.text,
      stream: false,
      output_format,
      voice_setting: {
        voice_id: args.voice_id ?? "English_expressive_narrator",
        speed: args.speed ?? 1,
        vol: 1,
        pitch: 0,
      },
      audio_setting: {
        sample_rate: 32000,
        bitrate: 128000,
        format: "mp3",
        channel: 1,
      },
    };
    if (args.language_boost) payload.language_boost = args.language_boost;

    const response = await fetch(`${MINIMAX_BASE}/v1/t2a_v2`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
      throw new Error(
        data.base_resp?.status_msg ?? data.error ?? "MiniMax speech API error"
      );
    }

    // When output_format is url, data.data.audio contains the URL string
    const audioUrl =
      output_format === "url" &&
      data.data?.audio &&
      typeof data.data.audio === "string"
        ? data.data.audio
        : null;

    return {
      audio_url: audioUrl,
      extra_info: data.extra_info,
      fullResponse: data,
    };
  },
});
