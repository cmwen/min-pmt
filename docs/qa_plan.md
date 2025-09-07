# QA Plan

This plan validates min-pmt against Vision, Product Backlog, and Design. It emphasizes happy paths and edge cases, automates where possible, and maintains traceability.

## Scope and Objectives
- Validate CLI init/add/list/move (F1.1/F1.2)
- Validate Web API (F3.1) CRUD endpoints used by SPA
- Capture gaps for MCP (F2.1) where not yet implemented
- Ensure frontmatter is the source of truth for status

## Documentation Verification [QA → Governance]
- Vision exists and links to Product: docs/vision.md → product_backlog.md
- Product links to Design: docs/product_backlog.md → design.md
- Design links to Execution and defines authority of frontmatter
- Execution Log present with latest changes and suggested tests
- QA Plan (this) exists and links to Governance
- Governance doc exists
- .gitignore present and comprehensive
Status: PASS for existence and linking; see Risks for known gaps.

## Acceptance Criteria ↔ Test Scenarios
- US1.1 init: Running `min-pmt init` creates config file and pmt folder → CLI integration test covers
- US1.2 add/list: Adding a ticket via CLI persists markdown with frontmatter and lists → Unit + CLI tests cover
- Status source of truth: Updating status changes frontmatter, file location organizational → Unit tests cover
- Web API: GET/POST/PATCH endpoints behave and validate bodies → Web tests cover
- Drag-drop UI: Not yet automated (manual/visual) → Deferred
- MCP tools: Server skeleton exists; tool behaviors not wired to HTTP here → Deferred with action items

## Test Plan
- Unit tests (core): ticket creation/listing/filtering/status update; edge cases (malformed files, nested dirs)
- Integration tests (CLI): init/add/list/move with stdout assertions
- Integration tests (Web): API endpoints (already present)
- Lint/Format: Biome checks
- Build: TypeScript project builds for each package

## Edge Cases
- Malformed/empty markdown files in pmt directory [Added test]
- Nested directories under pmt are scanned [Added test]
- Invalid status values present in frontmatter (current behavior: passed through) [Documented]
- Concurrent writes (not covered yet) [Planned]
- Very large number of tickets (perf smoke) [Planned]

## Bugs and Feedback
- [QA → Execution: Bug] Missing runtime validation for status when reading tickets; invalid status can slip through to UI and API responses. Severity: Medium. Suggested fix: validate against TicketStatusSchema during list/get.
- [QA → Governance] MCP expected outputs in design exist, but tests and end-to-end flows for MCP are minimal. Severity: Medium. Suggest adding tool-level tests and wiring examples.
- [QA → Execution: Bug] Web UI Kanban does not support drag-drop to update status yet (design mentions). Severity: Low (Phase 2). Track as enhancement.

## Regression Testing
- On each change: run pnpm -w test, pnpm lint:ci, and build all packages
- Keep unit and integration tests deterministic and filesystem-sandboxed under process.cwd()

## Quality Gates
- Build: PASS required
- Lint/Format: PASS (biome check .)
- Tests: PASS (unit+integration)

---
Created by QA Agent | Links: [Execution Log](execution_log.md) → [Governance](governance_traceability.md)
