/**
 * API Type Definitions
 * Shared types for API requests and responses
 */

import { Ticket } from '@/lib/db/schema';

// Re-export TriageResult from groqService
export type { TriageResult } from '@/lib/services/groqService';

// Ticket submission request
export interface TicketSubmissionRequest {
  userInput: string;
}

// Ticket response
export interface TicketResponse {
  ticketId: string;
  category: string;
  urgencyScore: number;
  aiSummary: string;
  status: string;
  createdAt: string;
}

// Ticket query parameters
export interface TicketQueryParams {
  category?: string;
  urgency?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Ticket list response
export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page?: number;
  limit?: number;
}

// Category distribution
export interface CategoryDistribution {
  category: string;
  count: number;
}

// Urgency distribution
export interface UrgencyDistribution {
  urgency: number;
  count: number;
}

// Status distribution
export interface StatusDistribution {
  status: string;
  count: number;
}

// Ticket statistics
export interface TicketStatistics {
  totalTickets: number;
  categoryDistribution: CategoryDistribution[];
  urgencyDistribution: UrgencyDistribution[];
  averageUrgency: number;
  statusDistribution: StatusDistribution[];
}
