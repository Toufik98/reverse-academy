import { test, expect } from '@playwright/test';

test.describe('Guest demo flow', () => {
  test('landing page renders in English', async ({ page }) => {
    await page.goto('/en');
    await expect(page).toHaveTitle(/Reverse Academy/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('landing page renders in French', async ({ page }) => {
    await page.goto('/fr');
    await expect(page).toHaveTitle(/Reverse Academy/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('root redirects to locale based on Accept-Language', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'fr-FR,fr;q=0.9' });
    await page.goto('/');
    await expect(page).toHaveURL(/\/fr/);
  });

  test('root defaults to /en for unknown locale', async ({ page }) => {
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'de-DE' });
    await page.goto('/');
    await expect(page).toHaveURL(/\/en/);
  });

  test('explore page lists learning paths', async ({ page }) => {
    await page.goto('/en/explore');
    // Should see path cards
    await expect(page.locator('[data-testid="path-card"]').or(page.locator('article')).first()).toBeVisible();
  });

  test('navigation skip link is present', async ({ page }) => {
    await page.goto('/en');
    const skipLink = page.locator('a[href="#main-content"]').or(page.locator('.skip-link'));
    await expect(skipLink).toBeAttached();
  });
});
