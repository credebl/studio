# Releasing Studio

Studio uses [Changesets](https://changesets.dev) for versioning, changelogs,
git tags and GitHub Releases. The package is private: nothing is published to
npm. A release bumps the version in `package.json`, prepends `CHANGELOG.md`,
creates a `vX.Y.Z` tag and opens a GitHub Release.

## Day to day: add a changeset with your PR

Every pull request that changes behaviour should include a changeset:

```bash
pnpm changeset
```

- choose the bump: `patch` for a fix, `minor` for a feature, `major` for a
  breaking change
- write a short, user-facing summary
- commit the generated `.changeset/<name>.md` with the rest of the PR

Docs-only, test-only and CI-only changes do not need a changeset.
`pnpm changeset:status` lists what is pending.

## Release PR

`.github/workflows/release.yml` runs on every push to `main`:

1. **Pending changesets exist** — the action runs `pnpm changeset:version`,
   which applies the bumps, updates `CHANGELOG.md`, deletes the consumed
   changesets and opens or updates the
   **chore(release): version packages** pull request.
2. **No changesets remain** — this is the state after the version PR merges, so
   the action runs `pnpm changeset:publish`. For this private package that
   creates the `vX.Y.Z` tag and the GitHub Release from the changelog entry.
   Nothing is sent to npm.

Merging the version PR is the release. Do not run `changeset version` on `main`
by hand unless you are recovering from a failed workflow run.

## Manual commands

| Command                  | Purpose                                      |
| ------------------------ | -------------------------------------------- |
| `pnpm changeset`         | Add a changeset interactively                |
| `pnpm changeset:status`  | Show pending changesets                      |
| `pnpm changeset:version` | Apply pending changesets locally             |
| `pnpm changeset:publish` | Tag the current version (and publish to npm) |
| `pnpm changeset:tag`     | Create git tags only                         |

## Repository settings

- In **Settings → Actions → General**, enable
  **Allow GitHub Actions to create and approve pull requests** so the action can
  open the version PR.
- The workflow needs only the repository `GITHUB_TOKEN`; it declares
  `contents: write` and `pull-requests: write`.
- Version commits are created through the GitHub API, so GitHub signs them, and
  the commit message carries a DCO `Signed-off-by` trailer.

## Configuration

`.changeset/config.json`:

- `baseBranch: main`
- `privatePackages.version` and `privatePackages.tag` are enabled, so the
  private app is versioned and tagged like a published package.
- the changelog uses the default Changesets CLI generator.

## Release candidates

A release candidate is cut by hand, outside the Changesets flow, so that it can
be tested with the matching platform and agent-controller candidates first.

1. Open a `chore(release): vX.Y.Z-rc.N` pull request that sets `package.json`
   to `X.Y.Z-rc.N` and adds the release notes to the PR description. Leave the
   pending changesets in place: they become the changelog of the final release.
2. After it merges, the release workflow only updates the
   **chore(release): version packages** pull request, which now proposes the
   final `X.Y.Z`. It does not tag the candidate. Do not merge the version PR
   until the candidate has passed testing.
3. Tag `vX.Y.Z-rc.N` on the merge commit and publish a GitHub Release from it
   marked **pre-release**, not Latest, with the notes from the PR.
4. Deploy with `NEXT_PUBLIC_CURRENT_RELEASE=vX.Y.Z-rc.N` so Developer settings
   shows the candidate's version.

Merging the version PR releases the final `X.Y.Z`.
