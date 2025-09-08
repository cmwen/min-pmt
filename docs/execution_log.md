# Execution Log

## 2025-09-08 - Configuration and Template System Implementation

- Feature: Implemented comprehensive configuration and template system for customizable ticket creation and project setup
- Linked Backlog: [F1.3 Configuration System] Flexible field definitions via config files; [Design] Template configuration and customizable ticket templates
- Design Decision: Enhanced ProjectConfig interface with states, schema, and template configuration while maintaining backward compatibility
- Code Changes:
  - **Enhanced ProjectConfig Interface**: Extended types.ts with StateConfig, FieldConfig, and TemplateConfig interfaces
  - **Template System**: Added configurable ticket content templates with custom sections (Description, Acceptance Criteria, Notes, etc.)
  - **State Configuration**: Added support for custom status states with colors and ordering for UI customization
  - **Schema Configuration**: Added field type definitions and validation rules for custom project schemas  
  - **ID Generation**: Made ticket ID prefix configurable via template configuration
  - **TicketManager Enhancements**: Added getConfig(), getStates(), getSchema(), getTemplate() methods for configuration access
  - **CLI Enhancements**: Added `min-pmt config` command to display current project configuration
  - **Web API**: Added `/api/config` endpoint to expose configuration to frontend clients
  - **Default Configuration**: Comprehensive default config with todo/in-progress/done states, standard field schema, and professional ticket template
- Configuration Features:
  - Custom ticket content templates with markdown formatting
  - Configurable ticket ID prefixes (e.g., 'task-', 'bug-', 'feature-')
  - Custom status states with UI colors and display ordering
  - Field type definitions for validation and UI generation
  - Backward compatibility with existing simple folder-only configurations
- Tests: Added comprehensive configuration.test.ts with 7 test cases covering:
  - Default configuration loading and validation
  - Custom configuration with states, schema, and template
  - Custom template content in created tickets
  - Template default status inheritance
  - Explicit status override capabilities
  - Configuration accessor methods
  - Partial configuration handling with graceful fallbacks
- Manual Validation: 
  - Tested CLI commands with default and custom configurations
  - Verified custom template content appears in created tickets
  - Confirmed custom ID prefixes are applied correctly
  - Validated configuration API endpoint returns proper JSON
- Suggested Tests [Execution → QA]:
  - Test configuration validation with invalid field types or status values
  - Test template content with various markdown structures and special characters
  - Verify state configuration affects UI properly (colors, ordering)
  - Test schema configuration with different field types and validation rules
  - Validate configuration inheritance and fallback behavior
  - Test configuration file loading precedence (JS vs JSON)
- Notes: All changes maintain full backward compatibility. Simple folder-only configurations continue to work with enhanced defaults applied automatically.

## 2025-09-08 - Major Web UI Enhancement: Complete UX Overhaul

- Feature: Comprehensive web UI improvement with modern design, enhanced UX, and accessibility
- Linked Backlog: [F3.2 WebUI usability] Enhanced user experience and professional design; [Design] Modern, accessible interface
- Code Changes:
  - **Visual Design Overhaul**: Implemented modern CSS with design tokens, gradients, improved typography (Inter font), better spacing, shadows, and visual hierarchy
  - **Toast Notification System**: Added Toast component with success/error/warning/info messages, auto-dismiss, and manual dismiss functionality
  - **Inline Ticket Editing**: Added double-click to edit functionality with save/cancel, keyboard shortcuts (Cmd+Enter to save, Esc to cancel)
  - **Search Functionality**: Implemented real-time search across ticket titles, descriptions, and IDs with clear button
  - **Enhanced Accessibility**: Added ARIA labels, roles, screen reader support, keyboard navigation, skip links, high contrast mode support
  - **Mobile Responsive Design**: Complete responsive layout with mobile-first approach, touch-friendly interactions
  - **Error Handling**: Replaced alert() calls with user-friendly toast notifications
  - **Visual Improvements**: Status-based column colors, priority badges with gradients, improved loading states, better empty states
