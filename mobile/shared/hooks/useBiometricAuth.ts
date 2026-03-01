import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';
import logger from '../utils/logger';

export type BiometricType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | 'None';

interface BiometricAuthResult {
  success: boolean;
  error?: string;
}

export const useBiometricAuth = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('None');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  /**
   * Check if biometric authentication is available on device
   */
  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsAvailable(compatible);

      if (compatible) {
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsEnrolled(enrolled);

        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const type = getBiometricType(types);
        setBiometricType(type);

        logger.debug('Biometric Auth Available:', {
          compatible,
          enrolled,
          type,
          types,
        });
      }
    } catch (error) {
      logger.error('Error checking biometric availability:', error);
      setIsAvailable(false);
    }
  };

  /**
   * Get human-readable biometric type
   */
  const getBiometricType = (
    types: LocalAuthentication.AuthenticationType[]
  ): BiometricType => {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return Platform.OS === 'ios' ? 'FaceID' : 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return Platform.OS === 'ios' ? 'TouchID' : 'Fingerprint';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'None';
  };

  /**
   * Authenticate user with biometrics
   */
  const authenticate = async (
    promptMessage?: string,
    fallbackLabel?: string
  ): Promise<BiometricAuthResult> => {
    try {
      // Check if biometrics are available
      if (!isAvailable) {
        return {
          success: false,
          error: 'Biometric authentication is not available on this device',
        };
      }

      if (!isEnrolled) {
        return {
          success: false,
          error: 'No biometric data enrolled. Please set up biometric authentication in your device settings.',
        };
      }

      // Authenticate
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || getBiometricPromptMessage(),
        fallbackLabel: fallbackLabel || 'Use Passcode',
        disableDeviceFallback: false,
        cancelLabel: 'Cancel',
      });

      if (result.success) {
        logger.info('Biometric authentication successful');
        return { success: true };
      } else {
        logger.warn('Biometric authentication failed:', result.error);
        return {
          success: false,
          error: getBiometricErrorMessage(result.error),
        };
      }
    } catch (error: any) {
      logger.error('Biometric authentication error:', error);
      return {
        success: false,
        error: error.message || 'Authentication failed',
      };
    }
  };

  /**
   * Get prompt message based on biometric type
   */
  const getBiometricPromptMessage = (): string => {
    switch (biometricType) {
      case 'FaceID':
        return 'Authenticate with Face ID';
      case 'TouchID':
        return 'Authenticate with Touch ID';
      case 'Fingerprint':
        return 'Authenticate with Fingerprint';
      case 'Iris':
        return 'Authenticate with Iris';
      default:
        return 'Authenticate to continue';
    }
  };

  /**
   * Get user-friendly error message
   */
  const getBiometricErrorMessage = (error?: string): string => {
    if (!error) return 'Authentication failed';

    switch (error) {
      case 'user_cancel':
        return 'Authentication cancelled by user';
      case 'system_cancel':
        return 'Authentication cancelled by system';
      case 'lockout':
        return 'Too many failed attempts. Try again later.';
      case 'not_enrolled':
        return 'No biometric data enrolled';
      case 'not_available':
        return 'Biometric authentication not available';
      default:
        return 'Authentication failed. Please try again.';
    }
  };

  /**
   * Get friendly name for biometric type (for UI display)
   */
  const getBiometricDisplayName = (): string => {
    switch (biometricType) {
      case 'FaceID':
        return 'Face ID';
      case 'TouchID':
        return 'Touch ID';
      case 'Fingerprint':
        return 'Fingerprint';
      case 'Iris':
        return 'Iris Scanner';
      default:
        return 'Biometric';
    }
  };

  return {
    // State
    isAvailable,
    isEnrolled,
    biometricType,

    // Methods
    authenticate,
    checkBiometricAvailability,
    getBiometricDisplayName,
  };
};

export default useBiometricAuth;
