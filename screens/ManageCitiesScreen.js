import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { getCityCoordinates, countryCoordinates } from '../utils/coordinates';
import { useTheme } from '../context/ThemeContext';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function ManageCitiesScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { visitedCities, addVisitedCity, deleteVisitedCity } = useAppContext();
  const [newCity, setNewCity] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newYear, setNewYear] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const returnScreen = route.params?.returnScreen || 'YourStats';

  // List of all countries for dropdown
  const allCountries = Object.keys(countryCoordinates).sort();

  // Filter countries based on search
  const filteredCountries = allCountries.filter(country =>
    country.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const selectCountry = (country) => {
    setNewCountry(country);
    setDropdownVisible(false);
    setCountrySearch('');
  };

  const addCity = async () => {
    if (!newCity.trim()) {
      Alert.alert('Error', 'Please enter a city name');
      return;
    }
    if (!newCountry.trim()) {
      Alert.alert('Error', 'Please select a country');
      return;
    }

    // Get approximate coordinates (use country center for now)
    const coordinates = await getCityCoordinates(newCity.trim(), newCountry);

    const newCityData = {
      city: newCity.trim(),
      country: newCountry.trim(),
      date: newYear.trim() || new Date().getFullYear().toString(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      name: `${newCity.trim()}, ${newCountry.trim()}`,
      type: 'city', // Mark as city for globe rendering
    };

    addVisitedCity(newCityData);
    setNewCity('');
    setNewCountry('');
    setNewYear('');

    Alert.alert('Success', `${newCityData.city} added to your visited cities!`);
  };

  const deleteCity = (index) => {
    Alert.alert(
      'Delete City',
      'Are you sure you want to remove this city?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteVisitedCity(index);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Cities</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Add cities you've visited in the past</Text>
        </View>

      <View style={styles.addSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add New City</Text>
        <TextInput
          style={[styles.input, {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            color: theme.text
          }]}
          placeholder="City name"
          placeholderTextColor={theme.textSecondary}
          value={newCity}
          onChangeText={setNewCity}
        />

        <TouchableOpacity
          style={[styles.dropdownButton, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Text style={newCountry ? [styles.dropdownButtonTextSelected, { color: theme.text }] : [styles.dropdownButtonTextPlaceholder, { color: theme.textSecondary }]}>
            {newCountry || 'Select a country'}
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={[styles.dropdownContainer, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <TextInput
              style={[styles.searchInput, {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text
              }]}
              placeholder="Search countries..."
              placeholderTextColor={theme.textSecondary}
              value={countrySearch}
              onChangeText={setCountrySearch}
            />
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {filteredCountries.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectCountry(country)}
                >
                  <Text style={[styles.dropdownItemText, { color: theme.text }]}>{country}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            color: theme.text
          }]}
          placeholder="Year visited (optional)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={newYear}
          onChangeText={setNewYear}
        />
        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={addCity}>
          <Ionicons name="add-circle" size={24} color={theme.background} />
          <Text style={[styles.addButtonText, { color: theme.background }]}>Add City</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Cities ({visitedCities.length})
        </Text>
        {visitedCities.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="business-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No cities added yet</Text>
          </View>
        ) : (
          visitedCities.map((city, index) => (
            <View key={index} style={[styles.cityCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <View style={styles.cityInfo}>
                <Ionicons name="business" size={24} color="#3b82f6" />
                <View style={styles.cityDetails}>
                  <Text style={[styles.cityName, { color: theme.text }]}>{city.city}</Text>
                  <Text style={[styles.cityCountry, { color: theme.primary }]}>{city.country}</Text>
                  <Text style={[styles.cityDate, { color: theme.textSecondary }]}>{city.date}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteCity(index)}>
                <Ionicons name="trash-outline" size={24} color={theme.danger} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  addSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#4ade80',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
    color: '#0a0a0a',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listSection: {
    padding: 20,
    paddingTop: 0,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
    marginTop: 10,
  },
  cityCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  cityDetails: {
    flex: 1,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  cityCountry: {
    fontSize: 15,
    color: '#4ade80',
    marginBottom: 2,
  },
  cityDate: {
    fontSize: 14,
    color: '#888',
  },
  dropdownButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dropdownButtonTextPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  dropdownButtonTextSelected: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  searchInput: {
    backgroundColor: '#0a0a0a',
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#ffffff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
