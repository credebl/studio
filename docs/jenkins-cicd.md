# Jenkins CI/CD reference for Studio

This document describes how Jenkins should build, publish, and deploy the Studio
container image. It complements, rather than replaces, the GitHub Actions
workflows already in the repository.

## 1. Source of truth

| Concern                         | Owner                                 | File                                |
| ------------------------------- | ------------------------------------- | ----------------------------------- |
| Versioning, changelog, git tags | GitHub Actions (Changesets)           | `.github/workflows/release.yml`     |
| Production image on release     | GitHub Actions (Docker Buildx / GHCR) | `.github/workflows/build-image.yml` |
| Dev/QA image builds             | Jenkins, or Jenkins triggering GitHub | This document                       |
| Deployment to runtime hosts     | Jenkins                               | Jenkins job / pipeline              |

A published GitHub Release already triggers the production image build. Jenkins
does **not** need to rebuild the production image after a release unless your
deployment policy requires a Jenkins-owned build.

## 2. End-to-end flow

```text
Developer PR
   |
   v
merge to main
   |
   +--> release.yml (Changesets) --> version PR --> merge --> vX.Y.Z tag + GitHub Release
   |                                                      |
   |                                                      v
   |                                          build-image.yml (prod)
   |                                                      |
   |                                                      v
   |                                     ghcr.io/credebl/studio:<tag>, :latest
   |
   +--> Jenkins (manual/parameterized, dev/qa/prod) -------+
                                                           |
                                                           v
                                              Jenkins deploy stage
```

## 3. Key constraint: build-time vs runtime configuration

Next.js inlines `NEXT_PUBLIC_*` values into the JavaScript bundle during
`next build`. Therefore:

- `NEXT_PUBLIC_*` values **must** be supplied as Docker build args.
- Passing them with `docker run -e` is too late and has no effect on the browser
  bundle.
- Runtime-only settings (auth secrets, crypto keys, server URLs) are supplied
  with `docker run -e` or your container platform's secret mechanism.

This is why the `Dockerfile` declares `ARG NEXT_PUBLIC_*` and the GitHub
workflow passes them via `build-args`.

## 4. Choose a Jenkins build strategy

### Option A — Jenkins triggers the existing GitHub workflow (recommended)

Use this when you want a single build definition and a single place to manage
environment variables.

Pros:

- One source of truth: `.github/workflows/build-image.yml`.
- No duplicated build-arg list in Jenkins.
- Uses the GitHub Environment variables already configured for `dev`, `qa`,
  and `prod`.

Cons:

- Jenkins agent needs the `gh` CLI and a token with `actions: write`.
- Jenkins waits on GitHub Actions rather than building locally.

### Option B — Jenkins builds and pushes directly

Use this when Jenkins agents own the Docker daemon and GHCR credentials, or
when GitHub Actions minutes are not available.

Pros:

- No dependency on GitHub Actions for dev/QA images.
- Jenkins controls the full lifecycle.

Cons:

- The `NEXT_PUBLIC_*` build-arg list must be maintained in Jenkins too.
- Jenkins needs Docker Buildx and GHCR credentials.

## 5. Jenkins credentials and parameters

Configure these in **Manage Jenkins → Credentials**.

| Credential ID          | Type              | Used by  | Purpose                                        |
| ---------------------- | ----------------- | -------- | ---------------------------------------------- |
| `github-actions-token` | Secret text       | Option A | PAT with `actions: write` and `contents: read` |
| `ghcr-creds`           | Username/password | Option B | GHCR username and PAT with `write:packages`    |
| `nextauth-secret`      | Secret text       | Runtime  | `NEXTAUTH_SECRET`                              |
| `crypto-private-key`   | Secret text       | Runtime  | `CRYPTO_PRIVATE_KEY`                           |

`NEXT_PUBLIC_*` values are public by design because they are embedded in the
browser bundle. Store them as Jenkins environment variables, job parameters, or
plain credentials — but never put secrets in them.

Recommended job parameters:

| Parameter     | Type   | Default | Purpose                                    |
| ------------- | ------ | ------- | ------------------------------------------ |
| `ENVIRONMENT` | Choice | `dev`   | `dev`, `qa`, or `prod`                     |
| `IMAGE_TAG`   | String | empty   | Optional additional tag, e.g. `rc-2026-11` |
| `GIT_REF`     | String | `main`  | Branch/tag/commit to build                 |

