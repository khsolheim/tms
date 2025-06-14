/**
 * BiometricService - Mobile Biometric Authentication
 * 
 * Håndterer biometrisk autentisering for mobile enheter (Touch ID, Face ID, Fingerprint)
 */

interface BiometricCapabilities {
  touchId: boolean;
  faceId: boolean;
  fingerprint: boolean;
  iris: boolean;
  voice: boolean;
}

interface BiometricAuthOptions {
  promptMessage?: string;
  subtitle?: string;
  description?: string;
  fallbackEnabled?: boolean;
  negativeButtonText?: string;
  disableDeviceFallback?: boolean;
}

interface AuthResult {
  success: boolean;
  error?: string;
  details?: any;
}

export class BiometricService {
  private static instance: BiometricService;
  private isInitialized = false;
  private capabilities: BiometricCapabilities = {
    touchId: false,
    faceId: false,
    fingerprint: false,
    iris: false,
    voice: false
  };

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Initialize biometric service and detect capabilities
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Detect platform capabilities
      await this.detectCapabilities();
      
      this.isInitialized = true;
      console.log('[BiometricService] Initialized with capabilities:', this.capabilities);
    } catch (error) {
      console.error('[BiometricService] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Check if biometric authentication is available
   */
  async isAvailable(): Promise<boolean> {
    await this.initialize();
    
    return (
      this.capabilities.touchId ||
      this.capabilities.faceId ||
      this.capabilities.fingerprint ||
      this.capabilities.iris ||
      this.capabilities.voice
    );
  }

  /**
   * Static method to check if biometric authentication is available
   */
  static async isAvailable(): Promise<boolean> {
    const instance = BiometricService.getInstance();
    return await instance.isAvailable();
  }

  /**
   * Get available biometric types
   */
  getCapabilities(): BiometricCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get human-readable biometric type names
   */
  getAvailableTypes(): string[] {
    const types: string[] = [];
    
    if (this.capabilities.touchId) types.push('Touch ID');
    if (this.capabilities.faceId) types.push('Face ID');
    if (this.capabilities.fingerprint) types.push('Fingerprint');
    if (this.capabilities.iris) types.push('Iris');
    if (this.capabilities.voice) types.push('Voice');
    
    return types;
  }

  /**
   * Authenticate user with biometrics
   */
  async authenticate(options: BiometricAuthOptions = {}): Promise<AuthResult> {
    if (!await this.isAvailable()) {
      return {
        success: false,
        error: 'Biometric authentication not available'
      };
    }

    try {
      // Default options
      const authOptions = {
        promptMessage: options.promptMessage || 'Bekreft din identitet',
        subtitle: options.subtitle || 'Bruk biometrisk autentisering for å fortsette',
        description: options.description || 'Plasser fingeren på sensoren eller se på kameraet',
        fallbackEnabled: options.fallbackEnabled ?? true,
        negativeButtonText: options.negativeButtonText || 'Avbryt',
        disableDeviceFallback: options.disableDeviceFallback ?? false
      };

      // Simulate biometric authentication
      // In a real React Native app, this would use react-native-biometrics
      const result = await this.performBiometricAuth(authOptions);
      
      if (result.success) {
        console.log('[BiometricService] Authentication successful');
        
        // Store successful authentication
        await this.storeAuthResult(result);
        
        return {
          success: true,
          details: result.details
        };
      } else {
        console.log('[BiometricService] Authentication failed:', result.error);
        
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error('[BiometricService] Authentication error:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Check if user has enrolled biometrics
   */
  async hasEnrolledBiometrics(): Promise<boolean> {
    if (!await this.isAvailable()) return false;

    try {
      // Simulate checking for enrolled biometrics
      // In React Native, this would check device settings
      return this.simulateEnrollmentCheck();
    } catch (error) {
      console.error('[BiometricService] Failed to check enrollment:', error);
      return false;
    }
  }

  /**
   * Enable biometric authentication for the app
   */
  async enableBiometricAuth(): Promise<boolean> {
    if (!await this.isAvailable()) {
      throw new Error('Biometric authentication not available');
    }

    if (!await this.hasEnrolledBiometrics()) {
      throw new Error('No biometrics enrolled on device');
    }

    try {
      // Store biometric preference using React Native storage
      const EncryptedStorage = require('react-native-encrypted-storage');
      await EncryptedStorage.setItem('tms_biometric_enabled', 'true');
      console.log('[BiometricService] Biometric authentication enabled');
      
      return true;
    } catch (error) {
      console.error('[BiometricService] Failed to enable biometric auth:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication for the app
   */
  async disableBiometricAuth(): Promise<boolean> {
    try {
      const EncryptedStorage = require('react-native-encrypted-storage');
      await EncryptedStorage.removeItem('tms_biometric_enabled');
      console.log('[BiometricService] Biometric authentication disabled');
      
      return true;
    } catch (error) {
      console.error('[BiometricService] Failed to disable biometric auth:', error);
      return false;
    }
  }

  /**
   * Check if biometric authentication is enabled for the app
   */
  async isBiometricEnabled(): Promise<boolean> {
    try {
      const EncryptedStorage = require('react-native-encrypted-storage');
      const enabled = await EncryptedStorage.getItem('tms_biometric_enabled');
      return enabled === 'true';
    } catch (error) {
      console.error('[BiometricService] Failed to check biometric status:', error);
      return false;
    }
  }

  /**
   * Get biometric authentication statistics
   */
  async getAuthStats() {
    try {
      const EncryptedStorage = require('react-native-encrypted-storage');
      const stats = await EncryptedStorage.getItem('tms_biometric_stats');
      
      if (stats) {
        return JSON.parse(stats);
      }
      
      return {
        totalAttempts: 0,
        successfulAttempts: 0,
        failedAttempts: 0,
        lastSuccessfulAuth: null,
        lastFailedAuth: null
      };
    } catch (error) {
      console.error('[BiometricService] Failed to get auth stats:', error);
      return null;
    }
  }

  /**
   * Detect platform biometric capabilities
   */
  private async detectCapabilities(): Promise<void> {
    try {
      // Simulate platform detection for React Native
      // In a real React Native app, this would use react-native-biometrics
      
      const { Platform } = require('react-native');
      
      if (Platform.OS === 'ios') {
        // iOS device
        this.capabilities.touchId = true;
        this.capabilities.faceId = true; // Newer iOS devices
      } else if (Platform.OS === 'android') {
        // Android device
        this.capabilities.fingerprint = true;
        this.capabilities.iris = false; // Some Samsung devices
      }
    } catch (error) {
      console.error('[BiometricService] Platform detection failed:', error);
      // Default to no capabilities if detection fails
    }
  }

  /**
   * Perform actual biometric authentication
   */
  private async performBiometricAuth(options: any): Promise<AuthResult> {
    // Simulate biometric authentication process
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        
        if (success) {
          resolve({
            success: true,
            details: {
              biometricType: this.getPrimaryBiometricType(),
              timestamp: new Date().toISOString(),
              deviceId: this.getDeviceId()
            }
          });
        } else {
          resolve({
            success: false,
            error: 'Biometric authentication failed'
          });
        }
      }, 1500); // Simulate authentication delay
    });
  }

  /**
   * Store authentication result
   */
  private async storeAuthResult(result: AuthResult): Promise<void> {
    try {
      const stats = await this.getAuthStats();
      
      const updatedStats = {
        ...stats,
        totalAttempts: stats.totalAttempts + 1,
        successfulAttempts: result.success ? stats.successfulAttempts + 1 : stats.successfulAttempts,
        failedAttempts: result.success ? stats.failedAttempts : stats.failedAttempts + 1,
        lastSuccessfulAuth: result.success ? new Date().toISOString() : stats.lastSuccessfulAuth,
        lastFailedAuth: result.success ? stats.lastFailedAuth : new Date().toISOString()
      };
      
      const EncryptedStorage = require('react-native-encrypted-storage');
      await EncryptedStorage.setItem('tms_biometric_stats', JSON.stringify(updatedStats));
    } catch (error) {
      console.error('[BiometricService] Failed to store auth result:', error);
    }
  }

  /**
   * Check if biometrics are enrolled (simulation)
   */
  private simulateEnrollmentCheck(): boolean {
    // Simulate that 80% of devices have biometrics enrolled
    return Math.random() > 0.2;
  }

  /**
   * Get primary biometric type
   */
  private getPrimaryBiometricType(): string {
    if (this.capabilities.faceId) return 'faceId';
    if (this.capabilities.touchId) return 'touchId';
    if (this.capabilities.fingerprint) return 'fingerprint';
    if (this.capabilities.iris) return 'iris';
    if (this.capabilities.voice) return 'voice';
    return 'unknown';
  }

  /**
   * Get device identifier
   */
  private getDeviceId(): string {
    // In React Native, this would use a proper device ID library
    return 'device_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const biometricService = BiometricService.getInstance();
export default biometricService; 