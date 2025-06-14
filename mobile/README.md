# TMS Mobile App 📱

## 🚀 Oversikt

TMS Mobile App er en React Native versjon av Training Management System, optimalisert for mobile enheter med fokus på offline-first arkitektur, biometrisk autentisering og enterprise-grade sikkerhet.

## ⭐ Hovedfunksjoner

### 🔐 Sikkerhet & Autentisering
- **Biometrisk autentisering** - Touch ID, Face ID, Fingerprint
- **Kryptert lagring** - Sensitive data krypteres lokalt
- **Secure keychain** - Sikker oppbevaring av tokens og credentials
- **Multi-factor authentication** - Støtte for 2FA og enterprise SSO

### 📱 Platform-Specific Optimizations
- **iOS optimalisert** - Native iOS design patterns og UX
- **Android optimalisert** - Material Design og Android-spesifikke funksjoner
- **Adaptive UI** - Responsiv design for tablets og telefoner
- **Haptic feedback** - Vibrasjon og taktil tilbakemelding

### 🌐 Offline-First Arkitektur
- **Smart caching** - Intelligent data caching med expiration
- **Background sync** - Automatisk synkronisering når online
- **Conflict resolution** - Håndtering av datakonflikter
- **Offline actions** - Lagre handlinger for senere synkronisering

### 📲 Push Notifications
- **Firebase Cloud Messaging** - Cross-platform push notifications
- **Rich notifications** - Bilder, handlinger og interaktive meldinger
- **Background processing** - Håndtering av notifications i bakgrunn
- **Notification channels** - Kategoriserte notifikasjoner (Android)

### 📷 Avanserte Funksjoner
- **QR Code Scanner** - Innebygd kamera-basert QR skanning
- **Document scanning** - PDF generering og dokumenthåndtering
- **Geolocation** - GPS-basert posisjonering for sikkerhetskontroller
- **Camera integration** - Bildetagning og vedlegg
- **Biometric enrollment** - Enkel aktivering av biometrisk pålogging

## 🏗️ Arkitektur

### Core Services
```typescript
// Offline-First Data Management
OfflineService.getInstance()
  .cacheData(key, data, expirationMinutes)
  .syncOfflineActions()
  .getCacheStats()

// Biometric Authentication
BiometricService.getInstance()
  .authenticate(options)
  .enableBiometricAuth()
  .getCapabilities()

// Push Notifications
NotificationService.getInstance()
  .requestPermission()
  .scheduleNotification(payload)
  .handleNotificationTap(data)
```

### State Management
- **Zustand** - Lightweight state management
- **React Query** - Server state synchronization
- **Offline persistence** - State persistence across app launches

### Navigation
- **React Navigation** - Native navigation patterns
- **Deep linking** - URL-based navigation og external links
- **Tab navigation** - Bottom tabs for main sections
- **Stack navigation** - Hierarchical navigation

## 📦 Installation

### Prerequisites
```bash
# Node.js 18+
node --version

# React Native CLI
npm install -g react-native-cli

# iOS (macOS only)
xcode-select --install
sudo gem install cocoapods

# Android
# Install Android Studio og set up environment
```

### Setup
```bash
# Clone project
git clone <repository-url>
cd tms/mobile

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Android setup
npx react-native run-android

# iOS setup
npx react-native run-ios
```

## 🔧 Development

### Build Commands
```bash
# Development
npm run start           # Start Metro bundler
npm run android         # Run on Android device/emulator
npm run ios            # Run on iOS device/simulator

# Testing
npm run test           # Run tests
npm run lint          # ESLint checking
npm run type-check    # TypeScript checking

# Production builds
npm run build:android  # Android release build
npm run build:ios     # iOS release build
```

### Environment Setup
```bash
# Development
cp .env.example .env.development

# Production
cp .env.example .env.production

# Required environment variables
REACT_APP_API_URL=https://api.tms.no
REACT_APP_WS_URL=wss://ws.tms.no
FCM_SENDER_ID=123456789
```

## 📱 Screens & Navigation

### Authentication Flow
```
SplashScreen → BiometricPrompt → Dashboard
           ↓                  ↓
    LoginScreen ←-----------  Logout
```

