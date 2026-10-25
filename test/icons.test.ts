import { describe, expect, it } from "vitest";
import {
  availableFormats,
  fileNameFor,
  groupIconFiles,
  orderedFormats,
  primaryFile,
  variantLabel,
} from "../src/lib/icons";
import { parseGetIcon } from "../src/lib/mcp";
import { IconDetails } from "../src/lib/types";
import { iconNtfy, iconPngOnly, iconPortabase, iconSimpleIcons } from "./fixtures";

function details(payload: unknown): IconDetails {
  const result = parseGetIcon(payload);
  if (!result.found) throw new Error("fixture not found");
  return result.icon;
}

describe("orderedFormats", () => {
  it("puts the preferred format first and keeps WebP, PNG, SVG order otherwise", () => {
    expect(orderedFormats("webp")).toEqual(["webp", "png", "svg"]);
    expect(orderedFormats("svg")).toEqual(["svg", "webp", "png"]);
    expect(orderedFormats("png")).toEqual(["png", "webp", "svg"]);
  });
});

describe("variantLabel", () => {
  it("labels well-known and custom variants", () => {
    expect(variantLabel("default")).toBe("Base");
    expect(variantLabel("light")).toBe("Light");
    expect(variantLabel("wordmark-dark")).toBe("Wordmark Dark");
    expect(variantLabel("4k")).toBe("4K");
    expect(variantLabel("high_contrast")).toBe("High Contrast");
  });
});

describe("fileNameFor", () => {
  it("keeps the CDN file name", () => {
    expect(
      fileNameFor(
        "portabase",
        "dark",
        "webp",
        "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/portabase-dark.webp",
      ),
    ).toBe("portabase-dark.webp");
  });

  it("derives a name when the URL has no matching extension", () => {
    expect(fileNameFor("githubpages", "default", "svg", "https://cdn.simpleicons.org/githubpages/222222")).toBe(
      "githubpages.svg",
    );
    expect(fileNameFor("githubpages", "light", "png", "https://example.com/x/dark.png")).toBe("dark.png");
    expect(fileNameFor("githubpages", "light", "svg", "https://cdn.simpleicons.org/githubpages/FFFFFF")).toBe(
      "githubpages-light.svg",
    );
  });

  it("sanitizes unsafe characters", () => {
    expect(fileNameFor("a/b c", "default", "svg", "not a url")).toBe("a-b-c.svg");
  });
});

describe("groupIconFiles", () => {
  it("offers Base as WebP, PNG and SVG for ntfy, WebP first", () => {
    const groups = groupIconFiles(details(iconNtfy));
    expect(groups.map((group) => group.label)).toEqual(["Base"]);
    expect(groups[0].files.map((file) => file.format)).toEqual(["webp", "png", "svg"]);
    expect(groups[0].files[0]).toMatchObject({
      fileName: "ntfy.webp",
      url: "https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/webp/ntfy.webp",
    });
  });

  it("offers Base, Light and Dark (plus wordmarks) for portabase", () => {
    const groups = groupIconFiles(details(iconPortabase));
    expect(groups.map((group) => group.label)).toEqual(["Base", "Light", "Dark", "Wordmark Light", "Wordmark Dark"]);
    expect(groups.find((group) => group.variant === "light")?.hint).toBe("For dark backgrounds");
    expect(groups.find((group) => group.variant === "dark")?.files.map((file) => file.fileName)).toEqual([
      "portabase-dark.webp",
      "portabase-dark.png",
      "portabase-dark.svg",
    ]);
  });

  it("respects the preferred format", () => {
    const groups = groupIconFiles(details(iconPortabase), "svg");
    expect(groups[0].files.map((file) => file.format)).toEqual(["svg", "webp", "png"]);
  });

  it("only lists formats that exist", () => {
    const icon = details(iconPngOnly);
    expect(availableFormats(icon)).toEqual(["webp", "png"]);
    expect(groupIconFiles(icon)[0].files.map((file) => file.format)).toEqual(["webp", "png"]);
  });
});

describe("primaryFile", () => {
  it("returns the base file in the preferred format", () => {
    expect(primaryFile(details(iconNtfy))?.fileName).toBe("ntfy.webp");
    expect(primaryFile(details(iconNtfy), "svg")?.fileName).toBe("ntfy.svg");
  });

  it("falls back to another format when the preferred one is missing", () => {
    expect(primaryFile(details(iconPngOnly), "svg")?.fileName).toBe("premium-mobile.webp");
    expect(primaryFile(details(iconSimpleIcons), "webp")?.fileName).toBe("brand.png");
  });
});
