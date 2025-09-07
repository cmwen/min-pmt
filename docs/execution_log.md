# Execution Log

## 2025-09-07 - Monorepo restructuring for proper package separation

- Feature: Restructured monorepo to separate CLI, MCP server, and Web UI into dedicated packages
- Linked Backlog: [Repo scaffolding] Better monorepo organization and separation of concerns
- Design Decision: Each module (core, CLI, MCP, Web) has its own package with proper dependencies
- Code Changes:
  - Created `@min-pmt/cli` package with standalone CLI functionality and proper bin configuration
  - Created `@min-pmt/mcp` package for Model Context Protocol server with MCP SDK dependencies
  - Created `@min-pmt/web` package for Web UI server and static assets with Express dependencies
  - Updated `@min-pmt/core` to only export core functionality (TicketManager, types, validators, ConfigLoader)
  - Removed CLI, MCP, and Web code from core package and moved to dedicated packages
  - Updated TypeScript project references and composite builds across packages
  - Moved web server tests to web package, created basic tests for CLI and MCP packages
- Tests: All packages have basic test coverage, web package has full API test suite
- Notes [Execution → QA]:
  - Each package can be built and tested independently
  - CLI package depends on both core and web packages for full functionality
  - MCP and Web packages only depend on core package
  - All TypeScript project references properly configured for composite builds
  - Package.json files properly configured with workspace dependencies

## 2025-09-07 - Core expansions (CLI, WebUI, MCP)

- Feature: Add ConfigLoader, CLI (init/add/list/move/web), WebUI Express server with minimal SPA, MCP server skeleton.
- Linked Backlog: [Design → Product] features F1.1, F1.2, F3.1, F3.2, F2.1 from docs/design.md
- Design Decision: Frontmatter is source of truth for ticket status; file location remains organizational.
- Tests: Added web.server.test.ts (API smoke). Existing TicketManager tests unchanged.
- Notes [Execution → QA]:
	- Ensure Node >=18.18 and pnpm installed.
	- WebUI tests use supertest; routes: GET/POST /api/tickets, PATCH /api/tickets/:id/status.
	- Follow-ups: add more validation with zod; add MCP stdio harness and CLI bin wiring.

## Implemented Features
- [Repo scaffolding] Initialized pnpm TypeScript monorepo with core package and tests. Status: Done.
- [F1.2 Minimal Core] Implemented minimal TicketManager (create/list) with gray-matter and unit tests. Status: Done.
- [F1.2 Update Status] Added TicketManager.updateTicketStatus(id, newStatus) to update frontmatter status and timestamp. Status: Done.
- [Monorepo restructuring] Separated core, CLI, MCP, and Web into dedicated packages with proper dependencies. Status: Done.

## Code Changes & Decisions
- Added pnpm workspace (`pnpm-workspace.yaml`) and root `package.json` with workspaces.
- Created base TS config (`tsconfig.base.json`) and package `@min-pmt/core` with minimal functions.
- Wired Vitest for testing; added sample unit tests.
- Updated `.gitignore` to include macOS, IDE, and pnpm logs.
- See Design: frontmatter-first status remains guiding principle for future implementation.
 - Implemented `TicketManager` with frontmatter-as-source-of-truth (create, list). Exported types and manager via core index.
 - Added tests covering create and list with filters.
 - Added tests for status update (happy path + unknown id error). See: [Product Backlog F1.2](product_backlog.md) and [Design: Core Ticket Engine](design.md#1-core-ticket-engine).
- Restructured monorepo with four packages: `@min-pmt/core`, `@min-pmt/cli`, `@min-pmt/mcp`, `@min-pmt/web`
- Each package has proper TypeScript project references and workspace dependencies
- Moved functionality to appropriate packages while maintaining clean dependency boundaries

## Integration Notes
- Use pnpm v10+ (declared via packageManager) and Node 18+.
- Packages reside under `packages/*`; add new packages there.
- CLI can be accessed via `@min-pmt/cli` package or root workspace scripts
- Web UI can be started via CLI (`min-pmt web`) or directly via `@min-pmt/web` package
- MCP server can be run via `@min-pmt/mcp` package for Model Context Protocol integration

## Technical Debt
- Consider adding ESLint/Prettier configuration across packages for consistent code style
- Add integration tests that test cross-package functionality
- Consider adding package for shared types/utilities if needed in the future

## Suggested Tests
[Execution → QA] Validate TicketManager create/list across edge cases and malformed frontmatter scenarios.
- Unit tests for core ticket parsing, listing, and status updates once implemented.
- Integration tests for CLI commands (init, add, list, move) using temp dirs.
- Edge cases: malformed frontmatter, missing fields, large directories, concurrent writes.
- Additional: verify file path remains unchanged during status update (organizational only) and that updated timestamp changes.
- Cross-package integration tests to ensure CLI, Web, and MCP packages work correctly with core

---
*Created by Execution Agent | Links: [Design](design.md) → [QA Plan](qa_plan.md)*
