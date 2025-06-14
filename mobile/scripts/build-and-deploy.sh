#!/bin/bash

# TMS Mobile App - Build and Deployment Script
# 
# Automatisk build og deployment til App Store og Google Play
# Krever: Xcode, Android Studio, fastlane, proper certificates

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="TMS"
BUNDLE_ID="no.tms.mobile"
VERSION=$(node -pe "require('./package.json').version")
BUILD_NUMBER=$(date +%Y%m%d%H%M)

echo -e "${BLUE}🚀 TMS Mobile App - Build and Deployment${NC}"
echo -e "${BLUE}Version: ${VERSION} (${BUILD_NUMBER})${NC}"
echo "============================================"

# Function to print colored output
print_step() {
    echo -e "${GREEN}[STEP]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the mobile directory."
    exit 1
fi

# Parse command line arguments
PLATFORM=""
ENVIRONMENT="production"
DEPLOY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--platform)
            PLATFORM="$2"
            shift 2
            ;;
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        -d|--deploy)
            DEPLOY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  -p, --platform    ios|android|both (required)"
            echo "  -e, --environment development|staging|production (default: production)"
            echo "  -d, --deploy      Deploy to app stores after build"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

if [ -z "$PLATFORM" ]; then
    print_error "Platform is required. Use -p ios, -p android, or -p both"
    exit 1
fi

# Validate platform
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "both" ]]; then
    print_error "Invalid platform. Use: ios, android, or both"
    exit 1
fi

print_step "Preparing build environment..."

# Check dependencies
print_step "Checking build dependencies..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npx &> /dev/null; then
    print_error "npx is not available"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_step "Installing npm dependencies..."
    npm install
fi

# Type checking
print_step "Running TypeScript type checking..."
npm run type-check

# Linting
print_step "Running ESLint..."
npm run lint

# Unit tests
print_step "Running unit tests..."
npm test -- --watchAll=false --coverage

# Set environment variables
print_step "Setting up environment for ${ENVIRONMENT}..."
if [ -f ".env.${ENVIRONMENT}" ]; then
    export $(cat .env.${ENVIRONMENT} | xargs)
else
    print_warning "Environment file .env.${ENVIRONMENT} not found"
fi

# Build for iOS
build_ios() {
    print_step "Building iOS app..."
    
    # Check if running on macOS
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "iOS builds require macOS"
        return 1
    fi
    
    # Check Xcode
    if ! command -v xcodebuild &> /dev/null; then
        print_error "Xcode is not installed"
        return 1
    fi
    
    # Install CocoaPods dependencies
    print_step "Installing CocoaPods dependencies..."
    cd ios
    pod install --repo-update
    cd ..
    
    # Clean previous builds
    print_step "Cleaning previous iOS builds..."
    cd ios
    xcodebuild clean -workspace ${APP_NAME}.xcworkspace -scheme ${APP_NAME}
    cd ..
    
    # Build for device
    print_step "Building iOS app for device..."
    cd ios
    
    if [ "$ENVIRONMENT" == "production" ]; then
        # Production build
        xcodebuild -workspace ${APP_NAME}.xcworkspace \
                   -scheme ${APP_NAME} \
                   -configuration Release \
                   -destination generic/platform=iOS \
                   -archivePath "../build/ios/${APP_NAME}.xcarchive" \
                   archive
        
        # Export IPA
        print_step "Exporting IPA..."
        xcodebuild -exportArchive \
                   -archivePath "../build/ios/${APP_NAME}.xcarchive" \
                   -exportPath "../build/ios/" \
                   -exportOptionsPlist "ExportOptions.plist"
    else
        # Development build
        xcodebuild -workspace ${APP_NAME}.xcworkspace \
                   -scheme ${APP_NAME} \
                   -configuration Debug \
                   -destination generic/platform=iOS \
                   build
    fi
    
    cd ..
    
    print_step "iOS build completed successfully!"
    
    # Deploy to TestFlight if requested
    if [ "$DEPLOY" = true ] && [ "$ENVIRONMENT" == "production" ]; then
        deploy_ios
    fi
}

