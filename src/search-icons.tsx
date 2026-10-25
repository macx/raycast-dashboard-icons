import { Action, ActionPanel, Grid, Icon, LaunchProps } from "@raycast/api";
import { showFailureToast, useCachedPromise } from "@raycast/utils";
import { useRef, useState } from "react";
import { IconDetail } from "./components/IconDetail";
import { copyIconFile, preferences } from "./lib/actions";
import { FORMAT_LABELS, primaryFile, SOURCE_LABELS } from "./lib/icons";
import { dashboardIcons } from "./lib/mcp";
import { SearchResult, Source, SOURCES } from "./lib/types";

type SourceFilter = "all" | Source;

function isSourceFilter(value: string): value is SourceFilter {
  return value === "all" || SOURCES.includes(value as Source);
}

async function quickCopy(result: SearchResult) {
  try {
    const details = await dashboardIcons.getIcon(result.name, result.source);
    const file = details.found ? primaryFile(details.icon, preferences().defaultFormat) : undefined;
    if (!file) throw new Error(`No downloadable file found for ${result.title}`);
    await copyIconFile(file);
  } catch (error) {
    await showFailureToast(error, { title: "Could not copy icon" });
  }
}

function SourceDropdown({ onChange }: { onChange: (value: SourceFilter) => void }) {
  return (
    <Grid.Dropdown
      tooltip="Icon Source"
      storeValue
      onChange={(value) => onChange(isSourceFilter(value) ? value : "all")}
    >
      <Grid.Dropdown.Item title="All Sources" value="all" icon={Icon.AppWindowGrid3x3} />
      <Grid.Dropdown.Section>
        {SOURCES.map((source) => (
          <Grid.Dropdown.Item key={source} title={SOURCE_LABELS[source]} value={source} />
        ))}
      </Grid.Dropdown.Section>
    </Grid.Dropdown>
  );
}

export default function Command(props: LaunchProps<{ arguments: Arguments.SearchIcons }>) {
  const [searchText, setSearchText] = useState(props.arguments.query?.trim() ?? "");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");
  const { defaultFormat } = preferences();
  const abortable = useRef<AbortController>(null);

  const { data, isLoading } = useCachedPromise(
    (query: string, filter: SourceFilter) =>
      dashboardIcons.searchIcons(query, {
        sources: filter === "all" ? undefined : [filter],
        signal: abortable.current?.signal,
      }),
    [searchText, sourceFilter],
    {
      abortable,
      execute: searchText.trim().length > 0,
      keepPreviousData: true,
      failureToastOptions: { title: "Search failed" },
    },
  );

  const query = searchText.trim();
  const results = query ? (data ?? []) : [];

  return (
    <Grid
      columns={6}
      inset={Grid.Inset.Medium}
      isLoading={isLoading}
      searchText={searchText}
      onSearchTextChange={setSearchText}
      throttle
      searchBarPlaceholder="Search icons, e.g. ntfy, Jellyfin, Home Assistant"
      searchBarAccessory={<SourceDropdown onChange={setSourceFilter} />}
    >
      {!query ? (
        <Grid.EmptyView
          icon="extension-icon.png"
          title="Search Dashboard Icons"
          description="Type an app or service name to find its icon."
        />
      ) : (
        !isLoading && (
          <Grid.EmptyView
            icon={Icon.MagnifyingGlass}
            title="No Icons Found"
            description={`Nothing matches “${query}”. Try a shorter or alternative name.`}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser
                  title="Search on Website"
                  url={`https://dashboardicons.com/icons?q=${encodeURIComponent(query)}`}
                />
              </ActionPanel>
            }
          />
        )
      )}
      {results.map((result) => (
        <Grid.Item
          key={`${result.source}:${result.name}`}
          content={{ value: { source: result.previewUrl }, tooltip: result.title }}
          title={result.title}
          subtitle={result.source === "native" ? undefined : SOURCE_LABELS[result.source]}
          actions={
            <ActionPanel title={result.title}>
              <Action.Push
                title="Show Formats and Variants"
                icon={Icon.AppWindowList}
                target={<IconDetail name={result.name} source={result.source} title={result.title} />}
              />
              <Action
                title={`Copy Base ${FORMAT_LABELS[defaultFormat]} File`}
                icon={Icon.Clipboard}
                shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
                onAction={() => quickCopy(result)}
              />
              <Action.OpenInBrowser
                title="Open Icon Page"
                url={
                  result.source === "native"
                    ? `https://dashboardicons.com/icons/${result.name}`
                    : `https://dashboardicons.com/icons/external/${result.source}/${result.name}`
                }
              />
              <Action.CopyToClipboard
                title="Copy Icon Name"
                content={result.name}
                shortcut={{ modifiers: ["cmd", "shift"], key: "n" }}
              />
            </ActionPanel>
          }
        />
      ))}
    </Grid>
  );
}
