import { test, expect } from '@playwright/test';

const mockProduct = {
  id: 'p-101',
  name: 'Wireless Headphones',
  category: 'Audio',
  price: 79.99,
  rating: 4.5,
  stock: 24,
  image: 'https://example.com/headphones.jpg',
  description: 'Comfortable over-ear wireless headphones.'
};

/** Shared route mocks used across multiple tests */
async function setupCommonMocks(page) {
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

  await page.route('**/api/products', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: { products: [mockProduct] }
      })
    });
  });

  await page.route('**/api/products/p-101', async (route) => {
    await route.fulfill({
      status: 200,
      body: JSON.stringify({
        success: true,
        data: { product: mockProduct }
      })
    });
  });
}

test.describe('E2E - Product Browsing', () => {
  test('should navigate from home product list to product details and back', async ({ page }) => {
    await setupCommonMocks(page);

    await page.goto('/');
    await expect(page.locator('text=Featured Products')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Wireless Headphones' })).toBeVisible();

    await page.click('[data-testid="product-link-p-101"]');
    await expect(page).toHaveURL('/products/p-101');
    await expect(page.locator('[data-testid="product-details-card"]')).toBeVisible();

    await page.click('[data-testid="back-home-link"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Featured Products')).toBeVisible();
  });

  test('should display all product fields on the product detail page', async ({ page }) => {
    await setupCommonMocks(page);

    await page.goto('/products/p-101');

    // Assert product metadata fields
    await expect(page.locator('[data-testid="product-details-card"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Wireless Headphones');
    await expect(page.locator('text=Audio')).toBeVisible();                  // category
    await expect(page.locator('text=$79.99')).toBeVisible();                 // price
    await expect(page.locator('text=4.5')).toBeVisible();                    // rating
    await expect(page.locator('text=24 left in stock')).toBeVisible();       // stock
    await expect(page.locator('text=Comfortable over-ear')).toBeVisible();   // description
  });

  test('should show Add to Cart and Save for Later buttons on the product detail page', async ({ page }) => {
    await setupCommonMocks(page);

    await page.goto('/products/p-101');

    await expect(page.locator('button:has-text("Add to Cart")')).toBeVisible();
    await expect(page.locator('button:has-text("Save for Later")')).toBeVisible();
  });

  test('should show error when navigating to a non-existent product', async ({ page }) => {
    await page.route('**/api/products/bad-id', async (route) => {
      await route.fulfill({
        status: 404,
        body: JSON.stringify({ success: false, message: 'Product not found' })
      });
    });

    await page.goto('/products/bad-id');

    await expect(page.locator('[role="alert"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-home-link"]')).toBeVisible();
  });

  test('should show Login and Signup links when user is unauthenticated', async ({ page }) => {
    await setupCommonMocks(page);

    // Navigate without any token in localStorage
    await page.goto('/');

    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
    await expect(page.locator('[data-testid="signup-link"]')).toBeVisible();

    // Logout button must NOT be present
    await expect(page.locator('[data-testid="logout-button"]')).not.toBeVisible();
  });

  test('should show products loading state before API resolves', async ({ page }) => {
    // Delay the products response so we can catch the loading state
    await page.route('**/api/health', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ status: 'ok', message: 'ShopSmart Backend is running', timestamp: new Date().toISOString() })
      });
    });

    await page.route('**/api/products', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true, data: { products: [mockProduct] } })
      });
    });

    await page.goto('/');

    // Before the products API resolves, the loading text should be visible
    await expect(page.locator('text=Loading products...')).toBeVisible();

    // Eventually products should load
    await expect(page.getByRole('heading', { name: 'Wireless Headphones' })).toBeVisible();
  });
});
