import { test, expect } from '@playwright/test';

test('user can add product to cart', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Mock Product 1');
  await page.click('text=Add to Cart');
  await page.goto('/cart');
  const cartItem = await page.locator('text=Mock Product 1');
  await expect(cartItem).toBeVisible();
});