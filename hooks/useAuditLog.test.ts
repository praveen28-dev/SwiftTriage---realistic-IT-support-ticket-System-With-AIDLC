/**
 * Unit Tests for useAuditLog Hook
 *
 * Tests the useAuditLog SWR hook for audit log data fetching including:
 * - Fetching from /api/audit-log with limit parameter
 * - Entries array population on successful fetch
 * - Error state on fetch failure
 *
 * Requirements Coverage:
 * - 4.6: Admin page uses SWR for Audit Log updates with refreshInterval
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuditLog } from './useAuditLog';
import useSWR from 'swr';
import { AuditLogEntry } from '@/types/api';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

describe('useAuditLog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Endpoint', () => {
    it('should fetch from /api/audit-log?limit=10 by default', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useAuditLog());

      // Verify SWR was called with correct endpoint
      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/audit-log?limit=10',
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should fetch with custom limit parameter', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useAuditLog({
          limit: 25,
        })
      );

      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/audit-log?limit=25',
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('Audit Log Entries', () => {
    it('should populate entries array on successful fetch', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockEntries: AuditLogEntry[] = [
        {
          id: 'entry-1',
          actionType: 'ticket_created',
          description: 'New ticket created by user',
          performedBy: 'john_doe',
          timestamp: '2024-01-01T12:00:00Z',
          metadata: { ticketId: 'ticket-123' },
        },
        {
          id: 'entry-2',
          actionType: 'status_changed',
          description: 'Ticket status changed to IN_PROGRESS',
          performedBy: 'jane_smith',
          timestamp: '2024-01-01T11:30:00Z',
          metadata: { ticketId: 'ticket-456', oldStatus: 'OPEN', newStatus: 'IN_PROGRESS' },
        },
      ];

      mockUseSWR.mockReturnValue({
        data: { entries: mockEntries },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.entries).toHaveLength(2);
      expect(result.current.entries).toEqual(mockEntries);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return empty array when no entries are returned', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: { entries: [] },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.entries).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return empty array when data is undefined', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.entries).toEqual([]);
    });

    it('should handle entries with different action types', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockEntries: AuditLogEntry[] = [
        {
          id: 'entry-1',
          actionType: 'user_login',
          description: 'User logged in',
          performedBy: 'admin',
          timestamp: '2024-01-01T12:00:00Z',
        },
        {
          id: 'entry-2',
          actionType: 'role_updated',
          description: 'User role changed to ADMIN',
          performedBy: 'super_admin',
          timestamp: '2024-01-01T11:30:00Z',
          metadata: { userId: 'user-123', newRole: 'ADMIN' },
        },
        {
          id: 'entry-3',
          actionType: 'ticket_resolved',
          description: 'Ticket marked as resolved',
          performedBy: 'it_staff',
          timestamp: '2024-01-01T11:00:00Z',
          metadata: { ticketId: 'ticket-789' },
        },
      ];

      mockUseSWR.mockReturnValue({
        data: { entries: mockEntries },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.entries).toHaveLength(3);
      expect(result.current.entries[0].actionType).toBe('user_login');
      expect(result.current.entries[1].actionType).toBe('role_updated');
      expect(result.current.entries[2].actionType).toBe('ticket_resolved');
    });
  });

  describe('Loading State', () => {
    it('should return isLoading as true before data resolves', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.entries).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should set isError to true on fetch failure', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockError = new Error('Failed to fetch audit log');

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.isError).toBe(true);
      expect(result.current.entries).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty entries array on error', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('Network error'),
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      expect(result.current.entries).toEqual([]);
    });
  });

  describe('SWR Configuration', () => {
    it('should configure SWR with custom refreshInterval', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useAuditLog({
          refreshInterval: 5000,
        })
      );

      // Verify SWR was called with correct config
      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      expect(config).toMatchObject({
        refreshInterval: 5000,
        revalidateOnFocus: true,
      });
    });

    it('should use default refreshInterval of 15000ms when not provided', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useAuditLog());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      expect(config).toMatchObject({
        refreshInterval: 15000,
        revalidateOnFocus: true,
      });
    });

    it('should enable revalidateOnFocus', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useAuditLog());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      if (config) {
        expect(config.revalidateOnFocus).toBe(true);
      }
    });

    it('should allow disabling polling with refreshInterval=0', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useAuditLog({
          refreshInterval: 0,
        })
      );

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      if (config) {
        expect(config.refreshInterval).toBe(0);
      }
    });
  });

  describe('Mutate Function', () => {
    it('should expose mutate function for manual revalidation', () => {
      const mockMutate = vi.fn();
      const mockUseSWR = vi.mocked(useSWR);
      const mockEntries: AuditLogEntry[] = [
        {
          id: 'entry-1',
          actionType: 'ticket_created',
          description: 'New ticket created',
          performedBy: 'john_doe',
          timestamp: '2024-01-01T12:00:00Z',
        },
      ];

      mockUseSWR.mockReturnValue({
        data: { entries: mockEntries },
        error: undefined,
        mutate: mockMutate,
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useAuditLog());

      result.current.mutate();

      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
