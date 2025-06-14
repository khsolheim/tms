#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Mapping av gamle til nye klasser
const spacingMappings = {
  // Grid spacing
  'gapx-2 py-1': 'cards-spacing-grid',
  'gap-x-2 py-1': 'cards-spacing-grid',
  'gapx-2': 'gap-8',
  'gap-x-2': 'gap-8',
  
  // Vertical spacing
  'space-y-4': 'cards-spacing-vertical',
  'space-y-6': 'cards-spacing-vertical',
  'space-y-8': 'cards-spacing-vertical',
  'space-y-3': 'space-y-8', // Mindre spacing beholder vi som space-y-8
  'space-y-2': 'space-y-6', // Mindre spacing
  
  // Form grid layout
  'grid grid-cols-1 lg:grid-cols-3 gap-8': 'form-grid-layout',
  'grid grid-cols-1 lg:grid-cols-2 gap-8': 'grid grid-cols-1 lg:grid-cols-2 cards-spacing-grid',
  'grid grid-cols-1 md:grid-cols-2 gap-8': 'grid grid-cols-1 md:grid-cols-2 cards-spacing-grid',
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 cards-spacing-grid',
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 cards-spacing-grid',
  'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 cards-spacing-grid',
  
  // Flex spacing
  'flex gap-2': 'flex gap-4',
  'flex gap-1': 'flex gap-2',
  'flex gapx-2 py-1': 'flex gap-4',
  'flex gap-x-2 py-1': 'flex gap-4',
};

// Funksjoner for å finne og erstatte
function replaceSpacingClasses(content) {
  let updatedContent = content;
  
  // Erstatt alle mappings
  for (const [oldClass, newClass] of Object.entries(spacingMappings)) {
    const regex = new RegExp(oldClass.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    updatedContent = updatedContent.replace(regex, newClass);
  }
  
  return updatedContent;
}

// Funksjon for å behandle en fil
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = replaceSpacingClasses(content);
    
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent);
      console.log(`✅ Oppdatert: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Feil ved behandling av ${filePath}:`, error.message);
    return false;
  }
}

// Funksjon for å behandle en katalog rekursivt
function processDirectory(dirPath) {
  let filesUpdated = 0;
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules og andre unødvendige kataloger
        if (!['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) {
          filesUpdated += processDirectory(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.jsx') || item.endsWith('.js'))) {
        if (processFile(fullPath)) {
          filesUpdated++;
        }
      }
    }
  } catch (error) {
    console.error(`❌ Feil ved behandling av katalog ${dirPath}:`, error.message);
  }
  
  return filesUpdated;
}

// Hovedfunksjon
function main() {
  console.log('🚀 Starter oppdatering av spacing-klasser...\n');
  
  const clientPath = path.join(__dirname, '..', 'client', 'src');
  
  if (!fs.existsSync(clientPath)) {
    console.error('❌ Finner ikke client/src katalogen');
    process.exit(1);
  }
  
  const filesUpdated = processDirectory(clientPath);
  
  console.log(`\n✨ Ferdig! Oppdaterte ${filesUpdated} filer.`);
  console.log('\n📋 Oppsummering av endringer:');
  console.log('   • gapx-2 py-1 → cards-spacing-grid');
  console.log('   • space-y-4/6/8 → cards-spacing-vertical');
  console.log('   • grid layouts → cards-spacing-grid');
  console.log('   • form layouts → form-grid-layout');
  console.log('\n🎯 Alle sider bruker nå konsistente Tailwind CSS spacing-klasser!');
}

// Kjør scriptet
if (require.main === module) {
  main();
}

module.exports = { replaceSpacingClasses, processFile, processDirectory }; 