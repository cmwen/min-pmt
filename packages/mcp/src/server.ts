#!/usr/bin/env node
import { MinPmtMcpServer } from './index.js';

const server = new MinPmtMcpServer();
await server.startStdio();
