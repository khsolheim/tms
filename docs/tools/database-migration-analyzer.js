#!/usr/bin/env node
/**
 * TMS Database Migration Analyzer
 * Analyserer hardkodet data som må flyttes til database
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
  magenta: '\x1b[35m',
  gray: '\x1b[90m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

// Kategorier av hardkodet data
const DATA_CATEGORIES = {
  MOCK_DATA: 'Mock/Sample Data',
  REFERENCE_DATA: 'Reference/Static Data', 
  CONFIGURATION: 'Configuration Data',
  USER_DATA: 'User/Business Data',
  SYSTEM_DATA: 'System Constants'
};

// Patterns for å identifisere hardkodet data
const HARDCODED_PATTERNS = [
  // Mock data patterns
  { pattern: /const\s+mock\w*\s*[:=]/, category: DATA_CATEGORIES.MOCK_DATA, severity: 'HIGH' },
  { pattern: /mock\w*Data\s*[:=]/, category: DATA_CATEGORIES.MOCK_DATA, severity: 'HIGH' },
  { pattern: /dummy\w*\s*[:=]/, category: DATA_CATEGORIES.MOCK_DATA, severity: 'HIGH' },
  { pattern: /sample\w*\s*[:=]/, category: DATA_CATEGORIES.MOCK_DATA, severity: 'HIGH' },
  
  // Reference data patterns
  { pattern: /const\s+\w*(kategorier|klasser|systemer|roller)\s*=\s*\[/, category: DATA_CATEGORIES.REFERENCE_DATA, severity: 'MEDIUM' },
  { pattern: /(A1|A2|B|BE|C1|C1E|C|CE|D1|D1E|D|DE).*førerkort/i, category: DATA_CATEGORIES.REFERENCE_DATA, severity: 'MEDIUM' },
  { pattern: /const\s+\w*(options|choices|items)\s*=\s*\[/, category: DATA_CATEGORIES.REFERENCE_DATA, severity: 'MEDIUM' },
  
  // Configuration patterns
  { pattern: /const\s+\w*config\w*\s*[:=]/, category: DATA_CATEGORIES.CONFIGURATION, severity: 'LOW' },
  { pattern: /const\s+\w*settings\w*\s*[:=]/, category: DATA_CATEGORIES.CONFIGURATION, severity: 'LOW' },
  { pattern: /ITEMS_PER_PAGE/, category: DATA_CATEGORIES.CONFIGURATION, severity: 'LOW' },
  
  // System constants
  { pattern: /const\s+\w*(STATUS|ROLE|TYPE)\w*\s*=/, category: DATA_CATEGORIES.SYSTEM_DATA, severity: 'LOW' },
];

// Database tabeller som allerede eksisterer
const EXISTING_TABLES = [
  'User', 'Ansatt', 'Bedrift', 'Elev', 'Kontrakt', 'Sjekkpunkt', 'KontrollMal',
  'Sikkerhetskontroll', 'QuizKategori', 'QuizSporsmal', 'BildeLibrary', 'Kjoretoy',
  'SystemConfig', 'EmailTemplate', 'IntegrationConfiguration', 'BedriftsKlasse',
  'SikkerhetskontrollKlasse', 'SikkerhetskontrollKategori', 'SikkerhetskontrollSporsmal'
];

// Finner alle relevante filer
function findRelevantFiles(dir, extensions = ['.ts', '.tsx', '.js']) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && 
        !['node_modules', 'coverage', 'build', 'dist'].includes(file)) {
      results = results.concat(findRelevantFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext)) && 
               !file.includes('.test.') && !file.includes('.spec.')) {
      results.push(filePath);
    }
  }
  
  return results;
}

// Analyserer en fil for hardkodet data
function analyzeFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const findings = [];
  
  lines.forEach((line, lineNumber) => {
    HARDCODED_PATTERNS.forEach(({ pattern, category, severity }) => {
      if (pattern.test(line)) {
        // Finn hele data-strukturen hvis det er et array/objekt
        let dataStructure = extractDataStructure(content, lineNumber);
        
        findings.push({
          file: filePath,
          line: lineNumber + 1,
          category,
          severity,
          code: line.trim(),
          dataStructure,
          estimatedRows: estimateDataRows(dataStructure)
        });
      }
    });
  });
  
  return findings;
}

// Prøver å ekstraktere hele data-strukturen
function extractDataStructure(content, startLineIndex) {
  const lines = content.split('\n');
  let structure = lines[startLineIndex];
  let braceCount = 0;
  let bracketCount = 0;
  let inStructure = false;
  
  for (let i = startLineIndex; i < lines.length && i < startLineIndex + 100; i++) {
    const line = lines[i];
    
    // Tell brackets og braces
    for (const char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
      if (char === '[') bracketCount++;
      if (char === ']') bracketCount--;
    }
    
    if (i > startLineIndex) {
      structure += '\n' + line;
    }
    
    // Stopp når vi har lukket alle brackets/braces
    if (braceCount === 0 && bracketCount === 0 && (line.includes(';') || line.includes(','))) {
      break;
    }
  }
  
  return structure.length > 1000 ? structure.substring(0, 1000) + '...' : structure;
}

// Estimerer antall rader data vil generere
function estimateDataRows(dataStructure) {
  if (!dataStructure) return 0;
  
  // Tell antall objekter/items i array
  const objectMatches = dataStructure.match(/{\s*[^}]+\s*}/g);
  const arrayItemMatches = dataStructure.match(/,\s*(?={|"|\d)/g);
  
  if (objectMatches) return objectMatches.length;
  if (arrayItemMatches) return arrayItemMatches.length + 1;
  
  // Fallback: tell linjer
  return Math.min(dataStructure.split('\n').length, 50);
}

// Foreslår database-tabeller basert på funn
function suggestDatabaseTables(findings) {
  const suggestions = new Map();
  
  findings.forEach(finding => {
    const fileName = path.basename(finding.file, path.extname(finding.file));
    const category = finding.category;
    
    let tableName = '';
    let description = '';
    
    // Kategorisér basert på filnavn og innhold
    if (finding.code.includes('kategori') || fileName.includes('Kategori')) {
      tableName = 'ReferenceKategorier';
      description = 'Kategorier for quiz, sikkerhetskontroll, etc.';
    } else if (finding.code.includes('klasse') || fileName.includes('Klasse')) {
      tableName = 'FørerkortKlasser';
      description = 'Førerkortklass-referanser (A1, A2, B, etc.)';
    } else if (finding.code.includes('system') || finding.code.includes('System')) {
      tableName = 'SjekkpunktSystemer';
      description = 'System-kategorier for sjekkpunkter';
    } else if (category === DATA_CATEGORIES.MOCK_DATA) {
      if (fileName.includes('Bedrift') || finding.code.includes('bedrift')) {
        tableName = 'SeedBedrifter';
        description = 'Demo/test bedrifter';
      } else if (fileName.includes('Elev') || finding.code.includes('elev')) {
        tableName = 'SeedElever';
        description = 'Demo/test elever';
      } else if (fileName.includes('Quiz') || finding.code.includes('quiz')) {
        tableName = 'SeedQuizData';
        description = 'Demo quiz-spørsmål og kategorier';
      } else {
        tableName = 'SeedData';
        description = 'Generell demo/test data';
      }
    } else if (category === DATA_CATEGORIES.CONFIGURATION) {
      tableName = 'SystemConfiguration';
      description = 'System-konfigurasjon og innstillinger';
    }
    
    if (tableName) {
      if (!suggestions.has(tableName)) {
        suggestions.set(tableName, {
          tableName,
          description,
          category,
          estimatedRows: 0,
          files: [],
          priority: finding.severity
        });
      }
      
      const suggestion = suggestions.get(tableName);
      suggestion.estimatedRows += finding.estimatedRows;
      suggestion.files.push({
        file: path.relative(process.cwd(), finding.file),
        line: finding.line,
        rows: finding.estimatedRows
      });
    }
  });
  
  return Array.from(suggestions.values());
}

// Hovedanalyse-funksjon
function analyzeTMSDatabase() {
  console.log(`${colors.bold}${colors.blue}🔍 TMS DATABASE MIGRATION ANALYZER${colors.reset}\n`);
  
  const clientSrcPath = path.join(__dirname, '../../client/src');
  const serverSrcPath = path.join(__dirname, '../../server/src');
  
  console.log(`${colors.cyan}📁 Analyserer filer i client og server...${colors.reset}`);
  
  // Finn alle relevante filer
  const clientFiles = findRelevantFiles(clientSrcPath);
  const serverFiles = findRelevantFiles(serverSrcPath);
  const allFiles = [...clientFiles, ...serverFiles];
  
  console.log(`${colors.gray}   Client: ${clientFiles.length} filer${colors.reset}`);
  console.log(`${colors.gray}   Server: ${serverFiles.length} filer${colors.reset}`);
  console.log(`${colors.gray}   Total: ${allFiles.length} filer${colors.reset}\n`);
  
  // Analyser alle filer
  let allFindings = [];
  let processedFiles = 0;
  
  allFiles.forEach(file => {
    const findings = analyzeFile(file);
    allFindings = allFindings.concat(findings);
    processedFiles++;
    
    if (processedFiles % 50 === 0) {
      console.log(`${colors.gray}   Prosessert ${processedFiles}/${allFiles.length} filer...${colors.reset}`);
    }
  });
  
  // Gruppér funn etter kategori
  const findingsByCategory = {};
  allFindings.forEach(finding => {
    if (!findingsByCategory[finding.category]) {
      findingsByCategory[finding.category] = [];
    }
    findingsByCategory[finding.category].push(finding);
  });
  
  // Vis sammendrag
  console.log(`${colors.bold}📊 ANALYSE-SAMMENDRAG${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`${colors.cyan}📊 Total funn: ${allFindings.length}${colors.reset}`);
  
  Object.entries(findingsByCategory).forEach(([category, findings]) => {
    const totalRows = findings.reduce((sum, f) => sum + f.estimatedRows, 0);
    const highPriority = findings.filter(f => f.severity === 'HIGH').length;
    
    console.log(`${colors.yellow}📋 ${category}: ${findings.length} funn (${totalRows} estimerte rader)${colors.reset}`);
    if (highPriority > 0) {
      console.log(`   ${colors.red}🔥 ${highPriority} høy prioritet${colors.reset}`);
    }
  });
  
  // Generer database-forslag
  console.log(`\n${colors.bold}🗄️ DATABASE-FORSLAG${colors.reset}`);
  console.log('='.repeat(70));
  
  const suggestions = suggestDatabaseTables(allFindings);
  suggestions.sort((a, b) => {
    const priorityOrder = { 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
  
  suggestions.forEach((suggestion, index) => {
    const priorityColor = suggestion.priority === 'HIGH' ? colors.red : 
                         suggestion.priority === 'MEDIUM' ? colors.yellow : colors.green;
    
    console.log(`${colors.bold}${index + 1}. ${suggestion.tableName}${colors.reset}`);
    console.log(`   ${colors.gray}${suggestion.description}${colors.reset}`);
    console.log(`   ${priorityColor}Prioritet: ${suggestion.priority}${colors.reset}`);
    console.log(`   ${colors.cyan}Estimerte rader: ${suggestion.estimatedRows}${colors.reset}`);
    console.log(`   ${colors.blue}Filer: ${suggestion.files.length}${colors.reset}`);
    
    suggestion.files.slice(0, 3).forEach(file => {
      console.log(`     ${colors.gray}• ${file.file}:${file.line} (${file.rows} rader)${colors.reset}`);
    });
    
    if (suggestion.files.length > 3) {
      console.log(`     ${colors.gray}• ... og ${suggestion.files.length - 3} flere${colors.reset}`);
    }
    console.log('');
  });
  
  // Eksisterende tabeller
  console.log(`${colors.bold}📋 EKSISTERENDE DATABASE-TABELLER${colors.reset}`);
  console.log('='.repeat(70));
  console.log(`${colors.green}✅ ${EXISTING_TABLES.length} tabeller allerede i schema:${colors.reset}`);
  EXISTING_TABLES.forEach(table => {
    console.log(`   ${colors.gray}• ${table}${colors.reset}`);
  });
  
  // Anbefalinger
  console.log(`\n${colors.bold}💡 ANBEFALINGER${colors.reset}`);
  console.log('='.repeat(70));
  
  const highPriorityFindings = allFindings.filter(f => f.severity === 'HIGH');
  const mockDataCount = findingsByCategory[DATA_CATEGORIES.MOCK_DATA]?.length || 0;
  
  if (highPriorityFindings.length > 0) {
    console.log(`${colors.red}🔥 HØYESTE PRIORITET: Fjern ${highPriorityFindings.length} mock/dummy data implementasjoner${colors.reset}`);
  }
  
  if (mockDataCount > 0) {
    console.log(`${colors.yellow}⚠️  MOCK DATA: ${mockDataCount} filer inneholder hardkodet demo-data${colors.reset}`);
    console.log(`${colors.cyan}💡 Opprett seed-scripts for demo-data i database${colors.reset}`);
  }
  
  const referenceDataCount = findingsByCategory[DATA_CATEGORIES.REFERENCE_DATA]?.length || 0;
  if (referenceDataCount > 0) {
    console.log(`${colors.blue}📚 REFERANSE DATA: ${referenceDataCount} hardkodede referanse-tabeller${colors.reset}`);
    console.log(`${colors.cyan}💡 Flytt til database-tabeller med admin-grensesnitt${colors.reset}`);
  }
  
  console.log(`\n${colors.bold}🏁 ANALYSE FULLFØRT!${colors.reset}`);
  console.log(`${colors.cyan}📝 Se detaljert rapport i docs/DATABASE_MIGRATION_REPORT.md${colors.reset}`);
  
  return {
    totalFindings: allFindings.length,
    findingsByCategory,
    suggestions,
    recommendations: {
      highPriority: highPriorityFindings.length,
      mockData: mockDataCount,
      referenceData: referenceDataCount
    }
  };
}

// Kjør analysen
if (require.main === module) {
  try {
    const result = analyzeTMSDatabase();
    
    // Exit med kode basert på funn
    if (result.recommendations.highPriority > 10) process.exit(2);
    else if (result.recommendations.highPriority > 0) process.exit(1);
    else process.exit(0);
  } catch (error) {
    console.error(`${colors.red}💥 Error:${colors.reset}`, error.message);
    process.exit(3);
  }
}

module.exports = { analyzeTMSDatabase }; 