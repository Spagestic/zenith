// lib/bedrock-client.ts
// Client-side helper for calling the /api/bedrock route

interface BedrockOptions {
  prompt?: string;
  messages?: { role: string; content: string }[];
  system?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
}

export async function generateText(options: BedrockOptions): Promise<string> {
  const res = await fetch("/api/bedrock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? `Bedrock request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.text as string;
}