- Component Updates:
  - App.tsx: Added toast state management, search filtering, accessibility improvements
  - Header.tsx: Added search form, improved ARIA labels, form validation
  - KanbanBoard.tsx: Enhanced accessibility with proper roles and live regions
  - TicketCard.tsx: Added inline editing, better keyboard navigation, ARIA labels
  - Toast.tsx: New component for user feedback notifications
- CSS Enhancements:
  - CSS custom properties for theming and consistency
  - Modern responsive grid layout for kanban board
  - Improved focus states and keyboard navigation
  - Support for reduced motion and high contrast preferences
  - Mobile-optimized layouts and touch interactions
- Suggested Tests [Execution → QA]:
  - Test all keyboard navigation (Tab, Enter, Space, E for edit, Esc to cancel)
  - Verify toast notifications appear and auto-dismiss
  - Test search functionality across all ticket fields
  - Verify inline editing saves/cancels properly
  - Test responsive design on mobile devices
  - Test accessibility with screen readers
  - Verify drag-and-drop still works correctly
- Performance: Client-side filtering for better responsiveness, optimized re-renders with useMemo
- Notes: All improvements maintain backward compatibility with existing API. Inline editing shows UI but would need backend API extension for persistence.

## 2025-09-08 - Web UI UX improvements (inline add, filter, DnD)

- Feature: Improved Web UI with inline ticket creation, priority filter, drag-and-drop between columns, and enhanced styling.
- Linked Backlog: [F3.2 WebUI usability] Quick add and manage tickets; [Design] Kanban interactions.
- Code Changes:
  - Header now contains an inline add form (title + priority) and a priority filter dropdown.
  - App state tracks priority filter and includes it in API queries; creation supports optional priority.
  - KanbanBoard supports drag-and-drop: drag cards, drop on columns to update status; column item counts and empty states.
  - TicketCard shows a priority badge, is draggable, and keeps keyboard activation for a11y.
  - Styles updated for header controls, badges, drag-over states, and layout polish.
- Suggested Tests [Execution → QA]:
  - Server API unaffected: existing tests should pass. Add client E2E later to simulate DnD if we add Playwright.
  - Manual: start web, add tickets via header, filter by priority, drag card across columns, ensure status updates.
- Notes: All changes are client-side; no API contract changes besides optional priority on create (already supported by core schema).

## 2025-09-07 - Biome setup for linting and formatting

- Feature: Added Biome for fast, modern linting and code formatting across the monorepo
- Linked Backlog: [Technical debt] Code quality and consistency improvements
- Code Changes:
  - Installed `@biomejs/biome` as dev dependency in root workspace
  - Created comprehensive `biome.json` configuration with TypeScript, JavaScript, and JSON formatting rules
  - Added `.biomeignore` file to exclude build artifacts, dependencies, and generated files
  - Added lint and format scripts to all package.json files (root and individual packages)
  - Applied automatic formatting and fixing to all existing code
  - Configured sensible defaults: 2-space indentation, single quotes, trailing commas, 100-char line width
  - Set up lint rules: recommended set + custom rules for complexity, unused variables, explicit any warnings
- Scripts added:
  - `pnpm lint` / `pnpm lint:ci` - check and fix linting issues
  - `pnpm format` / `pnpm format:check` - format code or check formatting
  - Package-level scripts for targeted linting/formatting within each package
- Tests: All builds and tests still pass after formatting changes
- Notes [Execution → QA]:
  - Biome provides much faster linting/formatting than ESLint + Prettier combination
  - Configuration allows unsafe fixes for aggressive auto-fixing
  - Some legitimate 'any' type warnings remain in CLI and web packages (expected for option parsing)
  - Code complexity warnings in TicketManager suggest future refactoring opportunities

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

## 2025-09-07 - Web UI Migration to Preact

