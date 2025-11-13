# Astro + React Skeleton

Minimal Astro structure with a clean starting point.

Scripts
- `bun install` — install deps
- `bun run dev` — start dev server
- `bun run build` — build for production
- `bun run preview` — preview the production build

Structure
- Pages in `src/pages`
- Components in `src/components`
- Global styles in `src/styles`
- Static assets in `public`

React
- Enabled via `@astrojs/react`. Example component: `src/components/Hello.tsx:1` mounted in `src/pages/index.astro:1`.

Deployment
- Cloudflare Workers config present (`wrangler.toml`), optional to use.
