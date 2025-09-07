import { describe, it, expect } from 'vitest';
import { runCli } from '../src/index.js';

describe('CLI', () => {
  it('should export runCli function', () => {
    expect(typeof runCli).toBe('function');
  });
});