## 6. Option A — Jenkins triggers GitHub Actions

Prerequisites:

- `gh` CLI installed on the Jenkins agent.
- Credential `github-actions-token`.
- GitHub Environments `dev`, `qa`, and `prod` with the `NEXT_PUBLIC_*` variables
  described in section 8.

Example declarative pipeline:

```groovy
pipeline {
  agent { label 'docker' }

  parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'prod'],
           description: 'Target environment')
    string(name: 'IMAGE_TAG', defaultValue: '',
           description: 'Optional extra image tag')
    string(name: 'GIT_REF', defaultValue: 'main',
           description: 'GitHub ref to build')
  }

  environment {
    GH_REPO   = 'credebl/studio'
    WORKFLOW  = 'build-image.yml'
    GH_TOKEN  = credentials('github-actions-token')
    TARGET_ENV = "${params.ENVIRONMENT}"
    EXTRA_TAG  = "${params.IMAGE_TAG}"
    BUILD_REF  = "${params.GIT_REF}"
  }

  stages {
    stage('Trigger image build') {
      steps {
        sh '''
          set -eu

          TAG_ARGS=""
          if [ -n "${EXTRA_TAG}" ]; then
            TAG_ARGS="-f tag=${EXTRA_TAG}"
          fi

          gh workflow run "${WORKFLOW}" \
            --repo "${GH_REPO}" \
            --ref "${BUILD_REF}" \
            -f environment="${TARGET_ENV}" \
            ${TAG_ARGS}
        '''
      }
    }

    stage('Wait for image build') {
      steps {
        sh '''
          set -eu

          # The most recent workflow_dispatch run is the one started above.
          # If concurrent dispatch runs are possible, capture the run URL from
          # the GitHub API instead and pass that explicit run ID here.
          RUN_ID=$(gh run list \
            --repo "${GH_REPO}" \
            --workflow "${WORKFLOW}" \
            --event workflow_dispatch \
            --limit 1 \
            --json databaseId \
            --jq '.[0].databaseId')

          test -n "${RUN_ID}"
          gh run watch "${RUN_ID}" --repo "${GH_REPO}" --exit-status
        '''
      }
    }

    stage('Deploy') {
      steps {
        echo 'Pull ghcr.io/credebl/studio:<tag> and deploy using runtime secrets.'
      }
    }
  }
}
```

## 7. Option B — Jenkins builds and pushes directly

Prerequisites:

- Docker Engine and Buildx on the Jenkins agent.
- Credential `ghcr-creds`.
- The `NEXT_PUBLIC_*` variables listed in section 8 available in the Jenkins
  environment.

Example declarative pipeline:

