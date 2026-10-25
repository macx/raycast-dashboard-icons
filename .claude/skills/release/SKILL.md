---
name: release
description: Publish a new version of the extension to the Raycast Store. Maintainer only; verifies ownership first. Use when the maintainer asks to release, publish, or ship the extension.
disable-model-invocation: true
---

# Release to the Raycast Store

Only the maintainer of `macx/raycast-dashboard-icons` can release. Follow these steps in order and stop at the first failure.

1. **Verify ownership.** Run `./scripts/check-owner.sh`. If it fails, stop, show its message, and explain that contributors open pull requests instead. Do not edit, skip or work around the script.
2. **Check the changelog.** The top entry of `CHANGELOG.md` must describe the unreleased changes and use `{PR_MERGE_DATE}` as its date. Compare it with `git log` since the last `v*` tag (or since the first commit if there is none). If entries are missing, draft them, show them to the user, and commit only after the user agrees.
3. **Check screenshots.** If the UI changed since the last release, ask whether `metadata/` needs new screenshots (see the `screenshots` skill). Do not block on it if the user says no.
4. **Pull Store-side contributions**, unless this is the first release (the extension is not on https://www.raycast.com/macx/dashboard-icons yet): `npm run pull-contributions`. If it brings in changes, run the checks again, commit, and push.
5. **Run all checks:** `npm run check`. Every step must pass, including the live tests.
6. **Confirm with the user.** Summarize what will be published (changelog entry, commit, screenshot count) and ask for an explicit go. Publishing opens or updates a public pull request in `raycast/extensions`.
7. **Publish:** `npm run publish`. It may ask the user to sign in with GitHub in the browser; tell them so. Report the pull request URL it prints.
8. **After the maintainer reports the merge**, tag the release: `git tag -a vYYYY.MM.DD -m "Release YYYY-MM-DD" && git push --tags`.
