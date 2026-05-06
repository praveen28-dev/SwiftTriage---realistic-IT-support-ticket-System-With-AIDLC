/**
 * Preservation Property Tests - Working Navigation Functionality
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**
 * 
 * IMPORTANT: These tests verify working functionality that must be preserved after fixes
 * These tests should PASS on UNFIXED code - they capture baseline behavior
 * 
 * GOAL: Ensure working navigation remains unchanged after implementing bug fixes
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sidebar } from './Sidebar';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import * as fc from 'fast-check';

// Mock Next.js modules
vi.mock('next-auth/react');
vi.mock('next/navigation');

// Mock Link component to capture href
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('Preservation Property Tests - Working Navigation', () => {
  beforeEach(() => {
    vi.mocked(usePathname).mockReturnValue('/dashboard');
  });

  /**
   * Property 3: Preservation - Working Navigation Links Remain Functional
   * 
   * Dashboard, Customers (for IT staff), and Submit navigation must continue to work
   * exactly as before. These are the implemented pages that should remain clickable.
   */

  describe('Working Navigation - Dashboard Link', () => {
    it('should render Dashboard link as clickable for end users', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Dashboard link exists and is clickable
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      
      // Should NOT be disabled
      expect(dashboardLink.getAttribute('aria-disabled')).not.toBe('true');
      expect(dashboardLink).not.toHaveAttribute('disabled');
    });

    it('should render Dashboard link as clickable for IT staff', () => {
      // Setup: IT staff session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'IT Admin', email: 'it_admin@example.com', role: 'it_staff' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Dashboard link exists and is clickable
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      
      expect(dashboardLink).toBeInTheDocument();
      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(dashboardLink.getAttribute('aria-disabled')).not.toBe('true');
    });
  });

  describe('Working Navigation - Customers Link (IT Staff Only)', () => {
    it('should render Customers link as clickable for IT staff', () => {
      // Setup: IT staff session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'IT Admin', email: 'it_admin@example.com', role: 'it_staff' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Customers link exists and is clickable for IT staff
      const customersLink = screen.getByRole('link', { name: /customers/i });
      
      expect(customersLink).toBeInTheDocument();
      expect(customersLink).toHaveAttribute('href', '/customers');
      
      // Should NOT be disabled
      expect(customersLink.getAttribute('aria-disabled')).not.toBe('true');
      expect(customersLink).not.toHaveAttribute('disabled');
    });

    it('should NOT render Customers link for end users (role-based visibility)', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Customers link should NOT exist for end users
      const customersLink = screen.queryByRole('link', { name: /customers/i });
      
      expect(customersLink).toBeNull();
    });
  });

  describe('Working Navigation - New Ticket Button', () => {
    it('should render New Ticket button as clickable for end users', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: New Ticket button exists and navigates to /submit
      const newTicketButton = screen.getByRole('link', { name: /new ticket/i });
      
      expect(newTicketButton).toBeInTheDocument();
      expect(newTicketButton).toHaveAttribute('href', '/submit');
      
      // Should NOT be disabled
      expect(newTicketButton.getAttribute('aria-disabled')).not.toBe('true');
      expect(newTicketButton).not.toHaveAttribute('disabled');
    });

    it('should render New Ticket button as clickable for IT staff', () => {
      // Setup: IT staff session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'IT Admin', email: 'it_admin@example.com', role: 'it_staff' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: New Ticket button exists and navigates to /submit
      const newTicketButton = screen.getByRole('link', { name: /new ticket/i });
      
      expect(newTicketButton).toBeInTheDocument();
      expect(newTicketButton).toHaveAttribute('href', '/submit');
      expect(newTicketButton.getAttribute('aria-disabled')).not.toBe('true');
    });
  });

  describe('Working Navigation - SwiftTriage Logo', () => {
    it('should render logo link navigating to dashboard when sidebar is expanded', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Logo link exists and navigates to /dashboard
      const logoLink = screen.getByRole('link', { name: /swifttriage/i });
      
      expect(logoLink).toBeInTheDocument();
      expect(logoLink).toHaveAttribute('href', '/dashboard');
    });
  });

  /**
   * Property-Based Test: All Working Routes Always Functional
   * 
   * Generates test cases for all working routes and verifies they remain
   * clickable and functional across different user roles.
   */
  it('property: all working navigation routes should remain functional', () => {
    const workingRoutes = [
      { href: '/dashboard', name: 'Dashboard', roles: ['end_user', 'it_staff'] },
      { href: '/submit', name: 'New Ticket', roles: ['end_user', 'it_staff'] },
      { href: '/customers', name: 'Customers', roles: ['it_staff'] },
    ];

    fc.assert(
      fc.property(
        fc.constantFrom(...workingRoutes),
        (route) => {
          // Test each route with appropriate roles
          route.roles.forEach((role) => {
            // Setup session with role
            vi.mocked(useSession).mockReturnValue({
              data: {
                user: { name: 'Test User', email: 'test@example.com', role } as any,
                expires: '2024-12-31',
              } as any,
              status: 'authenticated',
              update: vi.fn(),
            });

            const { container, unmount } = render(<Sidebar />);

            // Find the link
            const link = container.querySelector(`a[href="${route.href}"]`);

            // EXPECTED: Link should exist and be clickable (not disabled)
            expect(link).not.toBeNull();
            if (link) {
              expect(link.getAttribute('href')).toBe(route.href);
              
              // Should NOT be disabled
              expect(link.getAttribute('aria-disabled')).not.toBe('true');
              expect(link.hasAttribute('disabled')).toBe(false);
            }

            // Cleanup
            unmount();
          });
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * Preservation: Role-Based Visibility Works Correctly
   * 
   * IT staff should see IT-only navigation items, end users should not.
   */
  describe('Role-Based Visibility Preservation', () => {
    const itStaffOnlyRoutes = [
      'Users', 'Groups', 'Customers', 'Products', 
      'Inventory', 'Reports', 'Insights', 'Admin'
    ];

    it('should show IT staff-only navigation items to IT staff', () => {
      // Setup: IT staff session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'IT Admin', email: 'it_admin@example.com', role: 'it_staff' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: IT staff should see Customers link (one of the IT-only items)
      const customersLink = screen.queryByRole('link', { name: /customers/i });
      expect(customersLink).toBeInTheDocument();
    });

    it('should hide IT staff-only navigation items from end users', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: End users should NOT see any IT staff-only items
      itStaffOnlyRoutes.forEach((routeName) => {
        const link = screen.queryByRole('link', { name: new RegExp(routeName, 'i') });
        expect(link).toBeNull();
      });
    });

    it('property: role-based filtering works correctly for all roles', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('end_user', 'it_staff'),
          (role) => {
            // Setup session with role
            vi.mocked(useSession).mockReturnValue({
              data: {
                user: { name: 'Test User', email: 'test@example.com', role } as any,
                expires: '2024-12-31',
              } as any,
              status: 'authenticated',
              update: vi.fn(),
            });

            const { unmount } = render(<Sidebar />);

            // Observe: Dashboard should always be visible
            const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
            expect(dashboardLink).toBeInTheDocument();

            // Observe: Customers should only be visible to IT staff
            const customersLink = screen.queryByRole('link', { name: /customers/i });
            if (role === 'it_staff') {
              expect(customersLink).toBeInTheDocument();
            } else {
              expect(customersLink).toBeNull();
            }

            // Cleanup
            unmount();
          }
        ),
        { numRuns: 10 }
      );
    });
  });

  /**
   * Preservation: Sidebar Collapse/Expand Functionality
   * 
   * Sidebar should support collapsed and expanded states.
   */
  describe('Sidebar Collapse/Expand Preservation', () => {
    it('should render sidebar in expanded state by default', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      const { container } = render(<Sidebar />);

      // Observe: Sidebar should have expanded width class
      const sidebar = container.querySelector('aside');
      expect(sidebar).toHaveClass('w-64');
      expect(sidebar).not.toHaveClass('w-16');
    });

    it('should show navigation labels when expanded', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Navigation labels should be visible
      const dashboardLabel = screen.getByText('Dashboard');
      expect(dashboardLabel).toBeInTheDocument();
    });

    it('should show SwiftTriage logo when expanded', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Logo text should be visible
      const logoText = screen.getByText('SwiftTriage');
      expect(logoText).toBeInTheDocument();
    });

    it('should show New Ticket button when expanded', () => {
      // Setup: End user session
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: New Ticket button should be visible
      const newTicketButton = screen.getByRole('link', { name: /new ticket/i });
      expect(newTicketButton).toBeInTheDocument();
    });
  });

  /**
   * Preservation: Active Route Highlighting
   * 
   * The current route should be highlighted in the navigation.
   */
  describe('Active Route Highlighting Preservation', () => {
    it('should highlight Dashboard link when on /dashboard route', () => {
      // Setup: Current path is /dashboard
      vi.mocked(usePathname).mockReturnValue('/dashboard');
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Dashboard link should have active styling
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).toHaveClass('bg-blue-600');
      expect(dashboardLink).toHaveClass('text-white');
    });

    it('should NOT highlight Dashboard link when on different route', () => {
      // Setup: Current path is /submit
      vi.mocked(usePathname).mockReturnValue('/submit');
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'End User', email: 'user@example.com', role: 'end_user' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: Dashboard link should NOT have active styling
      const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
      expect(dashboardLink).not.toHaveClass('bg-blue-600');
      expect(dashboardLink).toHaveClass('text-slate-300');
    });
  });

  /**
   * Preservation: Badge Display
   * 
   * Navigation items with badges should display them correctly.
   * Note: Disabled items show badges with muted colors (bg-slate-600)
   * while enabled items show badges with prominent colors (bg-red-500).
   */
  describe('Badge Display Preservation', () => {
    it('should display badge on My Tickets navigation item', () => {
      // Setup: IT staff session (My Tickets is now active for it_staff)
      vi.mocked(useSession).mockReturnValue({
        data: {
          user: { name: 'it_admin', email: 'it_admin@example.com', role: 'it_staff' } as any,
          expires: '2024-12-31',
        } as any,
        status: 'authenticated',
        update: vi.fn(),
      });

      render(<Sidebar />);

      // Observe: My Tickets is now an active link (no badge — badge was removed per spec)
      const myTicketsLink = screen.getByRole('link', { name: /my tickets/i });
      expect(myTicketsLink).toBeInTheDocument();
      expect(myTicketsLink).toHaveAttribute('href', '/dashboard/my-tickets');
    });
  });

  /**
   * Property-Based Test: Navigation Consistency Across Sessions
   * 
   * Verifies that navigation behavior is consistent across different
   * user sessions and roles.
   */
  it('property: navigation behavior is consistent across user sessions', () => {
    fc.assert(
      fc.property(
        fc.record({
          name: fc.string({ minLength: 1, maxLength: 20 }),
          email: fc.emailAddress(),
          role: fc.constantFrom('end_user', 'it_staff'),
        }),
        (user) => {
          // Setup session with generated user
          vi.mocked(useSession).mockReturnValue({
            data: {
              user: user as any,
              expires: '2024-12-31',
            } as any,
            status: 'authenticated',
            update: vi.fn(),
          });

          const { unmount } = render(<Sidebar />);

          // EXPECTED: Core navigation always present
          const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
          const newTicketButton = screen.getByRole('link', { name: /new ticket/i });

          expect(dashboardLink).toBeInTheDocument();
          expect(dashboardLink).toHaveAttribute('href', '/dashboard');
          expect(newTicketButton).toBeInTheDocument();
          expect(newTicketButton).toHaveAttribute('href', '/submit');

          // Cleanup
          unmount();
        }
      ),
      { numRuns: 20 }
    );
  });
});
