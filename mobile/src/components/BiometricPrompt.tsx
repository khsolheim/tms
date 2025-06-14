<<<<<<< HEAD
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface BiometricPromptProps {
=======
/**
 * Biometric Prompt Component for TMS Mobile App
 * Handles biometric authentication prompts
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { BiometricService } from '../services/BiometricService';

const biometricService = BiometricService.getInstance();

export interface BiometricPromptProps {
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  visible: boolean;
  onSuccess: () => void;
  onFailure: () => void;
  onCancel: () => void;
<<<<<<< HEAD
=======
  title?: string;
  subtitle?: string;
  description?: string;
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
}

export const BiometricPrompt: React.FC<BiometricPromptProps> = ({
  visible,
  onSuccess,
  onFailure,
  onCancel,
<<<<<<< HEAD
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Biometric Authentication</Text>
          <Text style={styles.message}>Use your biometric to authenticate</Text>
          
          <View style={styles.buttons}>
            <TouchableOpacity style={styles.button} onPress={onSuccess}>
              <Text style={styles.buttonText}>Authenticate</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
=======
  title = 'Biometrisk autentisering',
  subtitle = 'Bekreft din identitet',
  description = 'Bruk fingeravtrykk eller ansiktsgjenkjenning for å fortsette',
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (visible) {
      // Scale in animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Start pulse animation
      startPulseAnimation();

      // Auto-start biometric authentication
      handleBiometricAuth();
    } else {
      // Scale out animation
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);

    try {
      const isAvailable = await biometricService.isAvailable();
      
      if (!isAvailable) {
        Alert.alert(
          'Biometri ikke tilgjengelig',
          'Biometrisk autentisering er ikke tilgjengelig på denne enheten.',
          [{ text: 'OK', onPress: onFailure }]
        );
        return;
      }

      const result = await biometricService.authenticate({
        promptMessage: title,
        negativeButtonText: 'Avbryt',
        description: 'Bruk passord',
      });

      if (result.success) {
        onSuccess();
      } else {
        if (result.error === 'UserCancel' || result.error === 'UserFallback') {
          onCancel();
        } else {
          Alert.alert(
            'Autentisering feilet',
            result.error || 'Biometrisk autentisering feilet. Prøv igjen.',
            [
              { text: 'Prøv igjen', onPress: handleBiometricAuth },
              { text: 'Avbryt', onPress: onFailure },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Biometric authentication error:', error);
      Alert.alert(
        'Feil',
        'En feil oppstod under biometrisk autentisering.',
        [{ text: 'OK', onPress: onFailure }]
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.content}>
            {/* Biometric Icon */}
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Text style={styles.icon}>👆</Text>
            </Animated.View>

            {/* Title and Description */}
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
            <Text style={styles.description}>{description}</Text>

            {/* Status */}
            {isAuthenticating && (
              <Text style={styles.status}>Autentiserer...</Text>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.retryButton]}
                onPress={handleBiometricAuth}
                disabled={isAuthenticating}
              >
                <Text style={styles.retryButtonText}>
                  {isAuthenticating ? 'Autentiserer...' : 'Prøv igjen'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={isAuthenticating}
              >
                <Text style={styles.cancelButtonText}>Avbryt</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: 'rgba(0,0,0,0.5)',
=======
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
<<<<<<< HEAD
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff6b6b',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
=======
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    margin: 20,
    maxWidth: 320,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  status: {
    fontSize: 14,
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  },
}); 