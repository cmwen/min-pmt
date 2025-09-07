import { promises as fs } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { TicketManager } from '../src/TicketManager.js';

const tmpDir = path.join(process.cwd(), 'pmt');

describe('TicketManager', () => {
  beforeEach(async () => {
    // Clean pmt dir between tests
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it('creates a ticket with frontmatter and lists it', async () => {
    const manager = new TicketManager();
    const created = await manager.createTicket({ title: 'Test Ticket', priority: 'high' });
    expect(created.id).toMatch(/^ticket-/);
    expect(created.status).toBe('todo');
    expect(created.filePath).toBeDefined();

    const list = await manager.listTickets();
    expect(list.length).toBe(1);
    expect(list[0].title).toBe('Test Ticket');
    expect(list[0].priority).toBe('high');
  });

  it('filters by status', async () => {
    const manager = new TicketManager();
    await manager.createTicket({ title: 'A', status: 'todo' });
    await manager.createTicket({ title: 'B', status: 'done' });
    const todos = await manager.listTickets({ status: 'todo' });
    expect(todos.every((t) => t.status === 'todo')).toBe(true);
  });

  it('updates ticket status by id', async () => {
    const manager = new TicketManager();
    const created = await manager.createTicket({ title: 'Move me', status: 'todo' });
    await manager.updateTicketStatus(created.id, 'in-progress');
    const list = await manager.listTickets();
    expect(list[0].status).toBe('in-progress');
  });

  it('throws on unknown ticket id', async () => {
    const manager = new TicketManager();
    await manager.createTicket({ title: 'Only one' });
    await expect(manager.updateTicketStatus('ticket-does-not-exist', 'done')).rejects.toThrow(
      /not found/i
    );
  });
});
