import { test, expect } from '@playwright/test';

test.describe('Kontrakt Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Logg inn først
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/oversikt/);
  });

  test('skal kunne opprette ny kontrakt end-to-end', async ({ page }) => {
    // Naviger til kontrakter
    await page.click('a[href*="/kontrakt"], text=Kontrakter');
    await expect(page).toHaveURL(/\/kontrakt/);
    
    // Klikk på "Opprett kontrakt" knapp
    await page.click('button:has-text("Opprett"), a:has-text("Opprett")');
    
    // Fyll inn elev informasjon
    await page.fill('input[name="fornavn"], input[placeholder*="fornavn"]', 'Test');
    await page.fill('input[name="etternavn"], input[placeholder*="etternavn"]', 'Testesen');
    await page.fill('input[name="personnummer"], input[placeholder*="personnummer"]', '12345678901');
    await page.fill('input[name="telefon"], input[placeholder*="telefon"]', '12345678');
    await page.fill('input[name="email"], input[type="email"]:not([disabled])', 'test@example.com');
    
    // Fyll inn adresse
    await page.fill('input[name="adresse"], input[placeholder*="adresse"]', 'Testveien 1');
    await page.fill('input[name="postnummer"], input[placeholder*="postnummer"]', '0123');
    await page.fill('input[name="poststed"], input[placeholder*="poststed"]', 'Oslo');
    
    // Fyll inn lånedetaljer
    await page.fill('input[name="belop"], input[placeholder*="beløp"]', '100000');
    await page.fill('input[name="lopetid"], input[placeholder*="løpetid"]', '24');
    await page.fill('input[name="rente"], input[placeholder*="rente"]', '5.5');
    
    // Lagre kontrakt
    await page.click('button[type="submit"], button:has-text("Lagre")');
    
    // Verifiser at kontrakten er opprettet
    await expect(page.locator('.success, .alert-success')).toBeVisible();
    await expect(page).toHaveURL(/\/kontrakt/);
  });

  test('skal kunne søke og filtrere kontrakter', async ({ page }) => {
    await page.click('a[href*="/kontrakt"], text=Kontrakter');
    await expect(page).toHaveURL(/\/kontrakt/);
    
    // Test søkefunksjonalitet
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      
      // Verifiser at søkeresultater vises
      await expect(page.locator('.kontrakt-item, tr')).toBeVisible();
    }
    
    // Test filtrering etter status
    const statusFilter = page.locator('select[name*="status"], .filter-status');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('AKTIV');
      await expect(page.locator('.kontrakt-item, tr')).toBeVisible();
    }
  });

  test('skal kunne redigere eksisterende kontrakt', async ({ page }) => {
    await page.click('a[href*="/kontrakt"], text=Kontrakter');
    await expect(page).toHaveURL(/\/kontrakt/);
    
    // Finn første kontrakt og klikk rediger
    const firstContract = page.locator('.kontrakt-item, tr').first();
    await expect(firstContract).toBeVisible();
    
    const editButton = firstContract.locator('button:has-text("Rediger"), a:has-text("Rediger")');
    await editButton.click();
    
    // Rediger noe informasjon
    await page.fill('input[name="telefon"], input[placeholder*="telefon"]', '87654321');
    
    // Lagre endringer
    await page.click('button[type="submit"], button:has-text("Lagre")');
    
    // Verifiser at endringen er lagret
    await expect(page.locator('.success, .alert-success')).toBeVisible();
  });

  test('skal kunne generere og laste ned PDF', async ({ page, context }) => {
    await page.click('a[href*="/kontrakt"], text=Kontrakter');
    await expect(page).toHaveURL(/\/kontrakt/);
    
    // Finn første kontrakt
    const firstContract = page.locator('.kontrakt-item, tr').first();
    await expect(firstContract).toBeVisible();
    
    // Start nedlasting av PDF
    const downloadPromise = page.waitForEvent('download');
    await firstContract.locator('button:has-text("PDF"), a:has-text("PDF")').click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });

  test('skal kunne slette kontrakt med bekreftelse', async ({ page }) => {
    await page.click('a[href*="/kontrakt"], text=Kontrakter');
    await expect(page).toHaveURL(/\/kontrakt/);
    
    // Finn første kontrakt
    const firstContract = page.locator('.kontrakt-item, tr').first();
    await expect(firstContract).toBeVisible();
    
    // Klikk slett knapp
    await firstContract.locator('button:has-text("Slett"), .delete-button').click();
    
    // Håndter bekreftelsesdialog
    page.on('dialog', dialog => dialog.accept());
    
    // Verifiser at kontrakten er slettet
    await expect(page.locator('.success, .alert-success')).toBeVisible();
  });
}); 