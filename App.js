import './i18n';
import React, { useEffect } from 'react';
import { initializeCurrencyService } from './utils/currencyService';
import { initializeRankingService } from './utils/rankingService';
import { MAX_FONT_SIZE_MULTIPLIER } from './utils/textScaling';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import { configureNotifications, requestNotificationPermissions } from './utils/notifications';
import InAppNotification from './components/InAppNotification';

// Configure font scaling for accessibility
// This ensures text scales with user's accessibility settings while preventing layout breaks
if (Text.defaultProps == null) {
  Text.defaultProps = {};
}
Text.defaultProps.maxFontSizeMultiplier = MAX_FONT_SIZE_MULTIPLIER;

// Configure notifications on app start
configureNotifications();

// Import screens and navigators
import HomeScreen from './screens/HomeScreen';
import TabNavigator from './navigation/TabNavigator';

// Auth screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

// Auth Navigator - for unauthenticated users
function AuthNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.background,
        },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// In-app notification overlay (must be inside AppProvider)
function NotificationOverlay() {
  const { inAppNotification, dismissInAppNotification } = useAppContext();

  return (
    <InAppNotification
      visible={!!inAppNotification}
      title={inAppNotification?.title || ''}
      body={inAppNotification?.body || ''}
      onDismiss={dismissInAppNotification}
    />
  );
}

// Request push notification permissions (must be inside AppProvider)
function NotificationPermissionRequester() {
  useEffect(() => {
    requestNotificationPermissions();
  }, []);
  return null;
}

// Main App Navigator - for authenticated users
function MainNavigator() {
  const { theme } = useTheme();

  return (
    <AppProvider>
      <NotificationPermissionRequester />
      <NotificationOverlay />
      <CountryProvider>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="MainTabs" component={TabNavigator} />
        </Stack.Navigator>
      </CountryProvider>
    </AppProvider>
  );
}

// Username Setup Navigator - for users who need to set up their username
function UsernameSetupNavigator() {
  const { theme } = useTheme();
  const { completeUsernameSetup } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <UsernameSetupScreen onComplete={completeUsernameSetup} />
    </View>
  );
}

// Onboarding Navigator - for users who completed username but need onboarding
function OnboardingNavigator() {
  const { theme } = useTheme();
  const { completeOnboarding } = useAuth();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <OnboardingScreen onComplete={completeOnboarding} />
    </View>
  );
}

// Root Navigator - handles auth state
function RootNavigator() {
  const { user, initializing, needsUsername, needsOnboarding, isGuest } = useAuth();
  const { theme, isDarkMode } = useTheme();

  // Initialize currency and ranking services on app start
  useEffect(() => {
    initializeCurrencyService();
    initializeRankingService();
  }, []);

  // Only show brief loading on first initialization (max 1.5 seconds)
  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <Ionicons name="earth" size={60} color={theme.primary} style={{ marginBottom: 15 }} />
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: theme.primary }}>Ferdi</Text>
      </View>
    );
  }

  // If user is logged in but needs to set up username, show username setup
  if (user && needsUsername) {
    return (
      <>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <UsernameSetupNavigator />
      </>
    );
  }

  // If user is logged in but needs onboarding, show onboarding
  if (user && needsOnboarding) {
    return (
      <>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <OnboardingNavigator />
      </>
    );
  }

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer>
        {(user || isGuest) ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
