#!/usr/bin/env node
import {
  CreateTicketSchema,
  initializeConfig,
  ListTicketsQuerySchema,
  loadConfig,
  TicketManager,
  type TicketStatus,
  TicketStatusSchema,
} from '@cmwen/min-pmt-core';
import { Command } from 'commander';

interface AddOptions {
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string;
  status?: TicketStatus;
}

interface ListOptions {
  status?: TicketStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
}

interface WebOptions {
  port: string;
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();
  program.name('min-pmt').description('Minimal Project Management Tool').version('0.1.0');

  program
    .command('init')
    .description('Initialize min-pmt in current project')
    .option('-f, --folder <name>', 'PMT folder name', 'pmt')
    .action(async (opts: { folder: string }) => {
      const cfg = await initializeConfig({ folder: opts.folder });
      const tm = new TicketManager(cfg);
      await tm.ensureInitialized();
      process.stdout.write(`Initialized min-pmt in folder: ${cfg.folder}\n`);
    });

  program
    .command('add <title>')
    .description('Create a new ticket')
    .option('-d, --description <desc>', 'Ticket description')
    .option('-p, --priority <priority>', 'Priority level')
    .option('-l, --labels <labels>', 'Comma-separated labels')
    .option('-s, --status <status>', 'Initial status')
    .action(async (title: string, options: AddOptions) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);
      const labels = options.labels
        ? String(options.labels)
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : undefined;
      const parsed = CreateTicketSchema.pick({
        title: true,
        description: true,
        priority: true,
        labels: true,
        status: true,
      }).safeParse({
        title,
        description: options.description,
        priority: options.priority,
        labels,
        status: options.status,
      });
      if (!parsed.success) {
        process.stderr.write('Invalid options for add.\n');
        process.stderr.write(`${JSON.stringify(parsed.error.issues, null, 2)}\n`);
        process.exitCode = 1;
        return;
      }
      const created = await tm.createTicket(parsed.data);
      process.stdout.write(`${created.id}\n`);
    });

  program
    .command('list')
    .alias('ls')
    .description('List all tickets')
    .option('-s, --status <status>', 'Filter by status')
    .option('-p, --priority <priority>', 'Filter by priority')
    .action(async (options: ListOptions) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);
      const q = ListTicketsQuerySchema.safeParse({
        status: options.status,
        priority: options.priority,
      });
      if (!q.success) {
        process.stderr.write('Invalid list filters.\n');
        process.stderr.write(`${JSON.stringify(q.error.issues, null, 2)}\n`);
        process.exitCode = 1;
        return;
      }
      const tickets = await tm.listTickets(q.data);
      // Simple table
      const rows = tickets.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
      }));
      console.table(rows);
    });

  program
    .command('move <ticketId> <newStatus>')
    .description('Move ticket to different status')
    .action(async (ticketId: string, newStatus: string) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);
      const statusParsed = TicketStatusSchema.safeParse(newStatus);
      if (!statusParsed.success) {
        process.stderr.write('Invalid status. Allowed: todo | in-progress | done\n');
        process.exitCode = 1;
        return;
      }
      await tm.updateTicketStatus(ticketId, statusParsed.data);
      process.stdout.write(`Updated ${ticketId} -> ${newStatus}\n`);
    });

  program
    .command('web')
    .description('Start web UI server')
    .option('-p, --port <port>', 'Port number', '3000')
    .action(async (options: WebOptions) => {
      const port = Number(options.port);
      // Dynamic import to avoid loading the web package unless needed
      const { WebUIServer } = await import('@cmwen/min-pmt-web');
      const server = new WebUIServer(port);
      await server.start();
    });

  await program.parseAsync(argv);
}

// If executed directly (not imported), run the CLI
if (import.meta.url === new URL(`file://${process.argv[1]}`).toString()) {
  runCli();
}
