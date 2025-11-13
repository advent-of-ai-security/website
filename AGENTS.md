# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` – Astro routes (e.g., `index.astro`, `doors/[slug].astro`).
- `src/layouts/` – shared layouts (e.g., `DoorLayout.astro`).
- `src/components/` – UI components (React/TSX and `.astro`); `src/components/ui/` holds primitives.
- `src/content/` – MDX content collections (`doors/*.mdx`) and `content/config.ts`.
- `src/styles/` – global styles (`global.css`).
- `src/utils/` – helpers (e.g., `anchorize.ts`).
- `public/` – static assets served as‑is.
- Root: `astro.config.ts` (Cloudflare adapter, env schema), `wrangler.toml` (Worker + routes).

## Build, Run & Deploy
- Install deps: `bun install`
- Dev server: `bun run dev` (Astro + HMR)
- Build: `bun run build` (outputs server bundle to `dist/` for Cloudflare Worker)
- Preview built site: `bun run preview`
- Cloudflare dev: `bun run cf:dev` (build then `wrangler dev`)
- Cloudflare deploy: `bun run cf:deploy` (build then `wrangler deploy`)

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indentation: 2 spaces; UTF‑8; LF.
- Components: React components use PascalCase filenames and default exports.
- Pages: `.astro` in `src/pages/` follow route naming (e.g., `[slug].astro`).
- Imports: prefer path alias `@/*` (see `tsconfig.json`). Example: `import { anchorize } from '@/utils/anchorize'`.
- Styling: Tailwind CSS v4 via Vite plugin; prefer utility classes in markup; keep global styles in `src/styles/global.css`.

### Comments Policy
- Avoid inline comments in code. Favor clear names and small functions over explanatory comments.
- Do not add “obvious” or redundant comments (e.g., restating what the code does).
- Use commit messages, CHANGELOG, or docs for rationale when needed.
- Allowed exceptions: required license headers (if any) and structured JSDoc for public APIs only.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest for unit tests and Playwright for E2E.
- Name tests `*.test.ts`/`*.test.tsx` colocated with source or under `__tests__/`.
- Include a `test` script in `package.json` and ensure CI can run it before merging.

## Commit & Pull Request Guidelines
- Conventional Commits style is used. Types include `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `build`, `ci`, `content`.
- Scopes seen in history: `ui`, `content`, `docs`, `deps`, `seo`, `copy`, `workers`.
- Examples:
  - `fix(seo,copy): remove phrase from meta`
  - `feat(ui): add TLDR component`
- PRs must include: clear description, linked issues, screenshots for UI changes, and proof of `bun run build` success. Provide a Wrangler preview link if available.

## Security & Configuration Tips
- Secrets: set via Cloudflare Wrangler. Example: `wrangler secret put UNLOCK_ALL_DOORS` (defined as a server‑only secret in `astro.config.ts`).
- Never commit secrets or tokens; review `wrangler.toml` routes (e.g., `advent-of-ai-security.com`) before deploys.
- Avoid embedding credentials in MDX/content.
