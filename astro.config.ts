import { defineConfig, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';

import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',

  adapter: cloudflare(),

  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'IBM Plex Mono',
        cssVariable: '--font-plex-mono',
        weights: [400, 600],
        styles: ['normal'],
        display: 'swap',
      },
    ],
  },

  vite: {
    plugins: [tailwindcss()],
  },
});
