/* eslint-disable @typescript-eslint/no-explicit-any */
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.MINIMAX_API_KEY!,
  baseURL: "https://api.minimax.io/anthropic",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      model = "MiniMax-M2.5",
      max_tokens = 1000,
      system = "You are a helpful assistant.",
      stream = false,
      temperature,
      top_p,
    } = body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 },
      );
    }

    // Streaming response
    if (stream) {
      const stream = await anthropic.messages.stream({
        model,
        max_tokens,
        system,
        messages,
        temperature,
        top_p,
      });

      // Create a ReadableStream for SSE
      const encoder = new TextEncoder();
      const readableStream = new ReadableStream({
        async start(controller) {
          try {
            for await (const event of stream) {
              const data = JSON.stringify(event);
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
          } catch (error) {
            controller.error(error);
          }
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // Non-streaming response
    const message = await anthropic.messages.create({
      model,
      max_tokens,
      system,
      messages,
      temperature,
      top_p,
    });

    // Parse thinking and text blocks
    const response = {
      thinking: "",
      text: "",
      fullResponse: message,
    };

    for (const block of message.content) {
      if (block.type === "thinking") {
        response.thinking = block.thinking;
      } else if (block.type === "text") {
        response.text = block.text;
      }
    }

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("MiniMax API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
        details: error.response?.data,
      },
      { status: error.status || 500 },
    );
  }
}

// Optional: GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    models: [
      "MiniMax-M2.5",
      "MiniMax-M2.5-highspeed",
      "MiniMax-M2.1",
      "MiniMax-M2.1-highspeed",
      "MiniMax-M2",
    ],
  });
}
