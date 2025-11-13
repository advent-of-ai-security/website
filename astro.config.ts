import { defineConfig, envField, fontProviders } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import sitemap from '@astrojs/sitemap';
import astroD2 from 'astro-d2';

import tailwindcss from '@tailwindcss/vite';

interface VitePluginLike {
  name: string;
}

import react from '@astrojs/react';

import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://advent-of-ai-security.com',
  output: 'server',

  adapter: cloudflare(),
  integrations: [
    react(),
    mdx(),
    astroD2(),
    sitemap({
      // Exclude doors from the static sitemap; covered by runtime sitemap-doors.xml
      filter(page) {
        if (page.startsWith('/doors/')) return false;
        if (page === '/sitemap-doors.xml') return false;
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
    plugins: tailwindcss() as VitePluginLike[],
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('@terrastruct/d2')) return 'd2';
              if (id.includes('react')) return 'react';
            }
            return undefined;
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
    resolve: {
      dedupe: ['react', 'react-dom'],
    },
  },
});
