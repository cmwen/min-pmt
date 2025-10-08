# @cmwen/min-pmt - Minimal Project Management Tool

A lightweight, filesystem-based project management tool that uses Markdown files with YAML frontmatter for ticket storage.

## Installation

### Via npx (Recommended)
```bash
npx @cmwen/min-pmt init
```

### Global Installation
```bash
npm install -g @cmwen/min-pmt
min-pmt init
```

### Local Installation
```bash
npm install @cmwen/min-pmt
npx min-pmt init
```

## Quick Start

1. **Initialize** in your project directory:
   ```bash
   npx @cmwen/min-pmt init
   ```

2. **Create your first ticket**:
   ```bash
   npx @cmwen/min-pmt add "Fix login bug" --priority high --labels bug,auth
   ```

3. **List tickets**:
   ```bash
   npx @cmwen/min-pmt list
   ```

4. **Move tickets between statuses**:
   ```bash
   npx @cmwen/min-pmt move ticket-fix-login-bug-abc123 in-progress
   ```

## Commands

### `init`
Initialize min-pmt in the current project.

```bash
min-pmt init [options]
```

**Options:**
- `-f, --folder <name>` - PMT folder name (default: "pmt")

**Example:**
```bash
min-pmt init --folder tickets
```

### `add`
Create a new ticket.

```bash
min-pmt add <title> [options]
```

**Options:**
- `-d, --description <desc>` - Ticket description
- `-p, --priority <priority>` - Priority level (low, medium, high, critical)
- `-l, --labels <labels>` - Comma-separated labels
- `-s, --status <status>` - Initial status (todo, in-progress, done)

**Examples:**
```bash
# Basic ticket
min-pmt add "Update documentation"

# Ticket with all options
min-pmt add "Fix API endpoint" \
  --description "The /users endpoint returns 500 error" \
  --priority high \
  --labels api,bug \
  --status todo
```

### `list` / `ls`
List all tickets with optional filtering.

```bash
min-pmt list [options]
```

**Options:**
- `-s, --status <status>` - Filter by status (todo, in-progress, done)
- `-p, --priority <priority>` - Filter by priority (low, medium, high, critical)

**Examples:**
```bash
# List all tickets
min-pmt list

# List only in-progress tickets
min-pmt list --status in-progress

# List high priority tickets
min-pmt list --priority high
```

### `move`
Move a ticket to a different status.

```bash
min-pmt move <ticketId> <newStatus>
```

**Parameters:**
- `ticketId` - The ticket ID (e.g., ticket-fix-bug-abc123)
- `newStatus` - New status (todo, in-progress, done)

**Example:**
```bash
min-pmt move ticket-fix-bug-abc123 done
```

### `mcp`
Start the MCP (Model Context Protocol) server over stdio for AI agents. The server loads your current project configuration so tickets created through MCP use the same folder, states, and templates as the CLI.

```bash
min-pmt mcp
```

**Notes:**
- Designed to be executed by MCP-compatible AI clients; it emits protocol traffic over stdio and intentionally produces no human-readable output.
- Use Ctrl+C to terminate the process when running manually.

### `web`
Start the web UI server for visual ticket management.

```bash
min-pmt web [options]
```

**Options:**
- `-p, --port <port>` - Port number (default: 3000)

**Example:**
```bash
min-pmt web --port 8080
```

## File Structure

min-pmt stores tickets as Markdown files with YAML frontmatter:

```
pmt/
├── ticket-fix-login-bug-abc123.md
├── ticket-update-docs-def456.md
└── ticket-add-tests-ghi789.md
```

Each ticket file contains:

```markdown
---
title: Fix login bug
status: in-progress
priority: high
labels:
  - bug
  - auth
created: 2024-01-15T10:30:00.000Z
updated: 2024-01-15T14:22:00.000Z
---

## Notes

Investigation shows the issue is with session validation.
```

## Configuration

Create a `min-pmt.config.js` file in your project root:

```javascript
export default {
  folder: 'tickets'  // Change from default 'pmt'
}
```

Or use JSON format (`min-pmt.config.json`):

```json
{
  "folder": "tickets"
}
```

## Integration with Other Tools

### Git Integration
Tickets are just files, so they work naturally with Git:

```bash
# Track ticket changes
git add pmt/
git commit -m "Add new feature tickets"

# See ticket history
git log --oneline pmt/
```

### Editor Integration
Edit tickets directly in your favorite editor. The frontmatter controls the ticket metadata.

### CI/CD Integration
Use min-pmt in scripts:

```bash
# Create tickets from CI
npx @cmwen/min-pmt add "Deploy to production" --priority critical

# List failed build tickets
npx @cmwen/min-pmt list --labels build --status todo
```

### AI Agent Integration (MCP)
Expose the MCP server for compatible AI assistants:

```bash
min-pmt mcp
```

- Streams Model Context Protocol messages over stdio (no human-oriented output)
- Reuses your local configuration, so tickets land in the same folder and state definitions
- Ideal for wiring agents like GitHub Copilot or custom LLM tools into your ticket workflow

## API Usage

For programmatic access, use the core library:

```javascript
import { TicketManager } from '@cmwen/min-pmt-core';

const tm = new TicketManager();
const ticket = await tm.createTicket({
  title: 'Programmatic ticket',
  priority: 'medium'
});
```

## Technical Details

This CLI is built with **Rolldown** (Rust-based bundler) and bundles all dependencies into a single executable file. It only requires two external npm packages: `commander` and `gray-matter`.

## Requirements

- Node.js >= 18.18
- Dependencies: commander, gray-matter (auto-installed)

## Development

For development on this CLI, see the [main repository](https://github.com/cmwen/min-pmt).

## License

MIT

## Contributing

See the main repository for contribution guidelines.

## Support

- 🐛 Report issues: [GitHub Issues](https://github.com/cmwen/min-pmt/issues)
- 📖 Documentation: [GitHub Repository](https://github.com/cmwen/min-pmt)