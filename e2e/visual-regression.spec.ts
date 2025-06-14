import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Logg inn først
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/oversikt/);
  });

  test('skal ha konsistent design på oversiktssiden', async ({ page }) => {
    await page.goto('/oversikt');
    
    // Vent på at siden er ferdig lastet
    await page.waitForLoadState('networkidle');
    
    // Skjul dynamiske elementer som kan endre seg
    await page.addStyleTag({
      content: `
        .dato, .timestamp, .relative-time { opacity: 0 !important; }
        .chart, .graph { opacity: 0 !important; }
      `
    });
    
    // Ta screenshot av hele siden
    await expect(page).toHaveScreenshot('oversikt-page.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha konsistent design på kontrakt oversikt', async ({ page }) => {
    await page.goto('/kontrakter');
    await page.waitForLoadState('networkidle');
    
    // Skjul dynamiske elementer
    await page.addStyleTag({
      content: `
        .dato, .timestamp { opacity: 0 !important; }
        .status-badge { opacity: 0 !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('kontrakter-oversikt.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha konsistent design på kontrakt opprettelse', async ({ page }) => {
    await page.goto('/kontrakter');
    await page.click('button:has-text("Opprett"), a:has-text("Opprett")');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('kontrakt-opprett.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha konsistent design på sikkerhetskontroll', async ({ page }) => {
    await page.goto('/sikkerhetskontroll');
    await page.waitForLoadState('networkidle');
    
    // Skjul dynamiske elementer
    await page.addStyleTag({
      content: `
        .dato, .timestamp { opacity: 0 !important; }
        .progress-bar { opacity: 0 !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('sikkerhetskontroll.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha konsistent design på innstillinger', async ({ page }) => {
    await page.goto('/innstillinger');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('innstillinger.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha responsivt design på mobil', async ({ page }) => {
    // Sett mobil viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/oversikt');
    await page.waitForLoadState('networkidle');
    
    // Skjul dynamiske elementer
    await page.addStyleTag({
      content: `
        .dato, .timestamp { opacity: 0 !important; }
      `
    });
    
    await expect(page).toHaveScreenshot('oversikt-mobile.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha responsivt design på tablet', async ({ page }) => {
    // Sett tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/kontrakter');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('kontrakter-tablet.png', {
      fullPage: true,
      threshold: 0.3,
      maxDiffPixels: 1000
    });
  });

  test('skal ha konsistent modal design', async ({ page }) => {
    await page.goto('/kontrakter');
    
    // Åpne en modal (hvis tilgjengelig)
    const modalTrigger = page.locator('button:has-text("Detaljer"), button:has-text("Rediger")').first();
    
    if (await modalTrigger.isVisible()) {
      await modalTrigger.click();
      await page.waitForSelector('.modal, .dialog', { state: 'visible' });
      
      await expect(page).toHaveScreenshot('modal-design.png', {
        threshold: 0.3,
        maxDiffPixels: 500
      });
    }
  });

  test('skal ha konsistent toast/notification design', async ({ page }) => {
    await page.goto('/kontrakter');
    
    // Trigger en toast notification
    const actionButton = page.locator('button:has-text("Lagre"), button:has-text("Opprett")').first();
    
    if (await actionButton.isVisible()) {
      await actionButton.click();
      
      // Vent på toast
      await page.waitForSelector('.toast, .notification, .alert', { 
        state: 'visible',
        timeout: 5000 
      });
      
      await expect(page).toHaveScreenshot('toast-notification.png', {
        threshold: 0.3,
        maxDiffPixels: 200
      });
    }
  });

  test('skal ha dark mode konsistens', async ({ page }) => {
    // Aktiver dark mode (hvis tilgjengelig)
    await page.goto('/innstillinger');
    
    const darkModeToggle = page.locator('input[type="checkbox"]:has-text("Dark"), .theme-toggle');
    
    if (await darkModeToggle.isVisible()) {
      await darkModeToggle.check();
      await page.waitForTimeout(500); // Vent på theme switch
      
      await page.goto('/oversikt');
      await page.waitForLoadState('networkidle');
      
      await expect(page).toHaveScreenshot('oversikt-dark-mode.png', {
        fullPage: true,
        threshold: 0.3,
        maxDiffPixels: 1000
      });
    }
  });
}); 