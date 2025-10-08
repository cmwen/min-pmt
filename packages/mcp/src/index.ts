import { type ProjectConfig, TicketManager } from '@cmwen/min-pmt-core';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

export class MinPmtMcpServer {
  private server: McpServer;
  private manager: TicketManager;

  constructor(config?: ProjectConfig) {
    this.server = new McpServer({ name: 'min-pmt-mcp', version: '0.1.0' });
    this.manager = new TicketManager(config);
    this.registerTools();
  }

  private registerTools() {
    // create-ticket
    const CreateSchema = z.object({
      title: z.string(),
      description: z.string().optional(),
      status: z.enum(['todo', 'in-progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
      labels: z.array(z.string()).optional(),
      assignee: z.string().optional(),
      due: z.string().optional(),
    });
    this.server.tool(
      'create-ticket',
      'Create a ticket with optional metadata',
      CreateSchema.shape,
      {
        title: 'Create Ticket',
        description:
          'Create a new ticket in the current project with title, status, priority, labels, assignee, and due date.',
        idempotentHint: false,
        openWorldHint: false,
        readOnlyHint: false,
      },
      async (args) => {
        const p = CreateSchema.parse(args);
        const t = await this.manager.createTicket(p);
        return { content: [{ type: 'text', text: JSON.stringify(t) }] };
      }
    );

    // move-ticket
    const MoveSchema = z.object({
      ticketId: z.string(),
      newStatus: z.enum(['todo', 'in-progress', 'done']),
    });
    this.server.tool(
      'move-ticket',
      'Move ticket to a new status',
      MoveSchema.shape,
      {
        title: 'Move Ticket',
        description: 'Update a ticket status to todo, in-progress, or done by ID.',
        idempotentHint: true,
        destructiveHint: false,
      },
      async (args) => {
        const p = MoveSchema.parse(args);
        await this.manager.updateTicketStatus(p.ticketId, p.newStatus);
        return { content: [{ type: 'text', text: 'ok' }] };
      }
    );

    // list-tickets
    const ListSchema = z.object({
      status: z.enum(['todo', 'in-progress', 'done']).optional(),
      priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    });
    this.server.tool(
      'list-tickets',
      'List tickets with optional filters',
      ListSchema.shape,
      {
        title: 'List Tickets',
        description: 'List tickets, optionally filtering by status and priority.',
        idempotentHint: true,
        readOnlyHint: true,
      },
      async (args) => {
        const p = ListSchema.parse(args);
        const list = await this.manager.listTickets(p);
        return { content: [{ type: 'text', text: JSON.stringify(list) }] };
      }
    );

    // get-ticket
    const GetSchema = z.object({ ticketId: z.string() });
    this.server.tool(
      'get-ticket',
      'Get a ticket by ID',
      GetSchema.shape,
      {
        title: 'Get Ticket',
        description: 'Fetch a single ticket by its ID.',
        idempotentHint: true,
        readOnlyHint: true,
      },
      async (args) => {
        const p = GetSchema.parse(args);
        const t = await this.manager.getTicketById(p.ticketId);
        if (!t) {
          return {
            content: [{ type: 'text', text: 'not found' }],
            isError: true,
          };
        }
        return { content: [{ type: 'text', text: JSON.stringify(t) }] };
      }
    );

    // update-ticket
    const UpdateSchema = z.object({ ticketId: z.string(), fields: z.record(z.any()) });
    this.server.tool(
      'update-ticket',
      'Update ticket fields',
      UpdateSchema.shape,
      {
        title: 'Update Ticket',
        description:
          'Update one or more fields on a ticket by ID. Fields can include title, description, status, priority, labels, assignee, due.',
        idempotentHint: true,
        destructiveHint: false,
      },
      async (args) => {
        const p = UpdateSchema.parse(args);
        const t = await this.manager.updateTicketFields(
          p.ticketId,
          p.fields as Record<string, unknown>
        );
        return { content: [{ type: 'text', text: JSON.stringify(t) }] };
      }
    );

    // delete-ticket
    const DeleteSchema = z.object({ ticketId: z.string() });
    this.server.tool(
      'delete-ticket',
      'Delete a ticket by ID',
      DeleteSchema.shape,
      {
        title: 'Delete Ticket',
        description: 'Permanently delete a ticket by its ID.',
        idempotentHint: false,
        destructiveHint: true,
      },
      async (args) => {
        const p = DeleteSchema.parse(args);
        await this.manager.deleteTicket(p.ticketId);
        return { content: [{ type: 'text', text: 'deleted' }] };
      }
    );

    // get-config
    this.server.tool(
      'get-config',
      'Get project configuration',
      {},
      {
        title: 'Get Configuration',
        description:
          'Get the current project configuration including templates, states, and schema.',
        idempotentHint: true,
        readOnlyHint: true,
      },
      async () => {
        const config = this.manager.getConfig();
        return { content: [{ type: 'text', text: JSON.stringify(config, null, 2) }] };
      }
    );
  }

  async startStdio(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
