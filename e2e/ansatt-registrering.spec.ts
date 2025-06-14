import { test, expect } from '@playwright/test';

test.describe('Ansatt Registrering', () => {
  test.beforeEach(async ({ page }) => {
    // Logg inn først
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Gå til bedriftsdetaljer (anta at vi har bedrift ID 1)
    await page.goto('/bedrifter/1');
  });

  test('skal kunne registrere ny ansatt', async ({ page }) => {
    // Klikk på "Legg til ansatt" knapp
    await page.click('button:has-text("Legg til ansatt"), a:has-text("Legg til ansatt")');
    
    // Sjekk at vi er på registreringssiden
    await expect(page).toHaveURL(/\/bedrifter\/\d+\/ansatte\/ny/);
    await expect(page.locator('h1')).toContainText('Registrer ny ansatt');
    
    // Fyll inn personlig informasjon
    await page.fill('input[name="fornavn"]', 'Test');
    await page.fill('input[name="etternavn"]', 'Testesen');
    await page.fill('input[name="email"]', 'test.testesen@example.com');
    await page.fill('input[name="telefon"]', '12345678');
    
    // Fyll inn adresse
    await page.fill('input[name="adresse"]', 'Testveien 1');
    await page.fill('input[name="postnummer"]', '0123');
    await page.fill('input[name="poststed"]', 'Oslo');
    
    // Velg rolle
    await page.check('input[value="TRAFIKKLÆRER"]');
    
    // Fyll inn passord
    await page.fill('input[name="password"]', 'test123');
    await page.fill('input[name="confirmPassword"]', 'test123');
    
    // Send inn skjema
    await page.click('button[type="submit"]');
    
    // Verifiser at ansatt ble opprettet
    await expect(page).toHaveURL(/\/bedrifter\/\d+/);
    await expect(page.locator('.success, .alert-success')).toBeVisible();
  });

  test('skal validere påkrevde felt', async ({ page }) => {
    // Klikk på "Legg til ansatt" knapp
    await page.click('button:has-text("Legg til ansatt"), a:has-text("Legg til ansatt")');
    
    // Prøv å sende inn tomt skjema
    await page.click('button[type="submit"]');
    
    // Sjekk at valideringsfeil vises
    const errorElements = page.locator('.error, .text-red-500');
    await expect(errorElements.first()).toBeVisible();
  });

  test('skal validere passord matching', async ({ page }) => {
    await page.click('button:has-text("Legg til ansatt"), a:has-text("Legg til ansatt")');
    
    // Fyll inn forskjellige passord
    await page.fill('input[name="password"]', 'test123');
    await page.fill('input[name="confirmPassword"]', 'test456');
    
    // Klikk på confirm password felt for å trigge validering
    await page.click('input[name="confirmPassword"]');
    await page.press('input[name="confirmPassword"]', 'Tab');
    
    // Sjekk at feilmelding vises
    await expect(page.locator('text=Passordene matcher ikke')).toBeVisible();
  });
}); 