export function greet(name: string): string {
  return `Hello, ${name}!`;
}

export function sum(a: number, b: number): number {
  return a + b;
}

export { initializeConfig, loadConfig } from './ConfigLoader.js';
export { TicketManager } from './TicketManager.js';
export type {
  FieldConfig,
  ProjectConfig,
  StateConfig,
  TemplateConfig,
  Ticket,
  TicketStatus,
} from './types.js';
export {
  CreateTicketSchema,
  ListTicketsQuerySchema,
  StatusUpdateSchema,
  TicketPrioritySchema,
  TicketStatusSchema,
  UpdateTicketSchema,
} from './validators.js';
