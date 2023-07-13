import { defineConfig } from 'astro/config';
import node from "@astrojs/node";
// import deno from '@astrojs/deno';
import nodejs from '@astrojs/node';
import react from "@astrojs/react";
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
const DEV_PORT = 3000;


// https://astro.build/config
export default defineConfig({
  site: process.env.CI ? 'https://credebl-dev-ui.deno.dev' : `http://localhost:${DEV_PORT}`,
  base: process.env.CI ? '/' : undefined,
  output: 'server',
  /* Like Vercel, Netlify,… Mimicking for dev. server */
  // trailingSlash: 'always',

  server: {
    /* Dev. server only */
    port: DEV_PORT
  },
  integrations: [
  //
  sitemap(), tailwind(), react()],
  adapter: node({
    mode: "standalone"
  })
  // adapter: deno()
});