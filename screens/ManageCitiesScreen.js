import React, { useState, useEffect, useCallback } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppContext } from '../context/AppContext';
import { searchCitiesAPI } from '../utils/citySearch';
import { searchCities as searchLocalCities } from '../utils/cities';
import { useTheme } from '../context/ThemeContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function ManageCitiesScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { visitedCities, addVisitedCity, deleteVisitedCity } = useAppContext();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const [citySearch, setCitySearch] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [newYear, setNewYear] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  const returnScreen = route.params?.returnScreen || 'YourStats';

  // Debounced search effect
  useEffect(() => {
    if (citySearch.length < 2) {
      setSearchResults([]);
      setShowCityDropdown(false);
      setSearchError(null);
      return;
    }

    // Show dropdown immediately with local results first
    const localResults = searchLocalCities(citySearch);
    if (localResults.length > 0) {
      setSearchResults(localResults);
      setShowCityDropdown(true);
    }

    // Set up debounced API search
    setIsSearching(true);
    setSearchError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const apiResults = await searchCitiesAPI(citySearch);

        if (apiResults.length > 0) {
          // Merge local and API results, removing duplicates
          const mergedResults = [...localResults];
          const existingKeys = new Set(
            localResults.map(c => `${c.city.toLowerCase()}-${c.country.toLowerCase()}`)
          );

          for (const result of apiResults) {
            const key = `${result.city.toLowerCase()}-${result.country.toLowerCase()}`;
            if (!existingKeys.has(key)) {
              mergedResults.push(result);
              existingKeys.add(key);
            }
          }

          setSearchResults(mergedResults.slice(0, 20));
        } else if (localResults.length === 0) {
          setSearchResults([]);
        }

        setShowCityDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setSearchError('Search failed. Please try again.');
        // Keep local results if API fails
        if (localResults.length === 0) {
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400); // 400ms debounce

    return () => clearTimeout(timeoutId);
  }, [citySearch]);

  const selectCity = (city) => {
    setSelectedCity(city);
    // Format display name with state for US cities
    const displayName = city.state && city.country === 'United States'
      ? `${city.city}, ${city.state}, ${city.country}`
      : `${city.city}, ${city.country}`;
    setCitySearch(displayName);
    setShowCityDropdown(false);
  };

  const handleCitySearchChange = (text) => {
    setCitySearch(text);
    setSelectedCity(null);
  };

  const addCity = async () => {
    // Check if guest user is trying to add a city
    if (checkAuth('add your travel history')) return;

    if (!selectedCity) {
      Alert.alert('Error', 'Please select a city from the list');
      return;
    }

    const newCityData = {
      city: selectedCity.city,
      country: selectedCity.country,
      state: selectedCity.state || '',
      date: newYear.trim() || new Date().getFullYear().toString(),
      latitude: selectedCity.latitude,
      longitude: selectedCity.longitude,
      name: selectedCity.state && selectedCity.country === 'United States'
        ? `${selectedCity.city}, ${selectedCity.state}, ${selectedCity.country}`
        : `${selectedCity.city}, ${selectedCity.country}`,
      type: 'city',
    };

    addVisitedCity(newCityData);
    setCitySearch('');
    setSelectedCity(null);
    setNewYear('');
    setSearchResults([]);

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

  // Format city display in dropdown
  const formatCityDisplay = (city) => {
    if (city.state && city.country === 'United States') {
      return `${city.city}, ${city.state}`;
    }
    return city.city;
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
        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.input, {
              backgroundColor: theme.inputBackground,
              borderColor: selectedCity ? theme.primary : theme.inputBorder,
              color: theme.text,
              marginBottom: 0,
            }]}
            placeholder="Search for any city worldwide..."
            placeholderTextColor={theme.textSecondary}
            value={citySearch}
            onChangeText={handleCitySearchChange}
            autoCorrect={false}
            autoCapitalize="words"
          />
          {selectedCity && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
            </View>
          )}
          {isSearching && !selectedCity && (
            <View style={styles.searchingIndicator}>
              <ActivityIndicator size="small" color={theme.primary} />
            </View>
          )}
        </View>

        {showCityDropdown && searchResults.length > 0 && (
          <View style={[styles.dropdownContainer, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {searchResults.map((city, index) => (
                <TouchableOpacity
                  key={`${city.city}-${city.country}-${city.state || ''}-${index}`}
                  style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectCity(city)}
                >
                  <View style={styles.cityDropdownItem}>
                    <Text style={[styles.dropdownItemText, { color: theme.text }]}>
                      {formatCityDisplay(city)}
                    </Text>
                    <Text style={[styles.dropdownItemCountry, { color: theme.primary }]}>
                      {city.country}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {showCityDropdown && searchResults.length === 0 && citySearch.length >= 2 && !isSearching && (
          <View style={[styles.noResults, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
              {searchError || `No cities found matching "${citySearch}"`}
            </Text>
          </View>
        )}

        {isSearching && searchResults.length === 0 && citySearch.length >= 2 && (
          <View style={[styles.noResults, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <ActivityIndicator size="small" color={theme.primary} style={{ marginBottom: 8 }} />
            <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
              Searching worldwide...
            </Text>
          </View>
        )}

        <TextInput
          style={[styles.input, {
            backgroundColor: theme.inputBackground,
            borderColor: theme.inputBorder,
            color: theme.text,
            marginTop: 15,
          }]}
          placeholder="Year visited (optional)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={newYear}
          onChangeText={setNewYear}
        />
        <TouchableOpacity
          style={[styles.addButton, {
            backgroundColor: selectedCity ? theme.primary : theme.textSecondary,
            opacity: selectedCity ? 1 : 0.6,
          }]}
          onPress={addCity}
          disabled={!selectedCity}
        >
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
                  <Text style={[styles.cityCountry, { color: theme.primary }]}>
                    {city.state ? `${city.state}, ${city.country}` : city.country}
                  </Text>
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

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />
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
  dropdownContainer: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    marginTop: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  dropdownList: {
    maxHeight: 250,
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
  searchContainer: {
    position: 'relative',
  },
  selectedIndicator: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  searchingIndicator: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
  cityDropdownItem: {
    flexDirection: 'column',
  },
  dropdownItemCountry: {
    fontSize: 13,
    marginTop: 2,
  },
  noResults: {
    padding: 15,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 5,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    textAlign: 'center',
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