```groovy
pipeline {
  agent { label 'docker' }

  parameters {
    choice(name: 'ENVIRONMENT', choices: ['dev', 'qa', 'prod'],
           description: 'Target environment')
    string(name: 'IMAGE_TAG', defaultValue: '',
           description: 'Optional extra image tag')
    string(name: 'GIT_REF', defaultValue: 'main',
           description: 'Git ref to build')
  }

  environment {
    IMAGE      = 'ghcr.io/credebl/studio'
    TARGET_ENV = "${params.ENVIRONMENT}"
    EXTRA_TAG  = "${params.IMAGE_TAG}"
    BUILD_REF  = "${params.GIT_REF}"
  }

  stages {
    stage('Checkout') {
      steps {
        git url: 'https://github.com/credebl/studio.git', branch: "${BUILD_REF}"
      }
    }

    stage('Build and push') {
      steps {
        withCredentials([
          usernamePassword(credentialsId: 'ghcr-creds',
                           usernameVariable: 'GHCR_USER',
                           passwordVariable: 'GHCR_TOKEN')
        ]) {
          sh '''
            #!/usr/bin/env bash
            set -eu

            SHORT_SHA=$(git rev-parse --short HEAD)
            PRIMARY_TAG="${IMAGE}:${TARGET_ENV}-${SHORT_SHA}"

            TAGS=(--tag "${PRIMARY_TAG}")
            if [ -n "${EXTRA_TAG}" ]; then
              TAGS+=(--tag "${IMAGE}:${EXTRA_TAG}")
            fi

            echo "${GHCR_TOKEN}" | docker login ghcr.io \
              -u "${GHCR_USER}" --password-stdin

            docker build \
              --target production \
              "${TAGS[@]}" \
              --build-arg NEXT_PUBLIC_MODE="${NEXT_PUBLIC_MODE:-}" \
              --build-arg NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL:-}" \
              --build-arg NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL="${NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL:-}" \
              --build-arg NEXT_PUBLIC_PLATFORM_NAME="${NEXT_PUBLIC_PLATFORM_NAME:-}" \
              --build-arg NEXT_PUBLIC_POLYGON_TESTNET_URL="${NEXT_PUBLIC_POLYGON_TESTNET_URL:-}" \
              --build-arg NEXT_PUBLIC_POLYGON_MAINNET_URL="${NEXT_PUBLIC_POLYGON_MAINNET_URL:-}" \
              --build-arg NEXT_PUBLIC_ENABLE_APP_LAUNCHER="${NEXT_PUBLIC_ENABLE_APP_LAUNCHER:-}" \
              --build-arg NEXT_PUBLIC_APP_NAME="${NEXT_PUBLIC_APP_NAME:-}" \
              --build-arg NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN="${NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN:-}" \
              --build-arg NEXT_PUBLIC_ACTIVE_THEME="${NEXT_PUBLIC_ACTIVE_THEME:-}" \
              --build-arg NEXT_PUBLIC_APP_TITLE="${NEXT_PUBLIC_APP_TITLE:-}" \
              --build-arg NEXT_PUBLIC_FOOTER_TEXT="${NEXT_PUBLIC_FOOTER_TEXT:-}" \
              --build-arg NEXT_PUBLIC_LOGO_BASE_URL="${NEXT_PUBLIC_LOGO_BASE_URL:-}" \
              --build-arg NEXT_PUBLIC_CURRENT_RELEASE="${NEXT_PUBLIC_CURRENT_RELEASE:-${BUILD_REF}}" \
              --build-arg NEXT_PUBLIC_ENABLE_BILLING_OPTION="${NEXT_PUBLIC_ENABLE_BILLING_OPTION:-}" \
              --build-arg NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID="${NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID:-}" \
              --build-arg NEXT_PUBLIC_LANDINGPAGE_URL="${NEXT_PUBLIC_LANDINGPAGE_URL:-}" \
              .

            docker push "${PRIMARY_TAG}"
            if [ -n "${EXTRA_TAG}" ]; then
              docker push "${IMAGE}:${EXTRA_TAG}"
            fi
          '''
        }
      }
    }

    stage('Deploy') {
      steps {
        echo 'Pull ghcr.io/credebl/studio:<tag> and deploy using runtime secrets.'
      }
    }
  }
}
```

## 8. Build-time variables

Set these per environment in GitHub Environments (Option A) or Jenkins (Option
B). The GitHub workflow passes all of them automatically; the Jenkins direct
build lists them explicitly.

| Variable                              | Example                                | Notes                               |
| ------------------------------------- | -------------------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_BASE_URL`                | `https://devapi.sovio.id`              | Platform API base URL               |
| `NEXT_PUBLIC_ACTIVE_THEME`            | `credebl` or `sovio`                   | Branding theme                      |
| `NEXT_PUBLIC_MODE`                    | `DEV`, `QA`, `PROD`                    | App mode                            |
| `NEXT_PUBLIC_APP_NAME`                | `CREDEBL Studio`                       | App launcher name                   |
| `NEXT_PUBLIC_APP_TITLE`               | `CREDEBL Studio`                       | Document title                      |
| `NEXT_PUBLIC_FOOTER_TEXT`             | `© CREDEBL`                            | Footer text                         |
| `NEXT_PUBLIC_LOGO_BASE_URL`           | `https://cdn.example.com/logos/`       | Logo base URL                       |
| `NEXT_PUBLIC_PLATFORM_NAME`           | `CREDEBL`                              | Platform name                       |
| `NEXT_PUBLIC_CURRENT_RELEASE`         | `v2.3.0`                               | Falls back to release tag / git ref |
| `NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL` | `https://dev.sovio.id`                 | Ecosystem front end                 |
| `NEXT_PUBLIC_ENABLE_APP_LAUNCHER`     | `true` / `false`                       | App launcher toggle                 |
| `NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN`     | `true` / `false`                       | Social login toggle                 |
| `NEXT_PUBLIC_ENABLE_BILLING_OPTION`   | `true` / `false`                       | Billing toggle                      |
| `NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID`  | `studio-admin`                         | Admin portal client id              |
| `NEXT_PUBLIC_LANDINGPAGE_URL`         | `https://dev.sovio.id`                 | Landing page URL                    |
| `NEXT_PUBLIC_POLYGON_TESTNET_URL`     | `https://rpc-amoy.polygon.technology/` | Wallet testnet RPC                  |
| `NEXT_PUBLIC_POLYGON_MAINNET_URL`     | `https://polygon-rpc.com/`             | Wallet mainnet RPC                  |

