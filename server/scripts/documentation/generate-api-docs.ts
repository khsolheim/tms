#!/usr/bin/env ts-node

/**
 * Generate API Documentation Script
 * 
 * Automatisk generering av API dokumentasjon fra Zod schemas og route kommentarer
 */

import swaggerService from '../../src/services/swagger.service';
import fs from 'fs';
import path from 'path';
import logger from '../../src/utils/logger';

async function generateApiDocumentation() {
  try {
    console.log('🚀 Genererer API dokumentasjon...\n');

    // Generate comprehensive documentation
    swaggerService.generateComprehensiveDocumentation();
    
    // Get the complete spec
    const spec = swaggerService.getSwaggerSpec();
    
    // Create docs directory
    const docsDir = path.join(__dirname, '../../docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }

    // Save OpenAPI spec as JSON
    const specPath = path.join(docsDir, 'openapi.json');
    fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));
    
    // Save OpenAPI spec as YAML
    const yaml = require('js-yaml');
    const yamlPath = path.join(docsDir, 'openapi.yaml');
    fs.writeFileSync(yamlPath, yaml.dump(spec));

    // Generate API statistics
    const stats = swaggerService.getApiStatistics();
    const statsPath = path.join(docsDir, 'api-stats.json');
    fs.writeFileSync(statsPath, JSON.stringify({
      ...stats,
      generatedAt: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }, null, 2));

    // Generate README for documentation
    const readmePath = path.join(docsDir, 'README.md');
    const readmeContent = generateDocumentationReadme(stats);
    fs.writeFileSync(readmePath, readmeContent);

    console.log('✅ API dokumentasjon generert!');
    console.log(`📊 Statistikk:`);
    console.log(`   - Totalt ${stats.totalEndpoints} endpoints`);
    console.log(`   - ${stats.securityRequiredEndpoints} sikkerhetskrevende endpoints`);
    console.log(`   - ${Object.keys(stats.tagCounts).length} kategorier`);
    console.log(`\n📁 Filer generert:`);
    console.log(`   - ${specPath}`);
    console.log(`   - ${yamlPath}`);
    console.log(`   - ${statsPath}`);
    console.log(`   - ${readmePath}`);
    console.log(`\n🌐 Swagger UI: http://localhost:4000/api/v1/docs`);

  } catch (error) {
    console.error('❌ Feil ved generering av API dokumentasjon:', error);
    process.exit(1);
  }
}

function generateDocumentationReadme(stats: any): string {
  return `# TMS API Dokumentasjon

## Oversikt

TMS (Training Management System) API er en omfattende tjeneste for håndtering av opplæringsprogrammer, studenter, bedrifter og sikkerhetskontroller.

## API Statistikk

- **Totalt endpoints**: ${stats.totalEndpoints}
- **Sikkerhetskrevende endpoints**: ${stats.securityRequiredEndpoints}
- **Kategorier**: ${Object.keys(stats.tagCounts).length}

### Endpoints per HTTP-metode
${Object.entries(stats.methodCounts).map(([method, count]) => `- **${method}**: ${count}`).join('\n')}

### Endpoints per kategori
${Object.entries(stats.tagCounts).map(([tag, count]) => `- **${tag}**: ${count}`).join('\n')}

## Tilgjengelige formater

### Interaktiv dokumentasjon
- **Swagger UI**: http://localhost:4000/api/v1/docs
- Utforsk og test alle endpoints direkte i nettleseren

### Maskinlesbare formater
- **OpenAPI JSON**: \`docs/openapi.json\`
- **OpenAPI YAML**: \`docs/openapi.yaml\`
- **API Statistikk**: \`docs/api-stats.json\`

## Autentisering

De fleste endpoints krever autentisering med JWT token:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

Få token via innlogging: \`POST /api/auth/login\`

## Rate Limiting

- **Generell API**: 1000 forespørsler per 15 minutter
- **Autentisering**: 5 forespørsler per 15 minutter

## Feilhåndtering

Alle endpoints returnerer konsistente feilresponser:

\`\`\`json
{
  "error": "Feilmelding på norsk",
  "details": {
    "field": ["Detaljert feilmelding"]
  },
  "requestId": "123e4567-e89b-12d3-a456-426614174000"
}
\`\`\`

## Generert

Dokumentasjonen genereres automatisk fra Zod schemas og route kommentarer.

**Sist oppdatert**: ${new Date().toISOString()}
**Environment**: ${process.env.NODE_ENV || 'development'}
`;
}

// Run if called directly
if (require.main === module) {
  generateApiDocumentation().catch(console.error);
}

export { generateApiDocumentation }; 