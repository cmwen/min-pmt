import { describe, expect, it } from 'vitest';
import { MinPmtMcpServer } from '../src/index.js';

describe('MCP Server', () => {
  it('should create an instance', () => {
    const server = new MinPmtMcpServer();
    expect(server).toBeInstanceOf(MinPmtMcpServer);
  });
});
