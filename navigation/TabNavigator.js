import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import TabProfileAvatar from '../components/TabProfileAvatar';

// Import all screens
import DashboardScreen from '../screens/DashboardScreen';
import MyTripsScreen from '../screens/MyTripsScreen';
import CreateTripScreen from '../screens/CreateTripScreen';
import TripDetailScreen from '../screens/TripDetailScreen';
import BudgetMakerScreen from '../screens/BudgetMakerScreen';
import MyBudgetScreen from '../screens/MyBudgetScreen';
import TravelMapperScreen from '../screens/TravelMapperScreen';
import AddCompletedTripScreen from '../screens/AddCompletedTripScreen';
import YourStatsScreen from '../screens/YourStatsScreen';
import WorldRankScreen from '../screens/WorldRankScreen';
import CountryDetailScreen from '../screens/CountryDetailScreen';
import ManageCountriesScreen from '../screens/ManageCountriesScreen';
import ManageCitiesScreen from '../screens/ManageCitiesScreen';
import WorldMapScreen from '../screens/WorldMapScreen';
import CompletedTripsScreen from '../screens/CompletedTripsScreen';
import PublicProfileScreen from '../screens/PublicProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SearchScreen from '../screens/SearchScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import TravelBuddiesScreen from '../screens/TravelBuddiesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import ActiveTripScreen from '../screens/ActiveTripScreen';
import LocalMapScreen from '../screens/LocalMapScreen';

const Tab = createBottomTabNavigator();
const DashboardStack = createNativeStackNavigator();
const WorldInfoStack = createNativeStackNavigator();
const TravelMapperStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// Shared screen options for all stacks
function getCommonScreenOptions(theme) {
  return {
    headerStyle: { backgroundColor: theme.background },
    headerTintColor: theme.primary,
    headerTitleStyle: { fontWeight: 'bold' },
    contentStyle: { backgroundColor: theme.background },
  };
}

// ===== DASHBOARD TAB STACK =====
function DashboardStackScreen() {
  const { theme, isDarkMode, toggleTheme } = useTheme();

  return (
    <DashboardStack.Navigator screenOptions={getCommonScreenOptions(theme)}>
      <DashboardStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={({ navigation }) => ({
          title: 'Dashboard',
          headerLeft: () => null,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
              <TouchableOpacity onPress={toggleTheme}>
                <Ionicons name={isDarkMode ? "sunny" : "moon"} size={24} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.navigate('Search')}>
                <Ionicons name="search" size={24} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ),
        })}
      />
      <DashboardStack.Screen name="MyTrips" component={MyTripsScreen} options={{ title: 'My Trips' }} />
      <DashboardStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: 'Create Trip' }} />
      <DashboardStack.Screen name="TripDetail" component={TripDetailScreen} options={{ title: 'Trip Details' }} />
      <DashboardStack.Screen name="ActiveTrip" component={ActiveTripScreen} options={{ title: 'Active Trip' }} />
      <DashboardStack.Screen name="AddCompletedTrip" component={AddCompletedTripScreen} options={{ title: 'Add Completed Trip' }} />
      <DashboardStack.Screen name="CompletedTrips" component={CompletedTripsScreen} options={{ title: 'Completed Trips' }} />
      <DashboardStack.Screen name="YourStats" component={YourStatsScreen} options={{ title: 'Your Stats' }} />
      <DashboardStack.Screen name="BudgetMaker" component={BudgetMakerScreen} options={{ title: 'Budget Maker' }} />
      <DashboardStack.Screen name="MyBudget" component={MyBudgetScreen} options={{ title: 'My Budgets' }} />
      <DashboardStack.Screen name="LocalMap" component={LocalMapScreen} options={{ headerShown: false }} />
      <DashboardStack.Screen name="Search" component={SearchScreen} options={{ title: 'Search Travelers' }} />
      <DashboardStack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Leaderboard' }} />
      <DashboardStack.Screen name="TravelBuddies" component={TravelBuddiesScreen} options={{ title: 'Travel Buddies' }} />
      <DashboardStack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Profile' }} />
      {/* Duplicated for cross-tab navigation from CompletedTrips, TripDetail, etc. */}
      <DashboardStack.Screen name="CountryDetail" component={CountryDetailScreen} options={{ title: 'Country Details' }} />
      <DashboardStack.Screen name="ManageCountries" component={ManageCountriesScreen} options={{ title: 'Manage Countries' }} />
      <DashboardStack.Screen name="ManageCities" component={ManageCitiesScreen} options={{ title: 'Manage Cities' }} />
    </DashboardStack.Navigator>
  );
}

