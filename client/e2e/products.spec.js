import { test, expect } from '@playwright/test';

test.describe('E2E - Product Browsing', () => {
  test('should navigate from home product list to product details and back', async ({ page }) => {
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
          data: {
            products: [
              {
                id: 'p-101',
                name: 'Wireless Headphones',
                category: 'Audio',
                price: 79.99,
                rating: 4.5,
                stock: 24,
                image: 'https://example.com/headphones.jpg',
                description: 'Comfortable over-ear wireless headphones.'
              }
            ]
          }
        })
      });
    });

    await page.route('**/api/products/p-101', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          success: true,
          data: {
            product: {
              id: 'p-101',
              name: 'Wireless Headphones',
              category: 'Audio',
              price: 79.99,
              rating: 4.5,
              stock: 24,
              image: 'https://example.com/headphones.jpg',
              description: 'Comfortable over-ear wireless headphones.'
            }
          }
        })
      });
    });

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
});
