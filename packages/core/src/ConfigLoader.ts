import { promises as fs } from 'node:fs';
import path from 'node:path';
import { defaultConfig, type ProjectConfig } from './types.js';

/**
 * Minimal configuration loader with JS preferred, JSON fallback.
 * Sandboxes resolution to process.cwd().
 */

export async function loadConfig(cwd: string = process.cwd()): Promise<ProjectConfig> {
  const jsPath = path.join(cwd, 'min-pmt.config.js');
  const jsonPath = path.join(cwd, 'min-pmt.config.json');

  // Prefer JS
  if (await exists(jsPath)) {
    const mod = (await import(pathToFileUrl(jsPath))).default as Partial<ProjectConfig>;
    return { ...defaultConfig, ...mod };
  }
  if (await exists(jsonPath)) {
    const raw = await fs.readFile(jsonPath, 'utf8');
    const obj = JSON.parse(raw) as Partial<ProjectConfig>;
    return { ...defaultConfig, ...obj };
  }
  return defaultConfig;
}

export async function initializeConfig(
  options?: { folder?: string },
  cwd: string = process.cwd()
): Promise<ProjectConfig> {
  const cfg: ProjectConfig = {
    ...defaultConfig,
    ...(options?.folder ? { folder: options.folder } : {}),
  };
  const jsPath = path.join(cwd, 'min-pmt.config.js');
  const content = `export default ${JSON.stringify(cfg, null, 2)}\n`;
  await fs.writeFile(jsPath, content, 'utf8');
  return cfg;
}

// Keep the static class for backward compatibility
export class ConfigLoader {
  static async load(cwd: string = process.cwd()): Promise<ProjectConfig> {
    return loadConfig(cwd);
  }

  static async initialize(
    options?: { folder?: string },
    cwd: string = process.cwd()
  ): Promise<ProjectConfig> {
    return initializeConfig(options, cwd);
  }
}

function pathToFileUrl(p: string): string {
  const u = new URL('file://');
  // Ensure absolute path
  const abs = path.resolve(p);
  // macOS paths start with /
  u.pathname = abs;
  return u.toString();
}

async function exists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}
