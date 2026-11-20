import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://advent-of-ai-security.com',
  output: 'server',
  vite: { resolve: { dedupe: ['vue', '@mlc-ai/web-llm'] } },

  adapter: cloudflare(),
  integrations: [
    vue(),
    mdx(),
    sitemap({
      filter(page) {
        if (page.includes('/2025/') || page.includes('/2026/') || page.includes('/doors/')) return false;
        if (page.endsWith('/sitemap-doors.xml')) return false;
        return true;
      },
    }),
  ],

  env: {
    schema: {
      UNLOCK_ALL_DOORS: envField.boolean({
        context: 'server',
        access: 'secret',
        default: false,
      }),
    },
  },

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'Hanken Grotesk',
      cssVariable: '--font-hanken',
      weights: [300, 400, 500],
      styles: ['normal'],
      display: 'swap',
    },
  ],
});
