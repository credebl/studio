
## 🚀 Quick start

1. Clone this repository or download the ZIP file
2. Make sure that you have **Node.js** and NPM, PNPM or Yarn installed
3. Install the project dependencies from the `package.json` file:

```sh
pnpm install
# or
npm install
# or
yarn
```

_PNPM is the package manager of choice for illustration, but you can use what you want._

1. Launch the Next.js local development server on `localhost:3000` by running the following command:

```sh
pnpm run dev
```

You can also build the project and get the distribution files inside the `.next/` folder by running:

```sh
pnpm run build
```

## Container image

The `Dockerfile` builds Next.js standalone output into a small production image. Because Next.js inlines `NEXT_PUBLIC_*` variables at build time, environment-specific public values must be passed as Docker build args:

```sh
docker build \
  --build-arg NEXT_PUBLIC_BASE_URL=https://api.example.com \
  --build-arg NEXT_PUBLIC_ACTIVE_THEME=credebl \
  -t studio:local .
```

Supported build args: `NEXT_PUBLIC_MODE`, `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_ECOSYSTEM_FRONT_END_URL`, `NEXT_PUBLIC_PLATFORM_NAME`, `NEXT_PUBLIC_POLYGON_TESTNET_URL`, `NEXT_PUBLIC_POLYGON_MAINNET_URL`, `NEXT_PUBLIC_ENABLE_APP_LAUNCHER`, `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_ENABLE_SOCIAL_LOGIN`, `NEXT_PUBLIC_ACTIVE_THEME`, `NEXT_PUBLIC_APP_TITLE`, `NEXT_PUBLIC_FOOTER_TEXT`, `NEXT_PUBLIC_LOGO_BASE_URL`, `NEXT_PUBLIC_CURRENT_RELEASE`, `NEXT_PUBLIC_ENABLE_BILLING_OPTION`, `NEXT_PUBLIC_ADMIN_PORTAL_CLIENT_ID`, and `NEXT_PUBLIC_LANDINGPAGE_URL`. Keep this list in sync with the `Dockerfile` and `.github/workflows/build-image.yml`.

Runtime-only settings such as `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_COOKIE_DOMAIN`, `NEXTAUTH_PROTOCOL`, `CRYPTO_PRIVATE_KEY`, `OPENSSL_HEADER`, `PUBLIC_*`, and `MODE` should be supplied to `docker run` as environment variables.

### GHCR workflow

`.github/workflows/build-image.yml` builds and pushes the image to `ghcr.io/credebl/studio`.

- On a published GitHub release it uses the `prod` environment and pushes `latest`, the release tag, and `sha-<short>` tags.
- On manual dispatch it uses the selected `dev`, `qa`, or `prod` environment and pushes `<environment>-sha-<short>` plus any optional custom tag.

Create `dev`, `qa`, and `prod` environments under repository settings, then add the `NEXT_PUBLIC_*` values above as **environment variables** in each environment. These values are public by design because they are embedded in the browser bundle; do not put secrets in them.

## Contributing

Pull requests are welcome! Please read our [contributions guide](https://github.com/credebl/platform/blob/main/CONTRIBUTING.md) and submit your PRs. We enforce [developer certificate of origin](https://developercertificate.org/) (DCO) commit signing — [guidance](https://github.com/apps/dco) on this is available. We also welcome issues submitted about problems you encounter in using CREDEBL.

## License

[Apache License Version 2.0](https://github.com/credebl/platform/blob/main/LICENSE)
