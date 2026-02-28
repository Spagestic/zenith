import type {
  ExaSearchRequest,
  ContentsOptions,
  ExaScrapeRequest,
  ExaSubpageScrapeRequest,
  SummaryOptions,
} from "@/types/exa";
/**
 * Get highlights-optimized search config for agentic workflows
 * Provides token-efficient excerpts perfect for multi-step agents
 */
export function getAgenticSearchConfig(
  query: string,
  maxCharacters: number = 4000,
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    numResults: 10,
    contents: {
      highlights: {
        maxCharacters,
      },
    },
  };
}

/**
 * Get full-text search config for deep research
 * Use when comprehensive understanding is needed
 */
export function getResearchSearchConfig(
  query: string,
  numResults: number = 5,
  maxCharacters: number = 15000,
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    numResults,
    contents: {
      text: {
        maxCharacters,
        verbosity: "standard",
      },
    },
  };
}

/**
 * Get real-time search config with livecrawl
 * Always fetches fresh content, may increase latency
 */
export function getRealTimeSearchConfig(
  query: string,
  domains?: string[],
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    maxAgeHours: 0, // Always livecrawl
    ...(domains && { includeDomains: domains }),
    contents: {
      highlights: {
        maxCharacters: 4000,
      },
    },
  };
}

/**
 * Get instant search config for autocomplete/live suggestions
 * Optimized for sub-200ms latency
 */
export function getInstantSearchConfig(
  query: string,
  numResults: number = 5,
): ExaSearchRequest {
  return {
    query,
    type: "instant",
    numResults,
    maxAgeHours: -1, // Cache only for maximum speed
    contents: {
      highlights: {
        maxCharacters: 1000,
      },
    },
  };
}

/**
 * Get company search config
 * Optimized for finding company information
 */
export function getCompanySearchConfig(
  query: string,
  numResults: number = 10,
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    category: "company",
    numResults,
    contents: {
      highlights: {
        maxCharacters: 4000,
      },
    },
  };
}

/**
 * Get people search config
 * Optimized for finding information about people
 */
export function getPeopleSearchConfig(
  query: string,
  numResults: number = 10,
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    category: "people",
    numResults,
    contents: {
      highlights: {
        maxCharacters: 4000,
      },
    },
  };
}

/**
 * Get news search config
 * Optimized for current events and journalism
 */
export function getNewsSearchConfig(
  query: string,
  maxAgeHours: number = 24,
  numResults: number = 10,
): ExaSearchRequest {
  return {
    query,
    type: "auto",
    category: "news",
    maxAgeHours,
    numResults,
    contents: {
      highlights: {
        maxCharacters: 4000,
      },
    },
  };
}

/**
 * Get deep search config with structured output
 * Use for comprehensive research with specific output format
 */
export function getDeepSearchConfig(
  query: string,
  outputSchema?: ExaSearchRequest["outputSchema"],
): ExaSearchRequest {
  return {
    query,
    type: "deep",
    numResults: 20,
    ...(outputSchema && { outputSchema }),
  };
}

/**
 * Get combined content config
 * Request both highlights and text for flexibility
 */
export function getCombinedContentsConfig(
  highlightChars: number = 4000,
  textChars: number = 15000,
): ContentsOptions {
  return {
    highlights: {
      maxCharacters: highlightChars,
    },
    text: {
      maxCharacters: textChars,
      verbosity: "standard",
    },
  };
}

/**
 * Get basic scrape config with highlights (token-efficient)
 */
export function getBasicScrapeConfig(
  url: string,
  maxCharacters: number = 4000,
): ExaScrapeRequest {
  return {
    url,
    highlights: {
      maxCharacters,
    },
  };
}

/**
 * Get full text scrape config for deep analysis
 */
export function getFullTextScrapeConfig(
  url: string,
  maxCharacters: number = 20000,
  verbosity: "compact" | "standard" | "full" = "standard",
): ExaScrapeRequest {
  return {
    url,
    text: {
      maxCharacters,
      verbosity,
    },
  };
}

/**
 * Get query-targeted highlights
 */
export function getQueryHighlightsScrapeConfig(
  url: string,
  query: string,
  maxCharacters: number = 2000,
): ExaScrapeRequest {
  return {
    url,
    highlights: {
      query,
      maxCharacters,
    },
  };
}

/**
 * Get structured summary with JSON schema
 */
export function getStructuredSummaryScrapeConfig(
  url: string,
  query: string,
  schema: SummaryOptions["schema"],
): ExaScrapeRequest {
  return {
    url,
    summary: {
      query,
      schema,
    },
  };
}

/**
 * Get combined content config (highlights + text + summary)
 * Use for comprehensive extraction
 */
export function getComprehensiveScrapeConfig(
  url: string,
  highlightQuery?: string,
): ExaScrapeRequest {
  return {
    url,
    text: {
      maxCharacters: 20000,
      verbosity: "standard",
    },
    highlights: highlightQuery
      ? { query: highlightQuery, maxCharacters: 4000 }
      : { maxCharacters: 4000 },
    summary: true,
  };
}

