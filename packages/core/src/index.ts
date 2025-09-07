export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function sum(a: number, b: number): number {
  return a + b;
}

export { TicketManager } from './TicketManager.js';
export type { Ticket, TicketStatus, ProjectConfig } from './types.js';
