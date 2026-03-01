/**
 * Restaurant App Navigation Configuration
 * 
 * Root navigation structure for the restaurant management mobile application.
 * Implements modern passwordless-first authentication flow.
 * 
 * Navigation Structure:
 * - AuthStack: Welcome, Social Login, Phone OTP, Biometric screens
 * - MainStack: Authenticated staff screens with drawer navigation
 * 
 * @module restaurant/navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { authService } from '@/shared/services/auth';
import { socialAuthService } from '@/shared/services/social-auth';
import { biometricAuthService } from '@/shared/services/biometric-auth';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { logger } from '@/shared/utils/logger';
import { captureException } from '@/shared/config/sentry';
import { useColors } from '@/shared/contexts/ThemeContext';
import {
  defaultScreenOptions,
  fadeScreenOptions,
  modalScreenOptions,
  scaleFadeScreenOptions,
} from '@/shared/config/navigation-animations';

// ============================================
// AUTH SCREENS (Modern Passwordless-First)
// ============================================
import { 
  WelcomeScreen,
  PhoneAuthScreen,
  PhoneRegisterScreen,
  BiometricEnrollmentScreen,
} from '@/shared/screens/auth';
import LoginScreen from '../screens/auth/LoginScreen';

// ============================================
// MAIN DASHBOARD SCREENS
// ============================================
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import KDSScreen from '../screens/kds/KDSScreen';
import BarmanKDSScreen from '../screens/barman-kds/BarmanKDSScreen';
import WaiterDashboardScreen from '../screens/waiter-dashboard/WaiterDashboardScreen';
import MaitreDashboardScreen from '../screens/maitre-dashboard/MaitreDashboardScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import ReservationsScreen from '../screens/reservations/ReservationsScreen';
import FloorPlanScreen from '../screens/floor-plan/FloorPlanScreen';
import MenuScreen from '../screens/menu/MenuScreen';
import FinancialScreen from '../screens/financial/FinancialScreen';
import TipsScreen from '../screens/tips/TipsScreen';
import StaffScreen from '../screens/staff/StaffScreen';
import HRScreen from '../screens/hr/HRScreen';
import ServiceConfigScreen from '../screens/service-config/ServiceConfigScreen';
import SetupHubScreen from '../screens/setup-hub/SetupHubScreen';

// ============================================
// DETAIL SCREENS
// ============================================
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import ReservationDetailScreen from '../screens/reservations/ReservationDetailScreen';
import TableDetailScreen from '../screens/floor-plan/TableDetailScreen';
import MenuItemDetailScreen from '../screens/menu/MenuItemDetailScreen';
import StaffDetailScreen from '../screens/staff/StaffDetailScreen';
import FinancialReportScreen from '../screens/financial/FinancialReportScreen';
import TipsDistributionScreen from '../screens/tips/TipsDistributionScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Complete auth session for web-based OAuth
WebBrowser.maybeCompleteAuthSession();

// ============================================
// NAVIGATOR INSTANCES
// ============================================
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// ============================================
// AUTH STACK (Passwordless-First)
// ============================================

/**
 * Modern authentication navigation stack for restaurant staff.
 * Prioritizes Social Login and Phone OTP with biometric quick-login.
 */
