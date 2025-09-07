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

export interface ProjectConfig {
  folder: string; // default: 'pmt'
}

export const defaultConfig: ProjectConfig = {
  folder: 'pmt',
};
