import { test, expect } from '@playwright/test';

test('Rask frontend test', async ({ page }) => {
  // Gå til hjemmesiden
  await page.goto('/');
  
  // Ta screenshot for debugging
  await page.screenshot({ path: 'test-results/homepage.png' });
  
  // Sjekk at siden laster
  await expect(page.locator('body')).toBeVisible();
  
  console.log('Sideinnhold:', await page.textContent('body'));
  console.log('URL:', page.url());
  
  // Test innlogging
  const emailField = page.locator('input[type="email"]');
  if (await emailField.isVisible()) {
    await emailField.fill('admin@test.com');
    
    const passwordField = page.locator('input[type="password"]');
    await passwordField.fill('admin123');
    
    await page.screenshot({ path: 'test-results/login-filled.png' });
    
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();
    
    // Vent på navigasjon
    await page.waitForTimeout(3000);
    
    await page.screenshot({ path: 'test-results/after-login.png' });
    
    console.log('URL etter innlogging:', page.url());
    console.log('Sideinnhold etter innlogging:', await page.textContent('body'));
  }
}); 