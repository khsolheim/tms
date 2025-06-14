#!/usr/bin/env node
/**
 * TMS Button OnClick Checker V2
 * Forbedret versjon som håndterer multi-line buttons og onClick handlers
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
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Finner alle TSX-filer
function findTsxFiles(dir) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules' && file !== 'coverage' && file !== 'build') {
      results = results.concat(findTsxFiles(filePath));
    } else if (file.endsWith('.tsx') && !file.includes('.test.') && !file.includes('.spec.')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Analyserer button-elementer i en fil (forbedret for multi-line)
function analyzeButtonsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const results = [];

  // Finn alle button-elementer inkludert multi-line
  const buttonRegex = /<(button|Button|PrimaryButton|SecondaryButton|OutlineButton|GhostButton|DestructiveButton)([^>]*?)>/gs;
  
  let match;
  while ((match = buttonRegex.exec(content)) !== null) {
    const fullMatch = match[0];
    const buttonType = match[1];
    const attributes = match[2] || '';
    
    // Finn linje nummer
    const beforeMatch = content.substring(0, match.index);
    const lineNumber = beforeMatch.split('\n').length;
    
    // Sjekk for onClick i attributter (inkludert multi-line)
    const hasOnClick = /onClick\s*=/i.test(attributes) || /onClick\s*=/i.test(fullMatch);
    
    // Sjekk for andre event handlers
    const hasEventHandler = /on[A-Z][a-zA-Z]*\s*=/i.test(attributes) || 
                           /handle[A-Z][a-zA-Z]*/.test(attributes);
    
    // Sjekk for type="submit"
    const isSubmit = /type\s*=\s*["']submit["']/i.test(attributes);
    
    // Sjekk for disabled
    const isDisabled = /disabled\s*[=:{]/.test(attributes);
    
    // Sjekk for component props som kan inneholde funksjoner
    const hasPropsFunction = /\{[^}]*\}/.test(attributes) && 
                            (/props\.|onPress|onSubmit|handleSubmit|handleClick|handle[A-Z]/.test(attributes));

    // Kategoriser button
    let category = 'unknown';
    if (hasOnClick) category = 'hasOnClick';
    else if (hasEventHandler) category = 'hasEventHandler';
    else if (isSubmit) category = 'submitButton';
    else if (isDisabled) category = 'disabled';
    else if (hasPropsFunction) category = 'hasPropsFunction';
    else category = 'noFunction';

    results.push({
      file: filePath,
      line: lineNumber,
      buttonType,
      category,
      hasOnClick,
      hasEventHandler,
      isSubmit,
      isDisabled,
      hasPropsFunction,
      preview: fullMatch.substring(0, 150) + (fullMatch.length > 150 ? '...' : ''),
      attributes: attributes.trim()
    });
  }

  return results;
}

