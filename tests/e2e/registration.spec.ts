import { test, expect } from '@playwright/test';

test.describe('Registration flow', () => {
  test('register page renders', async ({ page }) => {
    await page.goto('/en/auth/register');
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('input[name="email"]').or(page.locator('input[type="email"]'))).toBeVisible();
    await expect(page.locator('input[name="password"]').or(page.locator('input[type="password"]'))).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/en/auth/register');
    await page.locator('button[type="submit"]').click();
    // Should show validation messages
    await expect(page.locator('[role="alert"]').or(page.locator('.error')).first()).toBeVisible();
  });

  test('login page renders with GitHub OAuth option', async ({ page }) => {
    await page.goto('/en/auth/login');
    await expect(page.locator('form')).toBeVisible();
    // Should have GitHub login button
    const githubBtn = page.locator('a[href*="github"]').or(page.locator('button:has-text("GitHub")'));
    await expect(githubBtn).toBeVisible();
  });

  test('login shows error for invalid credentials', async ({ page }) => {
    await page.goto('/en/auth/login');
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('[role="alert"]').or(page.locator('.error')).first()).toBeVisible();
  });
});
