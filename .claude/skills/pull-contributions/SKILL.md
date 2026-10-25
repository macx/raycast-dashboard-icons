---
name: pull-contributions
description: Bring changes that others made to this extension in the Raycast Store repository (raycast/extensions) into this repository through a pull request. Use before a release, when publishing fails because of contributions, or when the maintainer asks to sync Store contributions.
---

# Pull Store-side contributions

After the extension is published, anyone can open pull requests against its copy in `raycast/extensions` (`extensions/dashboard-icons`). Once Raycast merges such a change, `npm run publish` fails until the change is merged back here. `main` is protected, so the result goes through a pull request.

## 1. Check whether there is anything to pull

- If `gh api repos/raycast/extensions/contents/extensions/dashboard-icons` returns 404, the extension is not in the Store yet: report that and stop.
- Show recent Store-side changes for context: `gh api "repos/raycast/extensions/commits?path=extensions/dashboard-icons&per_page=10" --jq '.[] | .sha[0:8] + " " + .commit.author.date[0:10] + " " + (.commit.message | split("\n")[0])'`.

## 2. Sync local main

1. Note the current branch. If it is not `main`, ask before switching; uncommitted changes on a feature branch are the user's work in progress.
2. `git switch main`
3. `git pull --rebase --autostash` keeps any local, uncommitted changes and re-applies them on top. If re-applying the stash conflicts, stop and show the conflicting files.

## 3. Pull the contributions on a branch

1. If the working tree still has uncommitted changes, set them aside so they do not mix with the contributions: `git stash push --include-untracked -m "before pull-contributions"`. Remember to restore them in step 5.
2. `git switch -c chore/pull-store-contributions-$(date +%Y%m%d-%H%M)`
3. `npm run pull-contributions`. It merges the Store-side changes into the current branch.
   - If it reports conflicts, show them, propose resolutions, and resolve only with the user's agreement. Then commit the merge.
   - If nothing changed (no new commits on the branch, `git log main..HEAD` is empty), report that the repository is already in sync, switch back to `main`, delete the branch, and go to step 5.

## 4. Verify and open the pull request

1. Show what came in: `git log main..HEAD --oneline` and `git diff --stat main...HEAD`, plus the changed source files.
2. Run `npm run check`. Fix failures only after discussing them with the user.
3. Make sure the contributors' `CHANGELOG.md` entries and the `contributors` list in `package.json` survived the merge.
4. Push the branch and open a pull request titled "Pull Store contributions" that lists the incoming commits and their authors. Ask the maintainer to review and merge it.

## 5. Restore local work

Switch back to the branch the user started on. If changes were stashed in step 3, run `git stash pop` and report the result; on conflicts, stop and show them.
