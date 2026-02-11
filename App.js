import './i18n';
import React, { useEffect } from 'react';
import { initializeCurrencyService } from './utils/currencyService';
import { initializeRankingService } from './utils/rankingService';
import { MAX_FONT_SIZE_MULTIPLIER } from './utils/textScaling';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity, View, Image, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, useAppContext } from './context/AppContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CountryProvider } from './context/CountryContext';
import { presetAvatars } from './utils/presetAvatars';
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

// Import all screens
import HomeScreen from './screens/HomeScreen';
import DashboardScreen from './screens/DashboardScreen';
import MyTripsScreen from './screens/MyTripsScreen';
import CreateTripScreen from './screens/CreateTripScreen';
import TripDetailScreen from './screens/TripDetailScreen';
import BudgetMakerScreen from './screens/BudgetMakerScreen';
import MyBudgetScreen from './screens/MyBudgetScreen';
import TravelMapperScreen from './screens/TravelMapperScreen';
import AddCompletedTripScreen from './screens/AddCompletedTripScreen';
import YourStatsScreen from './screens/YourStatsScreen';
import WorldRankScreen from './screens/WorldRankScreen';
import CountryDetailScreen from './screens/CountryDetailScreen';
import ManageCountriesScreen from './screens/ManageCountriesScreen';
import ManageCitiesScreen from './screens/ManageCitiesScreen';
import WorldMapScreen from './screens/WorldMapScreen';
import CompletedTripsScreen from './screens/CompletedTripsScreen';
import PublicProfileScreen from './screens/PublicProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SearchScreen from './screens/SearchScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';
import TravelBuddiesScreen from './screens/TravelBuddiesScreen';
import SettingsScreen from './screens/SettingsScreen';
import ActiveTripScreen from './screens/ActiveTripScreen';

// Auth screens
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import UsernameSetupScreen from './screens/UsernameSetupScreen';
import OnboardingScreen from './screens/OnboardingScreen';

const Stack = createNativeStackNavigator();

// Profile Avatar Component
function ProfileAvatar() {
  const { theme } = useTheme();
  const { profile } = useAppContext();

  if (profile.avatarType === 'custom' && profile.avatar) {
    // Custom uploaded image
    return (
      <Image
        source={{ uri: profile.avatar }}
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: theme.primary,
        }}
      />
    );
  } else if (profile.avatarType === 'preset' && profile.avatar) {
    // Preset emoji avatar
    const presetAvatar = presetAvatars.find(a => a.id === profile.avatar);
    if (presetAvatar) {
      return (
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: theme.cardBackground,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.primary,
          }}
        >
          <Text style={{ fontSize: 16 }}>{presetAvatar.value}</Text>
        </View>
      );
    }
  }
  // Default icon
  return (
    <Ionicons
      name="person-circle"
      size={28}
      color={theme.primary}
    />
  );
}

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
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { signOut } = useAuth();

  const getDashboardHeaderButtons = (navigation) => ({
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
        <TouchableOpacity onPress={toggleTheme}>
          <Ionicons
            name={isDarkMode ? "sunny" : "moon"}
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Search')}>
          <Ionicons
            name="search"
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <ProfileAvatar />
        </TouchableOpacity>
      </View>
    ),
  });

  const getHeaderButtons = (navigation) => ({
    headerRight: () => (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
        <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
          <Ionicons name="home" size={24} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <ProfileAvatar />
        </TouchableOpacity>
      </View>
    ),
  });

  return (
    <AppProvider>
      <NotificationPermissionRequester />
      <NotificationOverlay />
      <CountryProvider>
        <Stack.Navigator
          initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={({ navigation }) => ({
            title: 'Dashboard',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('Home')}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.primary} />
              </TouchableOpacity>
            ),
            ...getDashboardHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="MyTrips"
          component={MyTripsScreen}
          options={({ navigation }) => ({
            title: 'My Trips',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="CreateTrip"
          component={CreateTripScreen}
          options={({ navigation }) => ({
            title: 'Create Trip',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="TripDetail"
          component={TripDetailScreen}
          options={({ navigation }) => ({
            title: 'Trip Details',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="ActiveTrip"
          component={ActiveTripScreen}
          options={({ navigation }) => ({
            title: 'Active Trip',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="BudgetMaker"
          component={BudgetMakerScreen}
          options={({ navigation }) => ({
            title: 'Budget Maker',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="MyBudget"
          component={MyBudgetScreen}
          options={({ navigation }) => ({
            title: 'My Budgets',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="TravelMapper"
          component={TravelMapperScreen}
          options={({ navigation }) => ({
            title: 'Travel Mapper',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="AddCompletedTrip"
          component={AddCompletedTripScreen}
          options={({ navigation }) => ({
            title: 'Add Completed Trip',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="YourStats"
          component={YourStatsScreen}
          options={({ navigation }) => ({
            title: 'Your Stats',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="WorldRank"
          component={WorldRankScreen}
          options={({ navigation }) => ({
            title: 'World Rank',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="CountryDetail"
          component={CountryDetailScreen}
          options={({ navigation }) => ({
            title: 'Country Details',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="ManageCountries"
          component={ManageCountriesScreen}
          options={({ navigation }) => ({
            title: 'Manage Countries',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="ManageCities"
          component={ManageCitiesScreen}
          options={({ navigation }) => ({
            title: 'Manage Cities',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="WorldMap"
          component={WorldMapScreen}
          options={({ navigation }) => ({
            title: 'World Map',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="CompletedTrips"
          component={CompletedTripsScreen}
          options={({ navigation }) => ({
            title: 'Completed Trips',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="Profile"
          component={PublicProfileScreen}
          options={({ navigation }) => ({
            title: 'Profile',
            headerRight: () => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
                <TouchableOpacity onPress={() => navigation.navigate('Dashboard')}>
                  <Ionicons name="home" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
                  <Ionicons name="settings-outline" size={24} color={theme.primary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                  <Ionicons name="create" size={24} color={theme.primary} />
                </TouchableOpacity>
              </View>
            ),
          })}
        />
        <Stack.Screen
          name="EditProfile"
          component={EditProfileScreen}
          options={({ navigation }) => ({
            title: 'Edit Profile',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={({ navigation }) => ({
            title: 'Search Travelers',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="Leaderboard"
          component={LeaderboardScreen}
          options={({ navigation }) => ({
            title: 'Leaderboard',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="TravelBuddies"
          component={TravelBuddiesScreen}
          options={({ navigation }) => ({
            title: 'Travel Buddies',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="PublicProfile"
          component={PublicProfileScreen}
          options={({ navigation }) => ({
            title: 'Profile',
            ...getHeaderButtons(navigation),
          })}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={({ navigation }) => ({
            title: 'Settings',
            ...getHeaderButtons(navigation),
          })}
        />
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
