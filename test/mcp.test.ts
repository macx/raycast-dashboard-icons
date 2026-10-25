import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, CallToolResult, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { afterEach, describe, expect, it } from "vitest";
import { DashboardIconsClient, McpToolError, parseSearchResults, toolPayload } from "../src/lib/mcp";
import { iconNotFound, iconPortabase, searchGithub, searchNtfy } from "./fixtures";

type Call = { name: string; arguments: Record<string, unknown> };
type Handler = (call: Call) => CallToolResult;

/** Starts an in-process MCP server that answers tool calls with the given handler. */
function fakeServer(handler: Handler) {
  const calls: Call[] = [];
  let connections = 0;
  const client = new DashboardIconsClient(() => {
    connections++;
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = new Server({ name: "fake-dashboard-icons", version: "0.0.0" }, { capabilities: { tools: {} } });
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [] }));
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const call = { name: request.params.name, arguments: request.params.arguments ?? {} };
      calls.push(call);
      return handler(call);
    });
    void server.connect(serverTransport);
    return clientTransport;
  });
  return { client, calls, connections: () => connections };
}

const ok = (payload: Record<string, unknown>): CallToolResult => ({
  content: [{ type: "text", text: JSON.stringify(payload) }],
  structuredContent: payload,
});

let active: DashboardIconsClient | undefined;
afterEach(async () => {
  await active?.close();
  active = undefined;
});

describe("DashboardIconsClient.searchIcons", () => {
  it("calls search_icons with query, limit and analytics fields", async () => {
    const { client, calls } = fakeServer(() => ok(searchNtfy));
    active = client;
    const results = await client.searchIcons("  ntfy ");
    expect(results).toEqual([
      {
        name: "ntfy",
        title: "ntfy",
        source: "native",
        previewUrl: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/svg/ntfy.svg",
        matchedVariant: undefined,
      },
    ]);
    expect(calls).toHaveLength(1);
    expect(calls[0].name).toBe("search_icons");
    expect(calls[0].arguments).toMatchObject({ query: "ntfy", limit: 50, llm_model: "none" });
    expect(typeof calls[0].arguments.context).toBe("string");
    expect(calls[0].arguments).not.toHaveProperty("sources");
  });

  it("passes a source filter", async () => {
    const { client, calls } = fakeServer(() => ok(searchNtfy));
    active = client;
    await client.searchIcons("ntfy", { sources: ["selfhst"], limit: 10 });
    expect(calls[0].arguments).toMatchObject({ sources: ["selfhst"], limit: 10 });
  });

  it("does not call the server for an empty query", async () => {
    const { client, calls } = fakeServer(() => ok(searchNtfy));
    active = client;
    expect(await client.searchIcons("   ")).toEqual([]);
    expect(calls).toHaveLength(0);
  });

  it("reuses one connection for several calls", async () => {
    const { client, connections } = fakeServer(() => ok(searchNtfy));
    active = client;
    await client.searchIcons("ntfy");
    await client.searchIcons("github");
    expect(connections()).toBe(1);
  });

  it("turns tool errors into McpToolError", async () => {
    const { client } = fakeServer(() => ({ content: [{ type: "text", text: "Rate limited" }], isError: true }));
    active = client;
    await expect(client.searchIcons("ntfy")).rejects.toThrow(new McpToolError("search_icons", "Rate limited"));
  });
});

describe("DashboardIconsClient.getIcon", () => {
  it("returns all formats and variants", async () => {
    const { client, calls } = fakeServer(() => ok(iconPortabase));
    active = client;
    const result = await client.getIcon("portabase", "native");
    expect(calls[0]).toMatchObject({ name: "get_icon", arguments: { name: "portabase", source: "native" } });
    if (!result.found) throw new Error("expected icon");
    expect(Object.keys(result.icon.urls.webp ?? {})).toEqual([
      "default",
      "light",
      "dark",
      "wordmark-light",
      "wordmark-dark",
    ]);
    expect(result.icon.pageUrl).toBe("https://dashboardicons.com/icons/portabase");
    expect(result.icon.license).toBeNull();
  });

  it("reports unknown icons with suggestions", async () => {
    const { client } = fakeServer(() => ok(iconNotFound));
    active = client;
    expect(await client.getIcon("ntfyy")).toEqual({ found: false, didYouMean: ["ntfy"] });
  });
});

describe("parsing", () => {
  it("skips malformed search results and keeps matched variants", () => {
    const results = parseSearchResults(searchGithub);
    expect(results.map((result) => `${result.source}:${result.name}`)).toEqual([
      "native:github",
      "simpleicons:githubpages",
      "native:github",
    ]);
    expect(results[2].matchedVariant).toBe("light");
    expect(parseSearchResults(null)).toEqual([]);
  });

  it("falls back to JSON text content without structuredContent", () => {
    expect(
      toolPayload("search_icons", {
        content: [
          { type: "text", text: JSON.stringify(searchNtfy) },
          { type: "text", text: '{"conversation_id":"x"}' },
        ],
      }),
    ).toEqual(searchNtfy);
  });

  it("rejects responses without a payload", () => {
    expect(() => toolPayload("get_icon", { content: [{ type: "text", text: "not json" }] })).toThrow(McpToolError);
  });
});
