/**
 * API Request/Response Type Definitions
 * Shared interfaces for IT Staff Dashboard API endpoints
 */

import { Ticket } from '@/lib/db/schema';

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'STAFF';
  email: string;
  createdAt: string;
}

// ─── Tickets ─────────────────────────────────────────────────────────────────

export interface GetTicketsResponse {
  tickets: Ticket[];
  total: number;
}

export interface UpdateTicketRequest {
  status?: string;
  assignedTo?: string;
  priority?: string;
}

export interface UpdateTicketResponse {
  ticket: Ticket;
  message: string;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface AddCommentRequest {
  comment: string;
}

export interface AddCommentResponse {
  commentId: string;
  message: string;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface GetUsersResponse {
  users: User[];
}

export interface UpdateUserRequest {
  role: 'ADMIN' | 'STAFF';
}

export interface UpdateUserResponse {
  user: User;
  message: string;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export interface HealthStatus {
  service: string;
  status: 'connected' | 'disconnected' | 'degraded';
  lastCheck: string;
  responseTime?: number;
  error?: string;
}

export interface GetHealthResponse {
  groq: HealthStatus;
  database: HealthStatus;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────

export interface AuditLogEntry {
  id: string;
  actionType: string;
  description: string;
  performedBy: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface GetAuditLogResponse {
  entries: AuditLogEntry[];
  total: number;
}
