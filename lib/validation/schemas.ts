/**
 * Validation Service
 * Shared Zod schemas for client and server validation
 */

import { z } from 'zod';

// Ticket submission validation
export const ticketSubmissionSchema = z.object({
  userInput: z
    .string()
    .min(10, 'Issue description must be at least 10 characters')
    .max(5000, 'Issue description must not exceed 5000 characters')
    .trim(),
});

// Ticket filters validation
export const ticketFiltersSchema = z.object({
  category: z
    .enum(['Hardware', 'Network', 'Access', 'Software', 'Uncategorized'])
    .optional(),
  urgency: z.coerce.number().int().min(1).max(5).optional(),
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

// Ticket sort validation
export const ticketSortSchema = z.object({
  sortBy: z
    .enum(['urgencyScore', 'createdAt', 'category', 'status'])
    .default('urgencyScore'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Export validation functions
export const validateTicketSubmission = (data: unknown) =>
  ticketSubmissionSchema.parse(data);

export const validateTicketFilters = (data: unknown) =>
  ticketFiltersSchema.parse(data);

export const validateTicketSort = (data: unknown) =>
  ticketSortSchema.parse(data);

// Export inferred types
export type TicketSubmission = z.infer<typeof ticketSubmissionSchema>;
export type TicketFilters = z.infer<typeof ticketFiltersSchema>;
export type TicketSort = z.infer<typeof ticketSortSchema>;
