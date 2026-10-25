import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { FORMATS, IconDetails, IconLicense, IconUrls, SearchResult, Source, SOURCES } from "./types";

/** Official dashboardicons.com MCP server (Streamable HTTP). */
export const MCP_URL = "https://dashboardicons.com/api/mcp";

const CLIENT_INFO = { name: "raycast-dashboard-icons", version: "1.0.0" };
const REQUEST_TIMEOUT_MS = 15_000;

// The server asks every tool call for a purpose description and the calling model, for its own analytics.
// This extension is not an AI agent, so it sends a fixed, generic description and no model.
const ANALYTICS = {
  search_icons: "A Raycast extension user searches the icon catalog to find an icon for a dashboard or app directory.",
  get_icon: "A Raycast extension user opens one icon to list its formats and variants and copy or save a file.",
} as const;
const LLM_MODEL = "none";

export class McpToolError extends Error {
  constructor(
    readonly tool: string,
    message: string,
  ) {
    super(message);
    this.name = "McpToolError";
  }
}

export type GetIconResult = { found: true; icon: IconDetails } | { found: false; didYouMean: string[] };

export interface SearchOptions {
  sources?: Source[];
  limit?: number;
  signal?: AbortSignal;
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function str(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function source(value: unknown): Source {
  return SOURCES.includes(value as Source) ? (value as Source) : "native";
}

export function parseSearchResults(content: unknown): SearchResult[] {
  if (!isObject(content) || !Array.isArray(content.results)) return [];
  return content.results.flatMap((item): SearchResult[] => {
    if (!isObject(item)) return [];
    const name = str(item.name);
    const previewUrl = str(item.preview_url);
    if (!name || !previewUrl) return [];
    const matchedVariant = isObject(item.matched_variant) ? (str(item.matched_variant.key) ?? undefined) : undefined;
    return [{ name, title: str(item.title) ?? name, source: source(item.source), previewUrl, matchedVariant }];
  });
}

function parseLicense(value: unknown): IconLicense | null {
  if (!isObject(value)) return null;
  const name = str(value.name);
  if (!name) return null;
  return {
    name,
    url: str(value.url),
    attribution: str(value.attribution),
    sourceUrl: str(value.source_url),
    provider: str(value.provider) ?? "",
    providerUrl: str(value.provider_url) ?? "",
  };
}

function parseUrls(value: unknown): IconUrls {
  const urls: IconUrls = {};
  if (!isObject(value)) return urls;
  for (const format of FORMATS) {
    const variants = value[format];
    if (!isObject(variants)) continue;
    const entries = Object.entries(variants).filter((entry): entry is [string, string] => !!str(entry[1]));
    if (entries.length > 0) urls[format] = Object.fromEntries(entries);
  }
  return urls;
}

export function parseGetIcon(content: unknown): GetIconResult {
  if (!isObject(content) || content.found !== true || !isObject(content.icon)) {
    return { found: false, didYouMean: isObject(content) ? strings(content.did_you_mean) : [] };
  }
  const icon = content.icon;
  const name = str(icon.name);
  if (!name) return { found: false, didYouMean: [] };
  const src = source(icon.source);
  return {
    found: true,
    icon: {
      name,
      title: str(icon.title) ?? name,
      source: src,
      previewUrl: str(icon.preview_url) ?? "",
      pageUrl:
        str(icon.page_url) ??
        (src === "native"
          ? `https://dashboardicons.com/icons/${name}`
          : `https://dashboardicons.com/icons/external/${src}/${name}`),
      aliases: strings(icon.aliases),
      categories: strings(icon.categories),
      author: str(icon.author),
      updatedAt: str(icon.updated_at),
      license: parseLicense(icon.license),
      urls: parseUrls(icon.urls),
    },
  };
}

/** Extracts the tool's JSON payload, preferring structuredContent and falling back to the first JSON text block. */
export function toolPayload(tool: string, result: unknown): unknown {
  if (!isObject(result)) throw new McpToolError(tool, "Empty response from the Dashboard Icons server");
  const texts = Array.isArray(result.content)
    ? result.content
        .filter((block): block is { type: "text"; text: string } => isObject(block) && typeof block.text === "string")
        .map((block) => block.text)
    : [];
  if (result.isError === true) {
    throw new McpToolError(tool, texts[0] || `The Dashboard Icons server could not run ${tool}`);
  }
  if (isObject(result.structuredContent)) return result.structuredContent;
  for (const text of texts) {
    try {
      return JSON.parse(text);
    } catch {
      // Not JSON, try the next block.
    }
  }
  throw new McpToolError(tool, "Unexpected response from the Dashboard Icons server");
}

export class DashboardIconsClient {
  private connection?: Promise<Client>;

  constructor(
    private readonly createTransport: () => Transport = () => new StreamableHTTPClientTransport(new URL(MCP_URL)),
  ) {}

  private connect(): Promise<Client> {
    if (!this.connection) {
      const client = new Client(CLIENT_INFO);
      this.connection = client
        .connect(this.createTransport(), { timeout: REQUEST_TIMEOUT_MS })
        .then(() => client)
        .catch((error) => {
          this.connection = undefined;
          throw error;
        });
    }
    return this.connection;
  }

  async close(): Promise<void> {
    const connection = this.connection;
    this.connection = undefined;
    if (connection) await (await connection).close().catch(() => undefined);
  }

  private async callTool(name: keyof typeof ANALYTICS, args: JsonObject, signal?: AbortSignal): Promise<unknown> {
    const call = async () => {
      const client = await this.connect();
      return client.callTool(
        { name, arguments: { ...args, context: ANALYTICS[name], llm_model: LLM_MODEL } },
        undefined,
        { signal, timeout: REQUEST_TIMEOUT_MS },
      );
    };

    let result: unknown;
    try {
      result = await call();
    } catch (error) {
      if (signal?.aborted) throw error;
      // A dropped session or connection is recovered once with a fresh connection.
      await this.close();
      result = await call();
    }
    return toolPayload(name, result);
  }

  async searchIcons(query: string, options: SearchOptions = {}): Promise<SearchResult[]> {
    const trimmed = query.trim().slice(0, 100);
    if (!trimmed) return [];
    const args: JsonObject = { query: trimmed, limit: options.limit ?? 50 };
    if (options.sources && options.sources.length > 0) args.sources = options.sources;
    return parseSearchResults(await this.callTool("search_icons", args, options.signal));
  }

  async getIcon(name: string, iconSource?: Source, signal?: AbortSignal): Promise<GetIconResult> {
    const args: JsonObject = { name };
    if (iconSource) args.source = iconSource;
    return parseGetIcon(await this.callTool("get_icon", args, signal));
  }
}

export const dashboardIcons = new DashboardIconsClient();
