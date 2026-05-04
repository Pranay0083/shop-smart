// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * E2E User Journey Tests for Authentication
 *
 * These tests run against the live Vite dev server (http://localhost:5173).
 * The backend mock is NOT required — we test the UI flow, form states,
 * and navigation regardless of the real API response (intercept via route).
 */

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Mock the backend API calls so no running server is needed for E2E
const mockSignupSuccess = async (page) => {
    await page.route('**/api/auth/signup', async (route) => {
        await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
                message: 'User created successfully.',
                token: 'fake.jwt.token',
                user: { id: 1, name: 'Alice', email: 'alice@test.com' },
            }),
        });
    });
};

const mockLoginSuccess = async (page) => {
    await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                message: 'Login successful.',
                token: 'fake.jwt.token',
                user: { id: 1, name: 'Alice', email: 'alice@test.com' },
            }),
        });
    });
};

const mockLoginFail = async (page) => {
    await page.route('**/api/auth/login', async (route) => {
        await route.fulfill({
            status: 401,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'Invalid credentials.' }),
        });
    });
};

// ─── Signup Page Tests ────────────────────────────────────────────────────────

test.describe('Signup Page', () => {
    test('renders the signup form with all required fields', async ({ page }) => {
        await page.goto('/signup');
        await expect(page.getByLabel(/full name/i)).toBeVisible();
        await expect(page.getByLabel(/email address/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
    });

    test('shows validation error for empty submit', async ({ page }) => {
        await page.goto('/signup');
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page.getByRole('alert')).toContainText(/name is required/i);
    });

    test('shows validation error for short password', async ({ page }) => {
        await page.goto('/signup');
        await page.getByLabel(/full name/i).fill('Alice');
        await page.getByLabel(/email address/i).fill('alice@test.com');
        await page.getByLabel(/password/i).fill('123');
        await page.getByRole('button', { name: /create account/i }).click();
        await expect(page.getByRole('alert')).toContainText(/6 characters/i);
    });

    test('button fires and redirects to home on successful signup', async ({ page }) => {
        await mockSignupSuccess(page);
        await page.goto('/signup');

        await page.getByLabel(/full name/i).fill('Alice');
        await page.getByLabel(/email address/i).fill('alice@test.com');
        await page.getByLabel(/password/i).fill('password123');
        await page.getByRole('button', { name: /create account/i }).click();

        await expect(page).toHaveURL('/');
    });

    test('has a working link to the login page', async ({ page }) => {
        await page.goto('/signup');
        await page.getByRole('link', { name: /sign in/i }).click();
        await expect(page).toHaveURL('/login');
    });
});

// ─── Login Page Tests ─────────────────────────────────────────────────────────

test.describe('Login Page', () => {
    test('renders the login form with all required fields', async ({ page }) => {
        await page.goto('/login');
        await expect(page.getByLabel(/email address/i)).toBeVisible();
        await expect(page.getByLabel(/password/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });

    test('shows error for empty form submit', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page.getByRole('alert')).toContainText(/fill in all fields/i);
    });

    test('button fires and redirects home on successful login', async ({ page }) => {
        await mockLoginSuccess(page);
        await page.goto('/login');

        await page.getByLabel(/email address/i).fill('alice@test.com');
        await page.getByLabel(/password/i).fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page).toHaveURL('/');
    });

    test('shows error message on failed login (401)', async ({ page }) => {
        await mockLoginFail(page);
        await page.goto('/login');

        await page.getByLabel(/email address/i).fill('wrong@test.com');
        await page.getByLabel(/password/i).fill('wrongpassword');
        await page.getByRole('button', { name: /sign in/i }).click();

        await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
    });

    test('has a working link to the signup page', async ({ page }) => {
        await page.goto('/login');
        await page.getByRole('link', { name: /sign up/i }).click();
        await expect(page).toHaveURL('/signup');
    });
});

// ─── Full User Journey ────────────────────────────────────────────────────────

test.describe('Full User Journey', () => {
    test('user can sign up, then log in and reach the home page', async ({ page }) => {
        // Step 1: Navigate to signup
        await mockSignupSuccess(page);
        await page.goto('/signup');

        await page.getByLabel(/full name/i).fill('Alice');
        await page.getByLabel(/email address/i).fill('alice@test.com');
        await page.getByLabel(/password/i).fill('password123');
        await page.getByRole('button', { name: /create account/i }).click();

        // Should land on home after signup
        await expect(page).toHaveURL('/');

        // Step 2: Go to login page and log in
        await mockLoginSuccess(page);
        await page.goto('/login');

        await page.getByLabel(/email address/i).fill('alice@test.com');
        await page.getByLabel(/password/i).fill('password123');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Should be on home page
        await expect(page).toHaveURL('/');
    });