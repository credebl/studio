import { defineConfig } from 'astro/config';
import Deno from '@astrojs/deno';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import react from "@astrojs/react";
const DEV_PORT = 3000;

// https://astro.build/config
export default defineConfig({
  site: process.env.CI ? 'https://credebl-dev-ui.deno.dev' : `http://localhost:${DEV_PORT}`,
  base: process.env.CI ? '/' : undefined,
  output: 'server',
  MYURL: process.env.CI ? Deno.env.get("PUBLIC_BASE_URL") : '',
  /* Like Vercel, Netlify,… Mimicking for dev. server */
  // trailingSlash: 'always',

  server: {
    /* Dev. server only */
    port: DEV_PORT,
  },
  integrations: [
  //
  sitemap(), tailwind(), react()],
  adapter: Deno()
});
