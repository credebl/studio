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

The first release is `2.2.0` because the initial changeset is a `minor` bump
for the `/admin` console.
