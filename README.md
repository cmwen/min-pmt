# min-pmt

> A minimal, filesystem-based project management tool for developers and AI agents

[![CI](https://github.com/cmwen/min-pmt/actions/workflows/ci.yml/badge.svg)](https://github.com/cmwen/min-pmt/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@cmwen/min-pmt.svg)](https://www.npmjs.com/package/@cmwen/min-pmt)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

min-pmt stores tickets as Markdown files with YAML frontmatter, making them git-friendly, human-readable, and perfect for AI agent collaboration.

## ✨ Features

- 🗂️ **Local-first**: All tickets stored as Markdown files in your repository
- 🤖 **AI-friendly**: MCP (Model Context Protocol) server for AI agents
- 🎨 **Visual management**: Web UI with Kanban board and drag-drop
- ⚡ **Fast CLI**: Bundled single-file executable with minimal dependencies
- 📝 **Git-native**: Tickets are versioned alongside your code
- 🔧 **Configurable**: Customize fields, statuses, and templates

## 🚀 Quick Start

### Installation

No installation required! Use with `npx`:

```bash
# Initialize in your project
npx @cmwen/min-pmt init

# Create a ticket
npx @cmwen/min-pmt add "Fix login bug" --priority high

# List tickets
npx @cmwen/min-pmt list

# Start web UI
npx @cmwen/min-pmt web
```

### Global Installation (Optional)

```bash
npm install -g @cmwen/min-pmt
min-pmt init
```

## 📖 Usage

### Basic Commands

```bash
# Initialize min-pmt in current directory
min-pmt init

# Create tickets
min-pmt add "Implement authentication" --priority high --labels security,backend
min-pmt add "Update documentation" --priority medium

# List all tickets
min-pmt list

# Filter tickets
min-pmt list --status in-progress
min-pmt list --priority high

# Move ticket between statuses
min-pmt move ticket-fix-bug-abc123 done

# Start web UI on custom port
min-pmt web --port 8080
```

### Web UI

Launch a local Kanban board to visualize and manage tickets:

```bash
min-pmt web
# Opens at http://localhost:3000
```

Features:
- 📊 Kanban board with todo/in-progress/done columns
- 🎯 Drag-and-drop to update ticket status
- ✏️ Click tickets to view/edit details
- 🏷️ Visual priority indicators

### Ticket Format

Tickets are stored as Markdown files with YAML frontmatter:

```markdown
---
id: ticket-fix-login-bug-abc123
title: Fix login bug
status: in-progress
priority: high
labels:
  - bug
  - auth
created: 2024-01-15T10:30:00.000Z
updated: 2024-01-15T14:22:00.000Z
---

## Description
Users are unable to login with valid credentials.

## Steps to Reproduce
1. Navigate to /login
2. Enter valid username/password
3. Click submit

## Notes
- Issue appears to be with session validation
- Affects all users as of deployment #42
```

### Configuration

Create `min-pmt.config.js` in your project root:

```javascript
export default {
  folder: 'tickets',  // Custom folder name (default: 'pmt')
  template: {
    defaultStatus: 'todo',
    idPrefix: 'ticket-',
    content: '## Description\n\n## Acceptance Criteria\n'
  }
}
```

### Git Integration

Tickets work naturally with Git:

```bash
# Track ticket changes
git add pmt/
git commit -m "Add feature tickets"

# View ticket history
git log pmt/

# Create feature branch with tickets
git checkout -b feature/auth
min-pmt add "Implement JWT tokens"
git add pmt/ && git commit -m "Add auth tickets"
```

## 🤖 AI Agent Integration

min-pmt includes an MCP (Model Context Protocol) server for AI agents:

```javascript
// AI agents can create and manage tickets programmatically
import { TicketManager } from '@cmwen/min-pmt-core';

const tm = new TicketManager();

// Create ticket
const ticket = await tm.createTicket({
  title: 'Implement user registration',
  priority: 'high',
  labels: ['backend', 'auth']
});

// List tickets
const todos = await tm.listTickets({ status: 'todo' });

// Update status
await tm.updateTicketStatus(ticket.id, 'in-progress');
```

## 🏗️ Project Structure

This is a monorepo containing:

- `packages/core` - Core ticket management engine
- `packages/cli` - Command-line interface (published as `@cmwen/min-pmt`)
- `packages/web` - Web UI with Kanban board
- `packages/mcp` - Model Context Protocol server

Only the CLI package is published to npm - it bundles all functionality into a single executable.

## 🛠️ Development

### Prerequisites

- Node.js >= 18.18
- pnpm >= 9

### Setup

```bash
# Clone repository
git clone https://github.com/cmwen/min-pmt.git
cd min-pmt

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Scripts

- `pnpm build` - Build all packages (~2 seconds)
- `pnpm test` - Run test suite (26 tests)
- `pnpm lint` - Run linter with auto-fix
- `pnpm format` - Format code with Biome
- `pnpm clean` - Clean build artifacts
- `pnpm bundle:cli` - Bundle CLI for publishing
- `pnpm publish:cli` - Publish CLI to npm

### Publishing

The project uses automated CI/CD for publishing:

```bash
# 1. Bump version
cd packages/cli && npm version patch && cd ../..

# 2. Update CHANGELOG.md

# 3. Commit and push to main
git add . && git commit -m "chore: Bump version" && git push

# 4. Create and push tag - triggers automated release!
git tag -a v0.2.9 -m "Release 0.2.9"
git push origin v0.2.9
```

The CI/CD pipeline automatically:
- Runs tests and builds
- Bundles CLI with Rolldown
- Publishes to npm as `@cmwen/min-pmt`
- Creates GitHub Release

For manual publishing, use:
```bash
pnpm release       # Full publish workflow
pnpm release:dry-run  # Test without publishing
```

See [Automated Release Guide](docs/automated-release.md) for details.

## 📚 Documentation

- [Design Document](docs/design.md) - Architecture and technical decisions
- [Product Backlog](docs/product_backlog.md) - Feature roadmap
- [QA Plan](docs/qa_plan.md) - Testing strategy
- [Production Readiness](PRODUCTION_READINESS.md) - Pre-launch checklist
- [Publishing Guide](docs/publishing.md) - Release workflow

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🔗 Links

- [npm Package](https://www.npmjs.com/package/@cmwen/min-pmt)
- [GitHub Repository](https://github.com/cmwen/min-pmt)
- [Issue Tracker](https://github.com/cmwen/min-pmt/issues)
- [Changelog](CHANGELOG.md)

## 💡 Philosophy

min-pmt is designed for developers who want:
- Simple ticket management without heavyweight PM tools
- Tickets that live alongside code in version control
- AI-friendly interfaces for automated project planning
- Local-first data ownership and privacy
- Fast, minimal-dependency tools

---

**Note**: Requires Node.js 18+ and uses only 2 runtime dependencies (commander, gray-matter)
