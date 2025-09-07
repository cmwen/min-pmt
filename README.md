# min-pmt

A minimal project management tool monorepo managed with pnpm and TypeScript.

- Package manager: pnpm (declared in package.json)
- Workspace layout: `packages/*`
- Tests: Vitest

## Scripts
- `pnpm build` – build all packages
- `pnpm test` – run tests in all packages
- `pnpm clean` – clean build artifacts

## Getting started
1. Install dependencies: `pnpm install`
2. Build: `pnpm build`
3. Test: `pnpm test`

## Core API
Minimal ticket engine is available in `@min-pmt/core`:

TypeScript
- import { TicketManager } from '@min-pmt/core';
- const tm = new TicketManager();
- await tm.createTicket({ title: 'My first ticket', priority: 'high' });
- const list = await tm.listTickets({ status: 'todo' });

Notes
- Requires Node 18+ and pnpm 9+.
- Status is sourced from markdown frontmatter; folder layout is organizational.
