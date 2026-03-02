/**
 * Unit Tests for Login Component
 * Testing Library: Vitest + React Testing Library
 *
 * These tests verify:
 * - Component renders correctly
 * - Form elements are present and interactive
 * - Button clicks work as expected
 * - Error states are displayed
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../pages/Login';
import { AuthProvider } from '../../context/AuthContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Helper function to render with providers
const renderWithProviders = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{component}</AuthProvider>
    </BrowserRouter>
  );
};

describe('Login Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  describe('Rendering', () => {
    it('should render login form', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText('Login to ShopSmart')).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input field', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render login button', () => {
      renderWithProviders(<Login />);

      const loginButton = screen.getByTestId('login-button');
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveTextContent('Login');
    });

    it('should render signup link', () => {
      renderWithProviders(<Login />);

      expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
      expect(screen.getByText('Sign up')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in email field', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('should allow typing in password field', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByTestId('password-input');
      fireEvent.change(passwordInput, { target: { value: 'mypassword123' } });

      expect(passwordInput.value).toBe('mypassword123');
    });

    it('should trigger form submission when button is clicked', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                user: { id: 1, email: 'test@example.com' },
                token: 'mock-token'
              }
            })
        })
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Button should show loading state
      expect(loginButton).toHaveTextContent('Logging in...');
    });

    it('should display error when login fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: false,
              message: 'Invalid email or password'
            })
        })
      );

      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const form = screen.getByTestId('login-form');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.submit(form);

      // Wait for error message
      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent('Invalid email or password');
    });

    it('should disable button during loading', async () => {
      global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const loginButton = screen.getByTestId('login-button');

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      expect(loginButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should have required attribute on email field', () => {
      renderWithProviders(<Login />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have required attribute on password field', () => {
      renderWithProviders(<Login />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});
