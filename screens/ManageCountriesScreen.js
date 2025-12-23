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
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates } from '../utils/coordinates';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function ManageCountriesScreen({ navigation, route }) {
  const { completedTrips, addCompletedTrip, deleteCompletedTrip } = useAppContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const [newCountry, setNewCountry] = useState('');
  const [newYear, setNewYear] = useState('');
  const [newMonth, setNewMonth] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [monthDropdownVisible, setMonthDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const returnScreen = route.params?.returnScreen || 'YourStats';

  // List of all countries (simplified version from WorldRankScreen)
  const allCountries = Object.keys(countryCoordinates).sort();

  // List of months
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectCountry = (country) => {
    setNewCountry(country);
    setDropdownVisible(false);
    setSearchQuery('');
  };

  const selectMonth = (month) => {
    setNewMonth(month);
    setMonthDropdownVisible(false);
  };

  const getFilteredCountries = () => {
    if (!searchQuery) return allCountries;
    return allCountries.filter(country =>
      country.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const addCountry = () => {
    // Check if guest user is trying to add a country
    if (checkAuth('add your travel history')) return;

    if (!newCountry.trim()) {
      Alert.alert('Error', 'Please select a country');
      return;
    }

    const coordinates = countryCoordinates[newCountry] || { latitude: 0, longitude: 0 };

    // Build date string with month and year
    let dateString = newYear.trim() || new Date().getFullYear().toString();
    if (newMonth.trim()) {
      dateString = `${newMonth} ${dateString}`;
    }

    const newTrip = {
      country: newCountry.trim(),
      date: dateString,
      month: newMonth.trim(),
      year: newYear.trim() || new Date().getFullYear().toString(),
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      name: newCountry.trim(),
      type: 'country', // Mark as country for globe rendering
    };

    addCompletedTrip(newTrip);
    setNewCountry('');
    setNewYear('');
    setNewMonth('');

    Alert.alert('Success', `${newTrip.country} added to your visited countries!`);
  };

  const deleteCountry = (index) => {
    Alert.alert(
      'Delete Country',
      'Are you sure you want to remove this country?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCompletedTrip(index);
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
          <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Countries</Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Add countries you've visited in the past</Text>
        </View>

      <View style={styles.addSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Add New Country</Text>

        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
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
          <View style={[styles.dropdownContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              placeholder="Search countries..."
              placeholderTextColor={theme.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {getFilteredCountries().map((country, index) => (
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
          style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
          placeholder="Year visited (optional)"
          placeholderTextColor={theme.textSecondary}
          keyboardType="numeric"
          value={newYear}
          onChangeText={setNewYear}
        />

        <TouchableOpacity
          style={[styles.dropdownButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
          onPress={() => setMonthDropdownVisible(!monthDropdownVisible)}
        >
          <Text style={newMonth ? [styles.dropdownButtonTextSelected, { color: theme.text }] : [styles.dropdownButtonTextPlaceholder, { color: theme.textSecondary }]}>
            {newMonth || 'Month visited (optional)'}
          </Text>
          <Ionicons
            name={monthDropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>

        {monthDropdownVisible && (
          <View style={[styles.dropdownContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                  onPress={() => selectMonth(month)}
                >
                  <Text style={[styles.dropdownItemText, { color: theme.text }]}>{month}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity style={[styles.addButton, { backgroundColor: theme.primary }]} onPress={addCountry}>
          <Ionicons name="add-circle" size={24} color={theme.background} />
          <Text style={[styles.addButtonText, { color: theme.background }]}>Add Country</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Countries ({completedTrips.length})
        </Text>
        {completedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="map-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No countries added yet</Text>
          </View>
        ) : (
          completedTrips.map((trip, index) => (
            <View key={index} style={[styles.countryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={styles.countryInfo}>
                <Ionicons name="location" size={24} color="#ff4444" />
                <View style={styles.countryDetails}>
                  <Text style={[styles.countryName, { color: theme.text }]}>{trip.country}</Text>
                  <Text style={[styles.countryDate, { color: theme.textSecondary }]}>{trip.date}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => deleteCountry(index)}>
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
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  addSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  addButton: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  addButtonText: {
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
    fontSize: 16,
    marginTop: 10,
  },
  countryCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  countryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    flex: 1,
  },
  countryDetails: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  countryDate: {
    fontSize: 14,
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dropdownButtonTextPlaceholder: {
    fontSize: 16,
  },
  dropdownButtonTextSelected: {
    fontSize: 16,
  },
  dropdownContainer: {
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
  },
  searchInput: {
    borderBottomWidth: 1,
    padding: 15,
    fontSize: 16,
  },
  dropdownList: {
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: 16,
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
