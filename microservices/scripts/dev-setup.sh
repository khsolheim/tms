#!/bin/bash

# TMS Microservices Development Setup Script
# Dette scriptet setter opp development environment for alle microservices

set -e

echo "🛠️  Setting up TMS Microservices Development Environment..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "npm version: $(npm -v)"

# Navigate to microservices directory
cd "$(dirname "$0")/.."

# Install dependencies for API Gateway
print_status "Installing API Gateway dependencies..."
cd api-gateway
npm install
print_success "API Gateway dependencies installed"

# Install dependencies for Auth Service
print_status "Installing Auth Service dependencies..."
cd ../services/auth-service
npm install
print_success "Auth Service dependencies installed"

# Install dependencies for User Service
print_status "Installing User Service dependencies..."
cd ../user-service
npm install
print_success "User Service dependencies installed"

# Install dependencies for Quiz Service
print_status "Installing Quiz Service dependencies..."
cd ../quiz-service
npm install
print_success "Quiz Service dependencies installed"

# Create .env files if they don't exist
print_status "Creating environment files..."

# API Gateway .env
if [ ! -f "../../api-gateway/.env" ]; then
    cp "../../api-gateway/.env" "../../api-gateway/.env.example" 2>/dev/null || true
    print_status "Created API Gateway .env file"
fi

# Auth Service .env
if [ ! -f "../auth-service/.env" ]; then
    cat > "../auth-service/.env" << EOF
PORT=8001
NODE_ENV=development
LOG_LEVEL=info
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:8000
EOF
    print_status "Created Auth Service .env file"
fi

# User Service .env
if [ ! -f ".env" ]; then
    cat > ".env" << EOF
PORT=8002
NODE_ENV=development
LOG_LEVEL=info
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:8000
EOF
    print_status "Created User Service .env file"
fi

# Quiz Service .env
if [ ! -f "../quiz-service/.env" ]; then
    cat > "../quiz-service/.env" << EOF
PORT=8003
NODE_ENV=development
LOG_LEVEL=info
DATABASE_URL=postgresql://tms_user:tms_password@localhost:5432/tms_db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
ALLOWED_ORIGINS=http://localhost:8000
EOF
    print_status "Created Quiz Service .env file"
fi

# Create logs directories
print_status "Creating logs directories..."
mkdir -p ../../api-gateway/logs
mkdir -p ../auth-service/logs
mkdir -p logs
mkdir -p ../quiz-service/logs
print_success "Logs directories created"

# Build TypeScript projects
print_status "Building TypeScript projects..."

cd ../../api-gateway
npm run build
print_success "API Gateway built"

cd ../services/auth-service
npm run build
print_success "Auth Service built"

cd ../user-service
npm run build
print_success "User Service built"

cd ../quiz-service
npm run build
print_success "Quiz Service built"

# Go back to root
cd ../../

print_success "🎉 Development environment setup completed!"

echo ""
echo "📝 Next steps:"
echo "  1. Start your PostgreSQL database"
echo "  2. Run database migrations: cd server && npx prisma migrate deploy"
echo "  3. Start services individually:"
echo "     • API Gateway:    cd api-gateway && npm run dev"
echo "     • Auth Service:   cd services/auth-service && npm run dev"
echo "     • User Service:   cd services/user-service && npm run dev"
echo "     • Quiz Service:   cd services/quiz-service && npm run dev"
echo ""
echo "  Or use Docker Compose:"
echo "     • ./scripts/start-microservices.sh"
echo ""
echo "🔧 Development URLs:"
echo "  • API Gateway:     http://localhost:8000"
echo "  • Auth Service:    http://localhost:8001"
echo "  • User Service:    http://localhost:8002"
echo "  • Quiz Service:    http://localhost:8003" 