### Main Application
```
TabNavigator:
├── Dashboard (Home)
│   ├── Quick Actions
│   ├── Recent Activities  
│   └── Statistics
├── QRScanner
│   ├── Camera View
│   ├── Manual Input
│   └── Scan History
├── Offline Manager
│   ├── Cache Statistics
│   ├── Pending Sync
│   └── Data Management
└── Settings
    ├── Biometric Setup
    ├── Notification Preferences
    └── Account Management
```

## 🔐 Sikkerhet

### Data Protection
- **Encrypted Storage** - react-native-encrypted-storage
- **Certificate Pinning** - SSL/TLS certificate validation
- **Code Obfuscation** - Production build obfuscation
- **Root/Jailbreak Detection** - Security checks

### Authentication Methods
1. **Biometric** - Primary authentication method
2. **PIN Code** - Fallback for biometric failures
3. **OAuth 2.0** - Enterprise SSO integration
4. **2FA** - Two-factor authentication support

## 📊 Performance

### Optimization Strategies
- **Code splitting** - Dynamic imports for features
- **Image optimization** - WebP support og compression
- **Bundle analysis** - Metro bundle analyzer
- **Memory management** - Proper cleanup og lifecycle

### Metrics
- **App startup time** - < 3 seconds cold start
- **Bundle size** - < 50MB total app size
- **Memory usage** - < 200MB average usage
- **Battery efficiency** - Optimized background processing

## 🧪 Testing

### Test Strategy
```bash
# Unit tests
npm run test:unit

# Integration tests  
npm run test:integration

# E2E tests (Detox)
npm run test:e2e:ios
npm run test:e2e:android

# Performance tests
npm run test:performance
```

### Test Coverage
- **Services** - 90%+ coverage for core services
- **Components** - 80%+ coverage for UI components
- **Navigation** - End-to-end navigation testing
- **Offline scenarios** - Comprehensive offline testing

## 🚀 Deployment

### iOS Deployment
```bash
# Build for TestFlight
npm run build:ios

# Upload to App Store Connect
# Use Xcode or transporter tool
```

### Android Deployment
```bash
# Build AAB for Play Store
npm run build:android

# Upload to Google Play Console
# Use Play Console or fastlane
```

### CI/CD Pipeline
```yaml
# GitHub Actions / Azure DevOps
Build → Test → Security Scan → Deploy
├── Unit Tests
├── E2E Tests
├── Security Audit
└── Store Deployment
```

## 📈 Analytics & Monitoring

### Crash Reporting
- **Sentry** - Real-time crash reporting
- **Firebase Crashlytics** - Detailed crash analytics
- **Custom logging** - Application-specific error tracking

### Performance Monitoring
- **Firebase Performance** - Real-time performance metrics
- **Flipper** - Development debugging og profiling
- **Custom metrics** - Business-specific KPIs

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core mobile app structure
- ✅ Offline-first architecture  
- ✅ Biometric authentication
- ✅ Basic QR scanning

### Phase 2 (Next)
- [ ] Advanced camera features
- [ ] Real-time collaboration
- [ ] Geofencing capabilities
- [ ] AR/VR integration preview

### Phase 3 (Future)
- [ ] Machine learning integration
- [ ] IoT device connectivity
- [ ] Advanced analytics dashboard
- [ ] Multi-language support

## 🤝 Contributing

### Development Workflow
1. **Fork repository**
2. **Create feature branch** - `git checkout -b feature/amazing-feature`
3. **Commit changes** - `git commit -m 'Add amazing feature'`
4. **Push branch** - `git push origin feature/amazing-feature`
5. **Open Pull Request**

### Code Standards
- **TypeScript** - Strict typing requirements
- **ESLint** - Code quality enforcement
- **Prettier** - Consistent code formatting
- **Husky** - Pre-commit hooks

## 📞 Support

### Documentation
- **API Documentation** - `/docs/api`
- **Component Storybook** - `/docs/components`
- **Architecture Guide** - `/docs/architecture`

### Help & Issues
- **GitHub Issues** - Bug reports og feature requests
- **Internal Chat** - Team communication
- **Email Support** - support@tms.no

---

**TMS Mobile App** - Professional mobile solution for training management 🚀 