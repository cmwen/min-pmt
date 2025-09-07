import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { Ticket, TicketStatus, defaultConfig, ProjectConfig } from './types.js';

export class TicketManager {
  constructor(private config: ProjectConfig = defaultConfig) {}

  private projectRoot(): string {
    return process.cwd();
  }

  private pmtDir(): string {
    return path.join(this.projectRoot(), this.config.folder);
  }

  async ensureInitialized(): Promise<void> {
    await fs.mkdir(this.pmtDir(), { recursive: true });
  }

  async createTicket(input: {
    title: string;
    description?: string;
    status?: TicketStatus;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    labels?: string[];
    assignee?: string;
    due?: string;
  }): Promise<Ticket> {
    await this.ensureInitialized();
    const now = new Date().toISOString();
    const id = await this.generateId(input.title);
    const status: TicketStatus = input.status ?? 'todo';
    const data = {
      id,
      title: input.title,
      description: input.description || '',
      status,
      priority: input.priority,
      labels: input.labels,
      assignee: input.assignee,
      created: now,
      updated: now,
      due: input.due,
    };

    // Remove undefined values to satisfy YAML dumper
    const frontmatter: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) frontmatter[k] = v;
    }

    const body = `\n## Notes\n`;
    const content = matter.stringify(body, frontmatter);

    const filePath = path.join(this.pmtDir(), `${id}.md`);
    await fs.writeFile(filePath, content, 'utf8');

    return { ...data, filePath, content } as Ticket;
  }

  async listTickets(filters?: { status?: TicketStatus; priority?: Ticket['priority'] }): Promise<Ticket[]> {
    await this.ensureInitialized();
    const dir = this.pmtDir();
    const files = await this.findMarkdownFiles(dir);
    const tickets: Ticket[] = [];
    for (const filePath of files) {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = matter(raw);
      // minimal validation
      if (!parsed.data || !parsed.data.id || !parsed.data.title) continue;
      const t: Ticket = {
        id: String(parsed.data.id),
        title: String(parsed.data.title),
        description: parsed.data.description ? String(parsed.data.description) : undefined,
        status: (parsed.data.status as TicketStatus) ?? 'todo',
        priority: parsed.data.priority as Ticket['priority'],
        labels: Array.isArray(parsed.data.labels) ? parsed.data.labels.map(String) : undefined,
        assignee: parsed.data.assignee ? String(parsed.data.assignee) : undefined,
        created: parsed.data.created ? String(parsed.data.created) : new Date().toISOString(),
        updated: parsed.data.updated ? String(parsed.data.updated) : new Date().toISOString(),
        due: parsed.data.due ? String(parsed.data.due) : undefined,
        filePath,
        content: raw,
      };
      if (filters?.status && t.status !== filters.status) continue;
      if (filters?.priority && t.priority !== filters.priority) continue;
      tickets.push(t);
    }
    return tickets;
  }

  async updateTicketStatus(ticketId: string, newStatus: TicketStatus): Promise<void> {
    await this.ensureInitialized();
    const dir = this.pmtDir();
    const files = await this.findMarkdownFiles(dir);
    for (const filePath of files) {
      const raw = await fs.readFile(filePath, 'utf8');
      const parsed = matter(raw);
      const id = parsed.data?.id ? String(parsed.data.id) : undefined;
      if (id !== ticketId) continue;

      // Update frontmatter only; file location is organizational and unchanged
      parsed.data = parsed.data || {};
      parsed.data.status = newStatus;
      parsed.data.updated = new Date().toISOString();
      const next = matter.stringify(parsed.content, parsed.data);
      await fs.writeFile(filePath, next, 'utf8');
      return;
    }
    throw new Error(`Ticket not found: ${ticketId}`);
  }

  private async generateId(title: string): Promise<string> {
    // simple slug + timestamp
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32);
    const ts = Date.now().toString(36);
    return `ticket-${slug || 'item'}-${ts}`;
  }

  private async findMarkdownFiles(dir: string): Promise<string[]> {
    const out: string[] = [];
    async function walk(current: string) {
      const entries = await fs.readdir(current, { withFileTypes: true });
      for (const e of entries) {
        const p = path.join(current, e.name);
        if (e.isDirectory()) await walk(p);
        else if (e.isFile() && p.endsWith('.md')) out.push(p);
      }
    }
    await walk(dir);
    return out;
  }
}
