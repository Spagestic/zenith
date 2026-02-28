/* eslint-disable @typescript-eslint/no-explicit-any */
export type SearchType =
  | "auto"
  | "instant"
  | "deep"
  | "deep-reasoning"
  | "deep-max";

export type Category =
  | "company"
  | "people"
  | "research paper"
  | "news"
  | "tweet"
  | "personal site"
  | "financial report";

export type Verbosity = "compact" | "standard" | "full";

export interface TextOptions {
  maxCharacters?: number;
  includeHtmlTags?: boolean;
  verbosity?: Verbosity;
}

export interface HighlightsOptions {
  maxCharacters?: number;
  highlightsPerUrl?: number;
  query?: string;
}

export interface SummaryOptions {
  query?: string;
}

export interface OutputSchemaText {
  type: "text";
  description?: string;
}

export interface OutputSchemaObject {
  type: "object";
  properties: Record<
    string,
    {
      type: "string" | "number" | "boolean" | "array" | "object";
      description?: string;
      items?: any;
      properties?: any;
    }
  >;
  required?: string[];
}

export type OutputSchema = OutputSchemaText | OutputSchemaObject;

export interface ContentsOptions {
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
}

export interface ExaSearchRequest {
  query: string;
  type?: SearchType;
  numResults?: number;
  contents?: ContentsOptions;
  useAutoprompt?: boolean;
  category?: Category;
  startPublishedDate?: string;
  endPublishedDate?: string;
  includeDomains?: string[];
  excludeDomains?: string[];
  startCrawlDate?: string;
  endCrawlDate?: string;
  maxAgeHours?: number; // 0 = always livecrawl, -1 = never livecrawl
  outputSchema?: OutputSchema; // Only for deep search types
}

export interface ExaFindSimilarRequest {
  url: string;
  numResults?: number;
  contents?: ContentsOptions;
  excludeSourceDomain?: boolean;
  category?: Category;
  startPublishedDate?: string;
  endPublishedDate?: string;
  maxAgeHours?: number;
}

export interface ExaGetContentsRequest {
  ids: string[];
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
}

export interface ExaSearchResponse {
  results: ExaResult[];
  autopromptString?: string;
  output?: any; // For deep search with outputSchema
}

export interface ExaResult {
  score?: number;
  title: string;
  id: string;
  url: string;
  publishedDate?: string;
  author?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
}

// ... previous types ...

export interface ExaScrapeRequest {
  url?: string; // Single URL
  urls?: string[]; // Multiple URLs
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
  maxAgeHours?: number;
  livecrawl?: boolean;
}

export interface ExaBatchScrapeRequest {
  urls: string[];
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
  maxAgeHours?: number;
  batchSize?: number;
}

export interface ExaScrapeResponse {
  results: ExaScrapedContent[];
}

export interface ExaBatchScrapeResponse {
  success: boolean;
  totalUrls: number;
  successfulScrapes: number;
  failedBatches: number;
  results: ExaScrapedContent[];
  errors?: Array<{
    batch: number;
    urls: string[];
    error: string;
  }>;
}

export type ContentVerbosity = "compact" | "standard" | "full";

export interface TextOptions {
  maxCharacters?: number;
  includeHtmlTags?: boolean;
  verbosity?: ContentVerbosity;
}

export interface HighlightsOptions {
  query?: string;
  maxCharacters?: number;
  highlightsPerUrl?: number;
}

export interface SummaryOptions {
  query?: string;
  schema?: {
    type: "object";
    properties: Record<
      string,
      {
        type: "string" | "number" | "boolean" | "array";
        description?: string;
      }
    >;
    required?: string[];
  };
}

export interface ExaScrapeRequest {
  url?: string; // Single URL
  urls?: string[]; // Multiple URLs
  ids?: string[]; // Alternative to urls (matches API nomenclature)
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
  maxAgeHours?: number; // 0 = always livecrawl, -1 = never livecrawl
  livecrawl?: boolean;
  livecrawlTimeout?: number; // Milliseconds, recommended: 10000-15000
  subpages?: number; // Max subpages to crawl (1-50)
  subpageTarget?: string[]; // Keywords to prioritize when selecting subpages
}

export interface ExaSubpageScrapeRequest {
  url: string;
  subpages?: number;
  subpageTarget?: string[];
  text?: boolean | TextOptions;
  highlights?: boolean | HighlightsOptions;
  summary?: boolean | SummaryOptions;
  maxAgeHours?: number;
  livecrawlTimeout?: number;
}

export type ExaContentStatus = "success" | "error";

export type ExaErrorTag =
  | "CRAWL_NOT_FOUND" // 404
  | "CRAWL_TIMEOUT" // 408
  | "CRAWL_LIVECRAWL_TIMEOUT" // livecrawlTimeout exceeded
  | "SOURCE_NOT_AVAILABLE" // 403
  | "CRAWL_UNKNOWN_ERROR"; // 500+

export interface ExaContentError {
  tag: ExaErrorTag;
  httpStatusCode?: number;
  message?: string;
}

export interface ExaContentStatusInfo {
  id: string;
  status: ExaContentStatus;
  error?: ExaContentError;
}

export interface ExaScrapeResponse {
  results: ExaScrapedContent[];
  statuses?: ExaContentStatusInfo[];
  summary?: {
    total: number;
    successful: number;
    failed: number;
  };
  crawlSummary?: {
    baseUrl: string;
    requestedSubpages: number;
    targetKeywords: string[];
    totalPagesReturned: number;
    successful: number;
    failed: number;
  };
}

export interface ExaScrapedContent {
  url: string;
  id: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string | Record<string, any>; // Can be structured if schema provided
}
