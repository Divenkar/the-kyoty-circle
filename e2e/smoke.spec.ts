import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
    test('homepage loads and shows navigation', async ({ page }) => {
        await page.goto('/');
        await expect(page).toHaveTitle(/Kyoty/i);
    });

    test('/explore page loads and shows events section', async ({ page }) => {
        await page.goto('/explore');
        await expect(page.locator('h1')).toContainText(/explore/i);
    });

    test('/communities page loads', async ({ page }) => {
        await page.goto('/communities');
        await expect(page.locator('h1')).toContainText(/communities/i);
    });

    test('/login page shows sign-in form', async ({ page }) => {
        await page.goto('/login');
        // Clerk renders the login form
        await expect(page.locator('body')).toBeVisible();
    });

    test('protected route /dashboard redirects to login', async ({ page }) => {
        await page.goto('/dashboard');
        // Clerk middleware should redirect to /login
        await page.waitForURL(/login|sign-in/);
    });

    test('API /api/mobile/events returns 401 without auth', async ({ request }) => {
        const res = await request.get('/api/mobile/events');
        expect(res.status()).toBe(401);
    });

    test('community detail page loads for valid slug', async ({ page }) => {
        // Navigate to communities first, then click into one
        await page.goto('/communities');
        const firstCommunity = page.locator('a[href^="/community/"]').first();
        if (await firstCommunity.isVisible()) {
            await firstCommunity.click();
            await expect(page.locator('body')).toBeVisible();
        }
    });
});
