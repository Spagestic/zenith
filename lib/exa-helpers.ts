import type { ExaSearchRequest, ContentsOptions } from "@/types/exa";

import type { ExaScrapeRequest } from "@/types/exa";

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
 * Get basic scrape config with highlights
 * Good for quick content extraction
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
 * Get full text scrape config
 * For comprehensive content extraction
 */
export function getFullTextScrapeConfig(
  url: string,
  maxCharacters?: number,
  verbosity: "compact" | "standard" | "full" = "standard",
): ExaScrapeRequest {
  return {
    url,
    text: {
      ...(maxCharacters && { maxCharacters }),
      verbosity,
    },
  };
}

/**
 * Get summary scrape config
 * For quick overviews
 */
export function getSummaryScrapeConfig(
  url: string,
  query?: string,
): ExaScrapeRequest {
  return {
    url,
    summary: query ? { query } : true,
  };
}

/**
 * Get comprehensive scrape config
 * Includes text, highlights, and summary
 */
export function getComprehensiveScrapeConfig(
  url: string,
  textChars: number = 15000,
  highlightChars: number = 4000,
): ExaScrapeRequest {
  return {
    url,
    text: {
      maxCharacters: textChars,
      verbosity: "standard",
    },
    highlights: {
      maxCharacters: highlightChars,
    },
    summary: true,
  };
}

/**
 * Get real-time scrape config with livecrawl
 * Always fetches fresh content
 */
export function getLiveScrapeConfig(
  url: string,
  includeText: boolean = true,
): ExaScrapeRequest {
  return {
    url,
    livecrawl: true,
    maxAgeHours: 0,
    ...(includeText
      ? { text: { maxCharacters: 15000 } }
      : { highlights: { maxCharacters: 4000 } }),
  };
}

/**
 * Get multiple URL scrape config
 */
export function getMultiUrlScrapeConfig(
  urls: string[],
  contentType: "text" | "highlights" | "summary" | "all" = "highlights",
): ExaScrapeRequest {
  const config: ExaScrapeRequest = { urls };

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
    case "all":
      config.text = { maxCharacters: 15000, verbosity: "standard" };
      config.highlights = { maxCharacters: 4000 };
      config.summary = true;
      break;
  }

  return config;
}