# Build for Android
build_android() {
    print_step "Building Android app..."
    
    # Check Android SDK
    if [ -z "$ANDROID_HOME" ]; then
        print_error "ANDROID_HOME environment variable is not set"
        return 1
    fi
    
    # Clean previous builds
    print_step "Cleaning previous Android builds..."
    cd android
    ./gradlew clean
    
    # Build APK or AAB
    if [ "$ENVIRONMENT" == "production" ]; then
        print_step "Building Android App Bundle (AAB)..."
        ./gradlew bundleRelease
        
        # Copy AAB to build directory
        mkdir -p ../build/android
        cp app/build/outputs/bundle/release/app-release.aab ../build/android/
        
        print_step "Android AAB build completed!"
    else
        print_step "Building Android APK..."
        ./gradlew assembleDebug
        
        # Copy APK to build directory
        mkdir -p ../build/android
        cp app/build/outputs/apk/debug/app-debug.apk ../build/android/
        
        print_step "Android APK build completed!"
    fi
    
    cd ..
    
    # Deploy to Play Store if requested
    if [ "$DEPLOY" = true ] && [ "$ENVIRONMENT" == "production" ]; then
        deploy_android
    fi
}

# Deploy iOS to TestFlight
deploy_ios() {
    print_step "Deploying iOS app to TestFlight..."
    
    if ! command -v fastlane &> /dev/null; then
        print_error "Fastlane is not installed. Install with: gem install fastlane"
        return 1
    fi
    
    cd ios
    fastlane beta
    cd ..
    
    print_step "iOS app deployed to TestFlight successfully!"
}

# Deploy Android to Play Store
deploy_android() {
    print_step "Deploying Android app to Play Store..."
    
    if ! command -v fastlane &> /dev/null; then
        print_error "Fastlane is not installed. Install with: gem install fastlane"
        return 1
    fi
    
    cd android
    fastlane beta
    cd ..
    
    print_step "Android app deployed to Play Store successfully!"
}

# Create build directories
mkdir -p build/ios
mkdir -p build/android

# Execute builds based on platform
case $PLATFORM in
    ios)
        build_ios
        ;;
    android)
        build_android
        ;;
    both)
        build_android
        build_ios
        ;;
esac

# Generate build report
print_step "Generating build report..."

cat > build/build-report.txt << EOF
TMS Mobile App Build Report
===========================
Date: $(date)
Version: ${VERSION}
Build Number: ${BUILD_NUMBER}
Environment: ${ENVIRONMENT}
Platform: ${PLATFORM}

Build Artifacts:
EOF

if [ "$PLATFORM" == "ios" ] || [ "$PLATFORM" == "both" ]; then
    if [ -f "build/ios/${APP_NAME}.ipa" ]; then
        echo "- iOS IPA: build/ios/${APP_NAME}.ipa" >> build/build-report.txt
        echo "- Size: $(du -h build/ios/${APP_NAME}.ipa | cut -f1)" >> build/build-report.txt
    fi
fi

if [ "$PLATFORM" == "android" ] || [ "$PLATFORM" == "both" ]; then
    if [ -f "build/android/app-release.aab" ]; then
        echo "- Android AAB: build/android/app-release.aab" >> build/build-report.txt
        echo "- Size: $(du -h build/android/app-release.aab | cut -f1)" >> build/build-report.txt
    elif [ -f "build/android/app-debug.apk" ]; then
        echo "- Android APK: build/android/app-debug.apk" >> build/build-report.txt
        echo "- Size: $(du -h build/android/app-debug.apk | cut -f1)" >> build/build-report.txt
    fi
fi

cat build/build-report.txt

print_step "Build process completed successfully! 🎉"

if [ "$DEPLOY" = true ]; then
    print_step "Deployment completed! Check app store consoles for status."
fi

echo -e "${GREEN}✅ All done! Build artifacts are in the ./build directory.${NC}" 