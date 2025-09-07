# Project Vision: min-pmt

## Problem Statement
Individual developers working with AI coding agents need a **lightweight, git-friendly project management solution** that sits directly in their repository. Existing PM tools are either too heavyweight, cloud-dependent, or not designed for AI-human collaboration workflows where AI agents create and update tickets programmatically.

## Project Vision & Goals
**Vision**: Enable seamless project management for solo developers and AI agents working together, using simple markdown files that live alongside the code.

**Core Goals**:
1. **Local-first**: All project data stored as markdown files in the repo
2. **AI-friendly**: MCP server integration for AI agents to manage tickets
3. **Visual management**: WebUI for Kanban-style ticket visualization and drag-drop
4. **Developer-native**: CLI tools, markdown format, git version control
5. **Minimal complexity**: Focus on essential PM features without workflow overhead

## User Personas & Scenarios

### Primary Persona: Solo Developer + AI Agent
- **Context**: Individual developer working on software projects with AI coding assistants
- **Technical level**: Comfortable with CLI, markdown, git workflows
- **Pain points**: Existing PM tools too complex for personal projects, poor AI integration

### Key User Scenarios
1. **AI-Generated Planning**: AI agent analyzes feature request → creates structured tickets in `pmt/` folder
2. **Visual Progress Tracking**: Developer opens WebUI to see Kanban board, drags tickets between todo/in-progress/done
3. **CLI Updates**: Remote coding agent updates ticket status via CLI as work progresses
4. **Manual Editing**: Developer directly edits ticket markdown files in IDE for detailed updates
5. **Git Integration**: Tickets tracked in version control alongside code changes

## Success Criteria
- **MVP Success**: Solo developer can manage 20+ tickets visually with AI agent integration
- **Adoption**: 100+ npx downloads in first 3 months
- **Usability**: New user can set up project and create first ticket in < 5 minutes
- **AI Integration**: MCP server can create/update tickets without manual intervention
- **Performance**: WebUI loads and renders 50+ tickets in < 2 seconds

## Scope & Constraints

### In Scope (v1.0)
- **CLI Tool**: `npx min-pmt init`, `npx min-pmt add`, `npx min-pmt status`
- **File Structure**: Configurable `pmt/` folder with markdown tickets
- **Configuration**: `min-pmt.config.js/json` for custom fields
- **MCP Server**: Basic ticket CRUD operations for AI agents
- **WebUI**: Local server with Kanban board, drag-drop state changes
- **Default Template**: Out-of-box frontmatter schema for tickets

### Out of Scope (v1.0)
- Multi-user collaboration features
- Complex workflow rules or automation
- Cloud synchronization
- Mobile apps
- Real-time collaboration
- Advanced reporting/analytics

### Technical Constraints
- **Node.js**: CLI tool built for Node.js ecosystem
- **Local-first**: No external dependencies for core functionality
- **Git-based**: Assumes project is in git repository
- **Markdown**: All tickets stored as `.md` files with frontmatter

## Key Assumptions & Risks

### Critical Assumptions
- Target users are comfortable with file-based, git-controlled data
- AI agents (via MCP) provide significant value over manual ticket creation
- WebUI provides enough value to justify development complexity
- Solo developers need visual PM tools (vs. just TODO comments in code)

### Identified Risks
- **Market Risk**: Limited market for CLI-first PM tools
- **Technical Risk**: File conflicts when multiple agents update simultaneously
- **Scope Creep**: WebUI complexity could delay core CLI/MCP features
- **Adoption Risk**: Users may prefer existing solutions (GitHub Issues, etc.)

### Mitigation Strategies
- Start with CLI + MCP server MVP, add WebUI second
- Clear documentation on git conflict resolution
- Focus on AI integration as key differentiator
- Simple installation via npx (no complex setup)

---
*Created by Vision Agent | Links: [Product Backlog](product_backlog.md)*

---
*Created by Vision Agent | Links: [Product Backlog](product_backlog.md)*
