# Dashboard Icons

Search [dashboardicons.com](https://dashboardicons.com) from Raycast and copy or save icons for your homelab dashboard, app directory, or docs.

The extension talks to the public endpoint of the official Dashboard Icons MCP server (`https://dashboardicons.com/api/mcp/public`), so search results, formats, and variants are exactly what the website offers. The public endpoint needs no account and, according to the [Dashboard Icons privacy policy](https://dashboardicons.com/privacy), collects no analytics. No Raycast Pro or AI features are required. Next to the native Dashboard Icons catalog it can also search selfh.st, LobeHub, and Simple Icons. For those, the license and attribution are shown in the details.

## Usage

1. Open **Search Icons**, press `Tab`, and type an app name such as `ntfy`.
2. Press `Enter` on an icon to see every variant (Base, Light, Dark, wordmarks, and custom variants) in every available format (WebP, PNG, SVG), each with a preview.
3. Press `Enter` again to copy the file to the clipboard, or open the action panel with `⌘K` for more actions.

| Action | Shortcut |
| --- | --- |
| Copy file | `Enter` |
| Save file to the download folder | `⌘S` |
| Copy URL | `⌘⇧C` |
| Copy SVG code (SVG only) | `⌘⌥S` |
| Open icon page | `⌘O` |
| Copy base icon directly from search | `⌘⇧Enter` |

Light variants are meant for dark backgrounds, and Dark variants for light backgrounds.

The server allows 30 searches or icon lookups per minute. If you hit the limit, wait a minute and try again.

## Preferences

- **Default Format**: format listed first and used by the quick copy action (WebP by default).
- **Download Folder**: where Save puts files (your Downloads folder by default). Existing files are never overwritten.

## Development

```bash
npm install
npm run dev        # develop in Raycast
npm test           # unit tests (offline, uses an in-memory MCP server)
npm run test:live  # contract tests against the real dashboardicons.com MCP server
npm run lint
npm run build
```

Icons are provided by [homarr-labs/dashboard-icons](https://github.com/homarr-labs/dashboard-icons) and the respective external catalogs. This extension is not affiliated with Dashboard Icons.
