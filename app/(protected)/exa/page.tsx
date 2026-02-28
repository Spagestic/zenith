"use client";

import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";

const SEARCH_TYPES = [
  "auto",
  "instant",
  "neural",
  "fast",
  "deep",
  "deep-reasoning",
  "deep-max",
] as const;

const CATEGORIES = [
  "company",
  "people",
  "research paper",
  "news",
  "tweet",
  "personal site",
  "financial report",
  "pdf",
  "github",
] as const;

type SearchType = (typeof SEARCH_TYPES)[number];
type Category = (typeof CATEGORIES)[number];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function ResultDisplay({ data }: { data: unknown }) {
  return (
    <pre className="whitespace-pre-wrap break-all rounded-md bg-muted p-3 text-xs max-h-125 overflow-y-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ErrorDisplay({ error }: { error: string }) {
  return (
    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
      {error}
    </div>
  );
}

// ─── Search Tab ───────────────────────────────────────────────────────────────

function SearchTest() {
  const search = useAction(api.exa.search);

  const [query, setQuery] = useState("Latest AI research papers 2025");
  const [type, setType] = useState<SearchType>("auto");
  const [numResults, setNumResults] = useState(5);
  const [category, setCategory] = useState<Category | "">("");
  const [useAutoprompt, setUseAutoprompt] = useState(false);
  const [includeDomains, setIncludeDomains] = useState("");
  const [excludeDomains, setExcludeDomains] = useState("");
  const [startPublishedDate, setStartPublishedDate] = useState("");
  const [endPublishedDate, setEndPublishedDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await search({
        query,
        type,
        numResults,
        useAutoprompt,
        ...(category ? { category } : {}),
        ...(includeDomains.trim()
          ? {
              includeDomains: includeDomains
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean),
            }
          : {}),
        ...(excludeDomains.trim()
          ? {
              excludeDomains: excludeDomains
                .split(",")
                .map((d) => d.trim())
                .filter(Boolean),
            }
          : {}),
        ...(startPublishedDate ? { startPublishedDate } : {}),
        ...(endPublishedDate ? { endPublishedDate } : {}),
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Query</label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Search type</p>
        <div className="flex flex-wrap gap-2">
          {SEARCH_TYPES.map((t) => (
            <Badge
              key={t}
              variant={t === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setType(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Category (optional)</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={category === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategory("")}
          >
            none
          </Badge>
          {CATEGORIES.map((c) => (
            <Badge
              key={c}
              variant={c === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Num results</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={numResults}
            onChange={(e) => setNumResults(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="flex items-end gap-2 pb-1">
          <input
            type="checkbox"
            id="autoprompt"
            checked={useAutoprompt}
            onChange={(e) => setUseAutoprompt(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="autoprompt" className="text-sm font-medium">
            Use autoprompt
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">
            Include domains{" "}
            <span className="text-muted-foreground">(comma-separated)</span>
          </label>
          <Input
            value={includeDomains}
            onChange={(e) => setIncludeDomains(e.target.value)}
            placeholder="arxiv.org, nature.com"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Exclude domains{" "}
            <span className="text-muted-foreground">(comma-separated)</span>
          </label>
          <Input
            value={excludeDomains}
            onChange={(e) => setExcludeDomains(e.target.value)}
            placeholder="reddit.com"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Start published date</label>
          <Input
            type="date"
            value={startPublishedDate}
            onChange={(e) => setStartPublishedDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">End published date</label>
          <Input
            type="date"
            value={endPublishedDate}
            onChange={(e) => setEndPublishedDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Search
      </Button>

      {error && <ErrorDisplay error={error} />}
      {result !== null && <ResultDisplay data={result} />}
    </div>
  );
}

// ─── Search + Contents Tab ────────────────────────────────────────────────────

function SearchAndContentsTest() {
  const searchAndContents = useAction(api.exa.searchAndContents);

  const [query, setQuery] = useState("OpenAI GPT-5");
  const [type, setType] = useState<SearchType>("auto");
  const [numResults, setNumResults] = useState(3);
  const [getText, setGetText] = useState(true);
  const [getSummary, setGetSummary] = useState(true);
  const [getHighlights, setGetHighlights] = useState(false);
  const [category, setCategory] = useState<Category | "">("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await searchAndContents({
        query,
        type,
        numResults,
        ...(getText ? { text: true } : {}),
        ...(getSummary ? { summary: true } : {}),
        ...(getHighlights ? { highlights: true } : {}),
        ...(category ? { category } : {}),
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Query</label>
        <Textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={2}
          className="mt-1"
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Search type</p>
        <div className="flex flex-wrap gap-2">
          {SEARCH_TYPES.map((t) => (
            <Badge
              key={t}
              variant={t === type ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setType(t)}
            >
              {t}
            </Badge>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Category (optional)</p>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={category === "" ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setCategory("")}
          >
            none
          </Badge>
          {CATEGORIES.map((c) => (
            <Badge
              key={c}
              variant={c === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setCategory(c)}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Num results</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={numResults}
            onChange={(e) => setNumResults(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="flex flex-col gap-2 justify-end pb-1">
          {(
            [
              ["getText", getText, setGetText, "Include text"],
              ["getSummary", getSummary, setGetSummary, "Include summary"],
              [
                "getHighlights",
                getHighlights,
                setGetHighlights,
                "Include highlights",
              ],
            ] as [string, boolean, (v: boolean) => void, string][]
          ).map(([id, val, setter, label]) => (
            <div key={id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={id}
                checked={val}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Search & Get Contents
      </Button>

      {error && <ErrorDisplay error={error} />}
      {result !== null && <ResultDisplay data={result} />}
    </div>
  );
}

// ─── Get Contents Tab ─────────────────────────────────────────────────────────

function GetContentsTest() {
  const getContents = useAction(api.exa.getContents);

  const [urls, setUrls] = useState(
    "https://en.wikipedia.org/wiki/Artificial_intelligence",
  );
  const [getText, setGetText] = useState(true);
  const [getSummary, setGetSummary] = useState(true);
  const [getHighlights, setGetHighlights] = useState(false);
  const [livecrawl, setLivecrawl] = useState<"never" | "always" | "fallback">(
    "fallback",
  );

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const urlList = urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const res = await getContents({
        urls: urlList,
        ...(getText ? { text: true } : {}),
        ...(getSummary ? { summary: true } : {}),
        ...(getHighlights ? { highlights: true } : {}),
        livecrawl: livecrawl,
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          URLs{" "}
          <span className="text-muted-foreground">(one per line, max 100)</span>
        </label>
        <Textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={4}
          className="mt-1 font-mono text-xs"
          placeholder="https://example.com"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["chk-text", getText, setGetText, "Include text"],
            ["chk-summary", getSummary, setGetSummary, "Include summary"],
            [
              "chk-highlights",
              getHighlights,
              setGetHighlights,
              "Include highlights",
            ],
          ] as [string, boolean, (v: boolean) => void, string][]
        ).map(([id, val, setter, label]) => (
          <div key={id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={id}
              checked={val}
              onChange={(e) => setter(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Livecrawl</p>
        <div className="flex flex-wrap gap-2">
          {(["never", "fallback", "always"] as const).map((opt) => (
            <Badge
              key={opt}
              variant={opt === livecrawl ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setLivecrawl(opt)}
            >
              {opt}
            </Badge>
          ))}
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Get Contents
      </Button>

      {error && <ErrorDisplay error={error} />}
      {result !== null && <ResultDisplay data={result} />}
    </div>
  );
}

// ─── Subpages Tab ─────────────────────────────────────────────────────────────

function SubpagesTest() {
  const getContentsWithSubpages = useAction(api.exa.getContentsWithSubpages);

  const [url, setUrl] = useState("https://openai.com");
  const [subpages, setSubpages] = useState(5);
  const [subpageTarget, setSubpageTarget] = useState("research, blog");
  const [getText, setGetText] = useState(true);
  const [getSummary, setGetSummary] = useState(true);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const targets = subpageTarget
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await getContentsWithSubpages({
        url,
        subpages,
        ...(targets.length > 0 ? { subpageTarget: targets } : {}),
        ...(getText ? { text: true } : {}),
        ...(getSummary ? { summary: true } : {}),
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Base URL</label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="mt-1 font-mono text-xs"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">
            Subpages <span className="text-muted-foreground">(1–50)</span>
          </label>
          <Input
            type="number"
            min={1}
            max={50}
            value={subpages}
            onChange={(e) => setSubpages(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">
            Target keywords{" "}
            <span className="text-muted-foreground">(comma-separated)</span>
          </label>
          <Input
            value={subpageTarget}
            onChange={(e) => setSubpageTarget(e.target.value)}
            placeholder="blog, research"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {(
          [
            ["sp-text", getText, setGetText, "Include text"],
            ["sp-summary", getSummary, setGetSummary, "Include summary"],
          ] as [string, boolean, (v: boolean) => void, string][]
        ).map(([id, val, setter, label]) => (
          <div key={id} className="flex items-center gap-2">
            <input
              type="checkbox"
              id={id}
              checked={val}
              onChange={(e) => setter(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor={id} className="text-sm font-medium">
              {label}
            </label>
          </div>
        ))}
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Crawl Subpages
      </Button>

      {error && <ErrorDisplay error={error} />}
      {result !== null && (
        <div className="space-y-3">
          {/* Crawl summary */}
          {(result as { crawlSummary?: Record<string, unknown> })
            .crawlSummary && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Crawl Summary
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(
                  (result as { crawlSummary: Record<string, unknown> })
                    .crawlSummary,
                ).map(([k, v]) => (
                  <Badge key={k} variant="secondary">
                    {k}: {String(v)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Full Response
            </p>
            <ResultDisplay data={result} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Batch Tab ────────────────────────────────────────────────────────────────

function BatchTest() {
  const batchGetContents = useAction(api.exa.batchGetContents);

  const [urls, setUrls] = useState(
    "https://en.wikipedia.org/wiki/Machine_learning\nhttps://en.wikipedia.org/wiki/Deep_learning",
  );
  const [batchSize, setBatchSize] = useState(10);
  const [getText, setGetText] = useState(true);
  const [getSummary, setGetSummary] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const urlList = urls
        .split("\n")
        .map((u) => u.trim())
        .filter(Boolean);
      const res = await batchGetContents({
        urls: urlList,
        batchSize,
        ...(getText ? { text: true } : {}),
        ...(getSummary ? { summary: true } : {}),
      });
      setResult(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">
          URLs{" "}
          <span className="text-muted-foreground">
            (one per line, max 1000)
          </span>
        </label>
        <Textarea
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          rows={6}
          className="mt-1 font-mono text-xs"
          placeholder="https://example.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium">Batch size</label>
          <Input
            type="number"
            min={1}
            max={100}
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="mt-1"
          />
        </div>
        <div className="flex flex-col gap-2 justify-end pb-1">
          {(
            [
              ["b-text", getText, setGetText, "Include text"],
              ["b-summary", getSummary, setGetSummary, "Include summary"],
            ] as [string, boolean, (v: boolean) => void, string][]
          ).map(([id, val, setter, label]) => (
            <div key={id} className="flex items-center gap-2">
              <input
                type="checkbox"
                id={id}
                checked={val}
                onChange={(e) => setter(e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor={id} className="text-sm font-medium">
                {label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={run} disabled={loading}>
        {loading && <Spinner className="mr-2 h-4 w-4" />}
        Batch Scrape
      </Button>

      {error && <ErrorDisplay error={error} />}
      {result !== null && (
        <div className="space-y-3">
          {/* Stats row */}
          {(() => {
            const r = result as {
              totalUrls?: number;
              successfulScrapes?: number;
              failedBatches?: number;
            };
            return (
              <div className="flex flex-wrap gap-2">
                {r.totalUrls !== undefined && (
                  <Badge variant="secondary">Total: {r.totalUrls}</Badge>
                )}
                {r.successfulScrapes !== undefined && (
                  <Badge variant="default">
                    Scraped: {r.successfulScrapes}
                  </Badge>
                )}
                {r.failedBatches !== undefined && r.failedBatches > 0 && (
                  <Badge variant="destructive">
                    Failed batches: {r.failedBatches}
                  </Badge>
                )}
              </div>
            );
          })()}
          <ResultDisplay data={result} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExaTestPage() {
  return (
    <div className="container mx-auto max-w-4xl py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Exa API Tester</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Test Convex actions for search, content retrieval, and batch scraping
          via Exa.
        </p>
      </div>

      <Tabs defaultValue="search">
        <TabsList className="mb-6">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="search-contents">Search + Contents</TabsTrigger>
          <TabsTrigger value="contents">Get Contents</TabsTrigger>
          <TabsTrigger value="subpages">Subpages</TabsTrigger>
          <TabsTrigger value="batch">Batch</TabsTrigger>
        </TabsList>

        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search</CardTitle>
              <CardDescription>
                Calls <code>api.exa.search</code> — returns matching URLs with
                metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search-contents">
          <Card>
            <CardHeader>
              <CardTitle>Search &amp; Contents</CardTitle>
              <CardDescription>
                Calls <code>api.exa.searchAndContents</code> — search and
                retrieve full page content in one call.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SearchAndContentsTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contents">
          <Card>
            <CardHeader>
              <CardTitle>Get Contents</CardTitle>
              <CardDescription>
                Calls <code>api.exa.getContents</code> — scrape one or more URLs
                directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <GetContentsTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subpages">
          <Card>
            <CardHeader>
              <CardTitle>Get Contents with Subpages</CardTitle>
              <CardDescription>
                Calls <code>api.exa.getContentsWithSubpages</code> — crawl a
                base URL and its linked subpages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubpagesTest />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batch">
          <Card>
            <CardHeader>
              <CardTitle>Batch Get Contents</CardTitle>
              <CardDescription>
                Calls <code>api.exa.batchGetContents</code> — scrape many URLs
                in parallel batches.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BatchTest />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
