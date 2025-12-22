import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';
import { countryCoordinates } from '../utils/coordinates';
import { getCountryFlag } from '../utils/countryFlags';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function AddCompletedTripScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { completedTrips, addCompletedTrip, deleteCompletedTrip } = useAppContext();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();

  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [newVisitYear, setNewVisitYear] = useState('');

  const countries = Object.keys(countryCoordinates).sort();

  // Get list of countries that have been visited
  const visitedCountryNames = [...new Set(completedTrips.map(t => t.country))];

  // Get available countries (not yet visited)
  const availableCountries = countries.filter(
    country => !visitedCountryNames.includes(country)
  );

  // Group trips by country with all visit dates
  const groupedTrips = visitedCountryNames.map(countryName => {
    const visits = completedTrips
      .filter(trip => trip.country === countryName)
      .map(trip => trip.date)
      .sort((a, b) => b - a); // Sort newest first

    return {
      country: countryName,
      visits: visits,
      visitCount: visits.length
    };
  }).sort((a, b) => a.country.localeCompare(b.country));

  const handleAddCountry = (country) => {
    // Check if guest user is trying to add a trip
    if (checkAuth('add your travel history')) return;

    // Check if country already exists (case-insensitive and trimmed)
    const normalizedCountry = country.trim();
    const countryExists = visitedCountryNames.some(
      existingCountry => existingCountry.trim().toLowerCase() === normalizedCountry.toLowerCase()
    );

    if (countryExists) {
      Alert.alert(
        'Country Already Added',
        `${normalizedCountry} is already in your list. Click on it to add more visit dates.`,
        [{ text: 'OK' }]
      );
      setSearchText('');
      setShowCountryPicker(false);
      return;
    }

    const currentYear = new Date().getFullYear().toString();
    addCompletedTrip({
      country: normalizedCountry,
      date: currentYear
    });
    setSearchText('');
    setShowCountryPicker(false);
  };

  const handleEditCountry = (countryData) => {
    setSelectedCountry(countryData);
    setNewVisitYear('');
    setShowEditModal(true);
  };

  const handleAddVisit = () => {
    // Check if guest user is trying to add a visit
    if (checkAuth('add your travel history')) return;

    if (!newVisitYear.trim()) {
      Alert.alert('Error', 'Please enter a year');
      return;
    }

    const year = parseInt(newVisitYear);
    const currentYear = new Date().getFullYear();

    if (isNaN(year) || year < 1900 || year > currentYear) {
      Alert.alert('Error', 'Please enter a valid year');
      return;
    }

    // Check if this year already exists
    if (selectedCountry.visits.includes(newVisitYear)) {
      Alert.alert('Error', 'You already have a visit recorded for this year');
      return;
    }

    addCompletedTrip({
      country: selectedCountry.country,
      date: newVisitYear
    });

    setNewVisitYear('');
    setShowEditModal(false);
  };

  const handleDeleteVisit = (country, year) => {
    Alert.alert(
      'Delete Visit',
      `Remove ${country} visit in ${year}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const index = completedTrips.findIndex(
              trip => trip.country === country && trip.date === year
            );
            if (index !== -1) {
              deleteCompletedTrip(index);
              // If this was the last visit, close the modal
              const remainingVisits = completedTrips.filter(
                trip => trip.country === country
              ).length;
              if (remainingVisits === 1) {
                setShowEditModal(false);
              }
            }
          }
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="earth" size={28} color={theme.primary} />
            <Text style={[styles.headerTitle, { color: theme.text }]}>Your Countries</Text>
          </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {visitedCountryNames.length} {visitedCountryNames.length === 1 ? 'country' : 'countries'} visited
        </Text>
      </View>

      {/* Countries List */}
      <ScrollView style={styles.countriesList} showsVerticalScrollIndicator={false}>
        {groupedTrips.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="airplane-outline" size={60} color={theme.textSecondary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No countries added yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap the + button to add a country
            </Text>
          </View>
        ) : (
          groupedTrips.map((countryData, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.countryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => handleEditCountry(countryData)}
            >
              <View style={styles.countryCardLeft}>
                <Text style={styles.countryFlag}>{getCountryFlag(countryData.country)}</Text>
                <View style={styles.countryInfo}>
                  <Text style={[styles.countryName, { color: theme.text }]}>{countryData.country}</Text>
                  <View style={styles.visitInfo}>
                    <Ionicons name="calendar" size={14} color={theme.textSecondary} />
                    <Text style={[styles.visitCount, { color: theme.textSecondary }]}>
                      {countryData.visitCount} {countryData.visitCount === 1 ? 'visit' : 'visits'}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={styles.countryCardRight}>
                <View style={styles.yearsContainer}>
                  {countryData.visits.slice(0, 3).map((year, i) => (
                    <View key={i} style={[styles.yearBadge, { backgroundColor: theme.primary + '20' }]}>
                      <Text style={[styles.yearText, { color: theme.primary }]}>{year}</Text>
                    </View>
                  ))}
                  {countryData.visitCount > 3 && (
                    <Text style={[styles.moreYears, { color: theme.textSecondary }]}>
                      +{countryData.visitCount - 3}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
      </ScrollView>

      {/* Add Country FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={() => setShowCountryPicker(true)}
      >
        <Ionicons name="add" size={30} color={theme.background} />
      </TouchableOpacity>

      {/* Country Picker Modal */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setShowCountryPicker(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Country</Text>
              <TouchableOpacity onPress={() => {
                setShowCountryPicker(false);
                setSearchText('');
              }}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.searchContainer, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="search" size={20} color={theme.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Type to search countries..."
                placeholderTextColor={theme.textSecondary}
                value={searchText}
                onChangeText={setSearchText}
                autoCapitalize="words"
                autoFocus={true}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Country List */}
            <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false}>
              {availableCountries
                .filter(country => country.toLowerCase().includes(searchText.toLowerCase()))
                .map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.countryPickerItem, { borderBottomColor: theme.border }]}
                    onPress={() => handleAddCountry(country)}
                  >
                    <Text style={styles.countryPickerFlag}>{getCountryFlag(country)}</Text>
                    <Text style={[styles.countryPickerText, { color: theme.text }]}>{country}</Text>
                  </TouchableOpacity>
                ))}
              {availableCountries.filter(country => country.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                    {searchText ? 'No countries found' : 'All countries have been added!'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Country Modal */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <View style={styles.editModalHeader}>
                <Text style={styles.editCountryFlag}>{selectedCountry && getCountryFlag(selectedCountry.country)}</Text>
                <Text style={[styles.modalTitle, { color: theme.text }]}>{selectedCountry?.country}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>All Visits</Text>

            {/* Visits List */}
            <ScrollView style={styles.visitsList} showsVerticalScrollIndicator={false}>
              {selectedCountry?.visits.map((year, index) => (
                <View
                  key={index}
                  style={[styles.visitItem, { backgroundColor: theme.background, borderColor: theme.border }]}
                >
                  <View style={styles.visitItemLeft}>
                    <Ionicons name="calendar" size={20} color={theme.primary} />
                    <Text style={[styles.visitYear, { color: theme.text }]}>{year}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteVisit(selectedCountry.country, year)}
                  >
                    <Ionicons name="trash" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Add Visit Section */}
            <View style={styles.addVisitSection}>
              <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>Add Another Visit</Text>
              <View style={styles.addVisitRow}>
                <TextInput
                  style={[styles.yearInput, {
                    backgroundColor: theme.inputBackground,
                    borderColor: theme.border,
                    color: theme.text
                  }]}
                  placeholder="Year (e.g., 2023)"
                  placeholderTextColor={theme.textSecondary}
                  value={newVisitYear}
                  onChangeText={setNewVisitYear}
                  keyboardType="numeric"
                  maxLength={4}
                />
                <TouchableOpacity
                  style={[styles.addVisitButton, { backgroundColor: theme.primary }]}
                  onPress={handleAddVisit}
                >
                  <Ionicons name="add" size={24} color={theme.background} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />
    </View>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 38,
  },
  countriesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 5,
  },
  countryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  countryCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  countryFlag: {
    fontSize: 32,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  visitInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  visitCount: {
    fontSize: 13,
  },
  countryCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  yearsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  yearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 12,
    fontWeight: '600',
  },
  moreYears: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editCountryFlag: {
    fontSize: 28,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  countryPickerList: {
    maxHeight: 400,
  },
  countryPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    gap: 12,
  },
  countryPickerFlag: {
    fontSize: 24,
  },
  countryPickerText: {
    fontSize: 16,
  },
  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  visitsList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  visitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  visitItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  visitYear: {
    fontSize: 16,
    fontWeight: '600',
  },
  addVisitSection: {
    marginTop: 10,
  },
  addVisitRow: {
    flexDirection: 'row',
    gap: 10,
  },
  yearInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
  },
  addVisitButton: {
    width: 50,
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