## 9. Runtime variables

Pass these at container start, not at image build:

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_COOKIE_DOMAIN`
- `NEXTAUTH_PROTOCOL`
- `CRYPTO_PRIVATE_KEY`
- `OPENSSL_HEADER`
- `PUBLIC_ALLOW_DOMAIN`
- `PUBLIC_PLATFORM_DOCS_URL`
- `PUBLIC_ECOSYSTEM_BASE_URL`
- `MODE`

Example:

```sh
docker run --rm -p 3000:3000 \
  -e NEXTAUTH_URL=https://studio.example.com \
  -e NEXTAUTH_SECRET=... \
  -e NEXTAUTH_COOKIE_DOMAIN=example.com \
  -e NEXTAUTH_PROTOCOL=https \
  -e CRYPTO_PRIVATE_KEY=... \
  -e OPENSSL_HEADER=53616c7465645f5f \
  -e PUBLIC_ALLOW_DOMAIN='https://api.example.com' \
  ghcr.io/credebl/studio:<tag>
```

## 10. Verification checklist

Before promoting an image:

1. Confirm the tag exists in GHCR:

   ```sh
   docker pull ghcr.io/credebl/studio:<tag>
   ```

2. Confirm the correct public configuration was inlined:

   ```sh
   docker run --rm --entrypoint sh ghcr.io/credebl/studio:<tag> \
     -c "grep -R -l 'devapi.sovio.id' .next/static | head -3"
   ```

   Replace the hostname with the value expected for that environment.

3. Start the container with runtime secrets and smoke-test:
   - `/sign-in` loads.
   - API calls go to the expected `NEXT_PUBLIC_BASE_URL`.
   - OID4VC routes return `200`.

4. Record the image digest used by the deployment:

   ```sh
   docker inspect --format='{{index .RepoDigests 0}}' ghcr.io/credebl/studio:<tag>
   ```

## 11. Troubleshooting

| Symptom                                       | Likely cause                                   | Fix                                                             |
| --------------------------------------------- | ---------------------------------------------- | --------------------------------------------------------------- |
| Browser calls the wrong API host              | Wrong `NEXT_PUBLIC_BASE_URL` at build time     | Rebuild with the correct build arg; `docker run -e` is too late |
| Wrong theme/logo                              | Wrong `NEXT_PUBLIC_ACTIVE_THEME` / logo URL    | Rebuild with correct build args                                 |
| `denied: denied` from GHCR                    | Token lacks `write:packages`                   | Update PAT scopes and Jenkins credential                        |
| `gh workflow run` fails with 403              | Token lacks `actions: write`                   | Update `github-actions-token`                                   |
| Workflow runs but Jenkins watches old run     | Concurrent dispatch runs                       | Capture explicit run ID from GitHub API                         |
| Jenkins build succeeds but app has blank URLs | `NEXT_PUBLIC_*` not set in Jenkins environment | Add them as global/job environment variables                    |
| `images.domains` build warning                | Pre-existing Next.js deprecation               | Non-blocking; migrate to `images.remotePatterns` separately     |

## 12. Related files

- `Dockerfile`
- `.dockerignore`
- `.github/workflows/build-image.yml`
- `.github/workflows/release.yml`
- `docs/releasing.md`
- `README.md`