- Feature: Fixed Web UI static file serving and migrated from vanilla JS to Preact framework
- Issue Fixed: Web UI was not working locally due to incorrect static file copying in build process
- Framework Migration: Replaced vanilla JavaScript kanban board with modern Preact-based implementation
- Design Decision: Updated from vanilla JS to Preact for better maintainability while keeping small bundle size
- Build System: Configured Vite for Preact client builds alongside TypeScript server compilation
- Features Implemented:
  - Modern component-based architecture with App, Header, KanbanBoard, and TicketCard components  
  - Enhanced UI styling with cards, shadows, hover effects, and improved typography
  - Interactive ticket management (create, move between columns via click)
  - Real-time API integration with proper error handling
  - Loading states and responsive design
- Tests: All existing server tests pass; client-side code uses Vite for building
- CLI Integration: `min-pmt web` command works seamlessly with new Preact implementation

## Implemented Features
- [Repo scaffolding] Initialized pnpm TypeScript monorepo with core package and tests. Status: Done.
- [F1.2 Minimal Core] Implemented minimal TicketManager (create/list) with gray-matter and unit tests. Status: Done.
- [F1.2 Update Status] Added TicketManager.updateTicketStatus(id, newStatus) to update frontmatter status and timestamp. Status: Done.
- [F1.3 Configuration System] Implemented comprehensive configuration system with states, schema, and template customization. Status: Done.
- [Monorepo restructuring] Separated core, CLI, MCP, and Web into dedicated packages with proper dependencies. Status: Done.
- [Code quality] Implemented Biome for fast linting and formatting across all packages. Status: Done.
- [F3.2 WebUI Enhanced UX] Complete modern UI overhaul with accessibility, search, inline editing, and professional design. Status: Done.

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
- Configured Biome for consistent code style and quality across all packages
- Implemented comprehensive web UI improvements with modern design system, accessibility features, and enhanced user experience

## Integration Notes
- Use pnpm v10+ (declared via packageManager) and Node 18+.
- Packages reside under `packages/*`; add new packages there.
- CLI can be accessed via `@min-pmt/cli` package or root workspace scripts
- Web UI can be started via CLI (`min-pmt web`) or directly via `@min-pmt/web` package
- MCP server can be run via `@min-pmt/mcp` package for Model Context Protocol integration
- Use `pnpm lint` and `pnpm format` for code quality maintenance

## Technical Debt
- Consider addressing complexity warnings in TicketManager methods (refactor large functions)
- Add integration tests that test cross-package functionality
- Consider adding package for shared types/utilities if needed in the future
- Inline editing UI is implemented but needs backend API extension for persistence
- Add configuration validation to prevent invalid state or field configurations
- Consider implementing configuration migration utilities for major schema changes

## Suggested Tests
[Execution → QA] Validate TicketManager create/list across edge cases and malformed frontmatter scenarios.
- Unit tests for core ticket parsing, listing, and status updates once implemented.
- Integration tests for CLI commands (init, add, list, move) using temp dirs.
- Edge cases: malformed frontmatter, missing fields, large directories, concurrent writes.
- Additional: verify file path remains unchanged during status update (organizational only) and that updated timestamp changes.
- Cross-package integration tests to ensure CLI, Web, and MCP packages work correctly with core
- Code quality: run `pnpm lint:ci` in CI to ensure consistent formatting and catch linting issues
- Web UI: Test keyboard navigation, screen reader compatibility, mobile responsive design
- Test search functionality across ticket titles, descriptions, and IDs
- Test toast notifications and inline editing functionality
- Verify drag-and-drop interactions work correctly after UI improvements

---
*Created by Execution Agent | Links: [Design](design.md) → [QA Plan](qa_plan.md)*

## 2025-09-07 - Biome setup for linting and formatting

- Feature: Added Biome for fast, modern linting and code formatting across the monorepo
- Linked Backlog: [Technical debt] Code quality and consistency improvements
- Code Changes:
  - Installed `@biomejs/biome` as dev dependency in root workspace
  - Created comprehensive `biome.json` configuration with TypeScript, JavaScript, and JSON formatting rules
  - Added `.biomeignore` file to exclude build artifacts, dependencies, and generated files
  - Added lint and format scripts to all package.json files (root and individual packages)
  - Applied automatic formatting and fixing to all existing code
  - Configured sensible defaults: 2-space indentation, single quotes, trailing commas, 100-char line width
  - Set up lint rules: recommended set + custom rules for complexity, unused variables, explicit any warnings
