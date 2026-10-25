<p align="center">
  <img src="media/extension-icon.png" width="256" height="256" alt="Dashboard Icons extension icon">
</p>

<h1 align="center">Dashboard Icons for Raycast</h1>

<p align="center">
  Search <a href="https://dashboardicons.com">dashboardicons.com</a> from Raycast and copy or save icons for your homelab dashboard, app directory, or docs.
</p>

> [!NOTE]
> This is an independent, unofficial extension. It is not made by, affiliated with, or endorsed by Homarr Labs or the Dashboard Icons project. The extension icon is the Dashboard Icons logo, used under the Apache License 2.0 to identify the service. All rights to the Dashboard Icons name and logo remain with their owners. See [NOTICE](NOTICE).

## Features

- Search the Dashboard Icons catalog, and optionally selfh.st, LobeHub, and Simple Icons.
- See every variant (Base, Light, Dark, wordmarks, and custom variants) in every available format (WebP, PNG, SVG), each with a preview.
- Copy an icon file to the clipboard (WebP by default), save it to a folder, or copy its URL or SVG code.
- Shows license and attribution for icons from external catalogs.

The extension uses the public endpoint of the official Dashboard Icons MCP server (`https://dashboardicons.com/api/mcp/public`), so results, formats, and variants match the website. It needs no account, no API key, and no Raycast Pro. According to the [Dashboard Icons privacy policy](https://dashboardicons.com/privacy), the public endpoint collects no analytics.

## Install from the Raycast Store

1. Open the [Dashboard Icons page in the Raycast Store](https://www.raycast.com/macx/dashboard-icons) and click **Install Extension**.
   Alternatively, open the **Store** command in Raycast, search for "Dashboard Icons", and press `⌘↵`.
2. Run **Search Icons** from Raycast's root search.

Tip: Give the command an alias such as `icons` in Raycast Settings → Extensions. Then type `icons`, press `Tab`, enter an app name, and press `Enter`.

## Usage

1. Open **Search Icons**, press `Tab`, and type an app name such as `ntfy`.
2. Press `Enter` on an icon to see all variants and formats.
3. Press `Enter` again to copy the selected file, or press `⌘K` for more actions.

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

### Preferences

- **Default Format**: format listed first and used by the quick copy action (WebP by default).
- **Download Folder**: where Save puts files (your Downloads folder by default). Existing files are never overwritten.

## Development

Requirements: [Raycast](https://raycast.com) and Node.js 22.22.2 or later.

```bash
git clone https://github.com/macx/raycast-dashboard-icons.git
cd raycast-dashboard-icons
npm install
npm run dev
```

`npm run dev` adds the extension to Raycast in development mode with hot reloading. Stop it with `⌃C`; the extension stays in Raycast.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Develop in Raycast |
| `npm test` | Unit tests (offline, against an in-memory MCP server) |
| `npm run test:live` | Contract tests against the real Dashboard Icons MCP server |
| `npm run lint` | Raycast lint (manifest, icons, ESLint, Prettier) |
| `npm run build` | Distribution build, also generates `raycast-env.d.ts` |
| `npm run typecheck` | TypeScript check (run `npm run build` once first) |

## Contributing

Issues and pull requests are welcome.

1. Fork the repository and create a branch.
2. Make your change and add or update tests.
3. Run `npm run lint`, `npm run build`, and `npm test`.
4. Open a pull request against `main`. CI runs the same checks.

Releases to the Raycast Store are published by the maintainer with `npm run publish`, which opens a pull request in [raycast/extensions](https://github.com/raycast/extensions).

## License

The extension code is licensed under the [MIT License](LICENSE). The Dashboard Icons logo and all icons shown by the extension belong to their respective owners; see [NOTICE](NOTICE).
