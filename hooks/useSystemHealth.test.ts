/**
 * Unit Tests for useSystemHealth Hook
 *
 * Tests the useSystemHealth SWR hook for system health monitoring including:
 * - Fetching from /api/health endpoint
 * - Returning groqStatus and databaseStatus from response
 * - Error state on fetch failure
 *
 * Requirements Coverage:
 * - 4.5: Admin page uses SWR for System Health status checks with refreshInterval
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSystemHealth } from './useSystemHealth';
import useSWR from 'swr';
import { HealthStatus } from '@/types/api';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

describe('useSystemHealth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Endpoint', () => {
    it('should fetch from /api/health', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useSystemHealth());

      // Verify SWR was called with correct endpoint
      expect(mockUseSWR).toHaveBeenCalledWith(
        '/api/health',
        expect.any(Function),
        expect.any(Object)
      );
    });
  });

  describe('Health Status Response', () => {
    it('should return groqStatus and databaseStatus from response', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockGroqStatus: HealthStatus = {
        service: 'groq',
        status: 'connected',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 150,
      };
      const mockDatabaseStatus: HealthStatus = {
        service: 'database',
        status: 'connected',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 50,
      };

      mockUseSWR.mockReturnValue({
        data: {
          groq: mockGroqStatus,
          database: mockDatabaseStatus,
        },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.groqStatus).toEqual(mockGroqStatus);
      expect(result.current.databaseStatus).toEqual(mockDatabaseStatus);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isError).toBe(false);
    });

    it('should return undefined statuses when data is not yet loaded', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.groqStatus).toBeUndefined();
      expect(result.current.databaseStatus).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle disconnected status for Groq API', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockGroqStatus: HealthStatus = {
        service: 'groq',
        status: 'disconnected',
        lastCheck: '2024-01-01T12:00:00Z',
        error: 'Connection timeout',
      };
      const mockDatabaseStatus: HealthStatus = {
        service: 'database',
        status: 'connected',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 50,
      };

      mockUseSWR.mockReturnValue({
        data: {
          groq: mockGroqStatus,
          database: mockDatabaseStatus,
        },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.groqStatus?.status).toBe('disconnected');
      expect(result.current.groqStatus?.error).toBe('Connection timeout');
      expect(result.current.databaseStatus?.status).toBe('connected');
    });

    it('should handle degraded status', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockGroqStatus: HealthStatus = {
        service: 'groq',
        status: 'degraded',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 5000,
      };
      const mockDatabaseStatus: HealthStatus = {
        service: 'database',
        status: 'degraded',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 2000,
      };

      mockUseSWR.mockReturnValue({
        data: {
          groq: mockGroqStatus,
          database: mockDatabaseStatus,
        },
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.groqStatus?.status).toBe('degraded');
      expect(result.current.databaseStatus?.status).toBe('degraded');
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

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.groqStatus).toBeUndefined();
      expect(result.current.databaseStatus).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should set isError to true on fetch failure', () => {
      const mockUseSWR = vi.mocked(useSWR);
      const mockError = new Error('Failed to fetch health status');

      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      expect(result.current.isError).toBe(true);
      expect(result.current.groqStatus).toBeUndefined();
      expect(result.current.databaseStatus).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
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
        useSystemHealth({
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

    it('should use default refreshInterval of 10000ms when not provided', () => {
      const mockUseSWR = vi.mocked(useSWR);
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        mutate: vi.fn(),
        isValidating: false,
        isLoading: true,
      } as any);

      renderHook(() => useSystemHealth());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      expect(config).toMatchObject({
        refreshInterval: 10000,
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

      renderHook(() => useSystemHealth());

      const callArgs = mockUseSWR.mock.calls[0];
      const config = callArgs[2];
      if (config) {
        expect(config.revalidateOnFocus).toBe(true);
      }
    });
  });

  describe('Mutate Function', () => {
    it('should expose mutate function for manual revalidation', () => {
      const mockMutate = vi.fn();
      const mockUseSWR = vi.mocked(useSWR);
      const mockGroqStatus: HealthStatus = {
        service: 'groq',
        status: 'connected',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 150,
      };
      const mockDatabaseStatus: HealthStatus = {
        service: 'database',
        status: 'connected',
        lastCheck: '2024-01-01T12:00:00Z',
        responseTime: 50,
      };

      mockUseSWR.mockReturnValue({
        data: {
          groq: mockGroqStatus,
          database: mockDatabaseStatus,
        },
        error: undefined,
        mutate: mockMutate,
        isValidating: false,
        isLoading: false,
      } as any);

      const { result } = renderHook(() => useSystemHealth());

      result.current.mutate();

      expect(mockMutate).toHaveBeenCalled();
    });
  });
});
