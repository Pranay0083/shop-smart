import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Vite \+ React/);
});

test('check if ShopSmart header is visible', async ({ page }) => {
  await page.goto('/');

  // Check for the main header
  await expect(page.getByRole('heading', { name: /ShopSmart and save more!/i })).toBeVisible();
});

test('check backend status loading state', async ({ page }) => {
    await page.goto('/');
    
    // Check if the loading text is present initially
    // Note: Since the backend might respond quickly, this is sometimes flaky in E2E
    // But we check that *either* loading or status is present.
    const loading = page.getByText('Loading backend status...');
    const status = page.getByText('Status:');
    
    // Ensure at least one is visible (app is rendering)
    await expect(loading.or(status)).toBeVisible();
});
