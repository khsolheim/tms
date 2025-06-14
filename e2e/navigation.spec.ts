import { test, expect } from '@playwright/test';

test.describe('Navigering', () => {
  test.beforeEach(async ({ page }) => {
    // Logg inn først
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
  });

  test('skal kunne navigere til hovedsider', async ({ page }) => {
    // Sjekk at vi er på oversikt-siden
    await expect(page).toHaveURL(/\/oversikt/);
    
    // Test navigering til bedrifter
    await page.click('a[href*="/bedrifter"], text=Bedrifter');
    await expect(page).toHaveURL(/\/bedrifter/);
    await expect(page.locator('h1')).toContainText(/bedrift/i);
    
    // Test navigering til ansatte/elever (hvis tilgjengelig)
    const elevLink = page.locator('a[href*="/elever"], text=Elever');
    if (await elevLink.isVisible()) {
      await elevLink.click();
      await expect(page).toHaveURL(/\/elever/);
    }
    
    // Test navigering til rapporter
    const rapportLink = page.locator('a[href*="/rapport"], text=Rapport');
    if (await rapportLink.isVisible()) {
      await rapportLink.click();
      await expect(page).toHaveURL(/\/rapport/);
    }
  });

  test('skal kunne logge ut', async ({ page }) => {
    // Finn og klikk på logg ut knapp/link
    const logoutButton = page.locator('button:has-text("Logg ut"), a:has-text("Logg ut")');
    await logoutButton.click();
    
    // Verifiser at vi er tilbake på innloggingssiden
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('h1')).toContainText('Logg inn');
  });

  test('skal vise feilside for ukjente ruter', async ({ page }) => {
    await page.goto('/ikke-eksisterende-side');
    
    // Sjekk at vi får en 404-side eller blir omdirigert
    const pageContent = await page.textContent('body');
    expect(pageContent).toMatch(/404|ikke funnet|not found/i);
  });
}); 