/**
 * Get real-time scrape config (always livecrawl)
 */
export function getRealTimeScrapeConfig(
  url: string,
  contentType: "text" | "highlights" | "both" = "highlights",
  livecrawlTimeout: number = 12000,
): ExaScrapeRequest {
  const config: ExaScrapeRequest = {
    url,
    maxAgeHours: 0, // Always livecrawl
    livecrawlTimeout,
  };

  if (contentType === "text" || contentType === "both") {
    config.text = { maxCharacters: 15000, verbosity: "standard" };
  }

  if (contentType === "highlights" || contentType === "both") {
    config.highlights = { maxCharacters: 4000 };
  }

  return config;
}

/**
 * Get cached-only scrape config (maximum speed)
 */
export function getCachedScrapeConfig(
  url: string,
  contentType: "text" | "highlights" = "highlights",
): ExaScrapeRequest {
  const config: ExaScrapeRequest = {
    url,
    maxAgeHours: -1, // Never livecrawl, cache only
  };

  if (contentType === "text") {
    config.text = { maxCharacters: 15000, verbosity: "standard" };
  } else {
    config.highlights = { maxCharacters: 4000 };
  }

  return config;
}

/**
 * Get daily-fresh scrape config
 */
export function getDailyFreshScrapeConfig(
  url: string,
  contentType: "text" | "highlights" | "summary" = "highlights",
): ExaScrapeRequest {
  const config: ExaScrapeRequest = {
    url,
    maxAgeHours: 24,
    livecrawlTimeout: 12000,
  };

  switch (contentType) {
    case "text":
      config.text = { maxCharacters: 15000, verbosity: "standard" };
      break;
    case "highlights":
      config.highlights = { maxCharacters: 4000 };
      break;
    case "summary":
      config.summary = true;
      break;
  }

  return config;
}

/**
 * Scrape documentation site with subpage crawling
 */
export function getDocsScrapeConfig(
  baseUrl: string,
  subpages: number = 15,
  targetSections: string[] = ["api", "reference", "guide", "docs"],
): ExaSubpageScrapeRequest {
  return {
    url: baseUrl,
    subpages,
    subpageTarget: targetSections,
    maxAgeHours: 24,
    livecrawlTimeout: 15000,
    text: {
      maxCharacters: 5000,
      verbosity: "standard",
    },
  };
}

/**
 * Scrape company website with subpage crawling
 */
export function getCompanyScrapeConfig(
  companyUrl: string,
  subpages: number = 8,
  targetSections: string[] = ["about", "careers", "press", "blog", "team"],
): ExaSubpageScrapeRequest {
  return {
    url: companyUrl,
    subpages,
    subpageTarget: targetSections,
    summary: {
      query: "Company overview, culture, team, and recent news",
    },
    highlights: {
      maxCharacters: 4000,
    },
  };
}

/**
 * Scrape research paper or article
 */
export function getResearchPaperScrapeConfig(
  paperUrl: string,
  extractionQuery?: string,
): ExaScrapeRequest {
  return {
    url: paperUrl,
    text: {
      maxCharacters: 20000,
      verbosity: "standard",
    },
    highlights: extractionQuery
      ? { query: extractionQuery, maxCharacters: 3000 }
      : { query: "methodology and main findings", maxCharacters: 3000 },
    summary: {
      query: "Summarize the paper's methodology, key findings, and conclusions",
    },
  };
}

/**
 * Extract structured data from a page
 */
export function getStructuredExtractionConfig(
  url: string,
  extractionSchema: SummaryOptions["schema"],
  extractionQuery: string = "Extract structured information from this page",
): ExaScrapeRequest {
  return {
    url,
    summary: {
      query: extractionQuery,
      schema: extractionSchema,
    },
  };
}

/**
 * Helper to create company info extraction schema
 */
export function getCompanyInfoSchema(): SummaryOptions["schema"] {
  return {
    type: "object",
    properties: {
      name: { type: "string" },
      industry: { type: "string" },
      founded: { type: "number" },
      headquarters: { type: "string" },
      description: { type: "string" },
      keyProducts: { type: "array" },
    },
    required: ["name", "industry"],
  };
}

/**
 * Helper to create person info extraction schema
 */
export function getPersonInfoSchema(): SummaryOptions["schema"] {
  return {
    type: "object",
    properties: {
      name: { type: "string" },
      title: { type: "string" },
      company: { type: "string" },
      location: { type: "string" },
      background: { type: "string" },
      expertise: { type: "array" },
    },
    required: ["name"],
  };
}

/**
 * Helper to create article metadata extraction schema
 */
export function getArticleMetadataSchema(): SummaryOptions["schema"] {
  return {
    type: "object",
    properties: {
      title: { type: "string" },
      author: { type: "string" },
      publishDate: { type: "string" },
      mainTopics: { type: "array" },
      keyTakeaways: { type: "array" },
      wordCount: { type: "number" },
    },
    required: ["title", "mainTopics"],
  };
}
