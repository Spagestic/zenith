import { action } from "./_generated/server";
import { v } from "convex/values";

const EXA_BASE = "https://api.exa.ai";

function getApiKey(): string {
  const key = process.env.EXA_API_KEY;
  if (!key) {
    throw new Error("EXA_API_KEY is not configured");
  }
  return key;
}

function exaFetch(
  endpoint: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  return fetch(`${EXA_BASE}${endpoint}`, {
    method: "POST",
    headers: {
      "x-api-key": getApiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).then(async (res) => {
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? "Exa API error");
    }
    return data;
  });
}

// ============ Search ============

const searchTypeValidator = v.union(
  v.literal("auto"),
  v.literal("instant"),
  v.literal("neural"),
  v.literal("fast"),
  v.literal("deep"),
  v.literal("deep-reasoning"),
  v.literal("deep-max"),
);

const categoryValidator = v.optional(
  v.union(
    v.literal("company"),
    v.literal("people"),
    v.literal("research paper"),
    v.literal("news"),
    v.literal("tweet"),
    v.literal("personal site"),
    v.literal("financial report"),
    v.literal("pdf"),
    v.literal("github"),
  ),
);

export const search = action({
  args: {
    query: v.string(),
    type: v.optional(searchTypeValidator),
    numResults: v.optional(v.number()),
    contents: v.optional(v.any()),
    useAutoprompt: v.optional(v.boolean()),
    category: v.optional(categoryValidator),
    startPublishedDate: v.optional(v.string()),
    endPublishedDate: v.optional(v.string()),
    includeDomains: v.optional(v.array(v.string())),
    excludeDomains: v.optional(v.array(v.string())),
    startCrawlDate: v.optional(v.string()),
    endCrawlDate: v.optional(v.string()),
    maxAgeHours: v.optional(v.number()),
    outputSchema: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    if (
      args.numResults !== undefined &&
      (args.numResults < 1 || args.numResults > 100)
    ) {
      throw new Error("numResults must be between 1 and 100");
    }
    const type = args.type ?? "auto";
    if (
      args.outputSchema &&
      !["deep", "deep-reasoning", "deep-max"].includes(type)
    ) {
      throw new Error("outputSchema is only valid for deep search types");
    }

    const body: Record<string, unknown> = {
      query: args.query,
      type,
      numResults: args.numResults ?? 10,
    };
    if (args.contents !== undefined) body.contents = args.contents;
    if (args.useAutoprompt !== undefined)
      body.useAutoprompt = args.useAutoprompt;
    if (args.category !== undefined) body.category = args.category;
    if (args.startPublishedDate !== undefined)
      body.startPublishedDate = args.startPublishedDate;
    if (args.endPublishedDate !== undefined)
      body.endPublishedDate = args.endPublishedDate;
    if (args.includeDomains !== undefined)
      body.includeDomains = args.includeDomains;
    if (args.excludeDomains !== undefined)
      body.excludeDomains = args.excludeDomains;
    if (args.startCrawlDate !== undefined)
      body.startCrawlDate = args.startCrawlDate;
    if (args.endCrawlDate !== undefined) body.endCrawlDate = args.endCrawlDate;
    if (args.maxAgeHours !== undefined) body.maxAgeHours = args.maxAgeHours;
    if (args.outputSchema !== undefined) body.outputSchema = args.outputSchema;

    return await exaFetch("/search", body);
  },
});

// ============ Search and Contents ============

export const searchAndContents = action({
  args: {
    query: v.string(),
    type: v.optional(searchTypeValidator),
    numResults: v.optional(v.number()),
    text: v.optional(v.union(v.boolean(), v.any())),
    highlights: v.optional(v.union(v.boolean(), v.any())),
    summary: v.optional(v.union(v.boolean(), v.any())),
    maxAgeHours: v.optional(v.number()),
    category: v.optional(categoryValidator),
    includeDomains: v.optional(v.array(v.string())),
    excludeDomains: v.optional(v.array(v.string())),
    startPublishedDate: v.optional(v.string()),
    endPublishedDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (
      args.numResults !== undefined &&
      (args.numResults < 1 || args.numResults > 100)
    ) {
      throw new Error("numResults must be between 1 and 100");
    }

    const body: Record<string, unknown> = {
      query: args.query,
      type: args.type ?? "auto",
      numResults: args.numResults ?? 10,
    };
    if (args.text !== undefined) body.text = args.text;
    if (args.highlights !== undefined) body.highlights = args.highlights;
    if (args.summary !== undefined) body.summary = args.summary;
    if (args.maxAgeHours !== undefined) body.maxAgeHours = args.maxAgeHours;
    if (args.category !== undefined) body.category = args.category;
    if (args.includeDomains !== undefined)
      body.includeDomains = args.includeDomains;
    if (args.excludeDomains !== undefined)
      body.excludeDomains = args.excludeDomains;
    if (args.startPublishedDate !== undefined)
      body.startPublishedDate = args.startPublishedDate;
    if (args.endPublishedDate !== undefined)
      body.endPublishedDate = args.endPublishedDate;

    return await exaFetch("/search", body);
  },
});

// ============ Get Contents (scrape) ============

