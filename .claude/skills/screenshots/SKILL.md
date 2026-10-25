---
name: screenshots
description: Guide the user through taking Raycast Store screenshots of this extension with Raycast 2's Capture Window command and add them to metadata/ and the README. Use when screenshots are missing, outdated, or the user asks how to take them.
---

# Store screenshots

Screenshots cannot be taken reliably by Claude; the user takes them in Raycast, Claude checks and files them.

## What the user does

1. One-time setup: Raycast Settings (`⌘,`) → Extensions → search "Capture Window" (built-in Raycast command) → set a hotkey, for example `⌘⇧⌥M`. Optionally pick a custom wallpaper there; otherwise the desktop wallpaper is used. macOS must allow Raycast under System Settings → Privacy & Security → Screen & System Audio Recording.
2. Run `npm run dev`, open **Search Icons**, set up the view, press the hotkey, choose **Save to Metadata**.
3. Use the same theme and background for all screenshots. A Retina display gives sharper results. No personal data in the window.

If CleanShot X is installed, Raycast may hand the capture to CleanShot, and the file lands in CleanShot's folder (by default `~/Pictures/CleanShot X/`, named `Raycast <date>.png`) instead of `metadata/`.

## Recommended set

1. Search grid with many results (for example `home`).
2. Detail view of an icon with variants (`portabase`, a Light or Dark entry selected) showing the preview, About text and author.
3. The action panel (`⌘K`) in the detail view.
4. Optional: an external catalog icon with license (source dropdown → Simple Icons, `github`).

## What Claude does

1. Find new captures: files in `metadata/`, or recent `Raycast *.png` files in the CleanShot folder. Ask before copying files from outside the repository.
2. Check each one is a 2000 × 1250 PNG (`sips -g pixelWidth -g pixelHeight <file>`) and look at it for personal data or other apps.
3. Copy them into `metadata/` as `dashboard-icons-<n>-<subject>.png` in the order above, for example `dashboard-icons-1-search.png`, `dashboard-icons-2-variants.png`, `dashboard-icons-3-actions.png`, `dashboard-icons-4-sources.png`. The number keeps the Store order; the subject says what it shows. At most six.
4. Keep the README gallery (section "Screenshots") in sync with the files.
5. Run `npm run lint` (validates metadata) and commit.
