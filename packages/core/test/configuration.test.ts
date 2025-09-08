import { promises as fs } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { TicketManager } from '../src/TicketManager.js';
import type { ProjectConfig } from '../src/types.js';

const folder = 'pmt-config-tests';
const tmpDir = path.join(process.cwd(), folder);

describe('Configuration and Templates', () => {
  beforeEach(async () => {
    // Clean pmt dir between tests
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('uses default configuration when none provided', async () => {
    const manager = new TicketManager();
    const config = manager.getConfig();

    expect(config.folder).toBe('pmt');
    expect(config.states).toBeDefined();
    expect(config.states?.todo).toEqual({ color: '#6b7280', order: 1 });
    expect(config.template?.defaultStatus).toBe('todo');
    expect(config.template?.idPrefix).toBe('ticket-');
  });

  it('uses custom configuration when provided', async () => {
    const customConfig: ProjectConfig = {
      folder: 'custom-tickets',
      states: {
        backlog: { color: '#f59e0b', order: 1 },
        active: { color: '#3b82f6', order: 2 },
        completed: { color: '#10b981', order: 3 },
      },
      template: {
        defaultStatus: 'todo', // Note: status must still be valid TicketStatus
        generateId: true,
        idPrefix: 'task-',
        content: `## Objective\n\n[Describe the objective]\n\n## Steps\n\n1. Step 1\n2. Step 2`,
      },
    };

    const manager = new TicketManager(customConfig);
    const config = manager.getConfig();

    expect(config.folder).toBe('custom-tickets');
    expect(config.states?.backlog).toEqual({ color: '#f59e0b', order: 1 });
    expect(config.template?.idPrefix).toBe('task-');
    expect(config.template?.content).toContain('## Objective');
  });

  it('creates tickets with custom template content', async () => {
    const customConfig: ProjectConfig = {
      folder,
      template: {
        defaultStatus: 'todo',
        generateId: true,
        idPrefix: 'custom-',
        content: `## Task Description\n\n[Add description here]\n\n## Checklist\n\n- [ ] Item 1\n- [ ] Item 2`,
      },
    };

    const manager = new TicketManager(customConfig);
    const ticket = await manager.createTicket({
      title: 'Test Custom Template',
      description: 'Testing custom template functionality',
    });

    expect(ticket.id).toMatch(/^custom-/);
    expect(ticket.content).toContain('## Task Description');
    expect(ticket.content).toContain('## Checklist');
    expect(ticket.content).toContain('- [ ] Item 1');
  });

  it('uses custom default status from template', async () => {
    const customConfig: ProjectConfig = {
      folder,
      template: {
        defaultStatus: 'in-progress',
        generateId: true,
        idPrefix: 'ticket-',
        content: '## Notes',
      },
    };

    const manager = new TicketManager(customConfig);
    const ticket = await manager.createTicket({
      title: 'Test Default Status',
    });

    expect(ticket.status).toBe('in-progress');
  });

  it('allows explicit status to override template default', async () => {
    const customConfig: ProjectConfig = {
      folder,
      template: {
        defaultStatus: 'in-progress',
        generateId: true,
        idPrefix: 'ticket-',
        content: '## Notes',
      },
    };

    const manager = new TicketManager(customConfig);
    const ticket = await manager.createTicket({
      title: 'Test Explicit Status',
      status: 'done',
    });

    expect(ticket.status).toBe('done');
  });

  it('provides access to configuration methods', async () => {
    const customConfig: ProjectConfig = {
      folder,
      states: {
        planning: { color: '#8b5cf6', order: 1 },
        development: { color: '#06b6d4', order: 2 },
      },
      schema: {
        title: { type: 'string', required: true },
        priority: { type: 'string', required: false, enum: ['low', 'high'] },
      },
    };

    const manager = new TicketManager(customConfig);

    const states = manager.getStates();
    expect(states.planning).toEqual({ color: '#8b5cf6', order: 1 });

    const schema = manager.getSchema();
    expect(schema.priority?.enum).toEqual(['low', 'high']);

    const template = manager.getTemplate();
    expect(template.defaultStatus).toBe('todo');
  });

  it('handles partial configuration gracefully', async () => {
    const partialConfig: ProjectConfig = {
      folder,
      states: {
        custom: { color: '#ff0000', order: 1 },
      },
      // template and schema not provided
    };

    const manager = new TicketManager(partialConfig);

    const states = manager.getStates();
    expect(states.custom).toEqual({ color: '#ff0000', order: 1 });

    const template = manager.getTemplate();
    expect(template.defaultStatus).toBe('todo'); // fallback default
    expect(template.idPrefix).toBe('ticket-'); // fallback default
  });
});
