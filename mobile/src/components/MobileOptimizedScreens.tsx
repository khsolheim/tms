/**
 * Mobile Optimized Screens for TMS
 * 
 * Platform-specific optimizations for mobile experiences
 */

import React, { useState, useEffect } from 'react';

// Mock React Native components for demonstration
interface ViewProps {
  style?: any;
  children?: React.ReactNode;
}

interface TextProps {
  style?: any;
  children?: React.ReactNode;
}

interface TouchableOpacityProps {
  style?: any;
  onPress?: () => void;
  children?: React.ReactNode;
}

interface ScrollViewProps {
  style?: any;
  children?: React.ReactNode;
  refreshControl?: any;
}

interface ActivityIndicatorProps {
  size?: string;
  color?: string;
}

const View: React.FC<ViewProps> = ({ style, children }) => (
  <div style={{ ...style }}>{children}</div>
);

const Text: React.FC<TextProps> = ({ style, children }) => (
  <span style={{ ...style }}>{children}</span>
);

const TouchableOpacity: React.FC<TouchableOpacityProps> = ({ style, onPress, children }) => (
  <button style={{ ...style }} onClick={onPress}>{children}</button>
);

const ScrollView: React.FC<ScrollViewProps> = ({ style, children }) => (
  <div style={{ ...style, overflow: 'auto' }}>{children}</div>
);

const ActivityIndicator: React.FC<ActivityIndicatorProps> = ({ size, color }) => (
  <div style={{ 
    width: size === 'large' ? '40px' : '20px', 
    height: size === 'large' ? '40px' : '20px',
    borderRadius: '50%',
    border: `2px solid ${color || '#007AFF'}`,
    borderTopColor: 'transparent',
    animation: 'spin 1s linear infinite'
  }} />
);

