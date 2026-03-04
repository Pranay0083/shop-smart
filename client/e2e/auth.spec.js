/**
 * End-to-End Tests - Authentication User Journey
 * Testing Library: Playwright
 *
 * These tests verify the complete user journey:
 * - User can navigate to signup page
 * - User can fill out signup form
 * - User can navigate to login page
 * - User can log in
 * - User can log out
 * - Form validation works
 * - Error messages are displayed
 *
 * Note: These tests require the backend to be running.
 * For CI environments, you may want to use a mock server.
 */

import { test, expect } from '@playwright/test';

// Mock data for testing
const testUser = {
  email: `testuser_${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User'
};

test.describe('E2E - Navigation Tests', () => {
  test('should navigate from home to login page', async ({ page }) => {
    await page.goto('/');

    // Wait for page to load
    await expect(page.locator('h1')).toContainText('ShopSmart');

    // Click on login link
    await page.click('[data-testid="login-link"]');

    // Verify we're on login page
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h2')).toContainText('Login to ShopSmart');
  });

  test('should navigate from home to signup page', async ({ page }) => {
    await page.goto('/');

    // Click on signup link
    await page.click('[data-testid="signup-link"]');

    // Verify we're on signup page
    await expect(page).toHaveURL('/signup');
    await expect(page.locator('h2')).toContainText('Create an Account');
  });

  test('should navigate from login to signup page', async ({ page }) => {
    await page.goto('/login');

    // Click on signup link
    await page.click('a[href="/signup"]');

    // Verify we're on signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should navigate from signup to login page', async ({ page }) => {
    await page.goto('/signup');

    // Click on login link
    await page.click('a[href="/login"]');

    // Verify we're on login page
    await expect(page).toHaveURL('/login');
  });
});

test.describe('E2E - Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should render login form correctly', async ({ page }) => {
    // Check form elements are present
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should allow typing in input fields', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]');
    const passwordInput = page.locator('[data-testid="password-input"]');

    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    await expect(emailInput).toHaveValue('test@example.com');
    await expect(passwordInput).toHaveValue('password123');
  });

  test('should show loading state when form is submitted', async ({ page }) => {
    // Mock the API to delay response
    await page.route('**/api/auth/login', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      });
    });

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    // Button should show loading state
    await expect(page.locator('[data-testid="login-button"]')).toContainText('Logging in...');
    await expect(page.locator('[data-testid="login-button"]')).toBeDisabled();
  });

  test('should display error message for invalid credentials', async ({ page }) => {
    // Mock failed login response
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Invalid email or password' })
      });
    });

    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    // Wait for error message
    await expect(page.locator('[role="alert"]')).toContainText('Invalid email or password');
  });

  test('should require email field', async ({ page }) => {
    const emailInput = page.locator('[data-testid="email-input"]');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should require password field', async ({ page }) => {
    const passwordInput = page.locator('[data-testid="password-input"]');
    await expect(passwordInput).toHaveAttribute('required', '');
  });
});

test.describe('E2E - Signup Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('should render signup form correctly', async ({ page }) => {
    await expect(page.locator('[data-testid="firstname-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="lastname-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="confirm-password-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-button"]')).toBeVisible();
  });

  test('should allow typing in all input fields', async ({ page }) => {
    await page.fill('[data-testid="firstname-input"]', 'John');
    await page.fill('[data-testid="lastname-input"]', 'Doe');
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');

    await expect(page.locator('[data-testid="firstname-input"]')).toHaveValue('John');
    await expect(page.locator('[data-testid="lastname-input"]')).toHaveValue('Doe');
    await expect(page.locator('[data-testid="email-input"]')).toHaveValue('john@example.com');
    await expect(page.locator('[data-testid="password-input"]')).toHaveValue('password123');
    await expect(page.locator('[data-testid="confirm-password-input"]')).toHaveValue('password123');
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'differentpassword');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[role="alert"]')).toContainText('Passwords do not match');
  });

  test('should show error when password is too short', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', '12345');
    await page.fill('[data-testid="confirm-password-input"]', '12345');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[role="alert"]')).toContainText(
      'Password must be at least 6 characters long'
    );
  });

  test('should show loading state when form is submitted', async ({ page }) => {
    // Mock the API to delay response
    await page.route('**/api/auth/signup', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          success: true,
          data: {
            user: { id: 1, email: 'test@example.com' },
            token: 'mock-token'
          }
        })
      });
    });

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[data-testid="signup-button"]')).toContainText(
      'Creating Account...'
    );
    await expect(page.locator('[data-testid="signup-button"]')).toBeDisabled();
  });

  test('should display error for existing email', async ({ page }) => {
    // Mock duplicate email response
    await page.route('**/api/auth/signup', async (route) => {
      await route.fulfill({
        status: 409,
        body: JSON.stringify({ success: false, message: 'User with this email already exists' })
      });
    });

    await page.fill('[data-testid="email-input"]', 'existing@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="signup-button"]');

    await expect(page.locator('[role="alert"]')).toContainText(
      'User with this email already exists'
    );
  });
});

test.describe('E2E - Complete User Journey', () => {
  test('should complete signup and redirect to home', async ({ page }) => {
    // Mock successful signup
    await page.route('**/api/auth/signup', async (route) => {
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          success: true,
          message: 'User created successfully',
          data: {
            user: {
              id: 1,
              email: testUser.email,
              firstName: testUser.firstName,
              lastName: testUser.lastName
            },
            token: 'mock-jwt-token-1'
          }
        })
      });
    });

    // Mock get current user
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 1,
              email: testUser.email,
              firstName: testUser.firstName,
              lastName: testUser.lastName
            }
          }
        })
      });
    });

    // Mock health check
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'ok',
          message: 'ShopSmart Backend is running',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto('/signup');

    // Fill signup form
    await page.fill('[data-testid="firstname-input"]', testUser.firstName);
    await page.fill('[data-testid="lastname-input"]', testUser.lastName);
    await page.fill('[data-testid="email-input"]', testUser.email);
    await page.fill('[data-testid="password-input"]', testUser.password);
    await page.fill('[data-testid="confirm-password-input"]', testUser.password);

    // Submit form
    await page.click('[data-testid="signup-button"]');

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show welcome message with user's name
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should complete login and redirect to home', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            user: {
              id: 1,
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            },
            token: 'mock-jwt-token-1'
          }
        })
      });
    });

    // Mock get current user
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 1,
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        })
      });
    });

    // Mock health check
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'ok',
          message: 'ShopSmart Backend is running',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto('/login');

    // Fill login form
    await page.fill('[data-testid="email-input"]', 'john@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');

    // Submit form
    await page.click('[data-testid="login-button"]');

    // Should redirect to home page
    await expect(page).toHaveURL('/');

    // Should show welcome message
    await expect(page.locator('text=Welcome')).toBeVisible();
  });

  test('should logout and show login/signup links', async ({ page }) => {
    // First, set up authenticated state
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            user: {
              id: 1,
              email: 'john@example.com',
              firstName: 'John',
              lastName: 'Doe'
            }
          }
        })
      });
    });

    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'ok',
          message: 'ShopSmart Backend is running',
          timestamp: new Date().toISOString()
        })
      });
    });

    // Set token in localStorage before navigating
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('token', 'mock-jwt-token-1');
    });
    await page.reload();

    // Wait for user to be loaded
    await expect(page.locator('text=Welcome')).toBeVisible();

    // Click logout button
    await page.click('[data-testid="logout-button"]');

    // Should show login/signup links again
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-link"]')).toBeVisible();

    // Logout button should not be visible
    await expect(page.locator('[data-testid="logout-button"]')).not.toBeVisible();
  });
});

test.describe('E2E - Home Page Tests', () => {
  test('should display backend health status', async ({ page }) => {
    // Mock health check
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'ok',
          message: 'ShopSmart Backend is running',
          timestamp: '2024-02-19T12:00:00.000Z'
        })
      });
    });

    await page.goto('/');

    // Should show ShopSmart title
    await expect(page.locator('h1')).toContainText('ShopSmart');

    // Should show backend status
    await expect(page.locator('text=Backend Status')).toBeVisible();
    await expect(page.locator('text=ok')).toBeVisible();
    await expect(page.locator('text=ShopSmart Backend is running')).toBeVisible();
  });

  test('should show loading state while fetching health status', async ({ page }) => {
    // Mock slow health check
    await page.route('**/api/health', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          status: 'ok',
          message: 'ShopSmart Backend is running',
          timestamp: new Date().toISOString()
        })
      });
    });

    await page.goto('/');

    // Should show loading text
    await expect(page.locator('text=Loading backend status...')).toBeVisible();
  });
});

test.describe('E2E - Button Click Tests', () => {
  test('login button fires click event', async ({ page }) => {
    let loginClicked = false;

    await page.route('**/api/auth/login', async (route) => {
      loginClicked = true;
      await route.fulfill({
        status: 401,
        body: JSON.stringify({ success: false, message: 'Invalid credentials' })
      });
    });

    await page.goto('/login');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    // Wait for the API call
    await page.waitForResponse('**/api/auth/login');

    expect(loginClicked).toBe(true);
  });

  test('signup button fires click event', async ({ page }) => {
    let signupClicked = false;

    await page.route('**/api/auth/signup', async (route) => {
      signupClicked = true;
      await route.fulfill({
        status: 201,
        body: JSON.stringify({
          success: true,
          data: { user: { id: 1 }, token: 'mock' }
        })
      });
    });

    await page.goto('/signup');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="signup-button"]');

    // Wait for the API call
    await page.waitForResponse('**/api/auth/signup');

    expect(signupClicked).toBe(true);
  });
});
