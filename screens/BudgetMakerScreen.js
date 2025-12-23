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
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { countryCoordinates } from '../utils/coordinates';
import { getCurrencyInfo } from '../utils/currencyData';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function BudgetMakerScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { addBudget, updateBudget, budgets } = useAppContext();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();

  // Edit mode detection
  const editMode = route?.params?.editMode;
  const budgetToEdit = route?.params?.budget;
  const budgetIndex = route?.params?.budgetIndex;

  // Trip data pre-population
  const fromTrip = route?.params?.fromTrip;
  const tripData = route?.params?.tripData;

  // Trip type selection
  const [tripType, setTripType] = useState(
    budgetToEdit?.tripType || (fromTrip && tripData?.countries?.length > 0 ? 'multi' : 'single')
  );

  // Mode selection
  const [mode, setMode] = useState(budgetToEdit?.mode || 'manual'); // 'manual' or 'recommended'
  const [selectedPreset, setSelectedPreset] = useState(budgetToEdit?.preset || null); // 'foodie', 'hotel_lover', 'tourist', 'standard'

  // Country selection (single country mode)
  const [selectedCountry, setSelectedCountry] = useState(budgetToEdit?.country || '');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Multi-country selection
  const [countries, setCountries] = useState(() => {
    if (budgetToEdit?.countries) return budgetToEdit.countries;
    if (fromTrip && tripData?.countries) {
      // Pre-populate with trip countries
      return tripData.countries.map(c => {
        const currencyInfo = getCurrencyInfo(c.name);
        // Calculate days from dates if available
        let days = 1;
        if (c.startDate && c.endDate) {
          const start = typeof c.startDate === 'string' ? new Date(c.startDate) : c.startDate;
          const end = typeof c.endDate === 'string' ? new Date(c.endDate) : c.endDate;
          const timeDiff = end - start;
          days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
        }
        return {
          name: c.name,
          days: days,
          currency: currencyInfo.currency,
          symbol: currencyInfo.symbol,
          rate: currencyInfo.rate,
          accommodation: 0,
        };
      });
    }
    return [];
  });
  const [countryModalVisible, setCountryModalVisible] = useState(false);

  // Budget inputs
  const [totalBudget, setTotalBudget] = useState(
    budgetToEdit?.totalBudget || (fromTrip && tripData?.budget) || 5000
  );
  const [tripDuration, setTripDuration] = useState(() => {
    if (budgetToEdit?.tripDuration) return budgetToEdit.tripDuration;
    if (fromTrip && tripData?.countries) {
      // Calculate total days from trip countries
      return tripData.countries.reduce((sum, c) => {
        if (c.startDate && c.endDate) {
          const start = typeof c.startDate === 'string' ? new Date(c.startDate) : c.startDate;
          const end = typeof c.endDate === 'string' ? new Date(c.endDate) : c.endDate;
          const timeDiff = end - start;
          const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }
        return sum + 1;
      }, 0);
    }
    return 7;
  });

  // Accommodations
  const [accommodationPercent, setAccommodationPercent] = useState(
    budgetToEdit ? Math.round(((budgetToEdit.accommodation || 0) / budgetToEdit.totalBudget) * 100) : 40
  );
  const [accommodationTotal, setAccommodationTotal] = useState(budgetToEdit?.accommodation ? budgetToEdit.accommodation.toString() : '');
  const [accommodationInputMode, setAccommodationInputMode] = useState('percent'); // 'percent' or 'total'

  // Budget line items (for manual mode)
  const [lineItems, setLineItems] = useState(
    budgetToEdit?.lineItems || [
      { name: 'Food/Drink (non-alc)', percent: 25, icon: 'restaurant' },
      { name: 'Transportation', percent: 15, icon: 'car' },
      { name: 'Activities/Fun', percent: 15, icon: 'bicycle' },
      { name: 'Alcohol', percent: 5, icon: 'beer' },
    ]
  );

  // Get all countries from coordinates
  const allCountryNames = Object.keys(countryCoordinates).sort();

  // Recommended presets
  const presets = {
    foodie: {
      accommodation: 30,
      food: 40,
      transportation: 10,
      activities: 15,
      alcohol: 5,
    },
    hotel_lover: {
      accommodation: 50,
      food: 20,
      transportation: 10,
      activities: 15,
      alcohol: 5,
    },
    tourist: {
      accommodation: 30,
      food: 20,
      transportation: 15,
      activities: 30,
      alcohol: 5,
    },
    standard: {
      accommodation: 40,
      food: 25,
      transportation: 15,
      activities: 15,
      alcohol: 5,
    },
  };

  // Calculate values with actual currency data
  const currencyInfo = selectedCountry ? getCurrencyInfo(selectedCountry) : { currency: 'USD', symbol: '$', rate: 1.0 };
  const currencyRate = currencyInfo.rate;
  const currencyCode = currencyInfo.currency;
  const currencySymbol = currencyInfo.symbol;

  // Calculate for multi-country mode
  const effectiveDuration = tripType === 'multi' ? totalDaysMulti : tripDuration;
  const totalBudgetLocal = tripType === 'multi'
    ? countries.reduce((sum, country) => {
        const countryBudget = (totalBudget / totalDaysMulti) * country.days;
        return sum + (countryBudget * country.rate);
      }, 0)
    : totalBudget * currencyRate;

  const dailyBudget = totalBudget / effectiveDuration;
  const dailyBudgetLocal = totalBudgetLocal / effectiveDuration;

  // Calculate accommodation values
  const accommodationAmount = tripType === 'multi'
    ? countries.reduce((sum, country) => sum + (country.accommodation || 0), 0)
    : accommodationInputMode === 'percent'
      ? (totalBudget * accommodationPercent) / 100
      : parseFloat(accommodationTotal) || 0;

  const budgetAfterAccommodation = totalBudget - accommodationAmount;
  const budgetAfterAccommodationLocal = budgetAfterAccommodation * currencyRate;

  // Apply preset if in recommended mode
  const getLineItemPercent = (itemName) => {
    if (mode === 'recommended' && selectedPreset) {
      const preset = presets[selectedPreset];
      if (itemName.includes('Food')) return preset.food;
      if (itemName.includes('Transportation')) return preset.transportation;
      if (itemName.includes('Activities')) return preset.activities;
      if (itemName.includes('Alcohol')) return preset.alcohol;
    }
    return lineItems.find(item => item.name === itemName)?.percent || 0;
  };

  const selectCountry = (countryName) => {
    setSelectedCountry(countryName);
    setSearchText('');
    setDropdownVisible(false);
  };

  const updateLineItemPercent = (index, newPercent) => {
    const updated = [...lineItems];
    updated[index].percent = newPercent;
    setLineItems(updated);
  };

  const addCustomLineItem = () => {
    Alert.prompt(
      'Add Custom Item',
      'Enter item name',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Add',
          onPress: (name) => {
            if (name && name.trim()) {
              setLineItems([...lineItems, { name: name.trim(), percent: 0, icon: 'pricetag' }]);
            }
          },
        },
      ]
    );
  };

  const saveBudget = () => {
    // Check if guest user is trying to save a budget
    if (checkAuth('save your budget')) return;

    // Validation
    if (tripType === 'single' && !selectedCountry) {
      Alert.alert('Error', 'Please select a country');
      return;
    }

    if (tripType === 'multi' && countries.length === 0) {
      Alert.alert('Error', 'Please add at least one country to your trip');
      return;
    }

    if (tripType === 'multi' && totalDaysMulti !== tripDuration) {
      Alert.alert(
        'Error',
        `Days don't match! You've allocated ${totalDaysMulti} days but your trip duration is ${tripDuration} days. Please adjust the days for each country.`
      );
      return;
    }

    const budget = {
      id: editMode ? budgetToEdit.id : Date.now().toString(),
      source: fromTrip ? 'trip' : (budgetToEdit?.source || 'budgetMaker'), // Track where it came from
      tripId: fromTrip ? tripData?.tripId : (budgetToEdit?.tripId || null), // Link to trip if created from trip
      tripType,
      country: tripType === 'single' ? selectedCountry : null,
      countries: tripType === 'multi' ? countries : null,
      mode,
      preset: selectedPreset,
      totalBudget,
      tripDuration: effectiveDuration,
      accommodation: accommodationAmount,
      lineItems: mode === 'recommended'
        ? Object.entries(presets[selectedPreset] || presets.standard)
            .filter(([key]) => key !== 'accommodation')
            .map(([key, percent]) => ({
              name: key.charAt(0).toUpperCase() + key.slice(1),
              percent,
              total: (budgetAfterAccommodation * percent) / 100,
            }))
        : lineItems.map(item => ({
            name: item.name,
            percent: item.percent,
            total: (budgetAfterAccommodation * item.percent) / 100,
          })),
      currency: tripType === 'single' ? currencyCode : 'USD',
      currencyRate: tripType === 'single' ? currencyRate : null,
    };

    // Save or update to global context
    if (editMode) {
      updateBudget(budgetIndex, budget);
      Alert.alert('Success', 'Budget updated successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('MyBudget')
        }
      ]);
    } else {
      // Check if a budget already exists for this trip
      const existingBudgetIndex = fromTrip && tripData?.tripId
        ? budgets.findIndex(b => b.tripId === tripData.tripId)
        : -1;

      if (existingBudgetIndex !== -1) {
        // Update existing budget instead of creating a new one
        updateBudget(existingBudgetIndex, budget);
        Alert.alert('Success', 'Budget updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyBudget')
          }
        ]);
      } else {
        addBudget(budget);
        Alert.alert('Success', 'Budget saved successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.navigate('MyBudget')
          }
        ]);
      }
    }
  };

  // Helper functions for multi-country
  const addCountryToTrip = (countryName, days) => {
    const currencyInfo = getCurrencyInfo(countryName);
    setCountries([...countries, {
      name: countryName,
      days: days || 1, // Start at 1 day by default
      currency: currencyInfo.currency,
      symbol: currencyInfo.symbol,
      rate: currencyInfo.rate,
      accommodation: 0, // Per-country accommodation cost in USD
    }]);
  };

  const removeCountryFromTrip = (index) => {
    setCountries(countries.filter((_, i) => i !== index));
  };

  const updateCountryDays = (index, days) => {
    const updated = [...countries];
    const currentCountryDays = updated[index].days;
    const otherCountriesTotalDays = updated.reduce((sum, country, i) => i === index ? sum : sum + country.days, 0);
    const maxAllowedDays = tripDuration - otherCountriesTotalDays;

    // Cap the days to not exceed trip duration
    const newDays = Math.min(days, maxAllowedDays);
    updated[index].days = newDays;
    setCountries(updated);
  };

  const updateCountryAccommodation = (index, amount) => {
    const updated = [...countries];
    updated[index].accommodation = parseFloat(amount) || 0;
    setCountries(updated);
  };

  // Calculate total days for multi-country
  const totalDaysMulti = countries.reduce((sum, country) => sum + country.days, 0);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Trip Pre-loaded Banner */}
        {fromTrip && tripData && (
        <View style={[styles.tripBanner, { backgroundColor: theme.secondary + '20', borderColor: theme.secondary }]}>
          <Ionicons name="airplane" size={24} color={theme.secondary} />
          <View style={styles.tripBannerText}>
            <Text style={[styles.tripBannerTitle, { color: theme.text }]}>Trip Pre-loaded</Text>
            <Text style={[styles.tripBannerSubtitle, { color: theme.textSecondary }]}>
              {tripData.name} - {tripData.countries.length} {tripData.countries.length === 1 ? 'country' : 'countries'}
            </Text>
          </View>
        </View>
      )}

      {/* Trip Type Toggle */}
      <View style={[styles.modeToggle, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.modeButton, tripType === 'single' && [styles.modeButtonActive, { backgroundColor: theme.primary }]]}
          onPress={() => setTripType('single')}
        >
          <Text style={[styles.modeButtonText, { color: theme.textSecondary }, tripType === 'single' && [styles.modeButtonTextActive, { color: theme.background }]]}>
            Single Country
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, tripType === 'multi' && [styles.modeButtonActive, { backgroundColor: theme.primary }]]}
          onPress={() => setTripType('multi')}
        >
          <Text style={[styles.modeButtonText, { color: theme.textSecondary }, tripType === 'multi' && [styles.modeButtonTextActive, { color: theme.background }]]}>
            Multi-Country
          </Text>
        </TouchableOpacity>
      </View>

      {/* Mode Toggle */}
      <View style={[styles.modeToggle, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'manual' && [styles.modeButtonActive, { backgroundColor: theme.primary }]]}
          onPress={() => setMode('manual')}
        >
          <Text style={[styles.modeButtonText, { color: theme.textSecondary }, mode === 'manual' && [styles.modeButtonTextActive, { color: theme.background }]]}>
            Manual
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'recommended' && [styles.modeButtonActive, { backgroundColor: theme.primary }]]}
          onPress={() => setMode('recommended')}
        >
          <Text style={[styles.modeButtonText, { color: theme.textSecondary }, mode === 'recommended' && [styles.modeButtonTextActive, { color: theme.background }]]}>
            Recommended
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recommended Presets */}
      {mode === 'recommended' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Preset</Text>
          <View style={styles.presetGrid}>
            {['foodie', 'hotel_lover', 'tourist', 'standard'].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetCard,
                  { backgroundColor: theme.cardBackground, borderColor: theme.border },
                  selectedPreset === preset && [styles.presetCardActive, { borderColor: theme.primary }]
                ]}
                onPress={() => setSelectedPreset(preset)}
              >
                <Text style={[styles.presetName, { color: theme.text }]}>
                  {preset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Country Selector - Single Country */}
      {tripType === 'single' ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Select Country</Text>
          <TouchableOpacity
            style={[styles.dropdownButton, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={selectedCountry ? [styles.dropdownButtonTextSelected, { color: theme.text }] : [styles.dropdownButtonTextPlaceholder, { color: theme.textSecondary }]}>
              {selectedCountry || 'Select a country'}
            </Text>
            <Ionicons
              name="search"
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>

          {selectedCountry && (
            <View style={[styles.countryInfo, { backgroundColor: theme.cardBackground }]}>
              <Text style={[styles.countryInfoText, { color: theme.primary }]}>
                Currency: {currencyCode} ({currencySymbol}) | Rate: {currencyRate} per USD
              </Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Country Picker Modal - Single Country */}
      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setDropdownVisible(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Select Country</Text>
              <TouchableOpacity onPress={() => {
                setDropdownVisible(false);
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
            <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {allCountryNames
                .filter(country => country.toLowerCase().includes(searchText.toLowerCase()))
                .map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.countryPickerItem, { borderBottomColor: theme.border }]}
                    onPress={() => selectCountry(country)}
                  >
                    <Text style={[styles.countryPickerText, { color: theme.text }]}>{country}</Text>
                    {selectedCountry === country && (
                      <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                    )}
                  </TouchableOpacity>
                ))}
              {allCountryNames.filter(country => country.toLowerCase().includes(searchText.toLowerCase())).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                    No countries found
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Country Picker Modal - Multi Country */}
      <Modal
        visible={countryModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {
          setCountryModalVisible(false);
          setSearchText('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Add Country to Trip</Text>
              <TouchableOpacity onPress={() => {
                setCountryModalVisible(false);
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
            <ScrollView style={styles.countryPickerList} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {allCountryNames
                .filter(country => country.toLowerCase().includes(searchText.toLowerCase()))
                .filter(country => !countries.some(c => c.name === country))
                .map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.countryPickerItem, { borderBottomColor: theme.border }]}
                    onPress={() => {
                      addCountryToTrip(country, 1);
                      setCountryModalVisible(false);
                      setSearchText('');
                    }}
                  >
                    <Text style={[styles.countryPickerText, { color: theme.text }]}>{country}</Text>
                  </TouchableOpacity>
                ))}
              {allCountryNames.filter(country => country.toLowerCase().includes(searchText.toLowerCase())).filter(country => !countries.some(c => c.name === country)).length === 0 && (
                <View style={styles.noResultsContainer}>
                  <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                    {searchText ? 'No countries found' : 'All available countries added'}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Budget Sliders - Different layout for single vs multi-country */}
      {tripType === 'single' ? (
        <>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Total Budget</Text>
            <View style={styles.sliderInputRow}>
              <Text style={[styles.sliderValuePrefix, { color: theme.text }]}>$</Text>
              <TextInput
                style={[styles.sliderInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
                keyboardType="numeric"
                value={totalBudget.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setTotalBudget(Math.min(Math.max(value, 0), 100000));
                }}
                selectTextOnFocus
              />
            </View>
            <Slider
              style={styles.slider}
              minimumValue={500}
              maximumValue={25000}
              step={100}
              value={Math.min(totalBudget, 25000)}
              onValueChange={setTotalBudget}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>$500</Text>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>$25,000+</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trip Duration</Text>
            <View style={styles.sliderInputRow}>
              <TextInput
                style={[styles.sliderInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
                keyboardType="numeric"
                value={tripDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setTripDuration(Math.min(Math.max(value, 1), 365));
                }}
                selectTextOnFocus
              />
              <Text style={[styles.sliderValueSuffix, { color: theme.text }]}>days</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={120}
              step={1}
              value={Math.min(tripDuration, 120)}
              onValueChange={setTripDuration}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>1 day</Text>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>120+ days</Text>
            </View>
          </View>
        </>
      ) : (
        <>
          {/* Multi-Country: Budget and Duration Sliders First */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Total Budget</Text>
            <View style={styles.sliderInputRow}>
              <Text style={[styles.sliderValuePrefix, { color: theme.text }]}>$</Text>
              <TextInput
                style={[styles.sliderInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
                keyboardType="numeric"
                value={totalBudget.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 0;
                  setTotalBudget(Math.min(Math.max(value, 0), 100000));
                }}
                selectTextOnFocus
              />
            </View>
            <Slider
              style={styles.slider}
              minimumValue={500}
              maximumValue={25000}
              step={100}
              value={Math.min(totalBudget, 25000)}
              onValueChange={setTotalBudget}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>$500</Text>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>$25,000+</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Trip Duration</Text>
            <View style={styles.sliderInputRow}>
              <TextInput
                style={[styles.sliderInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
                keyboardType="numeric"
                value={tripDuration.toString()}
                onChangeText={(text) => {
                  const value = parseInt(text) || 1;
                  setTripDuration(Math.min(Math.max(value, 1), 365));
                }}
                selectTextOnFocus
              />
              <Text style={[styles.sliderValueSuffix, { color: theme.text }]}>days</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={120}
              step={1}
              value={Math.min(tripDuration, 120)}
              onValueChange={setTripDuration}
              minimumTrackTintColor={theme.primary}
              maximumTrackTintColor={theme.border}
              thumbTintColor={theme.primary}
            />
            <View style={styles.sliderLabels}>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>1 day</Text>
              <Text style={[styles.sliderLabel, { color: theme.textSecondary }]}>120+ days</Text>
            </View>
          </View>

          {/* Multi-Country Selector */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Countries on Your Trip</Text>

            {countries.length === 0 ? (
              <View style={[styles.emptyCountryState, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Ionicons name="earth-outline" size={40} color={theme.textSecondary} />
                <Text style={[styles.emptyCountryText, { color: theme.textSecondary }]}>
                  Add countries to your multi-country trip
                </Text>
              </View>
            ) : (
              <View style={styles.countryList}>
                {countries.map((country, index) => {
                  // Calculate max days for this country
                  const otherCountriesTotalDays = countries.reduce((sum, c, i) => i === index ? sum : sum + c.days, 0);
                  const maxDaysForCountry = tripDuration - otherCountriesTotalDays;

                  return (
                    <View key={index} style={[styles.countryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                      <View style={styles.countryCardHeader}>
                        <View style={styles.countryCardInfo}>
                          <Text style={[styles.countryCardName, { color: theme.text }]}>{country.name}</Text>
                          <Text style={[styles.countryCardCurrency, { color: theme.primary }]}>
                            {country.currency} ({country.symbol}) | Rate: {country.rate}
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => removeCountryFromTrip(index)}>
                          <Ionicons name="trash-outline" size={22} color={theme.danger} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.daysSliderContainer}>
                        <View style={styles.daysLabelRow}>
                          <Text style={[styles.daysLabel, { color: theme.textSecondary }]}>Days in {country.name}</Text>
                          <Text style={[styles.daysMaxLabel, { color: theme.textSecondary }]}>
                            (max: {maxDaysForCountry})
                          </Text>
                        </View>
                        <Text style={[styles.daysValue, { color: theme.primary }]}>{country.days} days</Text>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={maxDaysForCountry}
                          step={1}
                          value={country.days}
                          onValueChange={(value) => updateCountryDays(index, value)}
                          minimumTrackTintColor={theme.primary}
                          maximumTrackTintColor={theme.border}
                          thumbTintColor={theme.primary}
                        />
                      </View>
                      <View style={styles.accommodationInputContainer}>
                        <View style={styles.accommodationInputHeader}>
                          <Ionicons name="bed-outline" size={18} color={theme.primary} />
                          <Text style={[styles.accommodationInputLabel, { color: theme.textSecondary }]}>
                            Accommodation Cost (Optional)
                          </Text>
                        </View>
                        <TextInput
                          style={[styles.countryAccommodationInput, {
                            backgroundColor: theme.inputBackground,
                            borderColor: theme.inputBorder,
                            color: theme.text
                          }]}
                          placeholder="$0"
                          placeholderTextColor={theme.textSecondary}
                          keyboardType="numeric"
                          value={country.accommodation > 0 ? country.accommodation.toString() : ''}
                          onChangeText={(value) => updateCountryAccommodation(index, value)}
                        />
                        {country.accommodation > 0 && (
                          <Text style={[styles.accommodationLocalText, { color: theme.textSecondary }]}>
                            {country.symbol}{Math.round(country.accommodation * country.rate).toLocaleString()} {country.currency}
                          </Text>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            <TouchableOpacity
              style={[styles.addCountryButton, { backgroundColor: theme.cardBackground, borderColor: theme.primary }]}
              onPress={() => setCountryModalVisible(true)}
            >
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.addCountryButtonText, { color: theme.primary }]}>Add Country</Text>
            </TouchableOpacity>

            {countries.length > 0 && (
              <View style={[styles.totalDaysCard, {
                backgroundColor: totalDaysMulti === tripDuration ? theme.primary + '20' : theme.danger + '20',
                borderColor: totalDaysMulti === tripDuration ? theme.primary : theme.danger
              }]}>
                <Text style={[styles.totalDaysLabel, { color: theme.text }]}>Days Allocated</Text>
                <Text style={[styles.totalDaysValue, {
                  color: totalDaysMulti === tripDuration ? theme.primary : theme.danger
                }]}>
                  {totalDaysMulti} / {tripDuration} days
                </Text>
                {totalDaysMulti !== tripDuration && (
                  <Text style={[styles.totalDaysWarning, { color: theme.danger }]}>
                    {totalDaysMulti < tripDuration
                      ? `${tripDuration - totalDaysMulti} days remaining`
                      : `${totalDaysMulti - tripDuration} days over limit`}
                  </Text>
                )}
              </View>
            )}
          </View>
        </>
      )}

      {/* Currency Converter & Daily Budget */}
      <View style={styles.section}>
        {tripType === 'single' ? (
          <View style={styles.budgetRow}>
            <View style={[styles.budgetBox, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <Text style={[styles.budgetBoxLabel, { color: theme.textSecondary }]}>Total Budget (Local)</Text>
              <Text style={[styles.budgetBoxValue, { color: theme.text }]}>
                {currencySymbol}{totalBudgetLocal.toLocaleString(undefined, { maximumFractionDigits: 0 })} {currencyCode}
              </Text>
            </View>
            <View style={[styles.budgetBox, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <Text style={[styles.budgetBoxLabel, { color: theme.textSecondary }]}>Daily Budget</Text>
              <Text style={[styles.budgetBoxValue, { color: theme.text }]}>
                ${Math.round(dailyBudget).toLocaleString()} / {currencySymbol}{Math.round(dailyBudgetLocal).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget Per Country</Text>
            {countries.map((country, index) => {
              // Calculate raw budget allocation based on days
              const countryBudget = totalDaysMulti > 0 ? (totalBudget / totalDaysMulti) * country.days : 0;
              const countryBudgetLocal = countryBudget * country.rate;

              // Accommodation costs
              const countryAccommodation = country.accommodation || 0;
              const countryAccommodationLocal = countryAccommodation * country.rate;

              // Budget after accommodation
              const budgetAfterAccommodationCountry = countryBudget - countryAccommodation;
              const budgetAfterAccommodationCountryLocal = budgetAfterAccommodationCountry * country.rate;

              // Daily budget (after accommodation)
              const dailyBudgetCountry = country.days > 0 ? budgetAfterAccommodationCountry / country.days : 0;
              const dailyBudgetCountryLocal = dailyBudgetCountry * country.rate;

              return (
                <View key={index} style={[styles.countryBudgetCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                  <Text style={[styles.countryBudgetName, { color: theme.text }]}>{country.name}</Text>

                  {/* Show accommodation cost if entered */}
                  {countryAccommodation > 0 && (
                    <View style={[styles.countryAccommodationDisplay, { backgroundColor: theme.background, borderColor: theme.border }]}>
                      <Ionicons name="bed" size={16} color={theme.primary} />
                      <Text style={[styles.countryAccommodationText, { color: theme.textSecondary }]}>
                        Accommodation: ${Math.round(countryAccommodation).toLocaleString()} ({country.symbol}{Math.round(countryAccommodationLocal).toLocaleString()} {country.currency})
                      </Text>
                    </View>
                  )}

                  <View style={styles.countryBudgetRow}>
                    <View style={styles.countryBudgetItem}>
                      <Text style={[styles.countryBudgetLabel, { color: theme.textSecondary }]}>
                        {countryAccommodation > 0 ? 'After Accom.' : 'Total Budget'}
                      </Text>
                      <Text style={[styles.countryBudgetValue, { color: theme.primary }]}>
                        ${Math.round(budgetAfterAccommodationCountry).toLocaleString()}
                      </Text>
                      <Text style={[styles.countryBudgetLocalValue, { color: theme.textSecondary }]}>
                        {country.symbol}{Math.round(budgetAfterAccommodationCountryLocal).toLocaleString()} {country.currency}
                      </Text>
                    </View>
                    <View style={styles.countryBudgetItem}>
                      <Text style={[styles.countryBudgetLabel, { color: theme.textSecondary }]}>Per Day</Text>
                      <Text style={[styles.countryBudgetValue, { color: theme.primary }]}>
                        ${Math.round(dailyBudgetCountry).toLocaleString()}
                      </Text>
                      <Text style={[styles.countryBudgetLocalValue, { color: theme.textSecondary }]}>
                        {country.symbol}{Math.round(dailyBudgetCountryLocal).toLocaleString()} {country.currency}
                      </Text>
                    </View>
                    <View style={styles.countryBudgetItem}>
                      <Text style={[styles.countryBudgetLabel, { color: theme.textSecondary }]}>Days</Text>
                      <Text style={[styles.countryBudgetValue, { color: theme.primary }]}>
                        {country.days}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
            <View style={[styles.totalBudgetSummary, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
              <View style={styles.budgetRow}>
                <View style={styles.budgetSummaryItem}>
                  <Text style={[styles.budgetSummaryLabel, { color: theme.textSecondary }]}>Total Budget</Text>
                  <Text style={[styles.budgetSummaryValue, { color: theme.primary }]}>${totalBudget.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetSummaryItem}>
                  <Text style={[styles.budgetSummaryLabel, { color: theme.textSecondary }]}>Daily Average</Text>
                  <Text style={[styles.budgetSummaryValue, { color: theme.primary }]}>${Math.round(dailyBudget).toLocaleString()}</Text>
                </View>
              </View>
              {accommodationAmount > 0 && (
                <View style={[styles.totalAccommodationRow, { borderTopColor: theme.border }]}>
                  <Ionicons name="bed" size={18} color={theme.primary} />
                  <Text style={[styles.totalAccommodationText, { color: theme.textSecondary }]}>
                    Total Accommodations: ${Math.round(accommodationAmount).toLocaleString()}
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </View>

      {/* Accommodations - Only show for single country mode */}
      {tripType === 'single' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Accommodations</Text>
          <View style={styles.accommodationToggle}>
            <TouchableOpacity
              style={[styles.accommodationButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border
              }, accommodationInputMode === 'percent' && [styles.accommodationButtonActive, { borderColor: theme.primary }]]}
              onPress={() => setAccommodationInputMode('percent')}
            >
              <Text style={[styles.accommodationButtonText, { color: theme.text }]}>%</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.accommodationButton, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border
              }, accommodationInputMode === 'total' && [styles.accommodationButtonActive, { borderColor: theme.primary }]]}
              onPress={() => setAccommodationInputMode('total')}
            >
              <Text style={[styles.accommodationButtonText, { color: theme.text }]}>$</Text>
            </TouchableOpacity>
          </View>

          {accommodationInputMode === 'percent' ? (
            <>
              <Text style={[styles.sliderValue, { color: theme.primary }]}>{accommodationPercent}%</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={5}
                value={accommodationPercent}
                onValueChange={setAccommodationPercent}
                minimumTrackTintColor={theme.primary}
                maximumTrackTintColor={theme.border}
                thumbTintColor={theme.primary}
              />
            </>
          ) : (
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.inputBackground,
                borderColor: theme.inputBorder,
                color: theme.text
              }]}
              placeholder="Enter total accommodation cost"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={accommodationTotal}
              onChangeText={setAccommodationTotal}
            />
          )}

          <View style={styles.budgetBreakdownRow}>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>%</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>TOTAL</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>USD/DAY</Text>
            <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>{currencyCode}/DAY</Text>
          </View>

          <View style={styles.budgetBreakdownRow}>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>
              {((accommodationAmount / totalBudget) * 100).toFixed(0)}%
            </Text>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>${Math.round(accommodationAmount).toLocaleString()}</Text>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>${Math.round(accommodationAmount / tripDuration).toLocaleString()}</Text>
            <Text style={[styles.breakdownValue, { color: theme.text }]}>
              {currencySymbol}{Math.round((accommodationAmount * currencyRate) / tripDuration).toLocaleString()}
            </Text>
          </View>
        </View>
      )}

      {/* Budget After Accommodation */}
      <View style={[styles.budgetAfterCard, {
        backgroundColor: theme.cardBackground,
        borderColor: theme.primary
      }]}>
        <Text style={[styles.budgetAfterLabel, { color: theme.textSecondary }]}>Budget After Accommodations</Text>
        <Text style={[styles.budgetAfterValue, { color: theme.primary }]}>
          ${Math.round(budgetAfterAccommodation).toLocaleString()} USD / {currencySymbol}{Math.round(budgetAfterAccommodationLocal).toLocaleString()} {currencyCode}
        </Text>
      </View>

      {/* Budget Breakdown */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Budget Breakdown</Text>

        <View style={styles.budgetBreakdownRow}>
          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>%</Text>
          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>TOTAL</Text>
          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>USD/DAY</Text>
          <Text style={[styles.breakdownLabel, { color: theme.textSecondary }]}>{currencyCode}/DAY</Text>
        </View>

        {lineItems.map((item, index) => {
          const percent = mode === 'recommended' ? getLineItemPercent(item.name) : item.percent;
          const total = (budgetAfterAccommodation * percent) / 100;
          const perDay = total / tripDuration;
          const perDayLocal = perDay * currencyRate;

          return (
            <View key={index} style={[styles.lineItemCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <View style={styles.lineItemHeader}>
                <Ionicons name={item.icon} size={18} color={theme.primary} />
                <Text style={[styles.lineItemName, { color: theme.text }]}>{item.name}</Text>
              </View>

              {mode === 'manual' && (
                <>
                  <Text style={[styles.sliderValue, { color: theme.primary }]}>{percent}%</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={100}
                    step={5}
                    value={percent}
                    onValueChange={(value) => updateLineItemPercent(index, value)}
                    minimumTrackTintColor={theme.primary}
                    maximumTrackTintColor={theme.border}
                    thumbTintColor={theme.primary}
                  />
                </>
              )}

              <View style={styles.budgetBreakdownRow}>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>{percent}%</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>${Math.round(total).toLocaleString()}</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>${Math.round(perDay).toLocaleString()}</Text>
                <Text style={[styles.breakdownValue, { color: theme.text }]}>{currencySymbol}{Math.round(perDayLocal).toLocaleString()}</Text>
              </View>
            </View>
          );
        })}

        {mode === 'manual' && (
          <TouchableOpacity style={[styles.addItemButton, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]} onPress={addCustomLineItem}>
            <Ionicons name="add-circle" size={24} color={theme.primary} />
            <Text style={[styles.addItemButtonText, { color: theme.primary }]}>Add More</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Save Button */}
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: theme.primary }]} onPress={saveBudget}>
        <Ionicons name={editMode ? "checkmark-circle-outline" : "save-outline"} size={24} color={theme.background} />
        <Text style={[styles.saveButtonText, { color: theme.background }]}>
          {editMode ? 'Update Budget' : 'Save to My Budget'}
        </Text>
      </TouchableOpacity>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
    </ScrollView>

      {/* Auth Prompt Modal for Guests */}
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
    padding: 20,
  },
  tripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    gap: 12,
  },
  tripBannerText: {
    flex: 1,
  },
  tripBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  tripBannerSubtitle: {
    fontSize: 13,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 5,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeButtonActive: {
    backgroundColor: '#4ade80',
  },
  modeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#888',
  },
  modeButtonTextActive: {
    color: '#0a0a0a',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  presetCardActive: {
    borderColor: '#4ade80',
  },
  presetName: {
    fontSize: 14,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
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
  },
  dropdownButtonTextPlaceholder: {
    fontSize: 16,
    color: '#666',
  },
  dropdownButtonTextSelected: {
    fontSize: 16,
    color: '#ffffff',
  },
  dropdownList: {
    maxHeight: 200,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    marginTop: 10,
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
  countryInfo: {
    backgroundColor: '#1a1a1a',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  countryInfoText: {
    fontSize: 14,
    color: '#4ade80',
    textAlign: 'center',
  },
  sliderValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4ade80',
    textAlign: 'center',
    marginBottom: 10,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderLabel: {
    fontSize: 12,
    color: '#888',
  },
  sliderInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 8,
  },
  sliderInput: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
  },
  sliderValuePrefix: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sliderValueSuffix: {
    fontSize: 18,
    fontWeight: '500',
  },
  budgetRow: {
    flexDirection: 'row',
    gap: 10,
  },
  budgetBox: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  budgetBoxLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
  },
  budgetBoxValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  accommodationToggle: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  accommodationButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  accommodationButtonActive: {
    borderColor: '#4ade80',
  },
  accommodationButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
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
  budgetBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  breakdownLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  breakdownValue: {
    fontSize: 14,
    color: '#ffffff',
    flex: 1,
    textAlign: 'center',
  },
  budgetAfterCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#4ade80',
    marginBottom: 25,
    alignItems: 'center',
  },
  budgetAfterLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
  },
  budgetAfterValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  lineItemCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  lineItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  lineItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
  },
  addItemButtonText: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#4ade80',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
    gap: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#0a0a0a',
    fontSize: 18,
    fontWeight: 'bold',
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
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
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
  // Multi-country styles
  emptyCountryState: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#2a2a2a',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 40,
    alignItems: 'center',
    marginBottom: 15,
  },
  emptyCountryText: {
    fontSize: 14,
    color: '#888',
    marginTop: 10,
    textAlign: 'center',
  },
  countryList: {
    marginBottom: 15,
  },
  countryCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  countryCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  countryCardInfo: {
    flex: 1,
  },
  countryCardName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  countryCardCurrency: {
    fontSize: 12,
    color: '#4ade80',
  },
  daysSliderContainer: {
    marginTop: 10,
  },
  daysLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  daysValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4ade80',
    textAlign: 'center',
    marginBottom: 5,
  },
  addCountryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4ade80',
    marginBottom: 15,
  },
  addCountryButtonText: {
    fontSize: 16,
    color: '#4ade80',
    fontWeight: 'bold',
  },
  totalDaysCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#4ade80',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  totalDaysLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  totalDaysValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  countryBudgetCard: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
  },
  countryBudgetName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
  },
  countryBudgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  countryBudgetItem: {
    flex: 1,
    alignItems: 'center',
  },
  countryBudgetLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 5,
  },
  countryBudgetValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4ade80',
    marginBottom: 3,
  },
  countryBudgetLocalValue: {
    fontSize: 11,
    color: '#888',
  },
  totalBudgetSummary: {
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#4ade80',
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  budgetSummaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  budgetSummaryLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  budgetSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  accommodationInputContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  accommodationInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  accommodationInputLabel: {
    fontSize: 13,
    color: '#888',
  },
  countryAccommodationInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    fontSize: 15,
  },
  accommodationLocalText: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
  },
  countryAccommodationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  countryAccommodationText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  totalAccommodationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  totalAccommodationText: {
    fontSize: 14,
    color: '#888',
    fontWeight: '600',
  },
  daysLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  daysMaxLabel: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic',
  },
  totalDaysWarning: {
    fontSize: 12,
    marginTop: 5,
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
