// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Smoke Tests - Basic page load tests
 * Verifies that critical pages load without errors
 */

test.describe('Public Pages', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page title
    await expect(page).toHaveTitle(/NeoRoutine/);
    
    // Check key elements exist
    await expect(page.locator('text=NeoRoutine').first()).toBeVisible();
    
    // Check navigation elements
    await expect(page.locator('a[href="/login"]').first()).toBeVisible();
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
  });

  test('login page loads successfully', async ({ page }) => {
    await page.goto('/login');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check link to register
    await expect(page.locator('a[href="/register"]').first()).toBeVisible();
  });

  test('register page loads successfully', async ({ page }) => {
    await page.goto('/register');
    
    // Check form elements
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('forgot password page loads successfully', async ({ page }) => {
    await page.goto('/forgot-password');
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('pricing page loads successfully', async ({ page }) => {
    await page.goto('/pricing');
    
    // Check pricing tiers exist
    await expect(page.locator('text=/Premium/i').first()).toBeVisible();
  });
});

test.describe('Authentication Flow', () => {
  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message (wait for API response)
    await expect(page.locator('text=/invalid|error|incorrect/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('login page has demo mode option', async ({ page }) => {
    await page.goto('/login');
    
    // Check for demo button or link
    const demoButton = page.locator('text=/demo|try/i').first();
    await expect(demoButton).toBeVisible();
  });
});

test.describe('Protected Routes Redirect', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('settings redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/settings');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test('coach page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/coach');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });
});
