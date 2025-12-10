import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

const Stack = createNativeStackNavigator();

export default function App() {
  const getDashboardButton = (navigation) => ({
    headerRight: () => (
      <TouchableOpacity
        onPress={() => navigation.navigate('Dashboard')}
        style={{ marginRight: 10 }}
      >
        <Ionicons name="home" size={24} color="#4ade80" />
      </TouchableOpacity>
    ),
  });

  return (
    <>
      <StatusBar style="light" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0a0a0a',
            },
            headerTintColor: '#4ade80',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: '#0a0a0a',
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
            options={{ title: 'Dashboard' }}
          />
          <Stack.Screen
            name="MyTrips"
            component={MyTripsScreen}
            options={({ navigation }) => ({
              title: 'My Trips',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="CreateTrip"
            component={CreateTripScreen}
            options={({ navigation }) => ({
              title: 'Create Trip',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={({ navigation }) => ({
              title: 'Trip Details',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="BudgetMaker"
            component={BudgetMakerScreen}
            options={({ navigation }) => ({
              title: 'Budget Maker',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="MyBudget"
            component={MyBudgetScreen}
            options={({ navigation }) => ({
              title: 'My Budget',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="TravelMapper"
            component={TravelMapperScreen}
            options={({ navigation }) => ({
              title: 'Travel Mapper',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="AddCompletedTrip"
            component={AddCompletedTripScreen}
            options={({ navigation }) => ({
              title: 'Add Completed Trip',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="YourStats"
            component={YourStatsScreen}
            options={({ navigation }) => ({
              title: 'Your Stats',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="WorldRank"
            component={WorldRankScreen}
            options={({ navigation }) => ({
              title: 'World Rank',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="CountryDetail"
            component={CountryDetailScreen}
            options={({ navigation }) => ({
              title: 'Country Details',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="ManageCountries"
            component={ManageCountriesScreen}
            options={({ navigation }) => ({
              title: 'Manage Countries',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="ManageCities"
            component={ManageCitiesScreen}
            options={({ navigation }) => ({
              title: 'Manage Cities',
              ...getDashboardButton(navigation),
            })}
          />
          <Stack.Screen
            name="WorldMap"
            component={WorldMapScreen}
            options={({ navigation }) => ({
              title: 'World Map',
              ...getDashboardButton(navigation),
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
