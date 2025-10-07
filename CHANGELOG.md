# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive README with usage examples and installation instructions
- Single-module publishing script (`scripts/publish-single.sh`)
- `pnpm release` and `pnpm release:dry-run` commands
- Enhanced documentation with badges and better structure
- **Automated CI/CD release workflow** - publish by pushing version tags
- Comprehensive automated release guide (`docs/automated-release.md`)

### Changed
- Improved README to be more user-friendly and comprehensive
- Updated package descriptions with better keywords
- Enhanced release workflow with bundling, verification, and GitHub Releases
- PUBLISHING.md now recommends automated workflow

### Documentation
- Added usage examples for all CLI commands
- Documented AI agent integration
- Added development setup instructions
- Clarified single-module publishing model
- Added automated release workflow guide
- Updated CI/CD pipeline to bundle and verify before publishing

## [0.2.8] - 2024-09-09

### Added
- Publishing workflow and version management scripts
- Automated bundling with Rolldown for single-file CLI distribution

### Changed
- Improved CLI bundling process for better performance

## [0.2.0] - 2024-09-09

### Changed
- Updated package version to 0.2.0
- Removed private flag from package.json to enable public publishing

## [0.1.0] - 2024-09-08

### Added
- Core ticket management engine with filesystem-backed storage
- CLI commands: init, add, list, move, web
- Web UI with Preact-based Kanban board
- Drag-and-drop functionality for ticket status updates
- MCP server for AI agent integration
- Configuration system with custom fields
- Ticket template system
- Comprehensive test suite (26 tests)
- CI/CD workflows for testing and releases
- Documentation: README, design docs, QA plan

### Features
- **Local-first**: Markdown files with YAML frontmatter
- **Frontmatter as source of truth**: Status stored in ticket metadata
- **CLI**: Initialize projects, create/list/move tickets
- **Web UI**: Visual Kanban board with drag-drop
- **MCP Integration**: Protocol server for AI agents
- **TypeScript**: Full type safety across monorepo
- **Monorepo**: Clean workspace structure with pnpm
- **Bundled distribution**: Single-file CLI with minimal dependencies

[Unreleased]: https://github.com/cmwen/min-pmt/compare/v0.2.8...HEAD
[0.2.8]: https://github.com/cmwen/min-pmt/compare/v0.2.0...v0.2.8
[0.2.0]: https://github.com/cmwen/min-pmt/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/cmwen/min-pmt/releases/tag/v0.1.0
