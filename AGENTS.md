# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/` – Astro routes (e.g., `index.astro`, `doors/[slug].astro`).
- `src/layouts/` – shared layouts (e.g., `DoorLayout.astro`).
- `src/components/` – UI components (React/TSX and `.astro`); `src/components/ui/` holds primitives.
- `src/content/` – MDX content collections (`doors/*.mdx`) and `content/config.ts`.
- `src/styles/` – global styles (`global.css`).
- `src/utils/` – helpers (e.g., `anchorize.ts`, `dates.ts`).
- `public/` – static assets served as‑is.
- Root: `astro.config.ts` (Cloudflare adapter, env schema), `wrangler.toml` (Worker + routes).

## Component Architecture

### ShellSection Pattern
`ShellSection` (`src/components/ui/ShellSection.tsx`) is the base component for all content sections. It provides:
- Rail with numbered badge (auto-incremented via CSS counter)
- Header with title, optional meta badge, and anchor link
- Body area for content

All content UI components build on this pattern.

### UI Primitives (`src/components/ui/`)
| Component | Purpose |
|-----------|---------|
| `Section` | Wrapper using ShellSection with auto-generated anchor ID |
| `TLDR` | Summary section (sets title="TL;DR", meta="SUMMARY") |
| `Quote` | Blockquote with source attribution; supports `variant="minimal"` |
| `Steps` / `Step` | Numbered step list (01, 02, etc.) |
| `List` / `Item` | Bullet list with decorative line prefix |
| `Link` | External link (`target="_blank"`, `rel="noreferrer"`) |
| `Chip` | Small badge/tag for metadata |
| `MetaBar` | Displays metadata chips with separator line |

### Lab Components
Each door has an interactive lab in `src/components/ui/` (e.g., `PromptInjectionLab.tsx`). Labs follow a consistent pattern:
- `SCENARIOS` array with test cases
- `RULES` regex for risk detection
- Defense toggles via local state

### Lab-Common Components (`src/components/ui/lab-common/`)
Reusable lab infrastructure:
- `LabContainer` – Wrapper with gradient background
- `StageHeader` – Pipeline stage title (supports `variant`: neutral/red/emerald)
- `SecurityGate` – Toggle control with blocked/allowed state
- `ScenarioSelector` – Generic scenario picker
- `PipelineConnector` – Animated arrows between stages
- `InfoBanner` – Usage instructions banner
- `TooltipIcon` – Icon with hover tooltip

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
- Do not add "obvious" or redundant comments (e.g., restating what the code does).
- Use commit messages, CHANGELOG, or docs for rationale when needed.
- Allowed exceptions: required license headers (if any) and structured JSDoc for public APIs only.

## Content Authoring (MDX)

### Frontmatter Schema
```yaml
---
title: Door 01 - Prompt Injection  # Required
description: SEO description text   # Optional
date: 2025-12-01                    # Optional, controls unlock date
meta:                               # Optional, displayed in MetaBar
  - Door 01
  - OWASP - LLM01:2025
---
```

### Available MDX Components
Import at the top of each `.mdx` file:
```jsx
import { Section, TLDR, Quote, Steps, Step, List, Item, Link } from '@/components/ui';
import PromptInjectionLab from '@/components/ui/PromptInjectionLab';
```

### Content Structure Convention
Each door follows this section order:
1. `<TLDR>` – Brief summary
2. `<Section title="What is X?">` – Definition
3. `<Section title="Real-World Impact">` – Examples with `<Quote>`
4. `<Section title="Defense Strategies">` – Mitigations with `<Steps>`
5. `<Section title="Interactive Lab">` – Lab component

### Creating a New Door
1. Create `src/content/doors/{NN}.mdx` (zero-padded number)
2. Add frontmatter with `title`, `date`, and `meta`
3. Import and use UI components
4. Create corresponding lab component if needed

## Layout System

### Shell Grid CSS
The layout uses a custom shell grid system defined in `src/styles/global.css`:
- `.shell-grid` – Main container with vertical divider rail
- `.shell-section` – Flexible section container
- `.shell-section__card` – Card with border and shadow
- `.shell-section__rail` – Side rail with numbered badge
- `.shell-section__header` – Title row with anchor link
- `.shell-section__body` – Content area

### CSS Variables
```css
--shell-rail-width: clamp(2.5rem, 5vw, 3.5rem);
--shell-header-height: 3.25rem;
--shell-gap: var(--shell-header-height);
--shell-badge-size: var(--shell-header-height);
--surface-color: #ffffff;
```

### Responsive Breakpoints
- Mobile: `max-width: 768px` – Stacks layout vertically, hides rail
- Desktop: Full shell grid with side rail

## Door Unlock Logic
Doors unlock based on UTC date comparison:
- `locked` – Future date, redirects to homepage
- `today` – Current date, accessible with "today" styling
- `open` – Past date, fully accessible

Override for development: Set `UNLOCK_ALL_DOORS=true` in `.env` or via `wrangler secret`.

## Utilities Reference

### `anchorize(title: string): string`
Converts titles to URL-safe anchor IDs. Normalizes unicode, removes accents, replaces spaces with hyphens.

### `startOfDayUTC(date: Date): Date`
Normalizes a date to midnight UTC for consistent date comparisons.

### `slugCollator`
Collator for sorting numeric slugs (01, 02, ..., 10) in correct order.

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