const textOptionValidator = v.optional(
  v.union(
    v.boolean(),
    v.object({
      maxCharacters: v.optional(v.number()),
      includeHtmlTags: v.optional(v.boolean()),
    }),
  ),
);

const highlightsOptionValidator = v.optional(
  v.union(
    v.boolean(),
    v.object({
      maxCharacters: v.optional(v.number()),
      numSentences: v.optional(v.number()),
      highlightsPerUrl: v.optional(v.number()),
      query: v.optional(v.string()),
    }),
  ),
);

export const getContents = action({
  args: {
    url: v.optional(v.string()),
    urls: v.optional(v.array(v.string())),
    text: v.optional(textOptionValidator),
    highlights: v.optional(highlightsOptionValidator),
    summary: v.optional(v.union(v.boolean(), v.any())),
    maxAgeHours: v.optional(v.number()),
    livecrawl: v.optional(
      v.union(v.literal("never"), v.literal("always"), v.literal("fallback")),
    ),
  },
  handler: async (ctx, args) => {
    const urlsToScrape = args.url ? [args.url] : args.urls;
    if (!urlsToScrape || urlsToScrape.length === 0) {
      throw new Error(
        "Either url (string) or urls (array) parameter is required",
      );
    }
    if (urlsToScrape.length > 100) {
      throw new Error("Maximum 100 URLs can be scraped at once");
    }

    const body: Record<string, unknown> = {
      urls: urlsToScrape,
    };
    if (args.text !== undefined) body.text = args.text;
    if (args.highlights !== undefined) body.highlights = args.highlights;
    if (args.summary !== undefined) body.summary = args.summary;
    if (args.maxAgeHours !== undefined) body.maxAgeHours = args.maxAgeHours;
    if (args.livecrawl !== undefined) body.livecrawl = args.livecrawl;

    return await exaFetch("/contents", body);
  },
});

// ============ Get Contents with Subpages ============

export const getContentsWithSubpages = action({
  args: {
    url: v.string(),
    subpages: v.optional(v.number()),
    subpageTarget: v.optional(v.array(v.string())),
    text: v.optional(textOptionValidator),
    highlights: v.optional(highlightsOptionValidator),
    summary: v.optional(v.union(v.boolean(), v.any())),
    maxAgeHours: v.optional(v.number()),
    livecrawlTimeout: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (
      args.subpages !== undefined &&
      (args.subpages < 1 || args.subpages > 50)
    ) {
      throw new Error("subpages must be between 1 and 50");
    }

    const body: Record<string, unknown> = {
      urls: [args.url],
      subpages: args.subpages ?? 10,
      livecrawlTimeout: args.livecrawlTimeout ?? 12000,
    };
    if (args.subpageTarget && args.subpageTarget.length > 0) {
      body.subpageTarget = args.subpageTarget;
    }
    if (args.text !== undefined) body.text = args.text;
    if (args.highlights !== undefined) body.highlights = args.highlights;
    if (args.summary !== undefined) body.summary = args.summary;
    if (args.maxAgeHours !== undefined) body.maxAgeHours = args.maxAgeHours;

    const result = (await exaFetch("/contents", body)) as {
      results?: unknown[];
      statuses?: { status: string }[];
    };

    return {
      ...result,
      crawlSummary: {
        baseUrl: args.url,
        requestedSubpages: args.subpages ?? 10,
        targetKeywords: args.subpageTarget ?? [],
        totalPagesReturned: result.results?.length ?? 0,
        successful:
          result.statuses?.filter((s) => s.status === "success").length ?? 0,
        failed:
          result.statuses?.filter((s) => s.status === "error").length ?? 0,
      },
    };
  },
});

// ============ Batch Get Contents ============

export const batchGetContents = action({
  args: {
    urls: v.array(v.string()),
    text: v.optional(v.union(v.boolean(), v.any())),
    highlights: v.optional(v.union(v.boolean(), v.any())),
    summary: v.optional(v.union(v.boolean(), v.any())),
    maxAgeHours: v.optional(v.number()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.urls.length === 0) {
      throw new Error("urls array is required and must not be empty");
    }
    if (args.urls.length > 1000) {
      throw new Error(
        "Maximum 1000 URLs can be processed. Use pagination for larger sets.",
      );
    }

    const batchSize = args.batchSize ?? 10;
    const results: unknown[] = [];
    const errors: { batch: number; urls: string[]; error: string }[] = [];

    for (let i = 0; i < args.urls.length; i += batchSize) {
      const batch = args.urls.slice(i, i + batchSize);

      try {
        const body: Record<string, unknown> = {
          urls: batch,
          text: args.text ?? true,
        };
        if (args.highlights !== undefined) body.highlights = args.highlights;
        if (args.summary !== undefined) body.summary = args.summary;
        if (args.maxAgeHours !== undefined) body.maxAgeHours = args.maxAgeHours;

        const batchResult = (await exaFetch("/contents", body)) as {
          results?: unknown[];
        };
        results.push(...(batchResult.results ?? []));
      } catch (error) {
        errors.push({
          batch: Math.floor(i / batchSize) + 1,
          urls: batch,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return {
      success: true,
      totalUrls: args.urls.length,
      successfulScrapes: results.length,
      failedBatches: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };
  },
});
