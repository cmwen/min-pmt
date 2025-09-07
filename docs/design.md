# System Design: min-pmt

## Architecture Overview

**[Product Backlog → Design]** min-pmt follows a modular, local-first architecture with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    min-pmt CLI Tool                         │
├─────────────────────────────────────────────────────────────┤
│  CLI Commands     │  MCP Server      │  WebUI Server        │
│                   │                  │                      │
│  • npx min-pmt    │  • HTTP Endpoints│  • Express Server    │
│    init           │  • Tool Handlers │  • Static Assets     │
│  • npx min-pmt    │  • File I/O      │  • REST API          │
│    add <title>    │  • Validation    │  • WebSocket (opt)   │
│  • npx min-pmt    │                  │                      │
│    status         │                  │                      │
│  • npx min-pmt    │                  │                      │
│    web            │                  │                      │
├─────────────────────────────────────────────────────────────┤
│                 Core Ticket Engine                          │
│                                                             │
│  • File System Manager                                      │
│  • Configuration Loader                                     │
│  • Markdown Parser/Writer                                   │
│  • State Validator                                          │
├─────────────────────────────────────────────────────────────┤
│                    File System                              │
│                                                             │
│  pmt/                                                       │
│  ├── todo/                                                  │
│  ├── in-progress/                                           │
│  ├── done/                                                  │
│  └── config.json                                            │
│                                                             │
│  min-pmt.config.js                                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Designs

### 1. Core Ticket Engine

**[Product Backlog F1.2 → Design]** The `TicketManager` class implements frontmatter-first status management:

```typescript
// src/core/TicketManager.ts
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export class TicketManager {
  
  async listTickets(filters?: { status?: string; priority?: string }): Promise<Ticket[]> {
    // Read ALL markdown files from ALL folders
    const allTickets: Ticket[] = [];
    const pmtPath = await this.getPmtPath();
    
    // Recursively scan all subdirectories for .md files
    const markdownFiles = await this.findAllMarkdownFiles(pmtPath);
    
    for (const filePath of markdownFiles) {
      const ticket = await this.parseTicketFromFile(filePath);
      if (ticket && this.matchesFilters(ticket, filters)) {
        allTickets.push(ticket);
      }
    }
    
    return allTickets;
  }

  async updateTicketStatus(ticketId: string, newStatus: string): Promise<void> {
    // 1. Find ticket by ID (search all folders)
    const ticket = await this.findTicketById(ticketId);
    if (!ticket) throw new Error(`Ticket ${ticketId} not found`);
    
    // 2. Update frontmatter status (source of truth)
    const updatedContent = this.updateFrontmatterStatus(ticket.content, newStatus);
    
    // 3. Calculate new file path based on new status (for organization)
    const currentPath = ticket.filePath;
    const newPath = this.calculatePathForStatus(ticket.id, newStatus);
    
    // 4. Move file to appropriate folder (if needed) and update content
    if (currentPath !== newPath) {
      await fs.mkdir(path.dirname(newPath), { recursive: true });
      await fs.writeFile(newPath, updatedContent);
      await fs.unlink(currentPath); // Remove old file
    } else {
      await fs.writeFile(currentPath, updatedContent);
    }
  }

  private parseTicketFromFile(filePath: string): Ticket {
    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = matter(content);
    
    // Status comes from frontmatter, NOT folder location
    return {
      id: parsed.data.id,
      title: parsed.data.title,
      status: parsed.data.status,  // ← Source of truth
      priority: parsed.data.priority,
      labels: parsed.data.labels,
      assignee: parsed.data.assignee,
      created: new Date(parsed.data.created),
      updated: new Date(parsed.data.updated),
      due: parsed.data.due ? new Date(parsed.data.due) : undefined,
      filePath: filePath,
      content: content
    };
  }

  private calculatePathForStatus(ticketId: string, status: string): string {
    // Organize files by status folder for convenience
    const pmtPath = this.getPmtPath();
    return path.join(pmtPath, status, `${ticketId}.md`);
  }

  private updateFrontmatterStatus(content: string, newStatus: string): string {
    const parsed = matter(content);
    parsed.data.status = newStatus;
    parsed.data.updated = new Date().toISOString();
    return matter.stringify(parsed.content, parsed.data);
  }
}
```

