#!/usr/bin/env node
import { loadConfig } from '@cmwen/min-pmt-core';
import { MinPmtMcpServer } from './index.js';

const config = await loadConfig();
const server = new MinPmtMcpServer(config);
await server.startStdio();
