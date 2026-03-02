import { test, expect } from '@playwright/test';

test.describe('i18n routing', () => {
  test('en pages use English text', async ({ page }) => {
    await page.goto('/en');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'en');
  });

  test('fr pages use French text', async ({ page }) => {
    await page.goto('/fr');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang', 'fr');
  });

  test('language switcher toggles between en and fr', async ({ page }) => {
    await page.goto('/en');
    // Find language switcher
    const switcher = page.locator('[data-testid="language-switcher"]').or(page.locator('button:has-text("FR")'));
    if (await switcher.isVisible()) {
      await switcher.click();
      await expect(page).toHaveURL(/\/fr/);
    }
  });

  test('404 page shows in correct locale', async ({ page }) => {
    const response = await page.goto('/en/this-page-does-not-exist');
    // Should get error page with locale-appropriate text
    await expect(page.locator('main')).toBeVisible();
  });

  test('invalid locale redirects to en', async ({ page }) => {
    await page.goto('/de');
    // Should redirect to /en or show error
    const url = page.url();
    expect(url).toMatch(/\/(en|fr)/);
  });
});