**Key Principle**: The system always reads `status` from markdown frontmatter as the authoritative source. Folder structure is purely organizational and may not always match frontmatter status (e.g., during sync conflicts or manual edits).

### 2. CLI Component Design

**[Product Backlog F1.1 → Design]** Folder-based organization for convenience, **frontmatter status as source of truth**:

```
pmt/
├── todo/                               # Organizational folder (convenience)
│   ├── ticket-001-implement-auth.md   # status: todo (in frontmatter)
│   └── ticket-002-setup-database.md   # status: todo (in frontmatter)
├── in-progress/                        # Organizational folder (convenience)
│   └── ticket-003-create-ui.md        # status: in-progress (in frontmatter)
├── done/                               # Organizational folder (convenience)
│   └── ticket-004-project-init.md     # status: done (in frontmatter)
└── config.json                        # Local overrides
```

**Important**: The system reads `status` from markdown frontmatter as the authoritative source. Folder location is purely for file organization and visual convenience.

**Configuration Schema:**
```javascript
// min-pmt.config.js
export default {
  // Folder configuration
  folder: "pmt",                        // Configurable folder name
  
  // State definitions
  states: {
    "todo": { color: "#gray", order: 1 },
    "in-progress": { color: "#blue", order: 2 },
    "done": { color: "#green", order: 3 }
  },
  
  // Field definitions
  schema: {
    title: { type: "string", required: true },
    description: { type: "string", required: false },
    status: { type: "string", enum: ["todo", "in-progress", "done"], required: true },
    priority: { type: "string", enum: ["low", "medium", "high", "critical"], required: false },
    labels: { type: "array", items: "string", required: false },
    assignee: { type: "string", required: false },
    created: { type: "date", required: true },
    updated: { type: "date", required: true },
    due: { type: "date", required: false }
  },
  
  // Template configuration
  template: {
    defaultStatus: "todo",
    generateId: true,                   // Auto-generate ticket IDs
    idPrefix: "ticket-"
  }
}
```

**Ticket Schema (Markdown Frontmatter):**
```yaml
---
id: ticket-001
title: "Implement user authentication"
description: "Add JWT-based authentication system with login/logout functionality"
status: todo
priority: high
labels: ["auth", "security", "backend"]
assignee: "developer@example.com"
created: 2025-09-07T10:00:00Z
updated: 2025-09-07T10:00:00Z
due: 2025-09-15T00:00:00Z
---

## Requirements
- [ ] Implement JWT token generation
- [ ] Create login endpoint
- [ ] Add logout functionality
- [ ] Write unit tests

## Acceptance Criteria
- User can login with valid credentials
- JWT token expires after 24 hours
- Invalid tokens return 401 status

## Notes
Consider using bcrypt for password hashing.
```

### 2. CLI Component Design

**[Product Backlog F1.2 → Design]** Command-line interface using Commander.js:

```typescript
// src/cli/index.ts
import { Command } from 'commander';
import { TicketManager } from '../core/TicketManager';
import { ConfigLoader } from '../core/ConfigLoader';

const program = new Command();

program
  .name('min-pmt')
  .description('Minimal Project Management Tool')
  .version('1.0.0');

// Initialize project
program
  .command('init')
  .description('Initialize min-pmt in current project')
  .option('-f, --folder <name>', 'PMT folder name', 'pmt')
  .option('-t, --template <name>', 'Template to use', 'default')
  .action(async (options) => {
    const config = await ConfigLoader.initialize(options);
    await TicketManager.initializeProject(config);
  });

// Add new ticket
program
  .command('add <title>')
  .description('Create a new ticket')
  .option('-d, --description <desc>', 'Ticket description')
  .option('-p, --priority <priority>', 'Priority level')
  .option('-l, --labels <labels>', 'Comma-separated labels')
  .action(async (title, options) => {
    const manager = new TicketManager();
    await manager.createTicket({ title, ...options });
  });

// List tickets
program
  .command('list')
  .alias('ls')
  .description('List all tickets')
  .option('-s, --status <status>', 'Filter by status')
  .option('-p, --priority <priority>', 'Filter by priority')
  .action(async (options) => {
    const manager = new TicketManager();
    const tickets = await manager.listTickets(options);
    console.table(tickets);
  });

// Update ticket status
program
  .command('move <ticketId> <newStatus>')
  .description('Move ticket to different status')
  .action(async (ticketId, newStatus) => {
    const manager = new TicketManager();
    await manager.updateTicketStatus(ticketId, newStatus);
  });

// Start web UI
program
  .command('web')
  .description('Start web UI server')
  .option('-p, --port <port>', 'Port number', '3000')
  .action(async (options) => {
    const { WebUIServer } = await import('../web/server');
    const server = new WebUIServer(options.port);
    await server.start();
  });
```

