import type {
  ExaSearchRequest,
  ExaFindSimilarRequest,
  ExaGetContentsRequest,
  ExaSearchResponse,
  ExaScrapeRequest,
  ExaScrapeResponse,
} from "@/types/exa";

export class ExaClient {
  private baseUrl: string;

  constructor(baseUrl: string = "/api/exa") {
    this.baseUrl = baseUrl;
  }

  async search(params: ExaSearchRequest): Promise<ExaSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Search failed");
    }

    return response.json();
  }

  async searchAndContents(
    params: ExaSearchRequest,
  ): Promise<ExaSearchResponse> {
    const response = await fetch(`${this.baseUrl}/search-and-contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Search and contents failed");
    }

    return response.json();
  }

  async findSimilar(params: ExaFindSimilarRequest): Promise<ExaSearchResponse> {
    const response = await fetch(`${this.baseUrl}/find-similar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Find similar failed");
    }

    return response.json();
  }

  async getContents(params: ExaGetContentsRequest): Promise<ExaSearchResponse> {
    const response = await fetch(`${this.baseUrl}/get-contents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Get contents failed");
    }

    return response.json();
  }

  async scrape(params: ExaScrapeRequest): Promise<ExaScrapeResponse> {
    const response = await fetch(`${this.baseUrl}/scrape`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Scrape failed");
    }

    return response.json();
  }
  async scrapeUrl(
    url: string,
    options?: Omit<ExaScrapeRequest, "url">,
  ): Promise<ExaScrapeResponse> {
    return this.scrape({ url, ...options });
  }

  async scrapeUrls(
    urls: string[],
    options?: Omit<ExaScrapeRequest, "urls">,
  ): Promise<ExaScrapeResponse> {
    return this.scrape({ urls, ...options });
  }

  async batchScrape(params: ExaScrapeRequest): Promise<ExaScrapeRequest> {
    const response = await fetch(`${this.baseUrl}/scrape/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Batch scrape failed");
    }

    return response.json();
  }

  async scrapeSimple(
    url: string,
    options?: {
      text?: boolean;
      highlights?: boolean;
      summary?: boolean;
      maxCharacters?: number;
      livecrawl?: boolean;
    },
  ): Promise<ExaScrapeResponse> {
    const params = new URLSearchParams({ url });

    if (options?.text) params.append("text", "true");
    if (options?.highlights) params.append("highlights", "true");
    if (options?.summary) params.append("summary", "true");
    if (options?.maxCharacters)
      params.append("maxCharacters", options.maxCharacters.toString());
    if (options?.livecrawl) params.append("livecrawl", "true");

    const response = await fetch(`${this.baseUrl}/scrape?${params.toString()}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Simple scrape failed");
    }

    return response.json();
  }
}

// Export singleton instance
export const exaClient = new ExaClient();

// Export individual functions for convenience
export const exaSearch = (params: ExaSearchRequest) => exaClient.search(params);
export const exaSearchAndContents = (params: ExaSearchRequest) =>
  exaClient.searchAndContents(params);
export const exaFindSimilar = (params: ExaFindSimilarRequest) =>
  exaClient.findSimilar(params);
export const exaGetContents = (params: ExaGetContentsRequest) =>
  exaClient.getContents(params);
export const exaScrape = (params: ExaScrapeRequest) => exaClient.scrape(params);
export const exaScrapeUrl = (
  url: string,
  options?: Omit<ExaScrapeRequest, "url">,
) => exaClient.scrapeUrl(url, options);
export const exaScrapeUrls = (
  urls: string[],
  options?: Omit<ExaScrapeRequest, "urls">,
) => exaClient.scrapeUrls(urls, options);
export const exaBatchScrape = (params: ExaScrapeRequest) =>
  exaClient.batchScrape(params);
export const exaScrapeSimple = (
  url: string,
  options?: Parameters<ExaClient["scrapeSimple"]>[1],
) => exaClient.scrapeSimple(url, options);
