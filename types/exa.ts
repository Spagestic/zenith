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

export interface ExaScrapedContent {
  url: string;
  id: string;
  title?: string;
  author?: string;
  publishedDate?: string;
  text?: string;
  highlights?: string[];
  highlightScores?: number[];
  summary?: string;
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
