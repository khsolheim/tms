/**
<<<<<<< HEAD
 * Splash Screen Component
 * Displays loading screen during app initialization
=======
 * Splash Screen Component for TMS Mobile App
 * Displays loading screen while app initializes
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
 */

import React from 'react';
import {
  View,
  Text,
<<<<<<< HEAD
  ActivityIndicator,
  StyleSheet,
  Image,
} from 'react-native';

interface SplashScreenProps {
  message?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>TMS Mobile</Text>
        <Text style={styles.subtitle}>Training Management System</Text>
        
        <ActivityIndicator 
          size="large" 
          color="#007AFF" 
          style={styles.loader}
        />
        
        <Text style={styles.message}>{message}</Text>
      </View>
      
      <Text style={styles.version}>Version 1.0.0</Text>
=======
  StyleSheet,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>TMS</Text>
          </View>
        </View>

        {/* App Name */}
        <Text style={styles.appName}>Training Management System</Text>
        <Text style={styles.subtitle}>Mobile App</Text>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Laster...</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2024 TMS</Text>
        <Text style={styles.versionText}>v1.0.0</Text>
      </View>
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
<<<<<<< HEAD
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
=======
    paddingHorizontal: 40,
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
<<<<<<< HEAD
    marginBottom: 40,
    textAlign: 'center',
  },
  loader: {
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 20,
=======
    textAlign: 'center',
    marginBottom: 60,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  versionText: {
    fontSize: 12,
    color: '#CCCCCC',
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  },
}); 