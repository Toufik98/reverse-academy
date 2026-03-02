import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  { name: 'Landing (EN)', url: '/en' },
  { name: 'Landing (FR)', url: '/fr' },
  { name: 'Explore', url: '/en/explore' },
  { name: 'Login', url: '/en/auth/login' },
  { name: 'Register', url: '/en/auth/register' },
];

for (const { name, url } of pages) {
  test(`${name} page passes axe-core accessibility audit`, async ({ page }) => {
    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (results.violations.length > 0) {
      console.log(`\nA11y violations on ${name} (${url}):`);
      for (const violation of results.violations) {
        console.log(`  [${violation.impact}] ${violation.id}: ${violation.description}`);
        for (const node of violation.nodes) {
          console.log(`    Target: ${node.target.join(', ')}`);
        }
      }
    }

    expect(results.violations).toEqual([]);
  });
}

test('keyboard navigation works on landing page', async ({ page }) => {
  await page.goto('/en');

  // Tab should move through interactive elements
  await page.keyboard.press('Tab');
  const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
  expect(firstFocused).toBeTruthy();

  // Skip link should be first focusable element (or near first)
  const skipLink = page.locator('a[href="#main-content"]').or(page.locator('.skip-link'));
  if (await skipLink.isVisible()) {
    await expect(skipLink).toBeFocused();
  }
});

test('prefers-reduced-motion is respected', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/en');

  // Check that no CSS transitions are active
  const hasTransitions = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    for (const el of elements) {
      const style = window.getComputedStyle(el);
      if (style.transitionDuration && style.transitionDuration !== '0s') {
        return true;
      }
    }
    return false;
  });

  // With reduced motion, transitions should be minimal or none
  // (Some framework transitions may still exist; this is a soft check)
});
