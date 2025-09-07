import { promises as fs } from 'node:fs';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runCli } from '../src/index.js';

const pmtDir = path.join(process.cwd(), 'pmt');

function withCapturedIO(
  fn: () => Promise<void>
): Promise<{ out: string; err: string } | undefined> {
  const origOut = process.stdout.write;
  const origErr = process.stderr.write;
  let out = '';
  let err = '';
  (process.stdout.write as any) = (chunk: any) => {
    out += String(chunk);
    return true;
  };
  (process.stderr.write as any) = (chunk: any) => {
    err += String(chunk);
    return true;
  };
  return fn()
    .then(() => ({ out, err }))
    .finally(() => {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
    });
}

describe('CLI integration', () => {
  beforeEach(async () => {
    await fs.rm(pmtDir, { recursive: true, force: true });
    vi.spyOn(console, 'table').mockImplementation(() => undefined as any);
  });

  it('init creates config and folder', async () => {
    const result = (await withCapturedIO(async () => {
      await runCli(['node', 'min-pmt', 'init', '--folder', 'pmt']);
    })) as { out: string; err: string };

    const cfg = await fs.readFile(path.join(process.cwd(), 'min-pmt.config.js'), 'utf8');
    expect(cfg).toContain('"folder": "pmt"');
    expect(result.out).toMatch(/Initialized min-pmt/);
    expect(await existsDir(pmtDir)).toBe(true);
  });

  it('add creates a ticket and list shows it', async () => {
    await runCli(['node', 'min-pmt', 'init']);
    const created = (await withCapturedIO(async () => {
      await runCli(['node', 'min-pmt', 'add', 'From CLI', '-p', 'high']);
    })) as { out: string; err: string };
    const createdId = created.out.trim();
    expect(createdId).toMatch(/^ticket-/);

    await withCapturedIO(async () => {
      await runCli(['node', 'min-pmt', 'list']);
    });

    // Ensure a file exists in pmt folder
    const files = await fs.readdir(pmtDir);
    expect(files.some((f) => f.includes(createdId))).toBe(true);
  });

  it('move updates status', async () => {
    await runCli(['node', 'min-pmt', 'init']);
    const created = (await withCapturedIO(async () => {
      await runCli(['node', 'min-pmt', 'add', 'Movable']);
    })) as { out: string; err: string };
    const id = created.out.trim();
    const moved = (await withCapturedIO(async () => {
      await runCli(['node', 'min-pmt', 'move', id, 'done']);
    })) as { out: string; err: string };
    expect(moved.out).toMatch(/Updated/);
  });
});

async function existsDir(dir: string): Promise<boolean> {
  try {
    const st = await fs.stat(dir);
    return st.isDirectory();
  } catch {
    return false;
  }
}
