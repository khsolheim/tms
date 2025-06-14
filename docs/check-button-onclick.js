#!/usr/bin/env node
/**
 * TMS Button onClick Handler Checker
 * Sjekker alle button-elementer for manglende onClick-handlers
 */

const fs = require('fs');
const path = require('path');

// Farger for konsoll output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

class ButtonChecker {
  constructor() {
    this.results = {
      totalButtons: 0,
      buttonsWithOnClick: 0,
      buttonsWithoutOnClick: 0,
      files: {},
      issues: []
    };
  }

  // Rekursiv filsøking
  findFiles(dir, extensions = ['.tsx', '.jsx', '.ts', '.js']) {
    const files = [];
    
    if (!fs.existsSync(dir)) {
      return files;
    }

    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        files.push(...this.findFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        if (extensions.some(ext => item.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    }
    
    return files;
  }

  // Analyser en fil for button-elementer
  analyzeFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      // Regex for å finne button-elementer
      const buttonRegex = /<button[\s\S]*?<\/button>|<Button[\s\S]*?\/?>|<[A-Z]\w*Button[\s\S]*?\/?>/g;
      const buttons = content.match(buttonRegex) || [];
      
      const fileResults = {
        path: relativePath,
        totalButtons: buttons.length,
        buttonsWithOnClick: 0,
        buttonsWithoutOnClick: 0,
        buttonDetails: []
      };

      buttons.forEach((buttonHtml, index) => {
        const lineNumber = this.getLineNumber(content, buttonHtml);
        const hasOnClick = this.checkOnClickHandler(buttonHtml);
        const buttonType = this.getButtonType(buttonHtml);
        const isDisabled = buttonHtml.includes('disabled');
        const isSubmit = buttonHtml.includes('type="submit"');
        
        const buttonInfo = {
          index: index + 1,
          line: lineNumber,
          type: buttonType,
          hasOnClick,
          isDisabled,
          isSubmit,
          html: buttonHtml.substring(0, 100) + (buttonHtml.length > 100 ? '...' : ''),
          issue: null
        };

        // Sjekk for potensielle problemer
        if (!hasOnClick && !isSubmit && !isDisabled) {
          buttonInfo.issue = 'Missing onClick handler';
          this.results.issues.push({
            file: relativePath,
            line: lineNumber,
            type: buttonType,
            message: 'Button mangler onClick handler og er ikke submit eller disabled'
          });
          fileResults.buttonsWithoutOnClick++;
        } else {
          fileResults.buttonsWithOnClick++;
        }

        fileResults.buttonDetails.push(buttonInfo);
      });

      if (buttons.length > 0) {
        this.results.files[relativePath] = fileResults;
        this.results.totalButtons += fileResults.totalButtons;
        this.results.buttonsWithOnClick += fileResults.buttonsWithOnClick;
        this.results.buttonsWithoutOnClick += fileResults.buttonsWithoutOnClick;
      }

    } catch (error) {
      console.warn(`Kunne ikke analysere fil ${filePath}: ${error.message}`);
    }
  }

  // Sjekk om button har onClick handler
  checkOnClickHandler(buttonHtml) {
    return /onClick\s*=/.test(buttonHtml) || 
           /onPress\s*=/.test(buttonHtml) ||
           /handleClick/.test(buttonHtml) ||
           /onSubmit\s*=/.test(buttonHtml);
  }

  // Identifiser button-type
  getButtonType(buttonHtml) {
    if (buttonHtml.includes('<Button')) return 'Custom Button Component';
    if (buttonHtml.includes('Button>')) return 'Button Component';
    if (buttonHtml.includes('<button')) return 'Native HTML Button';
    return 'Unknown';
  }

  // Finn linjenummer for button
  getLineNumber(content, buttonHtml) {
    const index = content.indexOf(buttonHtml);
    if (index === -1) return 'Unknown';
    
    const beforeButton = content.substring(0, index);
    return beforeButton.split('\n').length;
  }

