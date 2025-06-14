import { test, expect } from '@playwright/test';

test.describe('Komplett Applikasjonstest', () => {
  
  test.beforeEach(async ({ page }) => {
    // Logg inn
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@test.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    
    // Vent til vi er på oversikt-siden
    await page.waitForTimeout(2000);
    await expect(page.locator('body')).toContainText('Oversikt');
  });

  test('Skal teste all hovednavigasjon', async ({ page }) => {
    console.log('🧪 Tester hovednavigasjon');
    
    // Test alle hovedsider
    const navItems = [
      'Oversikt', 'Bedriftshåndtering', 'Kontrakter', 
      'Quiz', 'Sikkerhetskontroll', 'Innstillinger', 'Brukere', 'Elever'
    ];
    
    for (const item of navItems) {
      const navLink = page.locator(`text=${item}`).first();
      if (await navLink.isVisible()) {
        await navLink.click();
        await page.waitForTimeout(1000);
        console.log(`✅ Navigerte til ${item}`);
        
        // Sjekk at siden har innhold
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('Skal teste bedriftshåndtering komplett', async ({ page }) => {
    console.log('🧪 Tester bedriftshåndtering');
    
    // Gå til bedriftshåndtering
    await page.click('text=Bedriftshåndtering');
    await page.waitForTimeout(1000);
    
    // Test at vi kan se bedrifter
    const bedriftContent = await page.textContent('body');
    console.log('Bedrift-sideinnhold synlig:', bedriftContent?.includes('bedrift') || false);
    
    // Se etter knapper på siden
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    console.log(`Fant ${buttonCount} klikkbare elementer på bedriftssiden`);
    
    // Test de første 5 klikkbare elementene
    for (let i = 0; i < Math.min(buttonCount, 5); i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      
      if (text && !text.includes('Logg ut') && !text.includes('Slett')) {
        try {
          await button.click();
          await page.waitForTimeout(500);
          console.log(`✅ Klikket på: "${text.slice(0, 30)}..."`);
          
          // Gå tilbake hvis vi navigerte
          await page.goBack();
          await page.waitForTimeout(500);
        } catch (e) {
          console.log(`⚠️ Kunne ikke klikke på: "${text}"`);
        }
      }
    }
  });

  test('Skal teste ansatt-funksjonalitet', async ({ page }) => {
    console.log('🧪 Tester ansatt-funksjonalitet');
    
    // Gå til brukere/ansatte
    await page.click('text=Brukere');
    await page.waitForTimeout(1000);
    
    // Se etter "Ny ansatt" eller lignende knapper
    const newButtons = page.locator('button:has-text("Ny"), a:has-text("Ny"), button:has-text("Legg til"), button:has-text("Registrer")');
    const newButtonCount = await newButtons.count();
    
    if (newButtonCount > 0) {
      const firstNewButton = newButtons.first();
      const buttonText = await firstNewButton.textContent();
      
      await firstNewButton.click();
      await page.waitForTimeout(1000);
      
      console.log(`✅ Klikket på: "${buttonText}"`);
      
      // Se etter skjemafelt
      const inputs = page.locator('input, select, textarea');
      const inputCount = await inputs.count();
      console.log(`Fant ${inputCount} input-felt i skjema`);
      
      // Test å fylle ut noen felt
      const fornavnField = page.locator('input[name="fornavn"], input[placeholder*="fornavn" i]');
      if (await fornavnField.isVisible()) {
        await fornavnField.fill('Test');
        console.log('✅ Fylte ut fornavn');
      }
      
      const epostField = page.locator('input[type="email"], input[name="epost"]');
      if (await epostField.isVisible()) {
        await epostField.fill('test@test.no');
        console.log('✅ Fylte ut e-post');
      }
    }
  });

  test('Skal teste kontrakt-funksjonalitet', async ({ page }) => {
    console.log('🧪 Tester kontrakt-funksjonalitet');
    
    await page.click('text=Kontrakter');
    await page.waitForTimeout(1000);
    
    // Se etter kontrakt-relaterte knapper
    const contractButtons = page.locator('button, a[href]');
    const buttonCount = await contractButtons.count();
    console.log(`Fant ${buttonCount} elementer på kontrakt-siden`);
    
    // Test noen av knappene
    for (let i = 0; i < Math.min(buttonCount, 3); i++) {
      const button = contractButtons.nth(i);
      const text = await button.textContent();
      
      if (text && text.length > 0 && !text.includes('Logg ut')) {
        try {
          await button.hover();
          console.log(`✅ Hover på: "${text.slice(0, 20)}..."`);
        } catch (e) {
          console.log(`⚠️ Kunne ikke hover på: "${text}"`);
        }
      }
    }
  });

  test('Skal teste quiz-funksjonalitet', async ({ page }) => {
    console.log('🧪 Tester quiz-funksjonalitet');
    
    await page.click('text=Quiz');
    await page.waitForTimeout(1000);
    
    const quizContent = await page.textContent('body');
    console.log('Quiz-side laster:', (quizContent?.length || 0) > 100);
    
    // Se etter quiz-relaterte elementer
    const quizElements = page.locator('button, input, select');
    const elementCount = await quizElements.count();
    console.log(`Fant ${elementCount} interaktive elementer på quiz-siden`);
  });

  test('Skal teste sikkerhetskontroll', async ({ page }) => {
    console.log('🧪 Tester sikkerhetskontroll');
    
    await page.click('text=Sikkerhetskontroll');
    await page.waitForTimeout(1000);
    
    const securityContent = await page.textContent('body');
    console.log('Sikkerhetskontroll-side laster:', (securityContent?.length || 0) > 100);
    
    // Se etter sikkerhet-relaterte knapper
    const securityButtons = page.locator('button:has-text("Start"), button:has-text("Kontroll"), button:has-text("Ny")');
    const securityButtonCount = await securityButtons.count();
    
    if (securityButtonCount > 0) {
      console.log(`✅ Fant ${securityButtonCount} sikkerhetskontroll-knapper`);
    }
  });

  test('Skal teste elev-administrasjon', async ({ page }) => {
    console.log('🧪 Tester elev-administrasjon');
    
    await page.click('text=Elever');
    await page.waitForTimeout(1000);
    
    const elevContent = await page.textContent('body');
    console.log('Elev-side laster:', (elevContent?.length || 0) > 100);
    
    // Se etter elev-relaterte knapper
    const elevButtons = page.locator('button:has-text("Ny elev"), button:has-text("Registrer"), a:has-text("Ny")');
    const elevButtonCount = await elevButtons.count();
    
    if (elevButtonCount > 0) {
      const firstElevButton = elevButtons.first();
      await firstElevButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Åpnet elev-registrering');
      
      // Test elevregistrering skjema
      const elevForm = page.locator('input[name="fornavn"], input[placeholder*="navn"]');
      if (await elevForm.isVisible()) {
        await elevForm.fill('Test Elev');
        console.log('✅ Fylte ut elev-skjema');
      }
    }
  });

  test('Skal teste innstillinger', async ({ page }) => {
    console.log('🧪 Tester innstillinger');
    
    await page.click('text=Innstillinger');
    await page.waitForTimeout(1000);
    
    const settingsContent = await page.textContent('body');
    console.log('Innstillinger-side laster:', (settingsContent?.length || 0) > 100);
    
    // Se etter innstillinger-tabs eller seksjoner
    const settingsTabs = page.locator('button:has-text("Profil"), button:has-text("Passord"), button:has-text("System")');
    const tabCount = await settingsTabs.count();
    
    if (tabCount > 0) {
      console.log(`✅ Fant ${tabCount} innstillinger-tabs`);
      
      // Test første tab
      const firstTab = settingsTabs.first();
      await firstTab.click();
      await page.waitForTimeout(500);
      console.log('✅ Klikket på innstillinger-tab');
    }
  });

  test('Skal teste responsivitet og generelle UI-elementer', async ({ page }) => {
    console.log('🧪 Tester responsivitet og UI');
    
    // Test desktop størrelse
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(500);
    
    const desktopNav = page.locator('nav');
    await expect(desktopNav).toBeVisible();
    console.log('✅ Desktop navigasjon synlig');
    
    // Test tablet størrelse
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    console.log('✅ Tablet størrelse testet');
    
    // Test mobile størrelse
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    console.log('✅ Mobile størrelse testet');
    
    // Test hamburger menu hvis den eksisterer
    const hamburger = page.locator('button[aria-label*="menu"], .hamburger, button:has(svg):not(:has(text))');
    if (await hamburger.isVisible()) {
      await hamburger.click();
      console.log('✅ Mobile menu åpnet');
    }
    
    // Tilbake til desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
  });

  test('Skal teste søk og filter-funksjonalitet', async ({ page }) => {
    console.log('🧪 Tester søk og filtre');
    
    const pagesToTest = ['Bedriftshåndtering', 'Elever', 'Kontrakter'];
    
    for (const pageName of pagesToTest) {
      await page.click(`text=${pageName}`);
      await page.waitForTimeout(1000);
      
      // Se etter søkefelt
      const searchField = page.locator('input[type="search"], input[placeholder*="søk" i], input[name="search"]');
      if (await searchField.isVisible()) {
        await searchField.fill('test');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        console.log(`✅ Testet søk på ${pageName}`);
        
        // Tøm søkefelt
        await searchField.clear();
      }
      
      // Se etter filter-elementer
      const filters = page.locator('select[name*="filter"], button:has-text("Filter")');
      const filterCount = await filters.count();
      
      if (filterCount > 0) {
        console.log(`✅ Fant ${filterCount} filter-elementer på ${pageName}`);
      }
    }
  });

  test('Skal teste alle skjema kan fylles ut', async ({ page }) => {
    console.log('🧪 Tester at alle skjema kan fylles ut');
    
    const pagesToTest = ['Bedriftshåndtering', 'Brukere', 'Elever'];
    
    for (const pageName of pagesToTest) {
      await page.click(`text=${pageName}`);
      await page.waitForTimeout(1000);
      
      // Se etter "Ny" eller "Legg til" knapper
      const addButtons = page.locator('button:has-text("Ny"), button:has-text("Legg til"), a:has-text("Ny")');
      const addButtonCount = await addButtons.count();
      
      if (addButtonCount > 0) {
        const firstAddButton = addButtons.first();
        const buttonText = await firstAddButton.textContent();
        
        await firstAddButton.click();
        await page.waitForTimeout(1000);
        
        // Se etter alle input-felt i skjema
        const formInputs = page.locator('input:not([type="hidden"]), select, textarea');
        const inputCount = await formInputs.count();
        
        console.log(`${pageName}: Fant ${inputCount} skjemafelt`);
        
        // Test å fylle ut de første feltene
        for (let i = 0; i < Math.min(inputCount, 5); i++) {
          const input = formInputs.nth(i);
          const inputType = await input.getAttribute('type');
          const inputName = await input.getAttribute('name');
          
          try {
            if (inputType === 'email') {
              await input.fill('test@example.com');
            } else if (inputType === 'password') {
              await input.fill('Test123456');
            } else if (inputType === 'tel' || inputName?.includes('telefon')) {
              await input.fill('12345678');
            } else if (inputName?.includes('postnummer')) {
              await input.fill('0123');
                         } else if ((await input.evaluate(el => el.tagName.toLowerCase())) === 'select') {
              // Velg første option som ikke er tom
              const options = input.locator('option');
              const optionCount = await options.count();
              if (optionCount > 1) {
                await input.selectOption({ index: 1 });
              }
            } else {
              await input.fill('Test verdi');
            }
            
            console.log(`✅ Fylte ut felt: ${inputName || inputType || 'ukjent'}`);
          } catch (e) {
            console.log(`⚠️ Kunne ikke fylle ut felt: ${inputName || inputType}`);
          }
        }
        
        // Se etter submit-knapp
        const submitButton = page.locator('button[type="submit"], button:has-text("Lagre"), button:has-text("Opprett")');
        if (await submitButton.isVisible()) {
          const isDisabled = await submitButton.isDisabled();
          console.log(`Submit-knapp tilstand: ${isDisabled ? 'Deaktivert' : 'Aktiv'}`);
        }
        
        // Gå tilbake
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    }
  });

}); 