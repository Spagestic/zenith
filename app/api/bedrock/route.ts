import {
  BedrockRuntimeClient,
  ConverseCommand,
  ConverseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";
import { NextRequest, NextResponse } from "next/server";

// Important for Next.js route handlers so AWS SDK runs in Node (not Edge)
export const runtime = "nodejs";

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION ?? "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

type InMsg = { role: "user" | "assistant"; content: string };

function normalizeMessages(input: unknown): InMsg[] | null {
  if (Array.isArray(input)) {
    return input
      .map((m: unknown) => {
        const msg = m as Record<string, unknown>;
        return {
          role: (msg?.role === "assistant" ? "assistant" : "user") as
            | "user"
            | "assistant",
          content: String(msg?.content ?? ""),
        };
      })
      .filter((m) => m.content.length > 0);
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      prompt,
      messages,
      system = "You are a helpful assistant.",
      model = "amazon.nova-pro-v1:0",
      max_tokens = 1000,
      temperature = 0.7,
      top_p = 0.9,
      stream = false,
    } = body;

    const msgList =
      normalizeMessages(messages) ??
      (prompt
        ? ([{ role: "user", content: String(prompt) }] as InMsg[])
        : null);

    if (!msgList || msgList.length === 0) {
      return NextResponse.json(
        { error: "Either 'prompt' or 'messages' is required" },
        { status: 400 },
      );
    }

    // Converse expects content blocks (text, images, documents, etc.)
    const bedrockMessages = msgList.map((m) => ({
      role: m.role,
      content: [{ text: m.content }],
    }));

    const input = {
      modelId: model,
      system: [{ text: system }],
      messages: bedrockMessages,
      inferenceConfig: {
        maxTokens: max_tokens,
        temperature,
        topP: top_p,
      },
    };

    if (stream) {
      const response = await client.send(new ConverseStreamCommand(input));

      const encoder = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          try {
            // ConverseStream emits events like:
            // { contentBlockDelta: { delta: { text: "..." }, ... } } :contentReference[oaicite:5]{index=5}
            for await (const event of response.stream!) {
              const textDelta = event.contentBlockDelta?.delta?.text;
              if (typeof textDelta === "string" && textDelta.length) {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ text: textDelta })}\n\n`,
                  ),
                );
              }

              if (event.messageStop) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              }
            }
          } finally {
            controller.close();
          }
        },
      });

      return new Response(readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming
    const response = await client.send(new ConverseCommand(input));
    const text =
      response.output?.message?.content
        ?.map((b: { text?: string }) =>
          typeof b?.text === "string" ? b.text : "",
        )
        .join("") ?? "";

    return NextResponse.json({
      text,
      usage: response.usage,
      modelUsed: model,
    });
  } catch (error: unknown) {
    console.error("[Bedrock] Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
