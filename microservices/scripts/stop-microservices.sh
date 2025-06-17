#!/bin/bash

# TMS Microservices Stop Script
# Dette scriptet stopper alle microservices

set -e

echo "🛑 Stopping TMS Microservices Architecture..."

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

# Navigate to infrastructure directory
cd "$(dirname "$0")/../infrastructure/docker"

print_status "Stopping all microservices..."
docker-compose -f docker-compose.microservices.yml down

print_status "Removing unused Docker images..."
docker image prune -f

print_success "🎉 All TMS Microservices stopped successfully!"

echo ""
echo "💡 To start services again:"
echo "  • ./start-microservices.sh"
echo ""
echo "🗑️  To clean up everything (including volumes):"
echo "  • docker-compose -f docker-compose.microservices.yml down -v"
echo "  • docker system prune -a" 