function AuthStack() {
  const [authLoading, setAuthLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleAppleLogin = useCallback(async () => {
    setAuthLoading(true);
    try {
      const result = await socialAuthService.signInWithApple();
      if (result.success && result.idToken) {
        await authService.socialLogin('apple', result.idToken);
      }
    } catch (error) {
      logger.error('Apple login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  const handleGoogleLogin = useCallback(async () => {
    setAuthLoading(true);
    try {
      const result = await socialAuthService.signInWithGoogle(
        googleRequest,
        googleResponse,
        googlePromptAsync,
      );
      if (result.success && result.idToken) {
        await authService.socialLogin('google', result.idToken);
      }
    } catch (error) {
      logger.error('Google login failed:', error);
    } finally {
      setAuthLoading(false);
    }
  }, [googleRequest, googleResponse, googlePromptAsync]);

  const handlePhoneLogin = useCallback((navigation: any) => {
    navigation.navigate('PhoneAuth');
  }, []);

  const handleBiometricLogin = useCallback(async () => {
    setBiometricLoading(true);
    try {
      const result = await biometricAuthService.authenticate();
      if (!result.success) {
        logger.warn('Biometric login failed:', result.error);
      }
    } catch (error) {
      logger.error('Biometric login error:', error);
    } finally {
      setBiometricLoading(false);
    }
  }, []);

  const handleAuthSuccess = useCallback((result: any) => {
    logger.info('Auth success:', { userId: result.user?.id });
  }, []);

  const handleBiometricPrompt = useCallback((enrollmentToken: string, navigation: any) => {
    navigation.navigate('BiometricEnrollment', { enrollmentToken });
  }, []);

  const handleBiometricComplete = useCallback((navigation: any) => {
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }, []);

  const handleBiometricSkip = useCallback((navigation: any) => {
    navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
  }, []);

  return (
    <Stack.Navigator screenOptions={fadeScreenOptions}>
      {/* Welcome Screen - Entry Point */}
      <Stack.Screen name="Welcome" options={{ headerShown: false }}>
        {(props) => (
          <WelcomeScreen
            {...props}
            onAppleLogin={handleAppleLogin}
            onGoogleLogin={handleGoogleLogin}
            onPhoneLogin={() => handlePhoneLogin(props.navigation)}
            onBiometricLogin={handleBiometricLogin}
            loading={authLoading}
            biometricLoading={biometricLoading}
          />
        )}
      </Stack.Screen>

      {/* Phone OTP Authentication */}
      <Stack.Screen 
        name="PhoneAuth" 
        options={{ headerShown: false, ...modalScreenOptions }}
      >
        {(props) => (
          <PhoneAuthScreen
            {...props}
            onSuccess={handleAuthSuccess}
          />
        )}
      </Stack.Screen>

      {/* Complete Registration After Phone Verification */}
      <Stack.Screen 
        name="PhoneRegister" 
        options={{ headerShown: false }}
      >
        {(props) => (
          <PhoneRegisterScreen
            {...props}
            onSuccess={handleAuthSuccess}
            onBiometricPrompt={(token) => handleBiometricPrompt(token, props.navigation)}
          />
        )}
      </Stack.Screen>

      {/* Biometric Enrollment */}
      <Stack.Screen 
        name="BiometricEnrollment" 
        options={{ headerShown: false }}
      >
        {(props) => (
          <BiometricEnrollmentScreen
            {...props}
            onComplete={() => handleBiometricComplete(props.navigation)}
            onSkip={() => handleBiometricSkip(props.navigation)}
          />
        )}
      </Stack.Screen>

      {/* Legacy Email/Password (Fallback) */}
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ title: 'Login with Email' }}
      />
    </Stack.Navigator>
  );
}

// ============================================
// MAIN STACK NAVIGATOR
// ============================================

/**
 * Main stack navigator containing drawer navigation and detail screens.
 * Provides access to all restaurant management functionality.
 */
function MainStack() {
  return (
    <Stack.Navigator screenOptions={defaultScreenOptions}>
      {/* Drawer Navigation as Root */}
      <Stack.Screen
        name="MainDrawer"
        component={MainDrawer}
        options={{ headerShown: false }}
      />
      
      {/* Detail Screens with custom animations */}
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Detalhes do Pedido', ...scaleFadeScreenOptions }}
      />
      <Stack.Screen
        name="ReservationDetail"
        component={ReservationDetailScreen}
        options={{ title: 'Detalhes da Reserva', ...scaleFadeScreenOptions }}
      />
      <Stack.Screen
        name="TableDetail"
        component={TableDetailScreen}
        options={{ title: 'Detalhes da Mesa', ...scaleFadeScreenOptions }}
      />
      <Stack.Screen
        name="MenuItemDetail"
        component={MenuItemDetailScreen}
        options={{ title: 'Detalhes do Item', ...scaleFadeScreenOptions }}
      />
      <Stack.Screen
        name="StaffDetail"
        component={StaffDetailScreen}
        options={{ title: 'Detalhes do Funcionário', ...scaleFadeScreenOptions }}
      />
      <Stack.Screen
        name="FinancialReport"
        component={FinancialReportScreen}
        options={{ title: 'Relatório Financeiro', ...modalScreenOptions }}
      />
      <Stack.Screen
        name="TipsDistribution"
        component={TipsDistributionScreen}
        options={{ title: 'Distribuição de Gorjetas', ...modalScreenOptions }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Configurações' }}
      />
      <Stack.Screen
        name="ServiceConfig"
        component={ServiceConfigScreen}
        options={{ title: 'Configuração de Serviço' }}
      />
      <Stack.Screen
        name="SetupHub"
        component={SetupHubScreen}
        options={{ title: 'Central de Configuração' }}
      />
    </Stack.Navigator>
  );
}

// ============================================
// MAIN DRAWER NAVIGATOR
// ============================================

/**
 * Main drawer navigation for restaurant management screens.
 * Provides slide-out navigation to all major app sections.
 * Uses semantic theme colors for consistent styling.
 */
function MainDrawer() {
  const colors = useColors();
  
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.foregroundSecondary,
        drawerType: 'slide',
        drawerStyle: {
          backgroundColor: colors.background,
        },
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.foreground,
      }}
    >
      {/* Primary Dashboard */}
      <Drawer.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ drawerLabel: 'Dashboard', title: 'Dashboard' }}
      />
      
      {/* Role-Specific Dashboards */}
      <Drawer.Screen
        name="KDS"
        component={KDSScreen}
        options={{ drawerLabel: 'Kitchen Display', title: 'Kitchen Display System' }}
      />
      <Drawer.Screen
        name="BarmanKDS"
        component={BarmanKDSScreen}
        options={{ drawerLabel: 'Bar Display', title: 'Bar Display System' }}
      />
      <Drawer.Screen
        name="WaiterDashboard"
        component={WaiterDashboardScreen}
        options={{ drawerLabel: 'Waiter Panel', title: 'Waiter Dashboard' }}
      />
      <Drawer.Screen
        name="MaitreDashboard"
        component={MaitreDashboardScreen}
        options={{ drawerLabel: 'Maitre Panel', title: 'Maitre Dashboard' }}
      />
      
      {/* Operations Management */}
      <Drawer.Screen
        name="Orders"
        component={OrdersScreen}
        options={{ drawerLabel: 'Orders', title: 'Orders Management' }}
      />
      <Drawer.Screen
        name="Reservations"
        component={ReservationsScreen}
        options={{ drawerLabel: 'Reservations', title: 'Reservations' }}
      />
      <Drawer.Screen
        name="FloorPlan"
        component={FloorPlanScreen}
        options={{ drawerLabel: 'Floor Plan', title: 'Floor Plan' }}
      />
      
      {/* Content Management */}
      <Drawer.Screen
        name="Menu"
        component={MenuScreen}
        options={{ drawerLabel: 'Menu', title: 'Menu Management' }}
      />
      
      {/* Financial Management */}
      <Drawer.Screen
        name="Financial"
        component={FinancialScreen}
        options={{ drawerLabel: 'Financial', title: 'Financial Reports' }}
      />
      <Drawer.Screen
        name="Tips"
        component={TipsScreen}
        options={{ drawerLabel: 'Tips', title: 'Tips Management' }}
      />
      
      {/* Staff Management */}
      <Drawer.Screen
        name="Staff"
        component={StaffScreen}
        options={{ drawerLabel: 'Staff', title: 'Staff Management' }}
      />
      <Drawer.Screen
        name="HR"
        component={HRScreen}
        options={{ drawerLabel: 'HR', title: 'Human Resources' }}
      />
    </Drawer.Navigator>
  );
}

// ============================================
// ROOT NAVIGATION COMPONENT
// ============================================

/**
 * Root navigation component with authentication state management.
 * Wraps all navigation with ErrorBoundary for crash protection.
 */
export default function Navigation() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
    
    // Listen for auth state changes
    const unsubscribe = authService.onAuthStateChange((authenticated) => {
      setIsAuthenticated(authenticated);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Checks stored authentication state on app launch.
   */
  const checkAuth = async () => {
    try {
      const user = await authService.getStoredUser();
      setIsAuthenticated(!!user);
    } catch (error) {
      logger.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles navigation-level errors by logging to analytics.
   */
  const handleNavigationError = (error: Error, errorInfo: React.ErrorInfo) => {
    logger.error('Navigation error boundary triggered:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  };

  // Show nothing while checking auth (splash screen should be visible)
  if (isLoading) {
    return null;
  }

  return (
    <ErrorBoundary onError={handleNavigationError}>
      <NavigationContainer>
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
    </ErrorBoundary>
  );
}
