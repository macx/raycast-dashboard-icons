import { FORMATS, Format, IconDetails, IconFile, Source, VariantGroup } from "./types";

export const SOURCE_LABELS: Record<Source, string> = {
  native: "Dashboard Icons",
  selfhst: "selfh.st",
  lobehub: "LobeHub",
  simpleicons: "Simple Icons",
};

export const FORMAT_LABELS: Record<Format, string> = {
  webp: "WebP",
  png: "PNG",
  svg: "SVG",
};

const KNOWN_VARIANTS: { key: string; label: string; hint?: string }[] = [
  { key: "default", label: "Base" },
  { key: "light", label: "Light", hint: "For dark backgrounds" },
  { key: "dark", label: "Dark", hint: "For light backgrounds" },
  { key: "wordmark", label: "Wordmark" },
  { key: "wordmark-light", label: "Wordmark Light", hint: "For dark backgrounds" },
  { key: "wordmark-dark", label: "Wordmark Dark", hint: "For light backgrounds" },
];

export function variantLabel(key: string): string {
  const known = KNOWN_VARIANTS.find((variant) => variant.key === key);
  if (known) return known.label;
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((word) => (/^\d/.test(word) ? word.toUpperCase() : word[0].toUpperCase() + word.slice(1)))
    .join(" ");
}

function variantRank(key: string): number {
  const index = KNOWN_VARIANTS.findIndex((variant) => variant.key === key);
  return index === -1 ? KNOWN_VARIANTS.length : index;
}

/** Formats in display order: the preferred format first, then WebP, PNG, SVG. */
export function orderedFormats(preferred: Format): Format[] {
  return [preferred, ...FORMATS.filter((format) => format !== preferred)];
}

function sanitizeFileName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "icon";
}

/**
 * File name for a downloaded icon. Uses the CDN file name when the URL ends with the
 * format's extension (e.g. "portabase-dark.webp"), so saved files match dashboardicons.com.
 * Otherwise (e.g. Simple Icons URLs without extension) it is derived from the icon name.
 */
export function fileNameFor(iconName: string, variant: string, format: Format, url: string): string {
  try {
    const last = decodeURIComponent(new URL(url).pathname.split("/").pop() ?? "");
    if (last.toLowerCase().endsWith(`.${format}`) && last.length > format.length + 1) {
      return sanitizeFileName(last);
    }
  } catch {
    // Fall through to the derived name.
  }
  const suffix = variant === "default" ? "" : `-${variant}`;
  return `${sanitizeFileName(`${iconName}${suffix}`)}.${format}`;
}

/** Groups every available file of an icon by variant, ordered Base, Light, Dark, wordmarks, then custom variants. */
export function groupIconFiles(icon: IconDetails, preferred: Format = "webp"): VariantGroup[] {
  const variants = new Set<string>();
  for (const format of FORMATS) {
    for (const variant of Object.keys(icon.urls[format] ?? {})) variants.add(variant);
  }

  return [...variants]
    .sort((a, b) => variantRank(a) - variantRank(b) || a.localeCompare(b))
    .map((variant) => {
      const files: IconFile[] = [];
      for (const format of orderedFormats(preferred)) {
        const url = icon.urls[format]?.[variant];
        if (url) files.push({ variant, format, url, fileName: fileNameFor(icon.name, variant, format, url) });
      }
      const known = KNOWN_VARIANTS.find((entry) => entry.key === variant);
      return { variant, label: variantLabel(variant), hint: known?.hint, files };
    })
    .filter((group) => group.files.length > 0);
}

/** The file used by quick actions: the base variant in the preferred format, falling back to any available file. */
export function primaryFile(icon: IconDetails, preferred: Format = "webp"): IconFile | undefined {
  const groups = groupIconFiles(icon, preferred);
  return groups.find((group) => group.variant === "default")?.files[0] ?? groups[0]?.files[0];
}

export function availableFormats(icon: IconDetails): Format[] {
  return FORMATS.filter((format) => Object.keys(icon.urls[format] ?? {}).length > 0);
}
