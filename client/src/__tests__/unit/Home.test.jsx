/**
 * Unit Tests for Home Component
 * Testing Library: Vitest + React Testing Library
 *
 * These tests verify:
 * - Component renders correctly
 * - Auth state is reflected in UI
 * - Logout button functionality
 */

import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Home from '../../pages/Home';
import { AuthProvider } from '../../context/AuthContext';

// Helper function to render with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Home Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock fetch for health check
    global.fetch = vi.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            status: 'ok',
            message: 'ShopSmart Backend is running',
            timestamp: new Date().toISOString()
          })
      })
    );
  });

  describe('Rendering', () => {
    it('should render ShopSmart title', async () => {
      renderWithProviders(<Home />);

      expect(screen.getByText('ShopSmart')).toBeInTheDocument();
    });

    it('should render backend status section', async () => {
      renderWithProviders(<Home />);

      expect(screen.getByText('Backend Status')).toBeInTheDocument();
    });

    it('should show loading state initially', () => {
      global.fetch = vi.fn(() => new Promise(() => {}));

      renderWithProviders(<Home />);

      expect(screen.getByText('Loading backend status...')).toBeInTheDocument();
    });

    it('should display backend status after fetch', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('ok')).toBeInTheDocument();
      });

      // Text is split across elements, use a matcher function
      expect(screen.getByText(/ShopSmart Backend is running/)).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should render login link when not authenticated', () => {
      renderWithProviders(<Home />);

      const loginLink = screen.getByTestId('login-link');
      expect(loginLink).toBeInTheDocument();
      expect(loginLink).toHaveTextContent('Login');
    });

    it('should render signup link when not authenticated', () => {
      renderWithProviders(<Home />);

      const signupLink = screen.getByTestId('signup-link');
      expect(signupLink).toBeInTheDocument();
      expect(signupLink).toHaveTextContent('Sign Up');
    });

    it('should not show logout button when not authenticated', () => {
      renderWithProviders(<Home />);

      expect(screen.queryByTestId('logout-button')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for login link', () => {
      renderWithProviders(<Home />);

      const loginLink = screen.getByTestId('login-link');
      expect(loginLink).toHaveAttribute('href', '/login');
    });

    it('should have correct href for signup link', () => {
      renderWithProviders(<Home />);

      const signupLink = screen.getByTestId('signup-link');
      expect(signupLink).toHaveAttribute('href', '/signup');
    });
  });

  describe('Error Handling', () => {
    it('should handle fetch error gracefully', async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error('Network error')));
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });
  });
});