// Mobile styles
const mobileStyles = {
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: '16px',
    paddingTop: '44px', // iOS status bar
  },
  headerTitle: {
    color: 'white',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
  },
  content: {
    flex: 1,
    padding: '16px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: '12px 24px',
    borderRadius: '8px',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginTop: '8px',
  },
  buttonText: {
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  offlineNotice: {
    backgroundColor: '#FF3B30',
    padding: '8px',
    alignItems: 'center' as const,
  },
  offlineText: {
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
  },
  fabButton: {
    position: 'absolute' as const,
    bottom: '20px',
    right: '20px',
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    backgroundColor: '#007AFF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
};

// Dashboard Screen
export const MobileDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <View style={mobileStyles.container}>
        <View style={mobileStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 16, fontSize: 16, color: '#666' }}>
            Laster dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={mobileStyles.container}>
      {/* Header */}
      <View style={mobileStyles.header}>
        <Text style={mobileStyles.headerTitle}>TMS Dashboard</Text>
      </View>

      {/* Offline Notice */}
      {isOffline && (
        <View style={mobileStyles.offlineNotice}>
          <Text style={mobileStyles.offlineText}>
            Offline modus - data kan være utdatert
          </Text>
        </View>
      )}

      {/* Content */}
      <ScrollView style={mobileStyles.content}>
        {/* Quick Actions */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Hurtighandlinger
          </Text>
          
          <TouchableOpacity 
            style={mobileStyles.button}
            onPress={() => console.log('Ny sikkerhetskontroll')}
          >
            <Text style={mobileStyles.buttonText}>Ny Sikkerhetskontroll</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[mobileStyles.button, { backgroundColor: '#34C759' }]}
            onPress={() => console.log('Skann QR kode')}
          >
            <Text style={mobileStyles.buttonText}>Skann QR Kode</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Siste aktiviteter
          </Text>
          
          {[1, 2, 3].map(i => (
            <View key={i} style={{
              padding: 12,
              borderBottomWidth: i < 3 ? 1 : 0,
              borderBottomColor: '#E5E5E5'
            }}>
              <Text style={{ fontSize: 14, fontWeight: '500' }}>
                Sikkerhetskontroll #{i}
              </Text>
              <Text style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                Fullført for 2 timer siden
              </Text>
            </View>
          ))}
        </View>

        {/* Statistics */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Denne uken
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#007AFF' }}>
                12
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Kontroller</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#34C759' }}>
                98%
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Godkjent</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9500' }}>
                2
              </Text>
              <Text style={{ fontSize: 12, color: '#666' }}>Avvik</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={mobileStyles.fabButton}
        onPress={() => console.log('Quick action')}
      >
        <Text style={{ color: 'white', fontSize: 20 }}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

// QR Scanner Screen
export const MobileQRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <View style={mobileStyles.container}>
      <View style={mobileStyles.header}>
        <Text style={mobileStyles.headerTitle}>QR Skanner</Text>
      </View>

      <View style={mobileStyles.content}>
        {/* Camera View Placeholder */}
        <View style={{
          flex: 1,
          backgroundColor: '#000',
          borderRadius: 8,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 20,
        }}>
          <Text style={{ color: 'white', fontSize: 16 }}>
            QR Kamera Visning
          </Text>
          <Text style={{ color: '#ccc', fontSize: 14, marginTop: 8 }}>
            Pek kameraet mot QR koden
          </Text>
        </View>

        {/* Controls */}
        <View style={mobileStyles.card}>
          <TouchableOpacity 
            style={[mobileStyles.button, { 
              backgroundColor: isScanning ? '#FF3B30' : '#34C759' 
            }]}
            onPress={() => setIsScanning(!isScanning)}
          >
            <Text style={mobileStyles.buttonText}>
              {isScanning ? 'Stopp skanning' : 'Start skanning'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[mobileStyles.button, { backgroundColor: '#8E8E93' }]}
            onPress={() => console.log('Manuell input')}
          >
            <Text style={mobileStyles.buttonText}>Manuell inntasting</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Offline Data Manager Screen
export const MobileOfflineManager: React.FC = () => {
  const [cacheStats, setCacheStats] = useState({
    totalItems: 0,
    validItems: 0,
    expiredItems: 0,
    pendingActions: 0
  });

  useEffect(() => {
    // Load cache stats
    setCacheStats({
      totalItems: 45,
      validItems: 42,
      expiredItems: 3,
      pendingActions: 2
    });
  }, []);

  return (
    <View style={mobileStyles.container}>
      <View style={mobileStyles.header}>
        <Text style={mobileStyles.headerTitle}>Offline Data</Text>
      </View>

      <ScrollView style={mobileStyles.content}>
        {/* Cache Statistics */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Cache Statistikk
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#666' }}>Totalt elementer:</Text>
            <Text style={{ fontWeight: '600' }}>{cacheStats.totalItems}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#666' }}>Gyldige:</Text>
            <Text style={{ fontWeight: '600', color: '#34C759' }}>{cacheStats.validItems}</Text>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: '#666' }}>Utløpte:</Text>
            <Text style={{ fontWeight: '600', color: '#FF9500' }}>{cacheStats.expiredItems}</Text>
          </View>
        </View>

        {/* Pending Sync Actions */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Ventende synkronisering
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#666' }}>Handlinger i kø:</Text>
            <Text style={{ fontWeight: '600', color: '#FF3B30' }}>{cacheStats.pendingActions}</Text>
          </View>

          <TouchableOpacity 
            style={[mobileStyles.button, { backgroundColor: '#34C759' }]}
            onPress={() => console.log('Sync now')}
          >
            <Text style={mobileStyles.buttonText}>Synkroniser nå</Text>
          </TouchableOpacity>
        </View>

        {/* Cache Management */}
        <View style={mobileStyles.card}>
          <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
            Cache Administrasjon
          </Text>
          
          <TouchableOpacity 
            style={[mobileStyles.button, { backgroundColor: '#FF9500' }]}
            onPress={() => console.log('Clear expired')}
          >
            <Text style={mobileStyles.buttonText}>Fjern utløpte elementer</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[mobileStyles.button, { backgroundColor: '#FF3B30' }]}
            onPress={() => console.log('Clear all')}
          >
            <Text style={mobileStyles.buttonText}>Tøm all cache</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}; 