#!/bin/bash

# TMS Microservices Startup Script
# Dette scriptet starter alle microservices i riktig rekkefølge

set -e

echo "🚀 Starting TMS Microservices Architecture..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to infrastructure directory
cd "$(dirname "$0")/../infrastructure/docker"

print_status "Stopping any existing containers..."
docker-compose -f docker-compose.microservices.yml down

print_status "Building Docker images..."
docker-compose -f docker-compose.microservices.yml build

print_status "Starting infrastructure services (Database, Redis, Monitoring)..."
docker-compose -f docker-compose.microservices.yml up -d postgres redis prometheus grafana

print_status "Waiting for database to be ready..."
sleep 10

# Check if database is ready
until docker-compose -f docker-compose.microservices.yml exec -T postgres pg_isready -U tms_user -d tms_db; do
    print_status "Waiting for PostgreSQL to be ready..."
    sleep 2
done

print_success "Database is ready!"

print_status "Starting microservices..."
docker-compose -f docker-compose.microservices.yml up -d auth-service user-service quiz-service sikkerhetskontroll-service hr-service

print_status "Starting Economy Service with CQRS patterns..."
docker-compose -f docker-compose.microservices.yml up -d economy-service

print_status "Waiting for services to be ready..."
sleep 15

print_status "Starting API Gateway..."
docker-compose -f docker-compose.microservices.yml up -d api-gateway

print_status "Waiting for API Gateway to be ready..."
sleep 10

# Health checks
print_status "Performing health checks..."

services=("api-gateway:8000" "auth-service:8001" "user-service:8002" "quiz-service:8003" "sikkerhetskontroll-service:8004" "hr-service:8005" "economy-service:8006")

for service in "${services[@]}"; do
    service_name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -f -s "http://localhost:$port/health" > /dev/null; then
        print_success "$service_name is healthy"
    else
        print_warning "$service_name health check failed"
    fi
done

print_success "🎉 TMS Microservices started successfully!"

echo ""
echo "📊 Service URLs:"
echo "  • API Gateway:     http://localhost:8000"
echo "  • Auth Service:    http://localhost:8001"
echo "  • User Service:    http://localhost:8002"
echo "  • Quiz Service:    http://localhost:8003"
echo "  • Sikkerhet:       http://localhost:8004"
echo "  • HR Service:      http://localhost:8005"
echo "  • Economy Service: http://localhost:8006"
echo ""
echo "🔧 Infrastructure:"
echo "  • PostgreSQL:      localhost:5432"
echo "  • Redis:           localhost:6379"
echo "  • Prometheus:      http://localhost:9090"
echo "  • Grafana:         http://localhost:3002 (admin/admin)"
echo "  • Jaeger UI:       http://localhost:16686"
echo ""
echo "🏥 Health Checks:"
echo "  • API Gateway:     http://localhost:8000/health"
echo "  • Services:        http://localhost:8000/services"
echo ""
echo "📝 Logs:"
echo "  • View all logs:   docker-compose -f docker-compose.microservices.yml logs -f"
echo "  • View service:    docker-compose -f docker-compose.microservices.yml logs -f [service-name]"
echo ""
echo "🛑 To stop all services:"
echo "  • ./stop-microservices.sh" 