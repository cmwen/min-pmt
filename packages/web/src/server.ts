#!/usr/bin/env node
import { WebUIServer } from './index.js';

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const server = new WebUIServer(port);
await server.start();
