#!/bin/bash

# Array av alle microservices som skal opprettes
services=(
    "hr-service:8005"
    "api-gateway:8000"
    "graphql-service:8007"
    "notification-service:8008"
    "ml-service:8009"
    "observability-service:8010"
    "blockchain-service:8011"
    "ai-autoscaler-service:8030"
    "autonomous-orchestrator-service:8031"
    "chaos-engineering-service:8032"
    "edge-computing-service:8033"
    "intelligent-learning-service:8034"
    "performance-optimizer-service:8035"
    "quantum-security-service:8036"
    "self-healing-service:8037"
    "sentient-consciousness-service:8040"
    "transcendent-intelligence-service:8041"
    "absolute-transcendence-service:8042"
    "universe-creation-service:8050"
    "omnipotent-reality-service:8051"
    "reality-manipulation-service:8052"
    "interdimensional-travel-service:8053"
    "multiversal-communication-service:8054"
)

echo "🚀 OPPRETTER FORENKLEDE MICROSERVICES..."

for service_info in "${services[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    
    echo "📦 Oppretter $service_name på port $port..."
    
    # Opprett katalogstruktur
    mkdir -p "microservices/services/$service_name/src"
    
    # Opprett package.json
    cat > "microservices/services/$service_name/package.json" << EOF
{
  "name": "tms-$service_name",
  "version": "1.0.0",
  "description": "TMS $service_name",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.2",
    "typescript": "^5.1.6",
    "ts-node": "^10.9.1"
  }
}
EOF

    # Opprett tsconfig.json
    cat > "microservices/services/$service_name/tsconfig.json" << EOF
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "noImplicitAny": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
EOF

    # Opprett Dockerfile
    cat > "microservices/services/$service_name/Dockerfile" << EOF
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm install
COPY src/ ./src/
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
RUN mkdir -p logs && chown -R nodejs:nodejs logs
USER nodejs
EXPOSE $port
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:$port/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"
CMD ["node", "dist/index.js"]
EOF

    # Opprett src/index.ts
    cat > "microservices/services/$service_name/src/index.ts" << EOF
import express from 'express';

const app = express();
const PORT = process.env.PORT || $port;

app.use(express.json());

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    service: '$service_name', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    port: $port
  });
});

// Root endpoint
app.get('/', (req: any, res: any) => {
  res.json({ 
    service: '${service_name^}',
    version: '1.0.0',
    status: 'running',
    port: $port,
    endpoints: [
      'GET /health',
      'GET /',
      'GET /status',
      'POST /action'
    ]
  });
});

// Status endpoint
app.get('/status', (req: any, res: any) => {
  res.json({ 
    service: '$service_name',
    status: 'operational',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Generic action endpoint
app.post('/action', (req: any, res: any) => {
  const { action, payload } = req.body;
  res.json({ 
    service: '$service_name',
    action: action || 'default',
    payload: payload || {},
    result: 'success',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(\`$service_name running on port \${PORT}\`);
});
EOF

    echo "✅ $service_name opprettet!"
done

echo ""
echo "🎉 ALLE MICROSERVICES OPPRETTET!"
echo "🔨 Kjør 'docker-compose -f docker-compose.microservices-large.yml build' for å bygge alle" 