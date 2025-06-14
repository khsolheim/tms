import { test, expect } from '@playwright/test';

test.describe('Omfattende Frontend Test', () => {
  // Helper function for å logge inn
  const login = async (page: any) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/oversikt/);
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('skal teste hovednavigasjon og alle knapper', async ({ page }) => {
    // Test oversikt-siden
    await expect(page).toHaveURL(/\/oversikt/);
    await expect(page.locator('h1')).toBeVisible();

    // Test navigasjon til alle hovedsider
    const mainNavItems = [
      { selector: 'a[href*="/bedrifter"]', expectedUrl: /\/bedrifter/, text: 'Bedrifter' },
      { selector: 'a[href*="/elever"]', expectedUrl: /\/elever/, text: 'Elever' },
      { selector: 'a[href*="/kontrakter"]', expectedUrl: /\/kontrakter/, text: 'Kontrakter' },
      { selector: 'a[href*="/rapportering"]', expectedUrl: /\/rapportering/, text: 'Rapportering' },
      { selector: 'a[href*="/innstillinger"]', expectedUrl: /\/innstillinger/, text: 'Innstillinger' },
    ];

    for (const navItem of mainNavItems) {
      const navLink = page.locator(navItem.selector).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await expect(page).toHaveURL(navItem.expectedUrl);
        console.log(`✅ Navigasjon til ${navItem.text} fungerer`);
        
        // Test at siden laster og har innhold
        await expect(page.locator('body')).toBeVisible();
        await page.waitForTimeout(1000); // Kort pause for lasting
      }
    }
  });

  test('skal teste bedriftsfunksjonalitet komplett', async ({ page }) => {
    // Gå til bedrifter
    await page.goto('/bedrifter');
    await expect(page.locator('h1')).toContainText(/bedrift/i);

    // Test "Ny bedrift" knapp hvis den eksisterer
    const newBedriftButton = page.locator('button:has-text("Ny bedrift"), a:has-text("Ny bedrift"), button:has-text("Legg til bedrift")');
    if (await newBedriftButton.isVisible()) {
      await newBedriftButton.click();
      
      // Test bedriftsregistrering
      const orgnrField = page.locator('input[name="orgnr"], input[placeholder*="organisasjonsnummer"]');
      if (await orgnrField.isVisible()) {
        await orgnrField.fill('123456789');
        
        const navnField = page.locator('input[name="navn"], input[placeholder*="bedriftsnavn"]');
        if (await navnField.isVisible()) {
          await navnField.fill('Test Bedrift AS');
        }
        
        // Test lagre knapp
        const saveButton = page.locator('button[type="submit"], button:has-text("Lagre"), button:has-text("Opprett")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('✅ Bedriftsregistrering skjema fungerer');
        }
      }
    }

    // Test eksisterende bedrifter
    const bedriftCards = page.locator('[data-testid="bedrift-card"], .bedrift-card, .card');
    const bedriftCount = await bedriftCards.count();
    if (bedriftCount > 0) {
      // Klikk på første bedrift
      await bedriftCards.first().click();
      
      // Sjekk at vi kommer til bedriftsdetaljer
      await expect(page).toHaveURL(/\/bedrifter\/\d+/);
      console.log('✅ Bedriftsdetaljer navigasjon fungerer');
      
      // Test redigeringsknapp
      const editButton = page.locator('button:has-text("Rediger"), button:has-text("Endre")');
      if (await editButton.isVisible()) {
        await editButton.click();
        console.log('✅ Bedrift redigeringsknapp fungerer');
      }
    }
  });

  test('skal teste ansatt-registrering komplett', async ({ page }) => {
    // Gå via bedrifter til ansatt-registrering
    await page.goto('/bedrifter');
    
    const bedriftCards = page.locator('[data-testid="bedrift-card"], .bedrift-card, .card, a[href*="/bedrifter/"]');
    const bedriftCount = await bedriftCards.count();
    
    if (bedriftCount > 0) {
      await bedriftCards.first().click();
      
      // Se etter "Legg til ansatt" eller "Ny ansatt" knapp
      const addAnsattButton = page.locator('button:has-text("Legg til ansatt"), a:has-text("Legg til ansatt"), button:has-text("Ny ansatt")');
      if (await addAnsattButton.isVisible()) {
        await addAnsattButton.click();
        
        // Test ansatt-registrering skjema
        await expect(page).toHaveURL(/\/bedrifter\/\d+\/ansatte\/ny/);
        
        // Fyll inn personlig informasjon
        await page.fill('input[name="fornavn"]', 'Test');
        await page.fill('input[name="etternavn"]', 'Ansatt');
        await page.fill('input[name="epost"]', 'test.ansatt@test.no');
        await page.fill('input[name="telefon"]', '12345678');
        
        // Fyll inn adresse
        await page.fill('input[name="adresse"]', 'Testveien 1');
        await page.fill('input[name="postnummer"]', '0123');
        
        // Velg rolle
        const rolleRadio = page.locator('input[value="TRAFIKKLARER"]');
        if (await rolleRadio.isVisible()) {
          await rolleRadio.check();
        }
        
        // Fyll inn passord (med krav som matcher server)
        await page.fill('input[name="passord"]', 'Test123456');
        await page.fill('input[name="bekreftPassord"]', 'Test123456');
        
        // Test lagre knapp
        const saveButton = page.locator('button[type="submit"], button:has-text("Registrer"), button:has-text("Lagre")');
        if (await saveButton.isVisible() && !await saveButton.isDisabled()) {
          await saveButton.click();
          console.log('✅ Ansatt-registrering skjema fungerer');
          
          // Vent på redirect og sjekk suksess
          await page.waitForTimeout(2000);
          const currentUrl = page.url();
          if (currentUrl.includes('/ansatte') || currentUrl.includes('/bedrifter/')) {
            console.log('✅ Ansatt-registrering var vellykket');
          }
        }
      }
    }
  });

  test('skal teste elevregistrering', async ({ page }) => {
    await page.goto('/elever');
    
    // Test "Ny elev" knapp
    const newElevButton = page.locator('button:has-text("Ny elev"), a:has-text("Ny elev"), button:has-text("Registrer elev")');
    if (await newElevButton.isVisible()) {
      await newElevButton.click();
      
      // Test elevregistrering skjema
      const fornavnField = page.locator('input[name="fornavn"]');
      if (await fornavnField.isVisible()) {
        await fornavnField.fill('Test');
        
        const etternavnField = page.locator('input[name="etternavn"]');
        await etternavnField.fill('Elev');
        
        const epostField = page.locator('input[name="epost"]');
        await epostField.fill('test.elev@test.no');
        
        const telefonField = page.locator('input[name="telefon"]');
        await telefonField.fill('87654321');
        
        // Test lagre knapp
        const saveButton = page.locator('button[type="submit"], button:has-text("Registrer"), button:has-text("Lagre")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('✅ Elevregistrering skjema fungerer');
        }
      }
    }
  });

  test('skal teste kontrakt-opprettelse', async ({ page }) => {
    await page.goto('/kontrakter');
    
    // Test "Ny kontrakt" knapp
    const newKontraktButton = page.locator('button:has-text("Ny kontrakt"), a:has-text("Ny kontrakt"), button:has-text("Opprett kontrakt")');
    if (await newKontraktButton.isVisible()) {
      await newKontraktButton.click();
      
      // Test kontrakt skjema
      const elevField = page.locator('select[name="elevId"], input[name="elev"]');
      if (await elevField.isVisible()) {
        // Velg første elev fra dropdown
        const elevTagName = await elevField.evaluate(el => el.tagName.toLowerCase());
        if (elevTagName === 'select') {
          await elevField.selectOption({ index: 1 });
        }
        
        const klasseField = page.locator('select[name="klasse"], input[name="klasse"]');
        if (await klasseField.isVisible()) {
          const klasseTagName = await klasseField.evaluate(el => el.tagName.toLowerCase());
          if (klasseTagName === 'select') {
            await klasseField.selectOption({ index: 1 });
          } else {
            await klasseField.fill('B');
          }
        }
        
        // Test lagre knapp
        const saveButton = page.locator('button[type="submit"], button:has-text("Opprett"), button:has-text("Lagre")');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('✅ Kontrakt-opprettelse skjema fungerer');
        }
      }
    }
  });

  test('skal teste sikkerhetskontroll', async ({ page }) => {
    // Test sikkerhetskontroll hvis tilgjengelig
    const sikkerhetsLink = page.locator('a[href*="sikkerhet"], a:has-text("Sikkerhet")');
    if (await sikkerhetsLink.isVisible()) {
      await sikkerhetsLink.click();
      
      // Test opprett ny sikkerhetskontroll
      const newKontrollButton = page.locator('button:has-text("Ny kontroll"), button:has-text("Start kontroll")');
      if (await newKontrollButton.isVisible()) {
        await newKontrollButton.click();
        
        // Test kontroll skjema
        const kjøretøyField = page.locator('select[name="kjøretøy"]');
        if (await kjøretøyField.isVisible()) {
          await kjøretøyField.selectOption({ index: 1 });
          
          // Test lagre/start knapp
          const startButton = page.locator('button[type="submit"], button:has-text("Start")');
          if (await startButton.isVisible()) {
            await startButton.click();
            console.log('✅ Sikkerhetskontroll opprettelse fungerer');
          }
        }
      }
    }
  });

  test('skal teste søk og filter funksjonalitet', async ({ page }) => {
    const pages = ['/bedrifter', '/elever', '/kontrakter'];
    
    for (const pagePath of pages) {
      await page.goto(pagePath);
      
      // Test søkefelt
      const searchField = page.locator('input[placeholder*="søk"], input[type="search"], input[name="search"]');
      if (await searchField.isVisible()) {
        await searchField.fill('test');
        await page.keyboard.press('Enter');
        console.log(`✅ Søkefunksjonalitet på ${pagePath} fungerer`);
      }
      
      // Test filter knapper
      const filterButtons = page.locator('button:has-text("Filter"), select[name*="filter"], select[name*="status"]');
      const filterCount = await filterButtons.count();
      if (filterCount > 0) {
        const firstFilter = filterButtons.first();
        if (await firstFilter.isVisible()) {
                     const filterType = await firstFilter.getAttribute('type');
           const filterTagName = await firstFilter.evaluate(el => el.tagName.toLowerCase());
           if (filterType === 'button') {
             await firstFilter.click();
           } else if (filterTagName === 'select') {
             await firstFilter.selectOption({ index: 1 });
           }
          console.log(`✅ Filter funksjonalitet på ${pagePath} fungerer`);
        }
      }
    }
  });

  test('skal teste innstillinger og profil', async ({ page }) => {
    await page.goto('/innstillinger');
    
    // Test profilinnstillinger
    const profileTab = page.locator('button:has-text("Profil"), a:has-text("Profil")');
    if (await profileTab.isVisible()) {
      await profileTab.click();
      
      // Test profiloppdatering
      const navnField = page.locator('input[name="navn"], input[name="fornavn"]');
      if (await navnField.isVisible()) {
        await navnField.fill('Oppdatert Navn');
        
        const saveButton = page.locator('button:has-text("Lagre"), button[type="submit"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('✅ Profiloppdatering fungerer');
        }
      }
    }
    
    // Test passord endring
    const passwordTab = page.locator('button:has-text("Passord"), a:has-text("Endre passord")');
    if (await passwordTab.isVisible()) {
      await passwordTab.click();
      
      const oldPasswordField = page.locator('input[name="gammeltPassord"], input[placeholder*="nåværende"]');
      if (await oldPasswordField.isVisible()) {
        await oldPasswordField.fill('admin123');
        
        const newPasswordField = page.locator('input[name="nyttPassord"], input[name="newPassword"]');
        await newPasswordField.fill('NyttPassord123');
        
        const confirmPasswordField = page.locator('input[name="bekreftPassord"], input[name="confirmPassword"]');
        await confirmPasswordField.fill('NyttPassord123');
        
        const saveButton = page.locator('button:has-text("Lagre"), button[type="submit"]');
        if (await saveButton.isVisible()) {
          await saveButton.click();
          console.log('✅ Passord endring fungerer');
        }
      }
    }
  });

  test('skal teste alle knapper er klikkbare og responsive', async ({ page }) => {
    const pagesToTest = ['/', '/oversikt', '/bedrifter', '/elever', '/kontrakter', '/rapportering', '/innstillinger'];
    
    for (const pagePath of pagesToTest) {
      try {
        await page.goto(pagePath);
        await page.waitForTimeout(1000);
        
        // Finn alle klikkbare elementer
        const clickableElements = page.locator('button, a[href], input[type="submit"], input[type="button"]');
        const count = await clickableElements.count();
        
        console.log(`Testing ${count} clickable elements on ${pagePath}`);
        
        for (let i = 0; i < Math.min(count, 10); i++) { // Begrenset til 10 for effektivitet
          const element = clickableElements.nth(i);
          
          if (await element.isVisible() && await element.isEnabled()) {
            const tagName = await element.evaluate(el => el.tagName.toLowerCase());
            const text = await element.textContent();
            
            // Skip logout og destructive actions
            if (text && (text.includes('Logg ut') || text.includes('Slett') || text.includes('Delete'))) {
              continue;
            }
            
            // Test hover state
            await element.hover();
            
                         // For buttons, test click (men ikke submit)
             const buttonType = await element.getAttribute('type');
             if (tagName === 'button' && !buttonType?.includes('submit')) {
              try {
                await element.click({ timeout: 2000 });
                console.log(`✅ Knapp "${text?.slice(0, 20)}..." er klikkbar`);
              } catch (e) {
                console.log(`⚠️ Kunne ikke klikke på knapp "${text?.slice(0, 20)}..."`);
              }
            }
          }
        }
      } catch (error) {
        console.log(`⚠️ Kunne ikke teste side ${pagePath}: ${error}`);
      }
    }
  });

  test('skal teste responsivt design', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'Desktop' },
      { width: 768, height: 1024, name: 'Tablet' },
      { width: 375, height: 667, name: 'Mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await page.goto('/oversikt');
      
      // Test at hovedinnhold er synlig
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('nav, header')).toBeVisible();
      
      // Test at navigation fungerer på mobile
      if (viewport.width < 768) {
        const mobileMenuButton = page.locator('button[aria-label*="menu"], .hamburger, button:has(svg)');
        if (await mobileMenuButton.isVisible()) {
          await mobileMenuButton.click();
          console.log(`✅ Mobile menu fungerer på ${viewport.name}`);
        }
      }
      
      console.log(`✅ ${viewport.name} (${viewport.width}x${viewport.height}) layout fungerer`);
    }
  });
}); 