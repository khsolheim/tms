<<<<<<< HEAD
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OfflineNotice: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
=======
/**
 * Offline Notice Component for TMS Mobile App
 * Displays notification when device is offline
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';

interface OfflineNoticeProps {
  onRetry?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ onRetry }) => {
  const [slideAnim] = React.useState(new Animated.Value(-100));

  React.useEffect(() => {
    // Slide down animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      // Slide up animation on unmount
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    };
  }, [slideAnim]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📶</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Ingen internettforbindelse</Text>
          <Text style={styles.message}>
            Du er offline. Endringer vil synkroniseres når du kommer tilbake online.
          </Text>
        </View>

        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
            <Text style={styles.retryText}>Prøv igjen</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  );
};

const styles = StyleSheet.create({
  container: {
<<<<<<< HEAD
    backgroundColor: '#ff6b6b',
    padding: 10,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 14,
=======
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FF6B6B',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50, // Account for status bar
  },
  iconContainer: {
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
    opacity: 0.8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  message: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    lineHeight: 16,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
>>>>>>> 7f4aa3d (🚀 TMS Complete Implementation - Production Ready)
  },
}); 