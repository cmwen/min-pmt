#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  CreateTicketSchema,
  initializeConfig,
  ListTicketsQuerySchema,
  loadConfig,
  type Ticket,
  TicketManager,
  type TicketStatus,
  TicketStatusSchema,
  UpdateTicketSchema,
} from '@cmwen/min-pmt-core';
import { Command } from 'commander';

// Get package version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf8'));
const version = packageJson.version;

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

interface EditOptions {
  title?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string;
  assignee?: string;
  due?: string;
}

// Helper functions for edit command
function prepareUpdateData(options: EditOptions): Partial<Ticket> {
  const updateData: Partial<Ticket> = {};
  if (options.title !== undefined) updateData.title = options.title;
  if (options.description !== undefined) updateData.description = options.description;
  if (options.priority !== undefined) updateData.priority = options.priority;
  if (options.assignee !== undefined) updateData.assignee = options.assignee;
  if (options.due !== undefined) updateData.due = options.due;
  if (options.labels !== undefined) {
    updateData.labels = options.labels
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
  }
  return updateData;
}

function handleValidationError(parsed: { success: false; error: { issues: unknown } }): void {
  process.stderr.write('Invalid update options.\n');
  process.stderr.write(`${JSON.stringify(parsed.error.issues, null, 2)}\n`);
  process.exitCode = 1;
}

function showUpdatedFields(updateData: Partial<Ticket>): void {
  for (const [key, value] of Object.entries(updateData)) {
    console.log(`  ${key}: ${value}`);
  }
}

export async function runCli(argv: string[] = process.argv): Promise<void> {
  const program = new Command();
  program.name('min-pmt').description('Minimal Project Management Tool').version(version);

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
    .command('config')
    .description('Show current project configuration')
    .action(async () => {
      try {
        const cfg = await loadConfig();
        const tm = new TicketManager(cfg);
        const config = tm.getConfig();

        console.log('Current Configuration:');
        console.log('====================');
        console.log(`Folder: ${config.folder}`);

        if (config.states && Object.keys(config.states).length > 0) {
          console.log('\nStates:');
          for (const [status, stateConfig] of Object.entries(config.states)) {
            console.log(`  ${status}: ${stateConfig.color} (order: ${stateConfig.order})`);
          }
        }

        if (config.template) {
          console.log('\nTemplate:');
          console.log(`  Default Status: ${config.template.defaultStatus}`);
          console.log(`  ID Prefix: ${config.template.idPrefix}`);
          console.log(`  Generate ID: ${config.template.generateId}`);
        }
      } catch (error) {
        process.stderr.write(`Error loading configuration: ${error}\n`);
        process.exitCode = 1;
      }
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
    .command('view <ticketId>')
    .alias('show')
    .description('View detailed information about a ticket')
    .action(async (ticketId: string) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);
      const ticket = await tm.getTicketById(ticketId);
      if (!ticket) {
        process.stderr.write(`Ticket not found: ${ticketId}\n`);
        process.exitCode = 1;
        return;
      }

      console.log(`\n📋 Ticket: ${ticket.title}`);
      console.log('='.repeat(50));
      console.log(`ID: ${ticket.id}`);
      console.log(`Status: ${ticket.status}`);
      console.log(`Priority: ${ticket.priority || 'none'}`);
      if (ticket.assignee) console.log(`Assignee: ${ticket.assignee}`);
      if (ticket.due) console.log(`Due: ${new Date(ticket.due).toLocaleString()}`);
      if (ticket.labels && ticket.labels.length > 0) {
        console.log(`Labels: ${ticket.labels.join(', ')}`);
      }
      console.log(`Created: ${new Date(ticket.created).toLocaleString()}`);
      console.log(`Updated: ${new Date(ticket.updated).toLocaleString()}`);

      if (ticket.description) {
        console.log('\nDescription:');
        console.log('-'.repeat(20));
        console.log(ticket.description);
      }

      if (ticket.content) {
        console.log('\nFull Content:');
        console.log('-'.repeat(20));
        console.log(ticket.content);
      }
    });

  program
    .command('edit <ticketId>')
    .description('Edit a ticket')
    .option('-t, --title <title>', 'Update title')
    .option('-d, --description <desc>', 'Update description')
    .option('-p, --priority <priority>', 'Update priority')
    .option('-l, --labels <labels>', 'Update labels (comma-separated)')
    .option('-a, --assignee <assignee>', 'Update assignee')
    .option('--due <due>', 'Update due date (ISO string)')
    .action(async (ticketId: string, options: EditOptions) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);

      // Check if ticket exists
      const existingTicket = await tm.getTicketById(ticketId);
      if (!existingTicket) {
        process.stderr.write(`Ticket not found: ${ticketId}\n`);
        process.exitCode = 1;
        return;
      }

      // Prepare update data
      const updateData = prepareUpdateData(options);

      // Validate the update data
      const parsed = UpdateTicketSchema.safeParse(updateData);
      if (!parsed.success) {
        handleValidationError(parsed);
        return;
      }

      if (Object.keys(updateData).length === 0) {
        process.stderr.write('No fields to update. Use --help to see available options.\n');
        process.exitCode = 1;
        return;
      }

      const updated = await tm.updateTicketFields(ticketId, parsed.data);
      process.stdout.write(`Updated ticket: ${updated.id}\n`);

      // Show what was changed
      showUpdatedFields(updateData);
    });

  program
    .command('delete <ticketId>')
    .alias('del')
    .alias('rm')
    .description('Delete a ticket')
    .option('-f, --force', 'Force deletion without confirmation')
    .action(async (ticketId: string, options: { force?: boolean }) => {
      const cfg = await loadConfig();
      const tm = new TicketManager(cfg);

      // Check if ticket exists
      const existingTicket = await tm.getTicketById(ticketId);
      if (!existingTicket) {
        process.stderr.write(`Ticket not found: ${ticketId}\n`);
        process.exitCode = 1;
        return;
      }

      if (!options.force) {
        // Simple confirmation (in a real CLI, you might use a proper prompt library)
        process.stdout.write(`Delete ticket "${existingTicket.title}" (${ticketId})? [y/N]: `);

        // For this demo, we'll assume 'yes' - in production you'd read from stdin
        const confirm = process.env.CLI_CONFIRM_DELETE === 'yes';
        if (!confirm) {
          process.stdout.write('Deletion cancelled.\n');
          return;
        }
      }

      await tm.deleteTicket(ticketId);
      process.stdout.write(`Deleted ticket: ${ticketId}\n`);
    });

  program
    .command('mcp')
    .description('Start the MCP server for AI agents (stdio transport)')
    .action(async () => {
      try {
        const cfg = await loadConfig();
        const { MinPmtMcpServer } = await import('@cmwen/min-pmt-mcp');
        const server = new MinPmtMcpServer(cfg);
        await server.startStdio();
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        process.stderr.write(`Failed to start MCP server: ${message}\n`);
        process.exitCode = 1;
      }
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
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('min-pmt') ||
  process.argv[1]?.includes('node_modules/.bin/')
) {
  runCli();
}
