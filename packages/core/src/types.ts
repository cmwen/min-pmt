export type TicketStatus = 'todo' | 'in-progress' | 'done';

export interface Ticket {
  id: string;
  title: string;
  description?: string;
  status: TicketStatus;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  labels?: string[];
  assignee?: string;
  created: string; // ISO string for portability
  updated: string; // ISO string for portability
  due?: string;
  filePath?: string;
  content?: string;
}

export interface StateConfig {
  color: string; // Hex color for UI
  order: number; // Display order
}

export interface FieldConfig {
  type: 'string' | 'number' | 'date' | 'array' | 'boolean';
  required: boolean;
  enum?: string[]; // For dropdown options
  items?: string; // For array item type
}

export interface TemplateConfig {
  defaultStatus: TicketStatus;
  generateId: boolean; // Auto-generate ticket IDs
  idPrefix: string;
  content: string; // Default markdown content template
}

export interface ProjectConfig {
  folder: string; // default: 'pmt'
  states?: Record<string, StateConfig>;
  schema?: Record<string, FieldConfig>;
  template?: TemplateConfig;
}

export const defaultConfig: ProjectConfig = {
  folder: 'pmt',
  states: {
    todo: { color: '#6b7280', order: 1 },
    'in-progress': { color: '#3b82f6', order: 2 },
    done: { color: '#10b981', order: 3 },
  },
  schema: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: false },
    status: { type: 'string', required: true, enum: ['todo', 'in-progress', 'done'] },
    priority: { type: 'string', required: false, enum: ['low', 'medium', 'high', 'critical'] },
    labels: { type: 'array', required: false, items: 'string' },
    assignee: { type: 'string', required: false },
    created: { type: 'date', required: true },
    updated: { type: 'date', required: true },
    due: { type: 'date', required: false },
  },
  template: {
    defaultStatus: 'todo',
    generateId: true,
    idPrefix: 'ticket-',
    content: `## Description

[Add your description here]

## Acceptance Criteria

- [ ] Criteria 1
- [ ] Criteria 2

## Notes

[Add any additional notes here]`,
  },
};
