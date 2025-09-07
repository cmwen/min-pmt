# Copilot instructions for this repo (min-pmt)

Purpose: make AI coding agents productive fast in this monorepo. Keep changes aligned with what exists today (do not invent unimplemented components).

## Project snapshot
- Monorepo managed by pnpm; active package is `@min-pmt/core` under `packages/core`.
- TypeScript, ESM ("type": "module"). Node >= 18.18 required.
- Tests: Vitest. No linter configured.

## Build and test
- Root scripts run across workspaces:
  - Build: `pnpm build` → runs `tsc -b` in `@min-pmt/core`
  - Test: `pnpm test` → runs `vitest run` in `@min-pmt/core`
- Package-local scripts (from `packages/core`): `pnpm run build`, `pnpm run test`.

## Core architecture (implemented now)
- Filesystem-backed ticket engine in `packages/core/src/TicketManager.ts` and types in `packages/core/src/types.ts`.
- Data model: `Ticket` with `status: 'todo' | 'in-progress' | 'done'` and optional fields (`priority`, `labels`, `assignee`, `due`).
- Storage: each ticket is a Markdown file with YAML frontmatter. Frontmatter is the single source of truth for `status` (folder names are organizational only).
- Default location: `pmt/` under `process.cwd()`. Config shape is `ProjectConfig` with `folder` (default `'pmt'`).

## Key APIs and patterns
- `new TicketManager(config?: ProjectConfig)` → uses `config.folder` as root under `cwd`.
- `await createTicket({ title, description?, status?, priority?, labels?, assignee?, due? })`:
  - Generates id `ticket-<slug>-<base36-ts>`; writes `pmt/<id>.md` with frontmatter and a `## Notes` body.
  - Omits undefined fields in frontmatter (via `gray-matter`).
- `await listTickets({ status?, priority? })`:
  - Recursively scans all `*.md` files under `pmt/`, parses frontmatter, and returns filtered `Ticket[]`.
  - If frontmatter misses `status/created/updated`, defaults are applied (`status: 'todo'`, timestamps to `now`).
- Internal helpers: `ensureInitialized()`, `generateId(title)`, `findMarkdownFiles(dir)`.
- ESM import style uses explicit `.js` extensions within TS (e.g., `import { TicketManager } from './TicketManager.js'`). Preserve this.

## Conventions to follow
- Treat frontmatter as authoritative; do not infer status from file paths. Do not relocate files to imply status unless adding that feature explicitly.
- Keep all filesystem operations under `process.cwd()` to avoid writing outside the project.
- When extending `Ticket` or `ProjectConfig`, update both `types.ts` and parsing/serialization in `TicketManager` and add tests in `packages/core/test/`.
- Maintain public re-exports from `packages/core/src/index.ts` (`TicketManager`, types) and avoid breaking changes.

## Example usage
```ts
import { TicketManager } from '@min-pmt/core';
const tm = new TicketManager();
await tm.createTicket({ title: 'My first ticket', priority: 'high' });
const todos = await tm.listTickets({ status: 'todo' });
```

## What NOT to assume
- Design docs in `docs/` mention CLI/MCP/Web UI; these are not implemented in code. Do not add those parts unless requested.
- Sample files exist under `packages/core/pmt/` for illustration; runtime operations read/write `pmt/` under the current working directory.

## Quick checks for agents
- Build/test green before PR: `pnpm build && pnpm test` at repo root.
- New features should include minimal Vitest coverage alongside changes.

## Code style and maintainability
- Prefer small, composable functions and small files; extract helpers (e.g., see `generateId`, `findMarkdownFiles`).
- Keep public surface minimal and re-exported via `packages/core/src/index.ts`.
- Preserve ESM import ergonomics with explicit `.js` extensions inside TS.
- Write straightforward Vitest tests colocated under `packages/core/test/` for new behavior (happy path + one edge case).
- Avoid speculative components (CLI/MCP/Web UI) unless requested; focus on the core engine.
