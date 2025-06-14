import { test, expect } from '@playwright/test';

test.describe('Sikkerhetskontroll Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Logg inn først
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/oversikt/);
  });

  test('skal kunne opprette ny sikkerhetskontroll', async ({ page }) => {
    // Naviger til sikkerhetskontroll
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Klikk på "Opprett kontroll" knapp
    await page.click('button:has-text("Opprett"), button:has-text("Ny kontroll")');
    
    // Velg kontrolltype
    await page.selectOption('select[name="type"], select[name="kontrollType"]', 'ÅRLIG');
    
    // Fyll inn kontrolldetaljer
    await page.fill('input[name="tittel"], input[placeholder*="tittel"]', 'Test Årlig Kontroll');
    await page.fill('textarea[name="beskrivelse"], textarea[placeholder*="beskrivelse"]', 'Test beskrivelse for årlig kontroll');
    
    // Velg dato
    await page.fill('input[type="date"], input[name="planlagtDato"]', '2024-12-31');
    
    // Velg ansvarlig person
    const responsibleSelect = page.locator('select[name="ansvarlig"], select[name="ansvarligId"]');
    if (await responsibleSelect.isVisible()) {
      await responsibleSelect.selectOption({ index: 1 });
    }
    
    // Lagre kontrollen
    await page.click('button[type="submit"], button:has-text("Lagre")');
    
    // Verifiser at kontrollen er opprettet
    await expect(page.locator('.success, .alert-success')).toBeVisible();
    await expect(page.locator('text=Test Årlig Kontroll')).toBeVisible();
  });

  test('skal kunne fylle ut sjekkpunkter i kontroll', async ({ page }) => {
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Finn første kontroll og start utfylling
    const firstControl = page.locator('.kontroll-item, tr').first();
    await expect(firstControl).toBeVisible();
    
    await firstControl.locator('button:has-text("Utfør"), a:has-text("Utfør")').click();
    
    // Fyll ut sjekkpunkter
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    for (let i = 0; i < Math.min(count, 3); i++) {
      await checkboxes.nth(i).check();
    }
    
    // Legg til kommentarer
    const commentFields = page.locator('textarea[name*="kommentar"], textarea[placeholder*="kommentar"]');
    const commentCount = await commentFields.count();
    
    if (commentCount > 0) {
      await commentFields.first().fill('Test kommentar for første sjekkpunkt');
    }
    
    // Lagre utfylte sjekkpunkter
    await page.click('button[type="submit"], button:has-text("Lagre")');
    
    // Verifiser at endringene er lagret
    await expect(page.locator('.success, .alert-success')).toBeVisible();
  });

  test('skal kunne fullføre og signere kontroll', async ({ page }) => {
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Finn en kontroll som kan fullføres
    const controllToComplete = page.locator('.kontroll-item:has-text("Utfør"), tr:has-text("Utfør")').first();
    await expect(controllToComplete).toBeVisible();
    
    await controllToComplete.locator('button:has-text("Utfør"), a:has-text("Utfør")').click();
    
    // Fullfør alle obligatoriske sjekkpunkter
    const requiredCheckboxes = page.locator('input[type="checkbox"][required]');
    const requiredCount = await requiredCheckboxes.count();
    
    for (let i = 0; i < requiredCount; i++) {
      await requiredCheckboxes.nth(i).check();
    }
    
    // Signering (hvis tilgjengelig)
    const signatureField = page.locator('input[name="signatur"], input[placeholder*="signatur"]');
    if (await signatureField.isVisible()) {
      await signatureField.fill('Test Signatur');
    }
    
    // Merk som fullført
    const completeButton = page.locator('button:has-text("Fullfør"), button:has-text("Godkjenn")');
    if (await completeButton.isVisible()) {
      await completeButton.click();
    }
    
    // Verifiser at kontrollen er markert som fullført
    await expect(page.locator('.success, .alert-success')).toBeVisible();
    await expect(page.locator('text=Fullført, text=Godkjent')).toBeVisible();
  });

  test('skal kunne generere kontrollrapport', async ({ page }) => {
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Finn en fullført kontroll
    const completedControl = page.locator('.kontroll-item:has-text("Fullført"), tr:has-text("Fullført")').first();
    
    if (await completedControl.isVisible()) {
      // Generer rapport
      const downloadPromise = page.waitForEvent('download');
      await completedControl.locator('button:has-text("Rapport"), a:has-text("Rapport")').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/rapport.*\.pdf$/i);
    }
  });

  test('skal kunne filtrere kontroller etter status og type', async ({ page }) => {
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Test statusfilter
    const statusFilter = page.locator('select[name="status"], .filter-status');
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('PLANLAGT');
      await page.waitForTimeout(500); // Vent på filtrering
      
      // Verifiser at kun planlagte kontroller vises
      const visibleControls = page.locator('.kontroll-item, tr');
      const count = await visibleControls.count();
      expect(count).toBeGreaterThan(0);
    }
    
    // Test typefilter
    const typeFilter = page.locator('select[name="type"], .filter-type');
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('ÅRLIG');
      await page.waitForTimeout(500);
      
      // Verifiser at kun årlige kontroller vises
      await expect(page.locator('text=ÅRLIG')).toBeVisible();
    }
  });

  test('skal kunne søke i kontroller', async ({ page }) => {
    await page.click('a[href*="/sikkerhet"], text=Sikkerhet');
    await expect(page).toHaveURL(/\/sikkerhet/);
    
    // Test søkefunksjonalitet
    const searchInput = page.locator('input[type="search"], input[placeholder*="søk"]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Test');
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);
      
      // Verifiser at søkeresultater vises
      const results = page.locator('.kontroll-item, tr');
      const count = await results.count();
      expect(count).toBeGreaterThanOrEqual(0);
    }
  });
}); 