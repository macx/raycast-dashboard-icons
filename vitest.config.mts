import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Tests import the SDK from the root, the extension code from extension/node_modules. Dedupe so both
    // use one copy; otherwise instanceof checks (e.g. StreamableHTTPError) fail across the two copies.
    dedupe: ["@modelcontextprotocol/sdk"],
  },
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
  },
});
