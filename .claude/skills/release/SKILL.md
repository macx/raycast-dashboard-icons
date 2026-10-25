---
name: release
description: Publish a new version of the extension to the Raycast Store. Maintainer only; verifies ownership first. Use when the maintainer asks to release, publish, or ship the extension.
disable-model-invocation: true
---

# Release to the Raycast Store

Only the maintainer of `macx/raycast-dashboard-icons` can release. `main` is protected: every change reaches it through a pull request with passing CI, merged by the maintainer. Follow these steps in order and stop at the first failure.

## 1. Verify ownership

If the current branch is not `main`: when the working tree is clean, tell the user and run `git switch main && git pull --rebase --autostash` (typical after a merged pull request); when it has uncommitted changes, stop and ask the user how to handle them.

Then run `./scripts/check-owner.sh`. If it fails, stop, show its message, and explain that contributors open pull requests instead. Do not edit, skip or work around the script. (It also requires a clean `main` in sync with `origin`.)

## 2. Pull Store-side contributions

Skip if the extension is not in the Store yet (`gh api repos/raycast/extensions/contents/extensions/dashboard-icons` returns 404). Otherwise run the `pull-contributions` skill first and continue only after its pull request is merged.

## 3. Choose the version

1. Read the current version from `package.json` and the last tag (`git describe --tags --abbrev=0`, may not exist before the first release).
2. Summarize the changes since that tag (`git log <tag>..HEAD --oneline`, or all commits before the first release).
3. Propose a Semantic Versioning bump with a reason: patch for bug fixes only, minor for new features, major for changes that break existing behavior (removed actions, changed defaults, renamed command). Ask the user to confirm or pick another.

## 4. Prepare the release pull request

Skip this step if `package.json` already has the chosen version and the top `CHANGELOG.md` entry is `## [<version>] - {PR_MERGE_DATE}` with matching notes (for example the first release, `1.0.0`).

1. `git switch -c release/v<version>`
2. `npm version <version> --no-git-tag-version`
3. Add a `CHANGELOG.md` entry at the top: `## [<version>] - {PR_MERGE_DATE}` followed by user-facing bullet points. Show it to the user and adjust until they agree.
4. Run `npm run check`.
5. Commit (`Release v<version>`), push, open a pull request, wait for CI, and ask the maintainer to merge it. Continue after the merge, then `git switch main && git pull --rebase --autostash`.

## 5. Screenshots

If the UI changed since the last release, ask whether `metadata/` needs new screenshots (see the `screenshots` skill). Do not block if the user says no.

## 6. Publish

1. Run `./scripts/check-owner.sh` again (now on the merged `main`).
2. Run `npm run check`. Every step must pass, including the live tests.
3. Summarize what will be published (version, changelog entry, commit, screenshot count) and ask for an explicit go. Publishing opens or updates a public pull request in `raycast/extensions`.
4. Run `npm run publish`. It may ask the user to sign in with GitHub in the browser; tell them so. Report the pull request URL it prints.

Fixes requested during Raycast's review belong to the same version: make them on a branch, merge through a pull request here, then run `npm run publish` again to update the same Raycast pull request.

## 7. After Raycast merges

When the maintainer reports that Raycast merged the pull request, tag the commit that was published last and create the GitHub release:

```bash
git tag -a v<version> -m "v<version>" <commit>
git push origin v<version>
gh release create v<version> --title "v<version>" --notes "<changelog entry>

Raycast Store: https://www.raycast.com/macx/dashboard-icons"
```

Show the tag, commit and release notes to the user before pushing.
