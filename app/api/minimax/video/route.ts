import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      model = "MiniMax-Hailuo-2.3",
      first_frame_image,
      last_frame_image,
      subject_reference,
      duration = 6,
      resolution,
      prompt_optimizer,
      fast_pretreatment,
    } = body;

    // Validate required fields
    if (
      !prompt &&
      !first_frame_image &&
      !subject_reference &&
      !last_frame_image
    ) {
      return NextResponse.json(
        {
          error:
            "At least one of prompt, first_frame_image, or subject_reference is required",
        },
        { status: 400 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload: any = {
      model,
      duration,
    };

    if (prompt) payload.prompt = prompt;
    if (resolution) payload.resolution = resolution;
    if (prompt_optimizer !== undefined)
      payload.prompt_optimizer = prompt_optimizer;
    if (fast_pretreatment !== undefined)
      payload.fast_pretreatment = fast_pretreatment;

    if (first_frame_image) {
      payload.first_frame_image = first_frame_image;
    }

    if (last_frame_image) {
      payload.last_frame_image = last_frame_image;
    }

    if (subject_reference) {
      payload.subject_reference = subject_reference;
    }

    const response = await fetch("https://api.minimax.io/v1/video_generation", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
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
    console.error("MiniMax Video Generation API Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
      },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const task_id = searchParams.get("task_id");

    if (!task_id) {
      return NextResponse.json({
        status: "ok",
        models: [
          "MiniMax-Hailuo-2.3",
          "MiniMax-Hailuo-02",
          "I2V-01-live",
          "S2V-01",
        ],
      });
    }

    const response = await fetch(
      `https://api.minimax.io/v1/query/video_generation?task_id=${task_id}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok || (data.base_resp && data.base_resp.status_code !== 0)) {
      return NextResponse.json(
        {
          error: data.base_resp?.status_msg || "Minimax API error",
          details: data,
        },
        { status: response.status !== 200 ? response.status : 400 },
      );
    }

    // If task succeeded, automatically retrieve file details and inject download URL
    if (data.status === "Success" && data.file_id) {
      const fileResponse = await fetch(
        `https://api.minimax.io/v1/files/retrieve?file_id=${data.file_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
          },
        },
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

    return NextResponse.json(data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("MiniMax Video Task Query Error:", error);
    return NextResponse.json(
      {
        error: error.message || "An error occurred",
      },
      { status: 500 },
    );
  }
}
