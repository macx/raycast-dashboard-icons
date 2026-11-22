---
name: validate
description: Run every check for this Raycast extension (lint, build, typecheck, unit and live tests) and review it against the Raycast Store checklist. Use before opening a pull request, before a release, or when asked whether the extension is ready.
---

# Validate the extension

1. Run `npm run check` (lint, build, typecheck, unit tests, live tests). Report each step's result. On failure, show the relevant output and fix it if the cause is clear.
2. If the network or the MCP server is unavailable, run `npm run lint && npm run build && npm run typecheck && npm test` and say that the live tests were skipped.
3. Review the Store checklist and report each item as OK or a finding with file and line:
   - `extension/package.json`: no `version` field, no command `subtitle` that repeats the extension title, `author`, `license: MIT`, categories in Title Case, command title `<verb> <noun>`, description one sentence, `platforms` correct, preferences with placeholders.
   - Icons: `extension/assets/extension-icon.png` and `@dark` variant are 512 × 512 PNG; no unused files in `extension/assets/`.
   - `extension/CHANGELOG.md`: newest entry on top, `## [Title] - {PR_MERGE_DATE}` format.
   - Store content: `extension/` holds only what Store users run (`src/`, `assets/`, `metadata/`, `README.md`, `CHANGELOG.md`, manifest, lockfile and lint/TypeScript config). No tests, test tooling, `CLAUDE.md`, `.claude/`, `.mcp.json`, `LICENSE`, scripts or contributor docs; those stay at the repository root. `extension/README.md` is the Store page: user-facing only, no development, contributing or release sections, no images from `metadata/` or `assets/`.
   - `extension/metadata/`: 1–6 PNG screenshots, 2000 × 1250 (check with `sips -g pixelWidth -g pixelHeight`), one theme.
   - UI: Title Case action titles, icons on all or no actions, search bar placeholder, empty views, no navigation title on the root command, US English.
   - No external analytics, no secrets, `package-lock.json` committed.
4. For a deeper review, delegate to the `store-validator` agent. For security-relevant changes, also run the `security-reviewer` agent.

Summarize: ready or not, and the list of findings.
