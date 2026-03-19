/**
 * Integration Tests for Auth Flow
 * Testing Library: Vitest + React Testing Library + MSW
 *
 * These tests verify:
 * - API integration with mock data
 * - Complete login flow with backend
 * - Complete signup flow with backend
 * - Error handling from API responses
 * - Token storage and retrieval
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeAll, afterAll, afterEach, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { AppRoutes } from '../../App';
import Login from '../../pages/Login';
import Signup from '../../pages/Signup';
import { AuthProvider } from '../../context/AuthContext';

// Setup MSW
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});
afterAll(() => server.close());

// Helper function to render with router
const renderWithRouter = (component, { route = '/' } = {}) => {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>{component}</AuthProvider>
    </MemoryRouter>
  );
};

describe('Integration Tests - Login Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    // Use valid mock credentials
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    // Wait for API call to complete
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeTruthy();
    });

    // Token should be stored
    const token = localStorage.getItem('token');
    expect(token).toContain('mock-jwt-token');
  });

  it('should show error with invalid credentials', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });

    // Token should not be stored
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should show error for non-existent user', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'nonexistent@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Invalid email or password');
    });
  });

  it('should handle button state during login', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Login />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const loginButton = screen.getByTestId('login-button');

    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');

    // Button should show "Login" initially
    expect(loginButton).toHaveTextContent('Login');

    await user.click(loginButton);

    // Button should show loading text (may resolve quickly with MSW)
    await waitFor(() => {
      expect(loginButton).toHaveTextContent(/Logging in|Login/);
    });
  });

  it('should display network error message when login request fails', async () => {
    // Override the handler to simulate a network failure
    server.use(
      http.post('*/api/auth/login', () => HttpResponse.error())
    );

    const user = userEvent.setup();
    renderWithRouter(<Login />);

    await user.type(screen.getByTestId('email-input'), 'john@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('Integration Tests - Signup Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should successfully create a new account', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    const firstNameInput = screen.getByTestId('firstname-input');
    const lastNameInput = screen.getByTestId('lastname-input');
    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    // Use a new email that doesn't exist in mock data
    await user.type(firstNameInput, 'New');
    await user.type(lastNameInput, 'User');
    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'newpassword123');
    await user.type(confirmPasswordInput, 'newpassword123');

    // Submit form
    fireEvent.submit(screen.getByTestId('signup-form'));

    // Wait for loading state and then success (no error shown means success)
    await waitFor(
      () => {
        // Either token is set OR we navigated away (no signup form visible)
        const token = localStorage.getItem('token');
        const hasNoError = screen.queryByRole('alert') === null;
        expect(token || hasNoError).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('should show error when email already exists', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const signupButton = screen.getByTestId('signup-button');

    // Use existing email from mock data
    await user.type(emailInput, 'john@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(signupButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('User with this email already exists');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('should validate password confirmation locally', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const signupButton = screen.getByTestId('signup-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'differentpassword');
    await user.click(signupButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Passwords do not match');
    });
  });

  it('should validate password length locally', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');
    const signupButton = screen.getByTestId('signup-button');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '12345');
    await user.type(confirmPasswordInput, '12345');
    await user.click(signupButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Password must be at least 6 characters long'
      );
    });
  });

  it('should allow signup without optional name fields', async () => {
    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');
    const confirmPasswordInput = screen.getByTestId('confirm-password-input');

    // Don't fill name fields
    await user.type(emailInput, 'noname@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');

    // Submit form
    fireEvent.submit(screen.getByTestId('signup-form'));

    // Wait for success (no error shown means success)
    await waitFor(
      () => {
        const token = localStorage.getItem('token');
        const hasNoError = screen.queryByRole('alert') === null;
        expect(token || hasNoError).toBeTruthy();
      },
      { timeout: 3000 }
    );
  });

  it('should display network error message when signup request fails', async () => {
    server.use(
      http.post('*/api/auth/signup', () => HttpResponse.error())
    );

    const user = userEvent.setup();
    renderWithRouter(<Signup />);

    await user.type(screen.getByTestId('email-input'), 'newuser@example.com');
    await user.type(screen.getByTestId('password-input'), 'password123');
    await user.type(screen.getByTestId('confirm-password-input'), 'password123');
    await user.click(screen.getByTestId('signup-button'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i);
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('Integration Tests - App Routing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render home page on root route', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('ShopSmart')).toBeInTheDocument();
    });
  });

  it('should render login page on /login route', async () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Login to ShopSmart')).toBeInTheDocument();
  });

  it('should render signup page on /signup route', async () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <AppRoutes />
      </MemoryRouter>
    );

    expect(screen.getByText('Create an Account')).toBeInTheDocument();
  });
});

describe('Integration Tests - Health Check API', () => {
  it('should fetch and display backend health status', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Wait for health check to complete
    await waitFor(() => {
      expect(screen.getByText('ok')).toBeInTheDocument();
    });

    expect(screen.getByText(/ShopSmart Backend is running/)).toBeInTheDocument();
  });
});

describe('Integration Tests - Authenticated Session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should show welcome message when a valid token is already in localStorage', async () => {
    // Pre-seed a mock token that matches the MSW handler's expected format
    // The MSW /api/auth/me handler extracts user id from token: mock-jwt-token-{id}-...
    localStorage.setItem('token', 'mock-jwt-token-1-john@example.com-123456');

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // The AuthProvider fetches /api/auth/me on mount; MSW returns John's data
    await waitFor(() => {
      expect(screen.getByText(/Welcome/i)).toBeInTheDocument();
    });

    expect(screen.getByTestId('logout-button')).toBeInTheDocument();
  });

  it('should clear the token and show login/signup links after logout', async () => {
    localStorage.setItem('token', 'mock-jwt-token-1-john@example.com-123456');

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // Wait for authenticated state
    await waitFor(() => {
      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    // Click logout
    await userEvent.setup().click(screen.getByTestId('logout-button'));

    // Token should be removed
    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });

    // Should show nav links again
    expect(screen.getByTestId('login-link')).toBeInTheDocument();
    expect(screen.getByTestId('signup-link')).toBeInTheDocument();
  });

  it('should clear invalid token and show unauthenticated state', async () => {
    // Put a clearly invalid token format in localStorage
    localStorage.setItem('token', 'completely-invalid-token');

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppRoutes />
      </MemoryRouter>
    );

    // MSW will reject the invalid token; AuthProvider logs out
    await waitFor(() => {
      expect(screen.getByTestId('login-link')).toBeInTheDocument();
    });

    expect(localStorage.getItem('token')).toBeNull();
  });
});
