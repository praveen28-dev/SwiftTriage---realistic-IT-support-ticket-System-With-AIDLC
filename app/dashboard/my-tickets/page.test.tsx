/**
 * My Tickets Page Component Tests
 * 
 * Tests cover:
 * - Authentication and authorization redirects
 * - Loading states
 * - Ticket data rendering
 * - Search functionality
 * - Sort functionality
 * - Error states
 * - Quick actions (status change, add comment)
 * 
 * Requirements Coverage:
 * - 1.11: TypeScript type safety
 * - 1.12: Zero compilation errors
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import MyTicketsPage from './page';
import { useTickets } from '@/hooks/useTickets';
import { Ticket } from '@/lib/db/schema';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(),
}));

// Mock useTickets hook
vi.mock('@/hooks/useTickets', () => ({
  useTickets: vi.fn(),
}));

// Mock fetch for API calls
global.fetch = vi.fn();

describe('MyTicketsPage', () => {
  const mockPush = vi.fn();
  const mockMutate = vi.fn();

  // Sample ticket data
  const mockTickets: Ticket[] = [
    {
      id: 'ticket-001',
      customerId: 'customer-1',
      submittedBy: 'user1@example.com',
      userInput: 'Network issue in building A',
      category: 'Network',
      urgencyScore: 8,
      aiSummary: 'Network connectivity problem in building A',
      status: 'PENDING',
      assignedTo: 'it_admin',
      tags: null,
      priority: 'high',
      resolvedAt: null,
      createdAt: new Date('2024-01-15T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'ticket-002',
      customerId: 'customer-2',
      submittedBy: 'user2@example.com',
      userInput: 'Printer not working',
      category: 'Hardware',
      urgencyScore: 5,
      aiSummary: 'Printer malfunction on 3rd floor',
      status: 'IN_PROGRESS',
      assignedTo: 'it_admin',
      tags: null,
      priority: 'medium',
      resolvedAt: null,
      createdAt: new Date('2024-01-14T09:00:00Z'),
      updatedAt: new Date('2024-01-14T09:00:00Z'),
    },
    {
      id: 'ticket-003',
      customerId: 'customer-3',
      submittedBy: 'user3@example.com',
      userInput: 'Software installation request',
      category: 'Software',
      urgencyScore: 3,
      aiSummary: 'Request to install Adobe Creative Suite',
      status: 'RESOLVED',
      assignedTo: 'it_admin',
      tags: null,
      priority: 'low',
      resolvedAt: new Date('2024-01-16T14:00:00Z'),
      createdAt: new Date('2024-01-13T08:00:00Z'),
      updatedAt: new Date('2024-01-16T14:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
    (usePathname as any).mockReturnValue('/dashboard/my-tickets');
    (global.fetch as any).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should redirect unauthenticated users to /login', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('should redirect non-IT-staff users (end_user) to /dashboard', () => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'End User',
            email: 'user@example.com',
            role: 'end_user',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should allow IT staff users to access the page', () => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'My Tickets' })).toBeInTheDocument();
    });

    it('should allow ADMIN users to access the page', () => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'Admin',
            email: 'admin@example.com',
            role: 'ADMIN',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(mockPush).not.toHaveBeenCalled();
      expect(screen.getByRole('heading', { name: 'My Tickets' })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should render loading spinner while session status is loading', () => {
      (useSession as any).mockReturnValue({
        data: null,
        status: 'loading',
      });

      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      // Check for loading spinner (it should be in the document)
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should render loading spinner while tickets are loading', () => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: true,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Ticket Data Rendering', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });
    });

    it('should render ticket rows when useTickets returns data', () => {
      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      // Check that all tickets are rendered
      expect(screen.getByText(/Network connectivity problem/i)).toBeInTheDocument();
      expect(screen.getByText(/Printer malfunction/i)).toBeInTheDocument();
      expect(screen.getByText(/Adobe Creative Suite/i)).toBeInTheDocument();
    });

    it('should display ticket count in subtitle', () => {
      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(screen.getByText('3 tickets assigned to you')).toBeInTheDocument();
    });

    it('should render empty state when no tickets match search', () => {
      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      expect(screen.getByText(/No tickets found matching your search/i)).toBeInTheDocument();
    });

    it('should display ticket details correctly', () => {
      (useTickets as any).mockReturnValue({
        tickets: [mockTickets[0]],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      // Check for ticket ID (truncated)
      expect(screen.getByText(/ticket-0/i)).toBeInTheDocument();
      
      // Check for AI summary
      expect(screen.getByText(/Network connectivity problem/i)).toBeInTheDocument();
      
      // Check for category badge
      expect(screen.getByText('Network')).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });
    });

    it('should filter tickets by search query (ID)', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'ticket-001' } });

      // Should show only the matching ticket
      expect(screen.getByText(/Network connectivity problem/i)).toBeInTheDocument();
      expect(screen.queryByText(/Printer malfunction/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Adobe Creative Suite/i)).not.toBeInTheDocument();
    });

    it('should filter tickets by search query (summary)', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'printer' } });

      // Should show only the matching ticket
      expect(screen.queryByText(/Network connectivity problem/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Printer malfunction/i)).toBeInTheDocument();
      expect(screen.queryByText(/Adobe Creative Suite/i)).not.toBeInTheDocument();
    });

    it('should filter tickets by search query (category)', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'software' } });

      // Should show only the matching ticket
      expect(screen.queryByText(/Network connectivity problem/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Printer malfunction/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Adobe Creative Suite/i)).toBeInTheDocument();
    });

    it('should filter tickets by search query (status)', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'resolved' } });

      // Should show only the matching ticket
      expect(screen.queryByText(/Network connectivity problem/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/Printer malfunction/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Adobe Creative Suite/i)).toBeInTheDocument();
    });

    it('should be case-insensitive', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'NETWORK' } });

      expect(screen.getByText(/Network connectivity problem/i)).toBeInTheDocument();
    });

    it('should show empty state when no tickets match search', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText(/No tickets found matching your search/i)).toBeInTheDocument();
    });

    it('should update ticket count based on filtered results', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByPlaceholderText(/Search by ID/i);
      fireEvent.change(searchInput, { target: { value: 'network' } });

      expect(screen.getByText('1 ticket assigned to you')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });
    });

    it('should sort by urgency score by default (descending)', () => {
      render(<MyTicketsPage />);

      const rows = screen.getAllByRole('row');
      // Skip header row, check data rows
      expect(rows[1]).toHaveTextContent(/Network connectivity problem/i); // urgency 8
      expect(rows[2]).toHaveTextContent(/Printer malfunction/i); // urgency 5
      expect(rows[3]).toHaveTextContent(/Adobe Creative Suite/i); // urgency 3
    });

    it('should toggle sort direction when clicking the same column header', () => {
      render(<MyTicketsPage />);

      const urgencyHeader = screen.getByText('Urgency').closest('th');
      
      // First click - should sort ascending
      fireEvent.click(urgencyHeader!);

      let rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent(/Adobe Creative Suite/i); // urgency 3
      expect(rows[2]).toHaveTextContent(/Printer malfunction/i); // urgency 5
      expect(rows[3]).toHaveTextContent(/Network connectivity problem/i); // urgency 8

      // Second click - should sort descending again
      fireEvent.click(urgencyHeader!);

      rows = screen.getAllByRole('row');
      expect(rows[1]).toHaveTextContent(/Network connectivity problem/i); // urgency 8
      expect(rows[2]).toHaveTextContent(/Printer malfunction/i); // urgency 5
      expect(rows[3]).toHaveTextContent(/Adobe Creative Suite/i); // urgency 3
    });

    it('should sort by created date when clicking Created column', () => {
      render(<MyTicketsPage />);

      const createdHeader = screen.getByText('Created').closest('th');
      fireEvent.click(createdHeader!);

      const rows = screen.getAllByRole('row');
      // Ascending order (oldest first)
      expect(rows[1]).toHaveTextContent(/Adobe Creative Suite/i); // Jan 13
      expect(rows[2]).toHaveTextContent(/Printer malfunction/i); // Jan 14
      expect(rows[3]).toHaveTextContent(/Network connectivity problem/i); // Jan 15
    });

    it('should sort by status when clicking Status column', () => {
      render(<MyTicketsPage />);

      const statusHeader = screen.getByText('Status').closest('th');
      fireEvent.click(statusHeader!);

      const rows = screen.getAllByRole('row');
      // Ascending alphabetical order - check that rows contain the expected statuses
      // Note: The actual text includes other content, so we just verify the order
      const rowTexts = rows.slice(1).map(row => row.textContent);
      
      // Verify IN_PROGRESS comes before PENDING which comes before RESOLVED
      const inProgressIndex = rowTexts.findIndex(text => text?.includes('IN PROGRESS'));
      const pendingIndex = rowTexts.findIndex(text => text?.includes('PENDING'));
      const resolvedIndex = rowTexts.findIndex(text => text?.includes('RESOLVED'));
      
      expect(inProgressIndex).toBeLessThan(pendingIndex);
      expect(pendingIndex).toBeLessThan(resolvedIndex);
    });

    it('should sort by category when clicking Category column', () => {
      render(<MyTicketsPage />);

      const categoryHeader = screen.getByText('Category').closest('th');
      fireEvent.click(categoryHeader!);

      const rows = screen.getAllByRole('row');
      // Ascending alphabetical order
      expect(rows[1]).toHaveTextContent(/Hardware/i);
      expect(rows[2]).toHaveTextContent(/Network/i);
      expect(rows[3]).toHaveTextContent(/Software/i);
    });

    it('should display sort indicator on active column', () => {
      render(<MyTicketsPage />);

      const urgencyHeader = screen.getByText('Urgency').closest('th');
      
      // Should have aria-sort attribute
      expect(urgencyHeader).toHaveAttribute('aria-sort', 'descending');
    });

    it('should update aria-sort when changing sort direction', () => {
      render(<MyTicketsPage />);

      const urgencyHeader = screen.getByText('Urgency').closest('th');
      
      // Click to change to ascending
      fireEvent.click(urgencyHeader!);
      expect(urgencyHeader).toHaveAttribute('aria-sort', 'ascending');

      // Click again to change to descending
      fireEvent.click(urgencyHeader!);
      expect(urgencyHeader).toHaveAttribute('aria-sort', 'descending');
    });
  });

  describe('Error States', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });
    });

    it('should render ErrorEmptyState when isError is true', () => {
      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: true,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      // ErrorEmptyState should be rendered - button text is "Try Again"
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should call mutate when retry button is clicked', () => {
      (useTickets as any).mockReturnValue({
        tickets: [],
        isLoading: false,
        isError: true,
        mutate: mockMutate,
      });

      render(<MyTicketsPage />);

      const retryButton = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryButton);

      expect(mockMutate).toHaveBeenCalled();
    });
  });

  describe('Quick Actions', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: [mockTickets[0]],
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });
    });

    it('should render Change Status button for each ticket', () => {
      render(<MyTicketsPage />);

      const changeStatusButtons = screen.getAllByRole('button', { name: /change status/i });
      expect(changeStatusButtons).toHaveLength(1);
    });

    it('should render Add Comment button for each ticket', () => {
      render(<MyTicketsPage />);

      const addCommentButtons = screen.getAllByRole('button', { name: /add comment/i });
      expect(addCommentButtons).toHaveLength(1);
    });

    it('should open status dropdown when Change Status is clicked', () => {
      render(<MyTicketsPage />);

      const changeStatusButton = screen.getByRole('button', { name: /change status/i });
      fireEvent.click(changeStatusButton);

      // Status options should be visible
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /pending/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /in progress/i })).toBeInTheDocument();
    });

    it('should send PATCH request when status is changed', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ticket: mockTickets[0], message: 'Success' }),
      });

      render(<MyTicketsPage />);

      const changeStatusButton = screen.getByRole('button', { name: /change status/i });
      fireEvent.click(changeStatusButton);

      const inProgressOption = screen.getByRole('option', { name: /in progress/i });
      fireEvent.click(inProgressOption);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tickets/ticket-001',
          expect.objectContaining({
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'IN_PROGRESS' }),
          })
        );
      });
    });

    it('should call mutate after successful status change', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ticket: mockTickets[0], message: 'Success' }),
      });

      render(<MyTicketsPage />);

      const changeStatusButton = screen.getByRole('button', { name: /change status/i });
      fireEvent.click(changeStatusButton);

      const inProgressOption = screen.getByRole('option', { name: /in progress/i });
      fireEvent.click(inProgressOption);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('should display error message when status change fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to update status' }),
      });

      render(<MyTicketsPage />);

      const changeStatusButton = screen.getByRole('button', { name: /change status/i });
      fireEvent.click(changeStatusButton);

      const inProgressOption = screen.getByRole('option', { name: /in progress/i });
      fireEvent.click(inProgressOption);

      await waitFor(() => {
        expect(screen.getByText(/Failed to update status/i)).toBeInTheDocument();
      });
    });

    it('should open comment modal when Add Comment is clicked', () => {
      render(<MyTicketsPage />);

      const addCommentButton = screen.getByRole('button', { name: /add comment/i });
      fireEvent.click(addCommentButton);

      // Comment textarea should be visible
      expect(screen.getByLabelText(/comment text/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should send POST request when comment is submitted', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ commentId: 'comment-1', message: 'Success' }),
      });

      render(<MyTicketsPage />);

      const addCommentButton = screen.getByRole('button', { name: /add comment/i });
      fireEvent.click(addCommentButton);

      const commentTextarea = screen.getByLabelText(/comment text/i);
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/tickets/ticket-001/comments',
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment: 'Test comment' }),
          })
        );
      });
    });

    it('should call mutate after successful comment submission', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ commentId: 'comment-1', message: 'Success' }),
      });

      render(<MyTicketsPage />);

      const addCommentButton = screen.getByRole('button', { name: /add comment/i });
      fireEvent.click(addCommentButton);

      const commentTextarea = screen.getByLabelText(/comment text/i);
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it('should display error message when comment submission fails', async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed to add comment' }),
      });

      render(<MyTicketsPage />);

      const addCommentButton = screen.getByRole('button', { name: /add comment/i });
      fireEvent.click(addCommentButton);

      const commentTextarea = screen.getByLabelText(/comment text/i);
      fireEvent.change(commentTextarea, { target: { value: 'Test comment' } });

      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to add comment/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useSession as any).mockReturnValue({
        data: {
          user: {
            name: 'IT Admin',
            email: 'it_admin@example.com',
            role: 'it_staff',
          },
          expires: '2024-12-31',
        },
        status: 'authenticated',
      });

      (useTickets as any).mockReturnValue({
        tickets: mockTickets,
        isLoading: false,
        isError: false,
        mutate: mockMutate,
      });
    });

    it('should have proper ARIA label for search input', () => {
      render(<MyTicketsPage />);

      const searchInput = screen.getByLabelText(/search tickets/i);
      expect(searchInput).toBeInTheDocument();
    });

    it('should have proper ARIA label for table', () => {
      render(<MyTicketsPage />);

      const table = screen.getByLabelText(/my assigned tickets/i);
      expect(table).toBeInTheDocument();
    });

    it('should have proper aria-sort attributes on sortable columns', () => {
      render(<MyTicketsPage />);

      const urgencyHeader = screen.getByText('Urgency').closest('th');
      expect(urgencyHeader).toHaveAttribute('aria-sort');
    });

    it('should have proper aria-expanded on status dropdown button', () => {
      render(<MyTicketsPage />);

      const changeStatusButtons = screen.getAllByRole('button', { name: /change status/i });
      const changeStatusButton = changeStatusButtons[0]; // Get the first one
      expect(changeStatusButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(changeStatusButton);
      expect(changeStatusButton).toHaveAttribute('aria-expanded', 'true');
    });
  });
});
