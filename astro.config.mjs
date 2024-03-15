import Deno from '@astrojs/deno';
import { defineConfig } from 'astro/config';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

const DEV_PORT = 3000;

// https://astro.build/config
export default defineConfig({
	experimental: {
    viewTransitions: true,
  },

	redirects: {
    '/login': '/authentication/sign-in',
		'/register': '/authentication/sign-up',
  },

  site: process.env.CI ? 'https://credebl-dev-ui.deno.dev' : `http://localhost:${DEV_PORT}`,
  base: process.env.CI ? '/' : undefined,
  output: 'server',
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

if (typeof globalThis !== 'undefined' && typeof Deno !== 'undefined') {
  globalThis.process ||= {
    env: Deno.env.toObject()
  }
}
