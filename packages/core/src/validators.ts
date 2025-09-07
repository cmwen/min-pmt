import { z } from 'zod';

export const TicketStatusSchema = z.enum(['todo', 'in-progress', 'done']);
export const TicketPrioritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const CreateTicketSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  due: z.string().datetime().optional(),
});

export const UpdateTicketSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
  labels: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  due: z.string().datetime().optional(),
});

export const ListTicketsQuerySchema = z.object({
  status: TicketStatusSchema.optional(),
  priority: TicketPrioritySchema.optional(),
});

export const StatusUpdateSchema = z.object({
  status: TicketStatusSchema,
});
