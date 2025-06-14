import { test, expect } from '@playwright/test';

test.describe('Innlogging', () => {
  test('skal kunne logge inn med gyldige credentials', async ({ page }) => {
    await page.goto('/');
    
    // Sjekk at vi er på innloggingssiden
    await expect(page).toHaveTitle(/TMS/);
    await expect(page.locator('h1')).toContainText('Logg inn');
    
    // Fyll inn innloggingsskjema
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    
    // Klikk logg inn knapp
    await page.click('button[type="submit"]');
    
    // Verifiser at vi er logget inn
    await expect(page).toHaveURL(/\/oversikt/);
    await expect(page.locator('nav')).toBeVisible();
  });

  test('skal vise feilmelding ved ugyldig pålogging', async ({ page }) => {
    await page.goto('/');
    
    // Fyll inn ugyldig innloggingsskjema
    await page.fill('input[type="email"]', 'ugyldig@test.com');
    await page.fill('input[type="password"]', 'feilpassord');
    
    // Klikk logg inn knapp
    await page.click('button[type="submit"]');
    
    // Verifiser at feilmelding vises
    await expect(page.locator('.error, .alert')).toBeVisible();
  });
}); 