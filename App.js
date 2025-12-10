import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';

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
            options={{ title: 'My Trips' }}
          />
          <Stack.Screen
            name="CreateTrip"
            component={CreateTripScreen}
            options={{ title: 'Create Trip' }}
          />
          <Stack.Screen
            name="TripDetail"
            component={TripDetailScreen}
            options={{ title: 'Trip Details' }}
          />
          <Stack.Screen
            name="BudgetMaker"
            component={BudgetMakerScreen}
            options={{ title: 'Budget Maker' }}
          />
          <Stack.Screen
            name="MyBudget"
            component={MyBudgetScreen}
            options={{ title: 'My Budget' }}
          />
          <Stack.Screen
            name="TravelMapper"
            component={TravelMapperScreen}
            options={{ title: 'Travel Mapper' }}
          />
          <Stack.Screen
            name="AddCompletedTrip"
            component={AddCompletedTripScreen}
            options={{ title: 'Add Completed Trip' }}
          />
          <Stack.Screen
            name="YourStats"
            component={YourStatsScreen}
            options={{ title: 'Your Stats' }}
          />
          <Stack.Screen
            name="WorldRank"
            component={WorldRankScreen}
            options={{ title: 'World Rank' }}
          />
          <Stack.Screen
            name="CountryDetail"
            component={CountryDetailScreen}
            options={{ title: 'Country Details' }}
          />
          <Stack.Screen
            name="ManageCountries"
            component={ManageCountriesScreen}
            options={{ title: 'Manage Countries' }}
          />
          <Stack.Screen
            name="ManageCities"
            component={ManageCitiesScreen}
            options={{ title: 'Manage Cities' }}
          />
          <Stack.Screen
            name="WorldMap"
            component={WorldMapScreen}
            options={{ title: 'World Map' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
