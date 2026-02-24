// @ts-check
const { test, expect } = require('@playwright/test');

/**
 * Demo Mode Tests
 * Tests the demo/guest experience without real authentication
 */

test.describe('Demo Mode Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page first
    await page.goto('/login');
  });

  test('can enter demo mode from login page', async ({ page }) => {
    // Click demo button
    const demoButton = page.locator('text=/demo|try|guest/i').first();
    await demoButton.click();
    
    // Should navigate to dashboard
    await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
  });
});

test.describe('Dashboard Demo View', () => {
  // This test assumes demo mode is accessible via a specific route or cookie
  // Adjust based on actual demo implementation

  test('dashboard shows routines in demo mode', async ({ page, context: _context }) => {
    // Set demo auth cookie/token if needed
    // For now, try accessing via demo login flow
    await page.goto('/login');
    
    const demoButton = page.locator('text=/demo|try|guest/i').first();
    
    // Check if demo button exists
    const hasDemo = await demoButton.isVisible().catch(() => false);
    
    if (hasDemo) {
      await demoButton.click();
      await expect(page).toHaveURL(/dashboard/, { timeout: 15000 });
      
      // Check dashboard elements
      await expect(page.locator('text=/routine/i').first()).toBeVisible({ timeout: 10000 });
    } else {
      // Skip if no demo mode available
      test.skip();
    }
  });
});