// ===== WORLD INFO TAB STACK =====
function WorldInfoStackScreen() {
  const { theme } = useTheme();

  return (
    <WorldInfoStack.Navigator screenOptions={getCommonScreenOptions(theme)}>
      <WorldInfoStack.Screen name="WorldRank" component={WorldRankScreen} options={{ title: 'World Info', headerLeft: () => null }} />
      <WorldInfoStack.Screen name="CountryDetail" component={CountryDetailScreen} options={{ title: 'Country Details' }} />
      <WorldInfoStack.Screen name="ManageCountries" component={ManageCountriesScreen} options={{ title: 'Manage Countries' }} />
      <WorldInfoStack.Screen name="ManageCities" component={ManageCitiesScreen} options={{ title: 'Manage Cities' }} />
      <WorldInfoStack.Screen name="WorldMap" component={WorldMapScreen} options={{ title: 'World Map' }} />
    </WorldInfoStack.Navigator>
  );
}

// ===== TRAVEL MAPPER TAB STACK =====
function TravelMapperStackScreen() {
  const { theme } = useTheme();

  return (
    <TravelMapperStack.Navigator screenOptions={getCommonScreenOptions(theme)}>
      <TravelMapperStack.Screen name="TravelMapper" component={TravelMapperScreen} options={{ title: 'Travel Mapper', headerLeft: () => null }} />
      <TravelMapperStack.Screen name="CreateTrip" component={CreateTripScreen} options={{ title: 'Create Trip' }} />
    </TravelMapperStack.Navigator>
  );
}

// ===== PROFILE TAB STACK =====
function ProfileStackScreen() {
  const { theme } = useTheme();

  return (
    <ProfileStack.Navigator screenOptions={getCommonScreenOptions(theme)}>
      <ProfileStack.Screen
        name="Profile"
        component={PublicProfileScreen}
        options={({ navigation }) => ({
          title: 'Profile',
          headerLeft: () => null,
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 15, marginRight: 10 }}>
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
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
      {/* Duplicated for cross-tab navigation */}
      <ProfileStack.Screen name="MyTrips" component={MyTripsScreen} options={{ title: 'My Trips' }} />
      <ProfileStack.Screen name="TravelBuddies" component={TravelBuddiesScreen} options={{ title: 'Travel Buddies' }} />
      <ProfileStack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Profile' }} />
    </ProfileStack.Navigator>
  );
}

// Placeholder for center Create tab (never renders - press is intercepted)
function CreateTabPlaceholder() {
  return null;
}

// ===== MAIN TAB NAVIGATOR =====
export default function TabNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingBottom: Math.max(insets.bottom, 5),
          paddingTop: 5,
          height: 60 + Math.max(insets.bottom, 5),
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardStackScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            // Reset to Dashboard root when already on this tab
            const state = navigation.getState();
            const tabRoute = state.routes.find(r => r.name === route.name);
            if (tabRoute?.state?.index > 0) {
              e.preventDefault();
              navigation.navigate(route.name, { screen: 'Dashboard' });
            }
          },
        })}
      />
      <Tab.Screen
        name="WorldInfoTab"
        component={WorldInfoStackScreen}
        options={{
          tabBarLabel: 'World Info',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="globe" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const tabRoute = state.routes.find(r => r.name === route.name);
            if (tabRoute?.state?.index > 0) {
              e.preventDefault();
              navigation.navigate(route.name, { screen: 'WorldRank' });
            }
          },
        })}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateTabPlaceholder}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            }}>
              <Ionicons name="add" size={28} color="#fff" />
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('DashboardTab', { screen: 'CreateTrip' });
          },
        })}
      />
      <Tab.Screen
        name="TravelMapperTab"
        component={TravelMapperStackScreen}
        options={{
          tabBarLabel: 'Mapper',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const tabRoute = state.routes.find(r => r.name === route.name);
            if (tabRoute?.state?.index > 0) {
              e.preventDefault();
              navigation.navigate(route.name, { screen: 'TravelMapper' });
            }
          },
        })}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, size }) => (
            <TabProfileAvatar focused={focused} size={size} />
          ),
        }}
        listeners={({ navigation, route }) => ({
          tabPress: (e) => {
            const state = navigation.getState();
            const tabRoute = state.routes.find(r => r.name === route.name);
            if (tabRoute?.state?.index > 0) {
              e.preventDefault();
              navigation.navigate(route.name, { screen: 'Profile' });
            }
          },
        })}
      />
    </Tab.Navigator>
  );
}
