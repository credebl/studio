import { defineConfig } from 'astro/config';
import deno from '@astrojs/deno';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
const DEV_PORT = 8085;


// https://astro.build/config
export default defineConfig({
  site: process.env.CI ? 'https://salty-weasel-93.deno.dev' : `http://localhost:${DEV_PORT}`,
  base: process.env.CI ? '/dashboard' : undefined,
  output: 'server',
  /* Like Vercel, Netlify,… Mimicking for dev. server */
  // trailingSlash: 'always',

  server: {
    /* Dev. server only */
    port: DEV_PORT
  },
  integrations: [
  //
  sitemap(), tailwind()],
  adapter: deno()
});
