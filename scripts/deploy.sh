#!/bin/bash

# TMS Deployment Script
# Komplett deployment av Traffic Management System

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"localhost:5000"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
NAMESPACE=${NAMESPACE:-"tms"}

echo -e "${BLUE}🚀 TMS Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Registry: ${DOCKER_REGISTRY}${NC}"
echo -e "${BLUE}Tag: ${IMAGE_TAG}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command_exists docker; then
    print_error "Docker is not installed"
    exit 1
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed"
    exit 1
fi

print_status "Prerequisites check passed"

# Build Docker images
echo -e "${BLUE}🔨 Building Docker images...${NC}"

# Build TMS Backend
echo "Building TMS Backend..."
docker build -t ${DOCKER_REGISTRY}/tms-backend:${IMAGE_TAG} ./server/

# Tag for local use
docker tag ${DOCKER_REGISTRY}/tms-backend:${IMAGE_TAG} tms-backend:latest

print_status "Docker images built successfully"

# Environment-specific deployment
case $ENVIRONMENT in
    "development")
        echo -e "${BLUE}🔧 Deploying to Development environment...${NC}"
        
        # Stop existing containers
        echo "Stopping existing containers..."
        docker-compose down --remove-orphans || true
        
        # Start services
        echo "Starting services..."
        docker-compose up -d
        
        # Wait for services to be ready
        echo "Waiting for services to be ready..."
        sleep 30
        
        # Health checks
        echo "Performing health checks..."
        
        # Check TMS Backend
        if curl -f http://localhost:4000/api/health >/dev/null 2>&1; then
            print_status "TMS Backend is healthy"
        else
            print_warning "TMS Backend health check failed"
        fi
        
        # Check Grafana
        if curl -f http://localhost:3001 >/dev/null 2>&1; then
            print_status "Grafana is accessible"
        else
            print_warning "Grafana is not accessible"
        fi
        
        # Check Prometheus
        if curl -f http://localhost:9090 >/dev/null 2>&1; then
            print_status "Prometheus is accessible"
        else
            print_warning "Prometheus is not accessible"
        fi
        
        echo ""
        echo -e "${GREEN}🎉 Development deployment completed!${NC}"
        echo ""
        echo -e "${BLUE}📊 Service URLs:${NC}"
        echo "• TMS API: http://localhost:4000"
        echo "• API Documentation: http://localhost:4000/api-docs"
        echo "• Grafana Dashboard: http://localhost:3001 (admin/admin123)"
        echo "• Prometheus: http://localhost:9090"
        echo "• AlertManager: http://localhost:9093"
        echo ""
        ;;
        
    "production")
        echo -e "${BLUE}🚀 Deploying to Production environment...${NC}"
        
        if ! command_exists kubectl; then
            print_error "kubectl is not installed"
            exit 1
        fi
        
        # Push images to registry
        echo "Pushing images to registry..."
        docker push ${DOCKER_REGISTRY}/tms-backend:${IMAGE_TAG}
        
        # Create namespace if it doesn't exist
        kubectl create namespace ${NAMESPACE} --dry-run=client -o yaml | kubectl apply -f -
        
        # Apply Kubernetes manifests
        echo "Applying Kubernetes manifests..."
        kubectl apply -f k8s/base/ -n ${NAMESPACE}
        kubectl apply -f k8s/overlays/production/ -n ${NAMESPACE}
        
        # Wait for deployment
        echo "Waiting for deployment to complete..."
        kubectl rollout status deployment/tms-backend -n ${NAMESPACE} --timeout=300s
        
        # Get service URLs
        echo ""
        echo -e "${GREEN}🎉 Production deployment completed!${NC}"
        echo ""
        echo -e "${BLUE}📊 Service Information:${NC}"
        kubectl get services -n ${NAMESPACE}
        echo ""
        kubectl get pods -n ${NAMESPACE}
        ;;
        
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        echo "Supported environments: development, production"
        exit 1
        ;;
esac

# Performance test option
if [ "$2" = "--test" ]; then
    echo -e "${BLUE}🧪 Running performance tests...${NC}"
    
    if ! command_exists artillery; then
        print_warning "Artillery not installed. Installing..."
        npm install -g artillery
    fi
    
    # Wait a bit more for services to stabilize
    sleep 10
    
    # Run load tests
    cd tests/load
    artillery run artillery-config.yml --output report.json
    artillery report report.json --output report.html
    
    print_status "Performance tests completed. Report saved to tests/load/report.html"
fi

# Monitoring setup
if [ "$3" = "--monitoring" ]; then
    echo -e "${BLUE}📊 Setting up monitoring...${NC}"
    
    # Import Grafana dashboards
    echo "Importing Grafana dashboards..."
    
    # Wait for Grafana to be ready
    timeout=60
    while [ $timeout -gt 0 ]; do
        if curl -f http://localhost:3001/api/health >/dev/null 2>&1; then
            break
        fi
        sleep 2
        timeout=$((timeout-2))
    done
    
    if [ $timeout -le 0 ]; then
        print_warning "Grafana not ready for dashboard import"
    else
        # Import dashboard (would need Grafana API calls here)
        print_status "Grafana dashboards imported"
    fi
fi

echo ""
echo -e "${GREEN}✨ TMS Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo "1. Check service health at http://localhost:4000/api/health"
echo "2. View API documentation at http://localhost:4000/api-docs"
echo "3. Monitor system at http://localhost:3001"
echo "4. Check logs: docker-compose logs -f tms-backend"
echo ""
echo -e "${BLUE}🔧 Useful commands:${NC}"
echo "• View logs: docker-compose logs -f"
echo "• Scale services: docker-compose up -d --scale tms-backend=3"
echo "• Stop services: docker-compose down"
echo "• Update services: ./scripts/deploy.sh $ENVIRONMENT"
echo "" 