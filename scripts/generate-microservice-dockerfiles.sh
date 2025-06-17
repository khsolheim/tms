#!/bin/bash

# Script for å generere Dockerfiles for alle mikrotjenester
# Bruker: ./scripts/generate-microservice-dockerfiles.sh

set -e

echo "🐳 Genererer Dockerfiles for alle mikrotjenester..."

# Basis Docker template
generate_dockerfile() {
    local service_name=$1
    local port=$2
    local dockerfile_path="microservices/services/$service_name/Dockerfile"
    
    cat > "$dockerfile_path" << EOF
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE $port

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:$port/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/index.js"]
EOF
    
    echo "✅ Generert Dockerfile for $service_name (port $port)"
}

# Array med mikrotjenester og deres porter
declare -a microservices=(
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

# Generer Dockerfiles for alle mikrotjenester
for item in "${microservices[@]}"; do
    IFS=':' read -r service_name port <<< "$item"
    
    # Sjekk om tjenesten eksisterer
    if [ -d "microservices/services/$service_name" ]; then
        # Sjekk om Dockerfile allerede eksisterer
        if [ ! -f "microservices/services/$service_name/Dockerfile" ]; then
            generate_dockerfile "$service_name" "$port"
        else
            echo "⏭️  Dockerfile eksisterer allerede for $service_name"
        fi
    else
        echo "⚠️  Finner ikke katalog for $service_name"
    fi
done

echo ""
echo "🎉 Fullført generering av Dockerfiles!"
echo "📦 Antall genererte: $(find microservices/services -name "Dockerfile" | wc -l | tr -d ' ')" 