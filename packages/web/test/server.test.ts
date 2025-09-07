import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { WebUIServer } from '../src/index.js';
import { promises as fs } from 'fs';
import path from 'path';

const pmtDir = path.join(process.cwd(), 'pmt');

describe('WebUIServer API', () => {
  let server: WebUIServer;

  beforeEach(async () => {
    await fs.rm(pmtDir, { recursive: true, force: true });
    server = new WebUIServer(0); // random available port when using supertest app
  });

  it('GET /api/tickets returns empty array initially', async () => {
    const res = await request(server.app).get('/api/tickets');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/tickets creates a ticket and lists it', async () => {
    const create = await request(server.app).post('/api/tickets').send({ title: 'From API' });
    expect(create.status).toBe(201);
    const list = await request(server.app).get('/api/tickets');
    expect(list.body.some((t: any) => t.title === 'From API')).toBe(true);
  });

  it('PATCH /api/tickets/:id/status updates status', async () => {
    const create = await request(server.app).post('/api/tickets').send({ title: 'Move API' });
    const id = create.body.id;
    const patch = await request(server.app).patch(`/api/tickets/${id}/status`).send({ status: 'done' });
    expect(patch.status).toBe(200);
    const list = await request(server.app).get('/api/tickets');
    const found = list.body.find((t: any) => t.id === id);
    expect(found.status).toBe('done');
  });

  it('POST /api/tickets rejects invalid body', async () => {
    const res = await request(server.app).post('/api/tickets').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid body/i);
  });

  it('PATCH /api/tickets/:id/status rejects invalid status', async () => {
    const create = await request(server.app).post('/api/tickets').send({ title: 'Bad Status' });
    const id = create.body.id;
    const res = await request(server.app)
      .patch(`/api/tickets/${id}/status`)
      .send({ status: 'invalid' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Invalid body/i);
  });
});
