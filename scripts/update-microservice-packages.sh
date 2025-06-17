#!/bin/bash

# Script for å oppdatere package.json for alle mikrotjenester med nødvendige dependencies
# Bruker: ./scripts/update-microservice-packages.sh

set -e

echo "📦 Oppdaterer package.json for alle mikrotjenester med felles dependencies..."

# Basis dependencies for alle mikrotjenester
update_package_json() {
    local service_name=$1
    local port=$2
    local package_path="microservices/services/$service_name/package.json"
    
    # Sjekk om tjenesten har spesielle requirements
    local has_express=""
    local has_prisma=""
    
    if [ -d "microservices/services/$service_name/src" ]; then
        # Sjekk om tjenesten bruker Express
        if grep -r "express" "microservices/services/$service_name/src" > /dev/null 2>&1; then
            has_express="true"
        fi
        
        # Sjekk om tjenesten bruker Prisma
        if grep -r "prisma" "microservices/services/$service_name/src" > /dev/null 2>&1; then
            has_prisma="true"
        fi
    fi
    
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
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.3.1",
    "winston": "^3.10.0"$(if [ "$has_express" = "true" ]; then echo ",
    \"express-validator\": \"^7.0.1\",
    \"jsonwebtoken\": \"^9.0.2\",
    \"bcryptjs\": \"^2.4.3\""; fi)$(if [ "$has_prisma" = "true" ]; then echo ",
    \"@prisma/client\": \"^5.2.0\""; fi)
  },
  "devDependencies": {
    "@types/node": "^20.5.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "@types/bcryptjs": "^2.4.2",
    "@types/jsonwebtoken": "^9.0.2",
    "typescript": "^5.1.6",
    "nodemon": "^3.0.1",
    "ts-node": "^10.9.1",
    "jest": "^29.6.2",
    "@types/jest": "^29.5.3"
  },
  "keywords": [
    "tms",
    "microservice",
    "$service_name",
    "typescript",
    "express"
  ],
  "author": "TMS Team",
  "license": "ISC"
}
EOF

    echo "✅ Oppdatert package.json for $service_name (port $port)"
}

# Mikrotjeneste-konfigurasjon (navn:port)
services=(
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
    "auth-service:8001"
    "user-service:8002"
    "quiz-service:8003"
    "sikkerhetskontroll-service:8004"
    "hr-service:8005"
)

echo "🔄 Behandler ${#services[@]} mikrotjenester..."

for service_config in "${services[@]}"; do
    service_name="${service_config%:*}"
    port="${service_config#*:}"
    
    if [ -d "microservices/services/$service_name" ]; then
        echo "🔧 Behandler $service_name..."
        update_package_json "$service_name" "$port"
    else
        echo "⚠️  Service directory ikke funnet: $service_name"
    fi
done

echo ""
echo "🎉 Fullført oppdatering av mikrotjeneste package.json filer!"
echo "📦 Oppdaterte ${#services[@]} services med felles dependencies" 