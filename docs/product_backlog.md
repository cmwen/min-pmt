# Product Backlog

## Product Epics

### Epic 1: Core CLI Foundation
**[Vision → Product]** Basic CLI tool for project initialization and ticket management
- Project initialization with configurable folder structure
- Basic ticket CRUD operations via command line
- Configuration system for custom fields

### Epic 2: MCP Server Integration
**[Vision → Product]** Enable AI agents to manage tickets programmatically
- MCP server implementation for ticket operations
- API for creating, reading, updating, deleting tickets
- Integration with AI coding agents workflow

### Epic 3: WebUI Kanban Board
**[Vision → Product]** Visual project management interface
- Local web server for ticket visualization
- Kanban board with drag-drop functionality
- Ticket editing capabilities in web interface

## Feature Definitions

### F1.1: Project Initialization
**Description**: CLI command to set up min-pmt in existing project
**Value**: Reduces setup friction for new users
**Complexity**: Low

### F1.2: Ticket Creation & Management
**Description**: CLI commands for basic ticket operations
**Value**: Core functionality for manual ticket management
**Complexity**: Medium

### F1.3: Configuration System
**Description**: Flexible field definitions via config files
**Value**: Customization for different project types
**Complexity**: Medium

### F2.1: MCP Server
**Description**: Model Context Protocol server for AI integration
**Value**: Enables AI agents to manage project tickets
**Complexity**: High

### F3.1: WebUI Server
**Description**: Local web server with Kanban interface
**Value**: Visual project management for developers
**Complexity**: High

### F3.2: Drag-Drop State Management
**Description**: Move tickets between states via UI
**Value**: Intuitive project status updates
**Complexity**: Medium

## User Stories

### CLI Foundation Stories

**US1.1**: As a developer, I want to initialize min-pmt in my project so that I can start managing tickets
- **Given** I have a git repository
- **When** I run `npx min-pmt init`
- **Then** a `pmt/` folder is created with sample configuration

**US1.2**: As a developer, I want to create a new ticket via CLI so that I can quickly add tasks
- **Given** min-pmt is initialized
- **When** I run `npx min-pmt add "Implement user authentication"`
- **Then** a new markdown file is created in `pmt/` with proper frontmatter

**US1.3**: As a developer, I want to list all tickets so that I can see project status
- **Given** tickets exist in the project
- **When** I run `npx min-pmt list`
- **Then** I see a formatted list of all tickets with their current status

### MCP Integration Stories

**US2.1**: As an AI agent, I want to create tickets via MCP so that I can break down user requests into manageable tasks
- **Given** MCP server is running
- **When** I send a create ticket request with title and description
- **Then** a new ticket file is created with proper metadata

**US2.2**: As an AI agent, I want to update ticket status so that I can report progress on development tasks
- **Given** a ticket exists
- **When** I send an update request to change status to "in-progress"
- **Then** the ticket's frontmatter is updated with new status

### WebUI Stories

**US3.1**: As a developer, I want to view tickets in a Kanban board so that I can visualize project progress
- **Given** tickets exist in the project
- **When** I run `npx min-pmt web`
- **Then** a local web server starts showing tickets organized by status

**US3.2**: As a developer, I want to drag tickets between columns so that I can update status visually
- **Given** the WebUI is open
- **When** I drag a ticket from "todo" to "in-progress"
- **Then** the ticket's markdown file is updated with new status

## Priority Matrix

### Phase 1 (MVP) - Core Value
1. **F1.1 Project Initialization** - MUST HAVE
2. **F1.2 Ticket Creation & Management** - MUST HAVE  
3. **F1.3 Configuration System** - SHOULD HAVE
4. **F2.1 MCP Server** - MUST HAVE (key differentiator)

### Phase 2 - User Experience
5. **F3.1 WebUI Server** - SHOULD HAVE
6. **F3.2 Drag-Drop State Management** - COULD HAVE

### Future Phases
- VS Code extension integration
- Template system for different project types
- Advanced ticket querying and filtering

## Dependencies & Blockers

### Technical Dependencies
- **Node.js ecosystem**: CLI built on Node.js with npx distribution
- **MCP Protocol**: Requires MCP server implementation knowledge
- **File system**: Reliable markdown file read/write operations
- **Web framework**: Local server framework for WebUI (Express.js or similar)

### External Dependencies
- MCP protocol specification and libraries
- Markdown frontmatter parsing libraries
- CLI framework (Commander.js or similar)
- Web UI framework (React/Vue or vanilla JS)

### Potential Blockers
- **MCP Server Complexity**: Limited documentation/examples for MCP implementation
- **File Conflicts**: Concurrent file access by multiple agents
- **WebUI Complexity**: Balancing simplicity with functionality

---
*Created by Product Agent | Links: [Vision](vision.md) → [Design](design.md)*
