/**
 * Unit Tests for useTickets Hook
 *
 * Tests the useTickets SWR hook for ticket data fetching including:
 * - assignedTo parameter appending to fetch URL
 * - Loading state before data resolves
 * - Tickets array population on successful fetch
 * - Error state on fetch failure
 *
 * Requirements Coverage:
 * - 4.1: SWR data fetching with automatic revalidation
 * - 4.2: SWR configured with refreshInterval for polling
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTickets } from './useTickets';
import useSWR from 'swr';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

describe('useTickets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL Construction', () => {
    it('should append assignedTo param to the fetch URL when provided', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useTickets({
          assignedTo: 'john_doe',
        })
      );

      // Verify SWR was called with correct URL including assignedTo
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining('assignedTo=john_doe'),
        expect.any(Function),
        expect.any(Object)
      );
    });

    it('should not include assignedTo param when not provided', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useTickets({}));

      // Verify SWR was called with URL without assignedTo
      const callArgs = mockUseSWR.mock.calls[0];
      const url = callArgs[0] as string;
      expect(url).not.toContain('assignedTo=');
    });

    it('should include multiple filter params in the URL', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useTickets({
          assignedTo: 'john_doe',
          filters: {
            category: 'Network',
            status: 'OPEN',
          },
        })
      );

      const callArgs = mockUseSWR.mock.calls[0];
      const url = callArgs[0] as string;
      expect(url).toContain('assignedTo=john_doe');
      expect(url).toContain('category=Network');
      expect(url).toContain('status=OPEN');
    });

    it('should include sortBy and sortOrder params in the URL', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() =>
        useTickets({
          sortBy: 'createdAt',
          sortOrder: 'asc',
        })
      );

      const callArgs = mockUseSWR.mock.calls[0];
      const url = callArgs[0] as string;
      expect(url).toContain('sortBy=createdAt');
      expect(url).toContain('sortOrder=asc');
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

      const { result } = renderHook(() => useTickets());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.tickets).toEqual([]);
      expect(result.current.total).toBe(0);
    });

    it('should return isLoading as false when data is available', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockTickets = [
        {
          id: 'ticket-1',
          customerId: 'customer-1',
          userInput: 'Network issue',
          category: 'Network',
          urgencyScore: 8,
          aiSummary: 'Network connectivity problem',
          status: 'OPEN',
          assignedTo: 'john_doe',
          tags: null,
          priority: 'high',
          resolvedAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockUseSWR.mockReturnValue({
        data: { tickets: mockTickets, total: 1 },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.total).toBe(1);
    });
  });

  describe('Successful Data Fetch', () => {
    it('should populate tickets array on successful fetch', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockTickets = [
        {
          id: 'ticket-1',
          customerId: 'customer-1',
          userInput: 'Network issue',
          category: 'Network',
          urgencyScore: 8,
          aiSummary: 'Network connectivity problem',
          status: 'OPEN',
          assignedTo: 'john_doe',
          tags: null,
          priority: 'high',
          resolvedAt: null,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'ticket-2',
          customerId: 'customer-2',
          userInput: 'Printer not working',
          category: 'Hardware',
          urgencyScore: 5,
          aiSummary: 'Printer malfunction',
          status: 'IN_PROGRESS',
          assignedTo: 'john_doe',
          tags: null,
          priority: 'medium',
          resolvedAt: null,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockUseSWR.mockReturnValue({
        data: { tickets: mockTickets, total: 2 },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      expect(result.current.tickets).toHaveLength(2);
      expect(result.current.tickets).toEqual(mockTickets);
      expect(result.current.total).toBe(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return empty array when no tickets are returned', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: { tickets: [], total: 0 },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      expect(result.current.tickets).toEqual([]);
      expect(result.current.total).toBe(0);
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

      const { result } = renderHook(() => useTickets());

      expect(result.current.tickets).toEqual([]);
      expect(result.current.total).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should set isError to true on fetch failure', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockError = new Error('Failed to fetch tickets');

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(mockError);
      expect(result.current.tickets).toEqual([]);
      expect(result.current.isLoading).toBe(false);
    });

    it('should return empty tickets array on error', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error('Network error'),
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      expect(result.current.tickets).toEqual([]);
      expect(result.current.total).toBe(0);
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
        useTickets({
          refreshInterval: 3000,
        })
      );

      // Verify SWR was called with correct config
      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      expect(config).toMatchObject({
        refreshInterval: 3000,
        revalidateOnFocus: true,
      });
    });

    it('should use default refreshInterval of 5000ms when not provided', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useTickets());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      expect(config).toMatchObject({
        refreshInterval: 5000,
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

      renderHook(() => useTickets());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      if (config) {
        expect(config.revalidateOnFocus).toBe(true);
      }
    });
  });

  describe('Mutate Function', () => {
    it('should expose mutate function for manual revalidation', async () => {
      const mockMutate = vi.fn().mockResolvedValue(undefined);
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: { tickets: [], total: 0 },
        error: undefined,
        mutate: mockMutate,
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useTickets());

      await result.current.mutate();

      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