- Scripts added:
  - `pnpm lint` / `pnpm lint:ci` - check and fix linting issues
  - `pnpm format` / `pnpm format:check` - format code or check formatting
  - Package-level scripts for targeted linting/formatting within each package
- Tests: All builds and tests still pass after formatting changes
- Notes [Execution → QA]:
  - Biome provides much faster linting/formatting than ESLint + Prettier combination
  - Configuration allows unsafe fixes for aggressive auto-fixing
  - Some legitimate 'any' type warnings remain in CLI and web packages (expected for option parsing)
  - Code complexity warnings in TicketManager suggest future refactoring opportunities

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

## 2025-09-07 - Web UI Migration to Preact

- Feature: Fixed Web UI static file serving and migrated from vanilla JS to Preact framework
- Issue Fixed: Web UI was not working locally due to incorrect static file copying in build process
- Framework Migration: Replaced vanilla JavaScript kanban board with modern Preact-based implementation
- Design Decision: Updated from vanilla JS to Preact for better maintainability while keeping small bundle size
- Build System: Configured Vite for Preact client builds alongside TypeScript server compilation
- Features Implemented:
  - Modern component-based architecture with App, Header, KanbanBoard, and TicketCard components  
  - Enhanced UI styling with cards, shadows, hover effects, and improved typography
  - Interactive ticket management (create, move between columns via click)
  - Real-time API integration with proper error handling
  - Loading states and responsive design
- Tests: All existing server tests pass; client-side code uses Vite for building
- CLI Integration: `min-pmt web` command works seamlessly with new Preact implementation

## Implemented Features
- [Repo scaffolding] Initialized pnpm TypeScript monorepo with core package and tests. Status: Done.
- [F1.2 Minimal Core] Implemented minimal TicketManager (create/list) with gray-matter and unit tests. Status: Done.
- [F1.2 Update Status] Added TicketManager.updateTicketStatus(id, newStatus) to update frontmatter status and timestamp. Status: Done.
- [Monorepo restructuring] Separated core, CLI, MCP, and Web into dedicated packages with proper dependencies. Status: Done.
- [Code quality] Implemented Biome for fast linting and formatting across all packages. Status: Done.

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
- Configured Biome for consistent code style and quality across all packages

## Integration Notes
- Use pnpm v10+ (declared via packageManager) and Node 18+.
- Packages reside under `packages/*`; add new packages there.
- CLI can be accessed via `@min-pmt/cli` package or root workspace scripts
- Web UI can be started via CLI (`min-pmt web`) or directly via `@min-pmt/web` package
- MCP server can be run via `@min-pmt/mcp` package for Model Context Protocol integration
- Use `pnpm lint` and `pnpm format` for code quality maintenance

## Technical Debt
- Consider addressing complexity warnings in TicketManager methods (refactor large functions)
- Add integration tests that test cross-package functionality
- Consider adding package for shared types/utilities if needed in the future

## Suggested Tests
[Execution → QA] Validate TicketManager create/list across edge cases and malformed frontmatter scenarios.
- Unit tests for core ticket parsing, listing, and status updates once implemented.
- Integration tests for CLI commands (init, add, list, move) using temp dirs.
- Edge cases: malformed frontmatter, missing fields, large directories, concurrent writes.
- Additional: verify file path remains unchanged during status update (organizational only) and that updated timestamp changes.
- Cross-package integration tests to ensure CLI, Web, and MCP packages work correctly with core
- Code quality: run `pnpm lint:ci` in CI to ensure consistent formatting and catch linting issues

---
*Created by Execution Agent | Links: [Design](design.md) → [QA Plan](qa_plan.md)*
