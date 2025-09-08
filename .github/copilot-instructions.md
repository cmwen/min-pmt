# min-pmt GitHub Copilot Instructions

**ALWAYS follow these instructions first and fallback to search or additional context gathering ONLY if the information here is incomplete or found to be in error.**

min-pmt is a TypeScript monorepo for a minimal project management tool with filesystem-backed ticket storage. The repository contains a core ticket engine, CLI, web UI, and MCP server components.

## Prerequisites and Installation

**Required versions:**
- Node.js >= 18.18 (verified: Node.js 20.19.4 works)
- pnpm >= 9 (verified: pnpm 10.15.1 works)

**EXACT installation commands:**
```bash
# Install pnpm globally (required)
npm install -g pnpm@10.15.1

# Clone and setup (if starting fresh)
git clone https://github.com/cmwen/min-pmt.git
cd min-pmt

# Install dependencies - takes ~17 seconds, NEVER CANCEL
pnpm install
```

## Build and Test Commands

**CRITICAL TIMING INFORMATION - Set timeouts accordingly:**

**Build process - NEVER CANCEL:**
```bash
pnpm build
```
- **Duration**: ~2 seconds
- **Timeout**: Set to 60+ seconds minimum
- **What it does**: Runs `tsc -b` across all packages (core, cli, web, mcp)
- **Expected output**: TypeScript compilation, Vite build for web package

**Test suite - NEVER CANCEL:**
```bash
pnpm test
```
- **Duration**: ~4 seconds  
- **Timeout**: Set to 30+ seconds minimum
- **What it does**: Runs `vitest run` across all packages
- **Expected output**: All tests pass (core: 9 tests, cli: 4 tests, web: 5 tests, mcp: 1 test)

**Quality checks:**
```bash
# Auto-fix linting (some warnings remain, this is normal)
pnpm lint

# Check-only linting (exits 1 if issues found)
pnpm lint:ci

# Format checking
pnpm format:check
```
- **Duration**: <1 second each
- **Known issue**: Some linting warnings exist but don't block CI

**Complete quality gate (always run before committing):**
```bash
pnpm build && pnpm test && pnpm lint:ci
```

## Manual Validation Scenarios

**ALWAYS test these scenarios after making changes to verify functionality:**

**1. CLI Functionality Test:**
```bash
cd /tmp && mkdir test-pmt && cd test-pmt

# Test CLI init
node /path/to/min-pmt/packages/cli/dist/index.js init
# Expected: "Initialized min-pmt in folder: pmt"

# Test adding tickets
node /path/to/min-pmt/packages/cli/dist/index.js add "Test ticket" --priority high
# Expected: Returns ticket ID like "ticket-test-ticket-mfafy4eu"

# Test listing tickets
node /path/to/min-pmt/packages/cli/dist/index.js list
# Expected: Table showing the created ticket with title, status='todo', priority='high'

# Cleanup
cd /tmp && rm -rf test-pmt
```

**2. Web Server Test:**
```bash
cd /tmp/test-pmt  # Use directory from CLI test above
timeout 10s node /path/to/min-pmt/packages/cli/dist/index.js web --port 3001
# Expected: "min-pmt WebUI http://localhost:3001" message
```

**3. Core API Test:**
Create test file and verify TicketManager API works programmatically.

## Repository Structure

**Active packages:**
- `packages/core` - Core ticket management engine (@cmwen/min-pmt-core)
- `packages/cli` - Command-line interface (@cmwen/min-pmt) 
- `packages/web` - Web UI server and client (@cmwen/min-pmt-web)
- `packages/mcp` - Model Context Protocol server (@cmwen/min-pmt-mcp)

**Key directories:**
- `.github/workflows/` - CI/CD (tests Node 18.x and 20.x)
- `docs/` - Design and architecture documentation
- `pmt/` - Example tickets (not used by runtime)

## Core Architecture

**Data model:**
- Tickets stored as Markdown files with YAML frontmatter
- Frontmatter is source of truth for status (not folder location)
- Default storage: `pmt/` directory under `process.cwd()`
- Schema: `Ticket` with `status: 'todo' | 'in-progress' | 'done'` and optional fields

**Key APIs:**
```typescript
import { TicketManager } from '@cmwen/min-pmt-core';
const tm = new TicketManager();
await tm.createTicket({ title: 'My ticket', priority: 'high' });
const todos = await tm.listTickets({ status: 'todo' });
```

## Development Rules

**Code style:**
- TypeScript with ESM modules (`"type": "module"`)
- Use explicit `.js` extensions in imports within TypeScript
- Use Biome for formatting and linting
- Prefer small, composable functions

**Testing:**
- Write Vitest tests for new features in `packages/*/test/`
- Tests are filesystem-sandboxed under `process.cwd()`
- Happy path + one edge case minimum coverage

**Monorepo management:**
- Use `pnpm -r <command>` to run across all packages
- Workspace dependencies use `workspace:*` protocol
- Build artifacts go to `dist/` directories

## Troubleshooting

**Build failures:**
- Ensure Node.js >= 18.18 and pnpm >= 9
- Run `pnpm install` first
- Check TypeScript compilation errors in individual packages

**Test failures:**
- Tests create temporary files under `pmt/` directories
- Some test files are auto-generated and change between runs (normal)

**Linting issues:**
- Run `pnpm lint` to auto-fix issues
- Some warnings are expected and don't block CI
- Use `pnpm lint:ci` to check without fixing

**Permission errors with CLI:**
- Use `node packages/cli/dist/index.js` instead of direct execution
- Ensure `pnpm build` was run first

## CI/CD Information

**GitHub Actions:**
- Runs on Node.js 18.x and 20.x
- Tests: install → lint → format → build → test
- Release: triggered by version tags, publishes CLI package to npm

**Quality gates that must pass:**
- All linting checks
- All format checks  
- All packages build successfully
- All test suites pass
