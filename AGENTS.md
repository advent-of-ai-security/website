# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` – Astro routes: `index.astro` (2026 calendar), `2026/[slug].astro`, `2025/index.astro` (recap), `2025/[slug].astro`, `doors/[slug].astro` (redirect to `/2025/NN`).
- `src/layouts/` – `ConsoleLayout.astro` (page shell, header, footer) and `DoorLayout.astro` (door header, neighbours).
- `src/console/styles.ts` – shared Panda CSS styles and recipes (`tile`, `key`, type styles).
- `src/components/` – Vue components (`Keypad.vue`, `Countdown.vue`, labs) and Astro components (`Notice.astro`, `SEO.astro`); `src/components/content/` holds the MDX primitives.
- `src/content/doors/` – 2025 door text (MDX); `../content/2026/` – 2026 door text and labs, in the private `advent-of-ai-security/content` repo; `src/content.config.ts` defines both collections.
- `src/data/editions.ts` – door metadata for both editions and the unlock logic.
- `src/labs/sim2025.ts` – data for the ten scripted 2025 labs.
- `panda.config.ts` – design tokens, keyframes, global CSS. `styled-system/` is generated (`panda codegen`) and not committed.
- Root: `astro.config.ts` (Cloudflare adapter, env schema, fonts), `wrangler.toml`.

## Design System
The site is a light "console" of keys. Rules:
- One rounded outer frame per page (`well`); tiles and keys inside are square, separated by 1px `seam` lines.
- `tile` tones: `read` (reading surface), `readout` (static label/value), `inert` (locked), `screen` (the one dark display).
- `key` is anything pressable: flat face, moves 2px on press, no shadows. Tones: `plain`, `today` (yellow), `locked`, `shut`, `dark`.
- Yellow marks the one key to press next on a screen. Do not use it elsewhere.
- Buttons only: no knobs, sliders or drop shadows on controls.
- Elements with `data-key` get the cursor-following highlight from the script in `ConsoleLayout.astro`.

## Components
- Content primitives (`src/components/content/`): `Section`, `Quote`, `Steps`/`Step`, `List`/`Item`, `Link`. Server-rendered Vue, no client JavaScript.
- `SimLab.vue` renders any 2025 lab from `sim2025` by door number.
- 2026 door text and labs live in the private content repo, checked out next to this one (`../content`). Files there can use the `@/` alias. Lab dependencies go in this repo's `package.json` and in `vite.resolve.dedupe` in `astro.config.ts`, because bare imports from outside this folder don't resolve otherwise. Panda scans `../content` too (`include` in `panda.config.ts`).
- Locked doors are never rendered (server output), and door text stays in `dist/server`. Keep lab answers server-side too: anything a `client:load` island imports ships to public assets at deploy time.

## Build, Run & Deploy
- Clone `advent-of-ai-security/content` next to this repo (without it, 2026 doors show "not published yet").
- Install deps: `bun install` (runs `panda codegen`)
- Dev server: `bun run dev`
- Build: `bun run build` (`panda codegen`, `astro check`, `astro build`)
- Cloudflare dev: `bun run cf:dev`; deploy: `bun run cf:deploy`
- CI checks out both repos side by side (`CONTENT_TOKEN` secret: fine-grained PAT with read access to the content repo). Content changes need a redeploy (`workflow_dispatch`).

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indentation: 2 spaces; UTF-8; LF.
- Components: Vue single-file components with `<script setup lang="ts">`, PascalCase filenames.
- Styling: Panda CSS. Use `css()`/`cva()` from `styled-system/css` with tokens from `panda.config.ts`; share styles through `src/console/styles.ts`. Do not combine two classes that set the same property with `cx`; add a recipe variant instead.
- Imports: prefer path alias `@/*`.

### Comments Policy
- Avoid inline comments in code. Favor clear names and small functions over explanatory comments.
- Do not add "obvious" or redundant comments (e.g., restating what the code does).
- Use commit messages, CHANGELOG, or docs for rationale when needed.
- Allowed exceptions: required license headers (if any) and structured JSDoc for public APIs only.

## Content Authoring (MDX)

### 2025 doors (`src/content/doors/NN.mdx`)
Frontmatter: `title` (required), `description`, `date`, `meta`. The text is frozen; the lab is `<SimLab door="NN" client:load />`.

### 2026 doors (`../content/2026/NN.mdx`)
Title, date and blurb live in `src/data/editions.ts`. Frontmatter: `description` (optional lede). A door with no MDX file shows a "not published yet" notice once its date arrives.

```jsx
import { Section, Quote, Steps, Step, List, Item, Link } from '@/components/content';
```

Use `<Section title="...">` for each part and `<Section title="Lab: ..." noPadding>` around the lab.

## Door Unlock Logic
Doors unlock on UTC date comparison (`doorState` in `src/data/editions.ts`): `locked`, `today`, `open`. Locked 2026 doors hide their title and show a countdown. Override for development: `UNLOCK_ALL_DOORS=true` in `.env` or via `wrangler secret`.

## Utilities Reference
- `anchorize(title)` – URL-safe anchor IDs.
- `startOfDayUTC(date)` – midnight UTC for date comparisons.
- `slugCollator` – numeric slug ordering.

## Testing Guidelines
- No test runner is configured yet. If adding tests, prefer Vitest for unit tests and Playwright for E2E.
- Name tests `*.test.ts`/`*.test.tsx` colocated with source or under `__tests__/`.
- Include a `test` script in `package.json` and ensure CI can run it before merging.

## Commit & Pull Request Guidelines
- Conventional Commits style is used. Types include `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `build`, `ci`, `content`.
- Scopes seen in history: `ui`, `content`, `docs`, `deps`, `seo`, `copy`, `workers`.
- Examples:
  - `fix(seo,copy): remove phrase from meta`
  - `feat(ui): add Section component`
- PRs must include: clear description, linked issues, screenshots for UI changes, and proof of `bun run build` success. Provide a Wrangler preview link if available.

## Security & Configuration Tips
- Secrets: set via Cloudflare Wrangler. Example: `wrangler secret put UNLOCK_ALL_DOORS` (defined as a server‑only secret in `astro.config.ts`).
- Never commit secrets or tokens; review `wrangler.toml` routes (e.g., `advent-of-ai-security.com`) before deploys.
- Avoid embedding credentials in MDX/content.

## Web Scraping
- When scraping external sites for content or analysis, use a headless Chrome dump piped into `markitdown`:
  - `chrome --headless --dump-dom "https://example.com" | uvx markitdown`
  - Replace `https://example.com` with the target URL to scrape.
