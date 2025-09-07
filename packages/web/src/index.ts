import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ConfigLoader,
  CreateTicketSchema,
  ListTicketsQuerySchema,
  StatusUpdateSchema,
  TicketManager,
  UpdateTicketSchema,
} from '@cmwen/min-pmt-core';
import express from 'express';

export class WebUIServer {
  private _app: express.Application;
  private ticketManager: TicketManager;

  constructor(private port: number = 3000) {
    this._app = express();
    this.ticketManager = new TicketManager();
    this.setupMiddleware();
    this.setupRoutes();
  }

  get app(): express.Application {
    return this._app;
  }

  private setupMiddleware() {
    this._app.use(express.json());
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this._app.use(express.static(path.join(__dirname, 'public')));
  }

  private setupRoutes() {
    // API Routes
    this._app.get('/api/tickets', async (req, res) => {
      try {
        const { status, priority } = ListTicketsQuerySchema.parse({
          status: req.query.status,
          priority: req.query.priority,
        });
        const tickets = await this.ticketManager.listTickets({ status, priority });
        res.json(tickets);
      } catch (err: unknown) {
        const errorObj = err as { issues?: unknown[]; message?: string };
        if (errorObj?.issues)
          return res.status(400).json({ error: 'Invalid query', issues: errorObj.issues });
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    this._app.get('/api/tickets/:id', async (req, res) => {
      try {
        const t = await this.ticketManager.getTicketById(req.params.id);
        if (!t) return res.status(404).json({ error: 'not found' });
        res.json(t);
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    this._app.post('/api/tickets', async (req, res) => {
      try {
        const body = CreateTicketSchema.parse(req.body || {});
        const created = await this.ticketManager.createTicket(body);
        res.status(201).json(created);
      } catch (err: unknown) {
        const errorObj = err as { issues?: unknown[]; message?: string };
        if (errorObj?.issues)
          return res.status(400).json({ error: 'Invalid body', issues: errorObj.issues });
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    this._app.patch('/api/tickets/:id/status', async (req, res) => {
      try {
        const id = req.params.id;
        const { status } = StatusUpdateSchema.parse(req.body || {});
        await this.ticketManager.updateTicketStatus(id, status);
        res.json({ ok: true });
      } catch (err: unknown) {
        const errorObj = err as { issues?: unknown[]; message?: string };
        if (errorObj?.issues) return res.status(400).json({ error: 'Invalid body', issues: errorObj.issues });
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    this._app.patch('/api/tickets/:id', async (req, res) => {
      try {
        const body = UpdateTicketSchema.parse(req.body || {});
        const updated = await this.ticketManager.updateTicketFields(req.params.id, body);
        res.json(updated);
      } catch (err: unknown) {
        const errorObj = err as { issues?: unknown[]; message?: string };
        if (errorObj?.issues) return res.status(400).json({ error: 'Invalid body', issues: errorObj.issues });
        if (/not found/i.test(errorObj?.message || '')) return res.status(404).json({ error: 'not found' });
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    this._app.delete('/api/tickets/:id', async (req, res) => {
      try {
        await this.ticketManager.deleteTicket(req.params.id);
        res.status(204).send();
      } catch (err: unknown) {
        const errorObj = err as { message?: string };
        if (/not found/i.test(errorObj?.message || '')) return res.status(404).json({ error: 'not found' });
        res.status(500).json({ error: errorObj?.message || 'Internal error' });
      }
    });

    // Serve SPA index for other routes
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    this._app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
  }

  async start(): Promise<void> {
    const cfg = await ConfigLoader.load();
    // ensure folder exists
    const tm = new TicketManager(cfg);
    await tm.ensureInitialized();
    await new Promise<void>((resolve) => {
      this._app.listen(this.port, () => {
        // eslint-disable-next-line no-console
        console.log(`min-pmt WebUI http://localhost:${this.port}`);
        resolve();
      });
    });
  }
}
