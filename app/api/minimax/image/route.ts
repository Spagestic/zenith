import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      model = "image-01",
      aspect_ratio,
      width,
      height,
      response_format = "url",
      n = 1,
      prompt_optimizer = false,
      seed,
      subject_reference,
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      model,
      prompt,
      response_format,
      n,
      prompt_optimizer,
    };

    if (width && height) {
      payload.width = width;
      payload.height = height;
    } else if (aspect_ratio) {
      payload.aspect_ratio = aspect_ratio;
    } else {
      payload.aspect_ratio = "1:1";
    }

    if (seed !== undefined) {
      payload.seed = seed;
    }

    if (subject_reference) {
      payload.subject_reference = subject_reference;
    }

    const response = await fetch("https://api.minimax.io/v1/image_generation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.base_resp?.status_code !== 0) {
      return NextResponse.json(
        {
          error: data.base_resp?.status_msg || "Minimax API error",
          details: data,
        },
        { status: response.status !== 200 ? response.status : 400 },
      );
    }

    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("MiniMax Image Generation API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    models: ["image-01", "image-01-live"],
  });
}
