/**
 * PhoneRegisterScreen - Complete Registration After Phone Verification
 * 
 * Collects additional user information after phone number is verified.
 * Follows passwordless-first approach with optional email.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, IconButton, HelperText, Checkbox } from 'react-native-paper';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { otpAuthService } from '@/shared/services/otp-auth';
import { validateForm, phoneRegisterSchema } from '@/shared/validation/schemas';
import Haptic from '@/shared/utils/haptics';
import { useScreenTracking } from '@/shared/hooks/useAnalytics';

interface PhoneRegisterScreenProps {
  navigation: any;
  route: {
    params?: {
      tempToken?: string;
      phoneNumber?: string;
    };
  };
  onSuccess: (result: any) => void;
  onBiometricPrompt: (enrollmentToken: string) => void;
}

export const PhoneRegisterScreen: React.FC<PhoneRegisterScreenProps> = ({
  navigation,
  route,
  onSuccess,
  onBiometricPrompt,
}) => {
  useScreenTracking('PhoneRegister');
  const { t } = useI18n();
  const colors = useColors();
  
  const tempToken = route.params?.tempToken;
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const styles = useMemo(() => createStyles(colors), [colors]);

  const clearFieldError = useCallback((field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

  const validateFields = useCallback((): boolean => {
    const result = validateForm(phoneRegisterSchema, {
      fullName,
      email: email || undefined,
      birthDate: birthDate || undefined,
    });

    if (!result.success) {
      setFieldErrors(result.errors);
      Haptic.errorNotification();
      return false;
    }

    if (!acceptTerms) {
      setError(t('auth.acceptTermsRequired') || 'Please accept the terms of service');
      Haptic.errorNotification();
      return false;
    }

    setFieldErrors({});
    setError('');
    return true;
  }, [fullName, email, birthDate, acceptTerms, t]);

  const handleRegister = async () => {
    if (!validateFields()) return;
    if (!tempToken) {
      setError('Registration session expired. Please start again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await otpAuthService.completeRegistration({
        tempToken,
        fullName,
        email: email || undefined,
        birthDate: birthDate || undefined,
      });

      if (result.success) {
        Haptic.successNotification();
        
        // Prompt for biometric enrollment if token available
        if (result.biometricEnrollmentToken) {
          onBiometricPrompt(result.biometricEnrollmentToken);
        } else {
          onSuccess(result);
        }
      } else {
        setError(result.message || t('auth.registerFailed'));
        Haptic.errorNotification();
      }
    } catch (err: any) {
      setError(err.message || t('auth.registerFailed'));
      Haptic.errorNotification();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          {t('auth.completeProfile') || 'Complete your profile'}
        </Text>
        <Text style={styles.subtitle}>
          {t('auth.profileDescription') || 'Tell us a bit about yourself'}
        </Text>

        {/* Full Name */}
        <TextInput
          mode="outlined"
          label={t('auth.fullName') || 'Full Name'}
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            clearFieldError('fullName');
          }}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          error={!!fieldErrors.fullName}
          autoFocus
          autoCapitalize="words"
          autoComplete="name"
        />
        {fieldErrors.fullName && (
          <HelperText type="error">{fieldErrors.fullName}</HelperText>
        )}

        {/* Email (Optional) */}
        <TextInput
          mode="outlined"
          label={t('auth.emailOptional') || 'Email (optional)'}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            clearFieldError('email');
          }}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          error={!!fieldErrors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        {fieldErrors.email && (
          <HelperText type="error">{fieldErrors.email}</HelperText>
        )}
        <Text style={styles.helperText}>
          {t('auth.emailHelper') || 'Add email for account recovery and receipts'}
        </Text>

        {/* Birth Date (Optional) */}
        <TextInput
          mode="outlined"
          label={t('auth.birthDateOptional') || 'Birth Date (optional)'}
          value={birthDate}
          onChangeText={setBirthDate}
          style={styles.input}
          outlineStyle={styles.inputOutline}
          placeholder="DD/MM/YYYY"
          keyboardType="numeric"
        />

        {/* Terms and Conditions */}
        <View style={styles.termsContainer}>
          <Checkbox
            status={acceptTerms ? 'checked' : 'unchecked'}
            onPress={() => {
              setAcceptTerms(!acceptTerms);
              setError('');
              Haptic.lightImpact();
            }}
          />
          <Text style={styles.termsText}>
            {t('auth.acceptTermsPrefix') || 'I accept the'}{' '}
            <Text style={styles.termsLink}>
              {t('auth.termsOfService') || 'Terms of Service'}
            </Text>
            {' '}{t('auth.and') || 'and'}{' '}
            <Text style={styles.termsLink}>
              {t('auth.privacyPolicy') || 'Privacy Policy'}
            </Text>
          </Text>
        </View>

        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          disabled={loading || !fullName || !acceptTerms}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {t('auth.createAccount') || 'Create Account'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  backButton: {
    margin: 0,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.foreground,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginBottom: 32,
  },
  input: {
    marginBottom: 4,
    backgroundColor: colors.card,
  },
  inputOutline: {
    borderRadius: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginBottom: 16,
    marginLeft: 4,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    lineHeight: 20,
  },
  termsLink: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    borderRadius: 12,
    marginTop: 16,
  },
  buttonContent: {
    height: 56,
  },
});

export default PhoneRegisterScreen;
