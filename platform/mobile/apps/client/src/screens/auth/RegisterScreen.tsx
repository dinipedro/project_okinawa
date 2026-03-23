import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { authService } from '@/shared/services/auth';
import { useScreenTracking, useAnalytics } from '@/shared/hooks/useAnalytics';
import { useAnalyticsContext } from '@/shared/contexts/AnalyticsContext';
import { useI18n } from '@/shared/hooks/useI18n';
import { useColors } from '@okinawa/shared/contexts/ThemeContext';
import { registerSchema, validateForm, type RegisterFormData } from '@/shared/validation/schemas';
import Haptic from '@/shared/utils/haptics';

export default function RegisterScreen({ navigation }: any) {
  useScreenTracking('Register');
  const { t } = useI18n();
  const colors = useColors();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const analytics = useAnalytics();
  const { setUser } = useAnalyticsContext();

  const clearFieldError = useCallback((field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  }, [fieldErrors]);

  const validateFields = useCallback((): boolean => {
    const result = validateForm(registerSchema, { 
      fullName, 
      email, 
      password, 
      confirmPassword 
    });
    
    if (!result.success) {
      setFieldErrors(result.errors);
      Haptic.errorNotification();
      return false;
    }
    
    setFieldErrors({});
    return true;
  }, [fullName, email, password, confirmPassword]);

  const handleRegister = async () => {
    // Validate with Zod before submitting
    if (!validateFields()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authService.register(email, password, fullName);

      await analytics.logSignUp('email');

      if (result?.user) {
        await setUser(result.user.id, {
          account_type: result.user.role || 'customer',
        });
      }

      Haptic.successNotification();
      navigation.replace('Main');
    } catch (err: any) {
      setError(err.response?.data?.message || t('auth.registerFailed'));
      Haptic.errorNotification();

      await analytics.logError('Registration failed', err.code || 'REGISTER_ERROR', false);
    } finally {
      setLoading(false);
    }
  };

  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.title}>
        {t('auth.createAccount')}
      </Text>

      <TextInput
        label={t('auth.fullName')}
        value={fullName}
        onChangeText={(text) => {
          setFullName(text);
          clearFieldError('fullName');
        }}
        style={styles.input}
        error={!!fieldErrors.fullName}
      />
      {fieldErrors.fullName ? <HelperText type="error">{fieldErrors.fullName}</HelperText> : null}

      <TextInput
        label={t('auth.email')}
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          clearFieldError('email');
        }}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        error={!!fieldErrors.email}
      />
      {fieldErrors.email ? <HelperText type="error">{fieldErrors.email}</HelperText> : null}

      <TextInput
        label={t('auth.password')}
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          clearFieldError('password');
        }}
        secureTextEntry
        style={styles.input}
        error={!!fieldErrors.password}
      />
      {fieldErrors.password ? <HelperText type="error">{fieldErrors.password}</HelperText> : null}

      <TextInput
        label={t('auth.confirmPassword')}
        value={confirmPassword}
        onChangeText={(text) => {
          setConfirmPassword(text);
          clearFieldError('confirmPassword');
        }}
        secureTextEntry
        style={styles.input}
        error={!!fieldErrors.confirmPassword}
      />
      {fieldErrors.confirmPassword ? <HelperText type="error">{fieldErrors.confirmPassword}</HelperText> : null}

      {error ? <HelperText type="error">{error}</HelperText> : null}

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        style={styles.button}
      >
        {t('auth.register')}
      </Button>

      <Button onPress={() => navigation.navigate('Login')}>
        {t('auth.hasAccount')}
      </Button>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    marginBottom: 30,
    textAlign: 'center',
    color: colors.foreground,
  },
  input: {
    marginBottom: 8,
    backgroundColor: colors.card,
  },
  button: {
    marginTop: 10,
    marginBottom: 20,
  },
});
