#!/bin/bash

# Script for å generere package.json og tsconfig.json for alle mikrotjenester
# Bruker: ./scripts/generate-microservice-packages.sh

set -e

echo "📦 Genererer package.json og tsconfig.json for alle mikrotjenester..."

# Generer package.json
generate_package_json() {
    local service_name=$1
    local port=$2
    local package_path="microservices/services/$service_name/package.json"
    
    cat > "$package_path" << EOF
{
  "name": "tms-$service_name",
  "version": "1.0.0",
  "description": "TMS $service_name Microservice",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "test": "jest",
    "docker:build": "docker build -t tms-$service_name .",
    "docker:run": "docker run -p $port:$port tms-$service_name"
  },
  "dependencies": {
    "express": "^4.18.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^6.14.0",
    "winston": "^3.8.0",
    "dotenv": "^16.0.0",
    "compression": "^1.7.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/cors": "^2.8.0",
    "@types/compression": "^1.7.0",
    "@types/node": "^18.0.0",
    "typescript": "^4.9.0",
    "nodemon": "^2.0.0",
    "ts-node": "^10.9.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  },
  "keywords": ["microservices", "$service_name", "tms", "nodejs"],
  "author": "TMS Team",
  "license": "MIT"
}
EOF
    
    echo "✅ Generert package.json for $service_name"
}

# Generer tsconfig.json
generate_tsconfig() {
    local service_name=$1
    local tsconfig_path="microservices/services/$service_name/tsconfig.json"
    
    cat > "$tsconfig_path" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
EOF
    
    echo "✅ Generert tsconfig.json for $service_name"
}

# Generer grunnleggende index.ts
generate_index_ts() {
    local service_name=$1
    local port=$2
    local service_path="microservices/services/$service_name/src"
    local index_path="$service_path/index.ts"
    
    # Opprett src katalog hvis den ikke eksisterer
    mkdir -p "$service_path"
    
    # Generer kun hvis index.ts ikke eksisterer
    if [ ! -f "$index_path" ]; then
        cat > "$index_path" << EOF
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || $port;

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// Configure rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    service: 'tms-$service_name',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Service specific routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'TMS $service_name is running',
    version: '1.0.0',
    endpoints: ['/health', '/']
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  logger.info(\`🚀 TMS $service_name started on port \${PORT}\`);
  logger.info(\`🏥 Health check: http://localhost:\${PORT}/health\`);
});

export default app;
EOF
        echo "✅ Generert grunnleggende index.ts for $service_name"
    else
        echo "⏭️  index.ts eksisterer allerede for $service_name"
    fi
}

# Array med alle mikrotjenester og deres porter
declare -a microservices=(
    "economy-service:8006"
    "graphql-service:8007"
    "notification-service:8008" 
    "ml-service:8009"
    "observability-service:8010"
    "blockchain-service:8011"
    "self-healing-service:8012"
    "performance-optimizer-service:8013"
    "ai-autoscaler-service:8014"
    "chaos-engineering-service:8015"
    "edge-computing-service:8016"
    "quantum-security-service:8017"
    "autonomous-orchestrator-service:8018"
    "intelligent-learning-service:8019"
    "sentient-consciousness-service:8020"
    "quantum-consciousness-service:8021"
    "transcendent-intelligence-service:8022"
    "interdimensional-travel-service:8023"
    "multiversal-communication-service:8024"
    "universe-creation-service:8025"
    "reality-manipulation-service:8026"
    "absolute-transcendence-service:8027"
    "omnipotent-reality-service:8028"
)

# Generer filer for alle mikrotjenester
for item in "${microservices[@]}"; do
    IFS=':' read -r service_name port <<< "$item"
    
    # Sjekk om tjenesten eksisterer
    if [ -d "microservices/services/$service_name" ]; then
        echo ""
        echo "🔧 Behandler $service_name..."
        
        # Generer package.json hvis den ikke eksisterer
        if [ ! -f "microservices/services/$service_name/package.json" ]; then
            generate_package_json "$service_name" "$port"
        else
            echo "⏭️  package.json eksisterer allerede for $service_name"
        fi
        
        # Generer tsconfig.json hvis den ikke eksisterer
        if [ ! -f "microservices/services/$service_name/tsconfig.json" ]; then
            generate_tsconfig "$service_name"
        else
            echo "⏭️  tsconfig.json eksisterer allerede for $service_name"
        fi
        
        # Generer grunnleggende index.ts
        generate_index_ts "$service_name" "$port"
        
        # Opprett logs katalog
        mkdir -p "microservices/services/$service_name/logs"
        
    else
        echo "⚠️  Finner ikke katalog for $service_name"
    fi
done

echo ""
echo "🎉 Fullført generering av mikrotjeneste-filer!"
echo "📦 Package.json filer: $(find microservices/services -name "package.json" | wc -l | tr -d ' ')"
echo "🔧 TypeScript filer: $(find microservices/services -name "tsconfig.json" | wc -l | tr -d ' ')"
echo "📝 Index.ts filer: $(find microservices/services -name "index.ts" | wc -l | tr -d ' ')" 