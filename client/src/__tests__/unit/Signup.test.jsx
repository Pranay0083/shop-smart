/**
 * Unit Tests for Signup Component
 * Testing Library: Vitest + React Testing Library
 *
 * These tests verify:
 * - Component renders correctly
 * - Form elements are present and interactive
 * - Button clicks work as expected
 * - Validation errors are displayed
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Signup from '../../pages/Signup';
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

describe('Signup Component - Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Rendering', () => {
    it('should render signup form', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByText('Create an Account')).toBeInTheDocument();
    });

    it('should render first name input field', () => {
      renderWithProviders(<Signup />);

      const firstNameInput = screen.getByTestId('firstname-input');
      expect(firstNameInput).toBeInTheDocument();
    });

    it('should render last name input field', () => {
      renderWithProviders(<Signup />);

      const lastNameInput = screen.getByTestId('lastname-input');
      expect(lastNameInput).toBeInTheDocument();
    });

    it('should render email input field', () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
    });

    it('should render password input field', () => {
      renderWithProviders(<Signup />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should render confirm password input field', () => {
      renderWithProviders(<Signup />);

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toBeInTheDocument();
      expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });

    it('should render signup button', () => {
      renderWithProviders(<Signup />);

      const signupButton = screen.getByTestId('signup-button');
      expect(signupButton).toBeInTheDocument();
      expect(signupButton).toHaveTextContent('Sign Up');
    });

    it('should render login link', () => {
      renderWithProviders(<Signup />);

      expect(screen.getByText('Already have an account?')).toBeInTheDocument();
      expect(screen.getByText('Login')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should allow typing in all input fields', () => {
      renderWithProviders(<Signup />);

      const firstNameInput = screen.getByTestId('firstname-input');
      const lastNameInput = screen.getByTestId('lastname-input');
      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });

      expect(firstNameInput.value).toBe('John');
      expect(lastNameInput.value).toBe('Doe');
      expect(emailInput.value).toBe('john@example.com');
      expect(passwordInput.value).toBe('password123');
      expect(confirmPasswordInput.value).toBe('password123');
    });

    it('should show error when passwords do not match', async () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const form = screen.getByTestId('signup-form');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'differentpassword' } });
      fireEvent.submit(form);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent('Passwords do not match');
    });

    it('should show error when password is too short', async () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const form = screen.getByTestId('signup-form');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '12345' } });
      fireEvent.change(confirmPasswordInput, { target: { value: '12345' } });
      fireEvent.submit(form);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent('Password must be at least 6 characters long');
    });

    it('should trigger form submission when button is clicked', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: true,
              data: {
                user: { id: 1, email: 'john@example.com' },
                token: 'mock-token'
              }
            })
        })
      );

      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const signupButton = screen.getByTestId('signup-button');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(signupButton);

      expect(signupButton).toHaveTextContent('Creating Account...');
    });

    it('should display error when signup fails', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          json: () =>
            Promise.resolve({
              success: false,
              message: 'User with this email already exists'
            })
        })
      );

      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const form = screen.getByTestId('signup-form');

      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.submit(form);

      const errorMessage = await screen.findByRole('alert');
      expect(errorMessage).toHaveTextContent('User with this email already exists');
    });

    it('should disable button during loading', async () => {
      global.fetch = vi.fn(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      const passwordInput = screen.getByTestId('password-input');
      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      const signupButton = screen.getByTestId('signup-button');

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(signupButton);

      expect(signupButton).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('should have required attribute on email field', () => {
      renderWithProviders(<Signup />);

      const emailInput = screen.getByTestId('email-input');
      expect(emailInput).toHaveAttribute('required');
    });

    it('should have required attribute on password field', () => {
      renderWithProviders(<Signup />);

      const passwordInput = screen.getByTestId('password-input');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('should have required attribute on confirm password field', () => {
      renderWithProviders(<Signup />);

      const confirmPasswordInput = screen.getByTestId('confirm-password-input');
      expect(confirmPasswordInput).toHaveAttribute('required');
    });

    it('should NOT have required attribute on name fields', () => {
      renderWithProviders(<Signup />);

      const firstNameInput = screen.getByTestId('firstname-input');
      const lastNameInput = screen.getByTestId('lastname-input');

      expect(firstNameInput).not.toHaveAttribute('required');
      expect(lastNameInput).not.toHaveAttribute('required');
    });
  });
});