### 3. MCP Server Design

**[Product Backlog F2.1 → Design]** Model Context Protocol integration for AI agents:

```typescript
// src/mcp/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport, SSEServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { TicketManager } from '../core/TicketManager';

export class MinPmtMcpServer {
  private server: McpServer;
  private ticketManager: TicketManager;

  constructor() {
    this.server = new McpServer({
      name: "min-pmt-mcp",
      version: "1.0.0",
      description: "MCP server for min-pmt ticket management"
    });
    
    this.ticketManager = new TicketManager();
    this.registerTools();
  }

  private registerTools() {
    // Create new ticket tool
    this.server.tool(
      "create-ticket",
      {
        title: z.string().describe("Ticket title"),
        description: z.string().optional().describe("Ticket description"),
        priority: z.enum(["low", "medium", "high", "critical"]).optional(),
        labels: z.array(z.string()).optional().describe("Array of labels"),
        assignee: z.string().optional().describe("Assignee email"),
        due: z.string().optional().describe("Due date (ISO 8601)")
      },
      async (params) => {
        try {
          const ticket = await this.ticketManager.createTicket(params);
          return {
            content: [{
              type: "text",
              text: `✅ Created ticket: ${ticket.id} - "${ticket.title}"`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text", 
              text: `❌ Error creating ticket: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // Move ticket tool  
    this.server.tool(
      "move-ticket",
      {
        ticketId: z.string().describe("Ticket ID to move"),
        newStatus: z.enum(["todo", "in-progress", "done"]).describe("New status")
      },
      async ({ ticketId, newStatus }) => {
        try {
          await this.ticketManager.updateTicketStatus(ticketId, newStatus);
          return {
            content: [{
              type: "text",
              text: `✅ Moved ticket ${ticketId} to ${newStatus}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Error moving ticket: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );

    // List tickets tool
    this.server.tool(
      "list-tickets",
      {
        status: z.enum(["todo", "in-progress", "done"]).optional(),
        priority: z.enum(["low", "medium", "high", "critical"]).optional()
      },
      async (filters) => {
        try {
          const tickets = await this.ticketManager.listTickets(filters);
          const summary = tickets.map(t => 
            `${t.id}: ${t.title} [${t.status}] (${t.priority || 'no priority'})`
          ).join('\n');
          
          return {
            content: [{
              type: "text",
              text: `📋 Tickets:\n${summary}`
            }]
          };
        } catch (error) {
          return {
            content: [{
              type: "text",
              text: `❌ Error listing tickets: ${error.message}`
            }],
            isError: true
          };
        }
      }
    );
  }

  async startStdio() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }

  async startSSE(app: Express.Application) {
    // SSE implementation for web-based MCP clients
    const transports: { [sessionId: string]: SSEServerTransport } = {};
    
    app.get("/mcp/sse", async (req, res) => {
      const transport = new SSEServerTransport("/mcp/messages", res);
      transports[transport.sessionId] = transport;
      res.on("close", () => delete transports[transport.sessionId]);
      await this.server.connect(transport);
    });

    app.post("/mcp/messages", async (req, res) => {
      const sessionId = req.query.sessionId as string;
      const transport = transports[sessionId];
      if (transport) {
        await transport.handlePostMessage(req, res);
      } else {
        res.status(400).send("No transport found for sessionId");
      }
    });
  }
}
```

### 4. WebUI Design

**[Product Backlog F3.1, F3.2 → Design]** Express.js server with REST API and static assets:

```typescript
// src/web/server.ts
import express from 'express';
import path from 'path';
import { TicketManager } from '../core/TicketManager';
import { MinPmtMcpServer } from '../mcp/server';

export class WebUIServer {
  private app: express.Application;
  private ticketManager: TicketManager;
  private mcpServer: MinPmtMcpServer;

  constructor(private port: number = 3000) {
    this.app = express();
    this.ticketManager = new TicketManager();
    this.mcpServer = new MinPmtMcpServer();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, 'public')));
  }

  private setupRoutes() {
    // API Routes
    this.app.get('/api/tickets', async (req, res) => {
      try {
        const tickets = await this.ticketManager.listTickets(req.query);
        res.json(tickets);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    this.app.post('/api/tickets', async (req, res) => {
      try {
        const ticket = await this.ticketManager.createTicket(req.body);
        res.status(201).json(ticket);
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    this.app.patch('/api/tickets/:id/status', async (req, res) => {
      try {
        await this.ticketManager.updateTicketStatus(req.params.id, req.body.status);
        res.json({ success: true });
      } catch (error) {
        res.status(400).json({ error: error.message });
      }
    });

    // MCP Server routes
    this.mcpServer.startSSE(this.app);

    // Serve React/Vue SPA
    this.app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'public/index.html'));
    });
  }

  async start() {
    this.app.listen(this.port, () => {
      console.log(`🚀 min-pmt WebUI running at http://localhost:${this.port}`);
      console.log(`📋 MCP Server available at http://localhost:${this.port}/mcp`);
    });
  }
}
```

**Frontend Kanban Board (HTML/CSS/JS):**
```html
<!-- src/web/public/index.html -->
<!DOCTYPE html>
<html>
<head>
  <title>min-pmt - Project Management</title>
  <style>
    .kanban-board { display: flex; gap: 20px; padding: 20px; }
    .kanban-column { 
      flex: 1; 
      background: #f5f5f5; 
      border-radius: 8px; 
      padding: 16px;
      min-height: 500px;
    }
    .ticket-card { 
      background: white; 
      border-radius: 4px; 
      padding: 12px; 
      margin: 8px 0;
      border-left: 4px solid var(--priority-color);
      cursor: grab;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .ticket-card.dragging { opacity: 0.5; }
    .priority-high { --priority-color: #ff4757; }
    .priority-medium { --priority-color: #ffa502; }
    .priority-low { --priority-color: #2ed573; }
  </style>
</head>
<body>
  <div id="app">
    <header>
      <h1>📋 min-pmt</h1>
      <button onclick="addTicket()">+ Add Ticket</button>
    </header>
    
    <div class="kanban-board">
      <div class="kanban-column" data-status="todo">
        <h3>📝 To Do</h3>
        <div class="tickets-container" ondrop="drop(event)" ondragover="allowDrop(event)">
          <!-- Tickets loaded via JS -->
        </div>
      </div>
      
      <div class="kanban-column" data-status="in-progress">
        <h3>⚡ In Progress</h3>
        <div class="tickets-container" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
      
      <div class="kanban-column" data-status="done">
        <h3>✅ Done</h3>
        <div class="tickets-container" ondrop="drop(event)" ondragover="allowDrop(event)">
        </div>
      </div>
    </div>
  </div>

  <script src="/js/kanban.js"></script>
</body>
</html>
```

## Data Models

### Core Entities

```typescript
// src/types/index.ts
export interface Ticket {
  id: string;                           // Auto-generated or manual
  title: string;                        // Required
  description?: string;                 // Optional
  status: 'todo' | 'in-progress' | 'done'; // Required - SOURCE OF TRUTH from frontmatter
  priority?: 'low' | 'medium' | 'high' | 'critical'; // Optional
  labels?: string[];                    // Optional array
  assignee?: string;                    // Optional email/username
  created: Date;                        // Auto-generated
  updated: Date;                        // Auto-updated
  due?: Date;                          // Optional
  filePath?: string;                    // Current file location (organizational)
  content?: string;                     // Full markdown content
}

export interface ProjectConfig {
  folder: string;                       // Default: "pmt"
  states: Record<string, StateConfig>;
  schema: Record<string, FieldConfig>;
  template: TemplateConfig;
}

export interface StateConfig {
  color: string;                        // Hex color for UI
  order: number;                        // Display order
}

export interface FieldConfig {
  type: 'string' | 'number' | 'date' | 'array' | 'boolean';
  required: boolean;
  enum?: string[];                      // For dropdown options
  items?: string;                       // For array item type
}
```

**Important Note**: The `status` field in the `Ticket` interface always reflects the value from markdown frontmatter, which is the single source of truth. The `filePath` indicates current organizational location but does not determine the ticket's actual status.

## API Specifications

### REST API Endpoints

```
GET    /api/tickets                    # List all tickets
POST   /api/tickets                    # Create new ticket
GET    /api/tickets/:id                # Get specific ticket
PATCH  /api/tickets/:id                # Update ticket
DELETE /api/tickets/:id                # Delete ticket
PATCH  /api/tickets/:id/status         # Update ticket status

GET    /api/config                     # Get project configuration
```

### MCP Tools

```
create-ticket(title, description?, priority?, labels?, assignee?, due?)
move-ticket(ticketId, newStatus)  
list-tickets(status?, priority?)
get-ticket(ticketId)
update-ticket(ticketId, fields)
delete-ticket(ticketId)
```

## Trade-off Decisions

### 1. File Structure: Frontmatter vs. Folder-based Status

**[Design Decision]** **Chosen: Frontmatter status as source of truth, folders for organization**

**Rationale:**
- ✅ **Single source of truth**: Frontmatter `status` field is authoritative
- ✅ **Visual organization**: Folders provide convenient file organization
- ✅ **Flexibility**: Allows status changes without requiring file moves
- ✅ **Git resilience**: Merge conflicts in frontmatter are easier to resolve than file moves
- ✅ **Manual editing**: Developers can edit status directly in IDE without CLI

**Implementation Details:**
- System scans ALL `.md` files in ALL folders when listing tickets
- Status from frontmatter determines actual ticket status
- Folder location is organizational convenience only
- File moves to appropriate folder happen during status updates (for tidiness)
- Mismatched folder/frontmatter status is allowed and resolved by frontmatter

**Trade-offs:**
- ⚠️ **Performance**: Must scan all files vs. just reading folder contents
- ⚠️ **Consistency**: Folder and frontmatter status may temporarily diverge
- ✅ **Robustness**: More resilient to manual edits and merge conflicts

**Alternative Considered:** Folder location as source of truth
- Would be faster to list by folder
- But brittle to manual edits and git operations
- Conflicts with developer-friendly markdown editing

### 2. Configuration: JSON vs. JavaScript

**[Design Decision]** **Chosen: JavaScript configuration with JSON fallback**

**Rationale:**
- ✅ **Flexibility**: JavaScript allows dynamic configuration and comments
- ✅ **Developer-friendly**: Familiar format for target audience
- ✅ **Type safety**: Can export TypeScript types for validation

**Implementation:**
```javascript
// min-pmt.config.js (preferred)
export default { /* config */ }

// min-pmt.config.json (fallback)
{ /* config */ }
```

### 3. MCP Transport: stdio vs. HTTP

**[Design Decision]** **Chosen: Both stdio and HTTP/SSE**

**Rationale:**
- ✅ **stdio**: Better for CLI-based AI agents and direct tool integration
- ✅ **HTTP/SSE**: Better for web-based AI clients and future extensions
- ✅ **Flexibility**: Covers broader range of AI agent implementations

**Implementation Strategy:**
- Default MCP server runs via stdio for CLI usage
- WebUI server exposes MCP over HTTP/SSE for browser clients

### 4. WebUI Framework: React/Vue vs. Vanilla JS

**[Design Decision]** **Chosen: Vanilla JavaScript (Phase 1)**

**Rationale:**
- ✅ **Simplicity**: No build step required, faster development
- ✅ **Bundle size**: Smaller package for npx distribution
- ✅ **Dependencies**: Fewer dependencies to manage
- ⚖️ **Future migration**: Can migrate to React/Vue in Phase 2

**Trade-offs:**
- ❌ **Maintainability**: More boilerplate code for complex interactions
- ❌ **State management**: Manual state synchronization

## Non-functional Requirements

### Performance
- **Startup time**: CLI commands complete in <500ms for 100+ tickets
- **Memory usage**: <50MB RAM usage for typical projects
- **File I/O**: Bulk operations use streaming for large projects

### Security  
- **Input validation**: Zod schemas for all user inputs
- **File system**: Sandboxed to project directory only
- **XSS protection**: Sanitize all user content in WebUI

### Scalability
- **Target capacity**: 500+ tickets per project
- **File size limits**: Individual tickets <1MB (markdown content)
- **Concurrent access**: Basic file locking for multi-agent scenarios

## Project Structure & Hygiene

**[Design → Product]** **[Design → Execution]** Repository scaffolding requirements:

```
min-pmt/
├── src/
│   ├── cli/                          # CLI command implementations
│   │   ├── index.ts                  # Main CLI entry point
│   │   └── commands/                 # Individual command handlers
│   ├── core/                         # Core business logic
│   │   ├── TicketManager.ts          # Main ticket operations
│   │   ├── ConfigLoader.ts           # Configuration management
│   │   ├── FileSystemManager.ts      # File system abstraction
│   │   └── validators.ts             # Input validation schemas
│   ├── mcp/                          # MCP server implementation
│   │   ├── server.ts                 # MCP server setup
│   │   └── tools/                    # Individual MCP tools
│   ├── web/                          # WebUI server and assets
│   │   ├── server.ts                 # Express server
│   │   └── public/                   # Static web assets
│   └── types/                        # TypeScript definitions
│       └── index.ts                  # Shared type definitions
├── tests/                            # Test suites
│   ├── unit/                         # Unit tests
│   ├── integration/                  # Integration tests
│   └── fixtures/                     # Test data
├── docs/                            # Documentation
├── package.json                      # Node.js package configuration
├── tsconfig.json                     # TypeScript configuration
├── .gitignore                        # Git ignore rules
└── README.md                         # Quick start guide
```

**Required Dependencies:**
```json
{
  "dependencies": {
    "commander": "^11.0.0",
    "express": "^4.18.0", 
    "@modelcontextprotocol/sdk": "^1.0.0",
    "zod": "^3.22.0",
    "gray-matter": "^4.0.3",
    "chokidar": "^3.5.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  }
}
```

## Known Risks & Mitigations

**[Design → QA]** Identified risks requiring QA attention:

1. **File Concurrency**: Multiple agents accessing same file
   - **Mitigation**: File locking mechanism + retry logic
   - **QA Focus**: Test concurrent file operations

2. **Markdown Parsing**: Malformed frontmatter breaking ticket loading
   - **Mitigation**: Robust parsing with error recovery
   - **QA Focus**: Test edge cases in markdown format

3. **Configuration Validation**: Invalid config breaking CLI
   - **Mitigation**: Zod schema validation with helpful error messages
   - **QA Focus**: Test configuration error scenarios

4. **File System Permissions**: CLI failing in restricted environments
   - **Mitigation**: Graceful error handling + permission checks
   - **QA Focus**: Test in various permission scenarios

## Integration Points

**[Design → Execution]** Key integration requirements:

1. **MCP SDK Integration**: Ensure compatibility with `@modelcontextprotocol/sdk`
2. **Git Integration**: File operations should work well with git workflows
3. **npx Distribution**: Package must work reliably via npx execution
4. **Cross-platform**: Support macOS, Linux, Windows file systems

---
*Created by Design Agent | Links: [Product Backlog](product_backlog.md) → [Execution Log](execution_log.md)*
