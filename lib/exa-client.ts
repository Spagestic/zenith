import type {
  ExaSearchRequest,
  ExaFindSimilarRequest,
  ExaGetContentsRequest,
  ExaSearchResponse,
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
