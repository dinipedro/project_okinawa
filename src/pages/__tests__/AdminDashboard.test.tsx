import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import AdminDashboard from '@/pages/AdminDashboard';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Wrapper with required providers
const renderWithProviders = (ui: React.ReactElement) =>
  render(<HelmetProvider>{ui}</HelmetProvider>);

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('Authentication Gate', () => {
    it('should show login form when no session exists', () => {
      renderWithProviders(<AdminDashboard />);
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should require both email and password', async () => {
      renderWithProviders(<AdminDashboard />);
      
      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);
      
      // HTML5 required validation prevents submission
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should show error on API failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ message: 'Invalid credentials' }),
      });

      renderWithProviders(<AdminDashboard />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'admin@okinawa.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('should reject users without admin/manager role', async () => {
      // Create a valid-looking JWT with only "waiter" role
      const payload = {
        sub: 'user-1',
        email: 'waiter@test.com',
        full_name: 'Waiter User',
        roles: ['waiter'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
        jti: 'test-jti',
      };
      const fakeJwt = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.fakesig`;

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: 'user-1',
              email: 'waiter@test.com',
              full_name: 'Waiter User',
              roles: [{ role: 'waiter' }],
            },
            access_token: fakeJwt,
            refresh_token: fakeJwt,
            expires_in: 900,
            refresh_expires_in: 604800,
          }),
      });

      renderWithProviders(<AdminDashboard />);

      fireEvent.change(screen.getByLabelText('Email'), {
        target: { value: 'waiter@test.com' },
      });
      fireEvent.change(screen.getByLabelText('Password'), {
        target: { value: 'Password123!' },
      });
      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });
    });

    it('should not restore expired token from sessionStorage', () => {
      // Create an expired JWT
      const payload = {
        sub: 'user-1',
        email: 'admin@test.com',
        full_name: 'Admin',
        roles: ['admin'],
        iat: Math.floor(Date.now() / 1000) - 3600,
        exp: Math.floor(Date.now() / 1000) - 1800, // Expired 30 min ago
        jti: 'old-jti',
      };
      const expiredJwt = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.fakesig`;
      sessionStorage.setItem('admin_access_token', expiredJwt);

      renderWithProviders(<AdminDashboard />);

      // Should show login, not dashboard
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(sessionStorage.getItem('admin_access_token')).toBeNull();
    });
  });

  describe('Token Management', () => {
    it('parseJwtPayload should handle malformed tokens gracefully', () => {
      // This tests the component's internal resilience
      sessionStorage.setItem('admin_access_token', 'not-a-jwt');
      renderWithProviders(<AdminDashboard />);
      
      // Should show login form (token parse failed)
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should clear tokens on logout API call', async () => {
      // Set up a valid session
      const payload = {
        sub: 'user-1',
        email: 'admin@okinawa.com',
        full_name: 'Admin User',
        roles: ['admin'],
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 900,
        jti: 'active-jti',
      };
      const validJwt = `eyJhbGciOiJIUzI1NiJ9.${btoa(JSON.stringify(payload))}.fakesig`;
      sessionStorage.setItem('admin_access_token', validJwt);
      sessionStorage.setItem('admin_refresh_token', 'refresh-token');

      // Mock the logout API
      mockFetch.mockResolvedValueOnce({ ok: true });

      renderWithProviders(<AdminDashboard />);

      // Wait for dashboard to render
      await waitFor(() => {
        expect(screen.getByText('Logout')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(sessionStorage.getItem('admin_access_token')).toBeNull();
        expect(sessionStorage.getItem('admin_refresh_token')).toBeNull();
      });
    });
  });
});