  // Hovedanalyse
  async analyze() {
    console.log(`${colors.bold}${colors.blue}🔍 TMS BUTTON ONCLICK CHECKER${colors.reset}`);
    console.log('='.repeat(60));
    
    // Søk etter filer
    const clientFiles = this.findFiles('../client/src', ['.tsx', '.jsx']);
    const mobileFiles = this.findFiles('../mobile/src', ['.tsx', '.jsx']);
    const allFiles = [...clientFiles, ...mobileFiles];
    
    console.log(`📁 Fant ${allFiles.length} React-filer å analysere`);
    console.log('');

    // Analyser hver fil
    for (const file of allFiles) {
      this.analyzeFile(file);
    }

    this.generateReport();
  }

  // Generer rapport
  generateReport() {
    console.log(`${colors.bold}📊 SAMMENDRAG${colors.reset}`);
    console.log('='.repeat(40));
    console.log(`✅ Totalt buttons: ${colors.cyan}${this.results.totalButtons}${colors.reset}`);
    console.log(`✅ Med onClick: ${colors.green}${this.results.buttonsWithOnClick}${colors.reset}`);
    console.log(`❌ Uten onClick: ${colors.red}${this.results.buttonsWithoutOnClick}${colors.reset}`);
    
    const successRate = this.results.totalButtons > 0 
      ? Math.round((this.results.buttonsWithOnClick / this.results.totalButtons) * 100)
      : 100;
    
    console.log(`📈 Success rate: ${successRate}%`);
    console.log('');

    // Vis filer med buttons
    console.log(`${colors.bold}📁 FILER MED BUTTONS${colors.reset}`);
    console.log('='.repeat(40));
    
    Object.entries(this.results.files).forEach(([filePath, fileData]) => {
      const icon = fileData.buttonsWithoutOnClick > 0 ? '❌' : '✅';
      console.log(`${icon} ${filePath} (${fileData.totalButtons} buttons, ${fileData.buttonsWithoutOnClick} issues)`);
    });
    console.log('');

    // Vis detaljerte problemer
    if (this.results.issues.length > 0) {
      console.log(`${colors.bold}${colors.red}🚨 PROBLEMER FUNNET${colors.reset}`);
      console.log('='.repeat(40));
      
      this.results.issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${colors.yellow}${issue.file}:${issue.line}${colors.reset}`);
        console.log(`   Type: ${issue.type}`);
        console.log(`   Problem: ${issue.message}`);
        console.log('');
      });
    } else {
      console.log(`${colors.bold}${colors.green}✅ ALLE BUTTONS HAR ONCLICK HANDLERS!${colors.reset}`);
    }

    // Anbefalinger
    this.generateRecommendations();
  }

  // Generer anbefalinger
  generateRecommendations() {
    console.log(`${colors.bold}💡 ANBEFALINGER${colors.reset}`);
    console.log('='.repeat(40));
    
    if (this.results.buttonsWithoutOnClick === 0) {
      console.log(`${colors.green}✅ Alle buttons har onClick handlers eller er korrekt konfigurert!${colors.reset}`);
      console.log('   - Systemet følger best practices for interaktivitet');
      console.log('   - Brukervennlighet er optimalisert');
    } else {
      console.log(`${colors.yellow}⚠️ ${this.results.buttonsWithoutOnClick} buttons mangler onClick handlers${colors.reset}`);
      console.log('   - Legg til onClick handlers for interaktive buttons');
      console.log('   - Vurder å disable buttons som ikke skal være klikkbare');
      console.log('   - Sjekk at submit-buttons har korrekt type="submit"');
    }
    
    console.log('');
    console.log(`${colors.bold}🏁 Analyse fullført!${colors.reset}`);
    
    // Exit code basert på resultater
    process.exit(this.results.buttonsWithoutOnClick > 0 ? 1 : 0);
  }
}

// Kjør sjekk
const checker = new ButtonChecker();
checker.analyze().catch(error => {
  console.error(`${colors.red}💥 Fatal error: ${error.message}${colors.reset}`);
  process.exit(2);
}); 