// Hovedfunksjon
function checkAllButtons() {
  console.log(`${colors.bold}${colors.blue}🔍 TMS BUTTON ONCLICK CHECKER V2${colors.reset}\n`);
  
  const clientSrcPath = path.join(__dirname, 'client', 'src');
  
  if (!fs.existsSync(clientSrcPath)) {
    console.log(`${colors.red}❌ Client src directory not found: ${clientSrcPath}${colors.reset}`);
    return;
  }

  const tsxFiles = findTsxFiles(clientSrcPath);
  console.log(`${colors.cyan}📁 Found ${tsxFiles.length} TSX files (excluding tests)${colors.reset}\n`);

  let totalButtons = 0;
  let functionalButtons = 0;
  const stats = {
    hasOnClick: 0,
    hasEventHandler: 0,
    submitButton: 0,
    disabled: 0,
    hasPropsFunction: 0,
    noFunction: 0
  };
  
  const problematicButtons = [];
  const fileResults = {};

  // Analyser hver fil
  tsxFiles.forEach(file => {
    const buttons = analyzeButtonsInFile(file);
    if (buttons.length > 0) {
      fileResults[file] = buttons;
      totalButtons += buttons.length;

      buttons.forEach(button => {
        stats[button.category]++;
        
        if (['hasOnClick', 'hasEventHandler', 'submitButton', 'hasPropsFunction'].includes(button.category)) {
          functionalButtons++;
        } else if (button.category === 'noFunction') {
          problematicButtons.push(button);
        }
      });
    }
  });

  // Vis sammendrag
  console.log(`${colors.bold}📊 SAMMENDRAG${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.cyan}📊 Total buttons found: ${totalButtons}${colors.reset}`);
  console.log(`${colors.green}✅ Buttons with onClick: ${stats.hasOnClick}${colors.reset}`);
  console.log(`${colors.green}🎯 Buttons with event handlers: ${stats.hasEventHandler}${colors.reset}`);
  console.log(`${colors.yellow}📝 Submit buttons: ${stats.submitButton}${colors.reset}`);
  console.log(`${colors.blue}🔧 Buttons with props functions: ${stats.hasPropsFunction}${colors.reset}`);
  console.log(`${colors.gray}⚫ Disabled buttons: ${stats.disabled}${colors.reset}`);
  console.log(`${colors.red}❌ Buttons without function: ${stats.noFunction}${colors.reset}`);
  
  const functionalPercentage = totalButtons > 0 ? Math.round((functionalButtons / totalButtons) * 100) : 0;
  console.log(`${colors.bold}🎯 Functional buttons: ${functionalPercentage}%${colors.reset}\n`);

  // Vis resultater per fil (kun filer med buttons)
  console.log(`${colors.bold}📋 RESULTATER PER FIL${colors.reset}`);
  console.log('='.repeat(90));
  
  Object.entries(fileResults)
    .sort(([, a], [, b]) => {
      const aFunctional = a.filter(btn => ['hasOnClick', 'hasEventHandler', 'submitButton', 'hasPropsFunction'].includes(btn.category)).length;
      const bFunctional = b.filter(btn => ['hasOnClick', 'hasEventHandler', 'submitButton', 'hasPropsFunction'].includes(btn.category)).length;
      const aPercentage = a.length > 0 ? (aFunctional / a.length) : 0;
      const bPercentage = b.length > 0 ? (bFunctional / b.length) : 0;
      return bPercentage - aPercentage; // Sorterer høyest prosent først
    })
    .forEach(([file, buttons]) => {
      const fileName = path.relative(clientSrcPath, file);
      const working = buttons.filter(btn => ['hasOnClick', 'hasEventHandler', 'submitButton', 'hasPropsFunction'].includes(btn.category)).length;
      const total = buttons.length;
      const percentage = Math.round((working / total) * 100);
      
      const statusIcon = percentage === 100 ? '✅' : percentage >= 80 ? '⚠️' : '❌';
      const categoryBreakdown = {
        onClick: buttons.filter(b => b.category === 'hasOnClick').length,
        events: buttons.filter(b => b.category === 'hasEventHandler').length,
        submit: buttons.filter(b => b.category === 'submitButton').length,
        props: buttons.filter(b => b.category === 'hasPropsFunction').length,
        none: buttons.filter(b => b.category === 'noFunction').length
      };
      
      console.log(`${statusIcon} ${fileName.padEnd(50)} | ${working}/${total} (${percentage}%) | onClick:${categoryBreakdown.onClick} events:${categoryBreakdown.events} submit:${categoryBreakdown.submit} none:${categoryBreakdown.none}`);
    });

  // Vis problematiske buttons (kun de 10 første)
  if (problematicButtons.length > 0) {
    console.log(`\n${colors.bold}${colors.red}❌ BUTTONS UTEN ONCLICK (Top 10)${colors.reset}`);
    console.log('='.repeat(90));
    
    problematicButtons.slice(0, 10).forEach((button, index) => {
      const fileName = path.relative(clientSrcPath, button.file);
      console.log(`${colors.red}${index + 1}. ${fileName}:${button.line}${colors.reset}`);
      console.log(`   Type: ${button.buttonType}`);
      console.log(`   ${colors.gray}${button.preview}${colors.reset}\n`);
    });

    if (problematicButtons.length > 10) {
      console.log(`${colors.yellow}... og ${problematicButtons.length - 10} flere buttons uten onclick${colors.reset}\n`);
    }
  }

  // Vis anbefalinger
  console.log(`${colors.bold}💡 ANBEFALINGER${colors.reset}`);
  console.log('='.repeat(60));
  
  if (stats.noFunction === 0) {
    console.log(`${colors.green}🎉 Alle buttons har funksjonalitet! Fantastisk arbeid!${colors.reset}`);
  } else if (functionalPercentage >= 90) {
    console.log(`${colors.green}👍 Nesten alle buttons har funksjonalitet (${functionalPercentage}%)${colors.reset}`);
    console.log(`${colors.cyan}💡 ${stats.noFunction} buttons kunne trenge onclick handlers${colors.reset}`);
  } else if (functionalPercentage >= 70) {
    console.log(`${colors.yellow}⚠️  God fremgang! ${functionalPercentage}% av buttons har funksjonalitet${colors.reset}`);
    console.log(`${colors.cyan}💡 Fokuser på å legge til onClick for de ${stats.noFunction} gjenværende buttons${colors.reset}`);
  } else {
    console.log(`${colors.red}🚨 ${stats.noFunction} buttons mangler onClick-funksjon (${100 - functionalPercentage}%)${colors.reset}`);
    console.log(`${colors.cyan}💡 Prioriter å implementere onClick handlers for bedre UX${colors.reset}`);
  }

  console.log(`\n${colors.bold}🏁 Analyse fullført!${colors.reset}`);
  
  return {
    total: totalButtons,
    functional: functionalButtons,
    withoutOnClick: stats.noFunction,
    percentage: functionalPercentage,
    breakdown: stats
  };
}

// Kjør analysen
if (require.main === module) {
  try {
    const result = checkAllButtons();
    // Exit med kode basert på hvor mange buttons som mangler onclick
    if (result.withoutOnClick === 0) process.exit(0);
    else if (result.percentage >= 90) process.exit(0);
    else if (result.percentage >= 70) process.exit(1);
    else process.exit(2);
  } catch (error) {
    console.error(`${colors.red}💥 Error:${colors.reset}`, error.message);
    process.exit(3);
  }
}

module.exports = { checkAllButtons }; 