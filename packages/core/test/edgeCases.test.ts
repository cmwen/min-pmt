import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { beforeEach, describe, expect, it } from 'vitest';
import { TicketManager } from '../src/TicketManager.js';

const folder = 'pmt-core-edge';
const pmtDir = path.join(process.cwd(), folder);

describe('TicketManager edge cases', () => {
	beforeEach(async () => {
		await fs.rm(pmtDir, { recursive: true, force: true });
	});

	it('skips markdown files without required frontmatter (id/title)', async () => {
		const tm = new TicketManager({ folder });
		// create one valid ticket
		await tm.createTicket({ title: 'Valid' });
		// and one invalid markdown file without frontmatter
		await fs.mkdir(pmtDir, { recursive: true });
		await fs.writeFile(path.join(pmtDir, 'notes.md'), '# just notes\n');

		const list = await tm.listTickets();
		// Only the valid ticket should be returned
		expect(list.length).toBe(1);
		expect(list[0].title).toBe('Valid');
	});

	it('recursively discovers tickets in nested directories', async () => {
		const tm = new TicketManager({ folder });
		const a = await tm.createTicket({ title: 'A' });
		const b = await tm.createTicket({ title: 'B' });

		// Move one file into a nested subdirectory
		const nestedDir = path.join(pmtDir, 'nested', 'deep');
		await fs.mkdir(nestedDir, { recursive: true });
		const newPath = path.join(nestedDir, path.basename(b.filePath!));
		await fs.rename(b.filePath!, newPath);

		const list = await tm.listTickets();
		const ids = list.map((t) => t.id);
		expect(ids).toContain(a.id);
		expect(ids).toContain(b.id);
	});

	it('does not validate status values from frontmatter (current behavior)', async () => {
		const tm = new TicketManager({ folder });
		await tm.ensureInitialized();
		const now = new Date().toISOString();
		const bad = matter.stringify('\nBody\n', {
			id: 'ticket-bad-status',
			title: 'Invalid Status',
			status: 'blocked', // not in union at type-level, but currently passes through at runtime
			created: now,
			updated: now,
		});
		await fs.writeFile(path.join(pmtDir, 'ticket-bad-status.md'), bad, 'utf8');

		const list = await tm.listTickets();
		const found = list.find((t) => t.id === 'ticket-bad-status');
		expect(found).toBeDefined();
		// Documenting current behavior for QA: invalid status is preserved
		expect(found!.status).toBe('blocked' as any);
	});
});
