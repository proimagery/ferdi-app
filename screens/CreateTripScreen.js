import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';
import ThemedAlert from '../components/ThemedAlert';
import { useTranslation } from 'react-i18next';
import { getActiveTrips } from '../utils/activeTripHelpers';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function CreateTripScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { trips, addTrip, updateTrip, addBudget } = useAppContext();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const editMode = route.params?.editMode || false;
  const editIndex = route.params?.editIndex;
  const editTrip = editMode && editIndex !== undefined ? trips[editIndex] : null;
  const isActiveTripEdit = editMode && editTrip && getActiveTrips([editTrip]).length > 0;
  const prefilledCountries = route.params?.prefilledCountries || null;

  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState(editMode ? editTrip.name : '');
  const [countries, setCountries] = useState(() => {
    if (editMode) return editTrip.countries;
    if (prefilledCountries) return prefilledCountries;
    return [{ name: '', startDate: null, endDate: null }];
  });
  const [budget, setBudget] = useState(editMode ? editTrip.budget.toString() : '');
  const [showDatePicker, setShowDatePicker] = useState({ index: null, type: null });
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [searchQuery, setSearchQuery] = useState({});
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ title: '', message: '' });

  const showAlert = (title, message) => {
    setAlertConfig({ title, message });
    setAlertVisible(true);
  };

  const handleDatePress = (index, type) => {
    setShowDatePicker({ index, type });
  };

  // List of all countries
  const allCountries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia',
    'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium',
    'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei',
    'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
    'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti',
    'Dominica', 'Dominican Republic', 'East Timor', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala',
    'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland',
    'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan',
    'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos',
    'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Macedonia', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
    'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
    'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand',
    'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan',
    'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland',
    'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
    'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia',
    'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Swaziland', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan',
    'Tanzania', 'Thailand', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
    'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'England', 'Scotland',
    'Wales', 'Northern Ireland', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
    'Yemen', 'Zambia', 'Zimbabwe',
  ].sort();

  const selectCountry = (index, country) => {
    const newCountries = [...countries];
    newCountries[index].name = country;
    setCountries(newCountries);
    setDropdownVisible(null);
    setSearchQuery({ ...searchQuery, [index]: '' });
  };

  const getFilteredCountries = (index) => {
    const query = searchQuery[index] || '';
    if (!query) return allCountries;
    return allCountries.filter(country =>
      country.toLowerCase().includes(query.toLowerCase())
    );
  };

  const addCountry = () => {
    // Get the end date of the last country
    const lastCountry = countries[countries.length - 1];
    const newStartDate = lastCountry?.endDate || null;

    setCountries([...countries, { name: '', startDate: newStartDate, endDate: null }]);
  };

  const removeCountry = (index) => {
    if (countries.length > 1) {
      setCountries(countries.filter((_, i) => i !== index));
    }
  };

  const updateCountry = (index, field, value) => {
    const newCountries = [...countries];
    newCountries[index][field] = value;

    // If updating end date, update the next country's start date
    if (field === 'endDate' && value && index < countries.length - 1) {
      newCountries[index + 1].startDate = value;
    }

    setCountries(newCountries);
  };

  const formatDate = (date) => {
    if (!date) return '';
    // Handle both Date objects and date strings
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const onDateChange = (event, selectedDate) => {
    const currentIndex = showDatePicker.index;
    const currentType = showDatePicker.type;

    if (Platform.OS === 'android') {
      setShowDatePicker({ index: null, type: null });
      if (event.type === 'set' && selectedDate && currentIndex !== null) {
        updateCountry(currentIndex, currentType, selectedDate);
      }
    } else {
      // iOS
      if (selectedDate && currentIndex !== null) {
        updateCountry(currentIndex, currentType, selectedDate);
      }
    }
  };

  const handleNext = () => {
    if (step === 1) {
      const hasEmptyCountry = countries.some(c => !c.name.trim());
      if (hasEmptyCountry) {
        showAlert(t('common.oops'), t('createTrip.missingCountry'));
        return;
      }
    }
    if (step === 2) {
      if (!budget.trim() || isNaN(budget)) {
        showAlert(t('common.oops'), t('createTrip.invalidBudget'));
        return;
      }
    }
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // Check if guest user is trying to save a trip
    if (checkAuth('save your trip')) return;

    if (!tripName.trim()) {
      showAlert(t('common.oops'), t('createTrip.missingName'));
      return;
    }

    if (editMode) {
      // Update existing trip
      const updatedTrip = {
        ...editTrip,
        name: tripName,
        countries: countries,
        budget: parseFloat(budget),
      };

      updateTrip(editIndex, updatedTrip);

      // Navigate to Trip Detail page
      navigation.navigate('TripDetail', {
        tripIndex: editIndex,
        isNewTrip: false
      });
    } else {
      // Create new trip
      const newTrip = {
        id: Date.now().toString(),
        name: tripName,
        countries: countries,
        budget: parseFloat(budget),
      };

      addTrip(newTrip);

      // Also create a budget entry for this trip
      const tripBudget = {
        id: `trip-${Date.now()}`,
        source: 'trip', // Mark as coming from trip creation
        tripId: newTrip.id,
        tripType: 'multi',
        countries: countries.map(c => ({
          name: c.name,
          days: 1, // Default to 1 day per country
          currency: 'USD',
          symbol: '$',
          rate: 1,
          accommodation: 0,
        })),
        mode: 'custom',
        preset: null,
        totalBudget: parseFloat(budget),
        tripDuration: countries.length, // Default to 1 day per country
        accommodation: 0,
        lineItems: [],
        currencyRate: 1,
        country: null,
      };

      addBudget(tripBudget);

      // Navigate to Trip Detail page to show the breakdown
      const newTripIndex = trips.length; // The new trip will be at this index
      navigation.navigate('TripDetail', {
        tripIndex: newTripIndex,
        isNewTrip: true
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.progressDot,
              { backgroundColor: s === step || s < step ? theme.primary : theme.border },
            ]}
          />
        ))}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Step 1: Countries */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {editMode ? 'Edit Countries' : 'Step 1: Add Countries'}
            </Text>
            {countries.map((country, index) => (
              <View key={index} style={[styles.countryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.countryHeader}>
                  <Text style={[styles.countryLabel, { color: theme.primary }]}>Country {index + 1}</Text>
                  {countries.length > 1 && (
                    <TouchableOpacity onPress={() => removeCountry(index)}>
                      <Ionicons name="close-circle" size={24} color={theme.danger} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Country Dropdown */}
                <TouchableOpacity
                  style={[styles.dropdownButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                  onPress={() => setDropdownVisible(dropdownVisible === index ? null : index)}
                >
                  <Text style={country.name ? { fontSize: 16, color: theme.text } : { fontSize: 16, color: theme.textSecondary }}>
                    {country.name || 'Select a country'}
                  </Text>
                  <Ionicons
                    name={dropdownVisible === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={theme.primary}
                  />
                </TouchableOpacity>

                {dropdownVisible === index && (
                  <View style={[styles.dropdownContainer, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
                    <TextInput
                      style={[styles.searchInput, { backgroundColor: theme.inputBackground, borderBottomColor: theme.inputBorder, color: theme.text }]}
                      placeholder={t('createTrip.searchCountriesPlaceholder')}
                      placeholderTextColor={theme.textSecondary}
                      value={searchQuery[index] || ''}
                      onChangeText={(text) => setSearchQuery({ ...searchQuery, [index]: text })}
                      autoFocus={true}
                    />
                    <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
                      {getFilteredCountries(index).map((countryName, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={[styles.dropdownItem, { borderBottomColor: theme.border }]}
                          onPress={() => selectCountry(index, countryName)}
                        >
                          <Text style={[styles.dropdownItemText, { color: theme.text }]}>{countryName}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Date Pickers */}
                <View style={styles.dateRow}>
                  <TouchableOpacity
                    style={[styles.input, styles.dateInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                    onPress={() => handleDatePress(index, 'startDate')}
                  >
                    <View style={styles.datePickerContent}>
                      <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                      <Text style={country.startDate ? { color: theme.text, fontSize: 16 } : { color: theme.textSecondary, fontSize: 16 }}>
                        {country.startDate ? formatDate(country.startDate) : 'Start date'}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.input, styles.dateInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                    onPress={() => handleDatePress(index, 'endDate')}
                  >
                    <View style={styles.datePickerContent}>
                      <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                      <Text style={country.endDate ? { color: theme.text, fontSize: 16 } : { color: theme.textSecondary, fontSize: 16 }}>
                        {country.endDate ? formatDate(country.endDate) : 'End date'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addCountry}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.addButtonText, { color: theme.primary }]}>{t('createTrip.addAnotherCountry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Budget */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {editMode ? 'Edit Budget' : 'Step 2: Set Your Budget'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder={t('createTrip.budgetAmountPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              value={budget}
              onChangeText={setBudget}
            />
          </View>
        )}

        {/* Step 3: Trip Name */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>
              {editMode ? 'Edit Trip Name' : 'Step 3: Name Your Trip'}
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
              placeholder={t('createTrip.tripNamePlaceholder')}
              placeholderTextColor={theme.textSecondary}
              value={tripName}
              onChangeText={setTripName}
            />
          </View>
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker.index !== null && (() => {
        const raw = countries[showDatePicker.index][showDatePicker.type]
          || (showDatePicker.type === 'endDate' && countries[showDatePicker.index].startDate)
          || null;
        const pickerValue = raw instanceof Date ? raw : raw ? new Date(raw) : new Date();
        return (
          <DateTimePicker
            value={pickerValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            themeVariant="dark"
          />
        );
      })()}

      {/* Navigation Buttons */}
      <View style={[styles.buttonContainer, { paddingBottom: Math.max(insets.bottom, 20) + 10 }]}>
        {step > 1 && (
          <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.border }]} onPress={handleBack}>
            <Text style={[styles.backButtonText, { color: theme.text }]}>{t('common.back')}</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextButton, { backgroundColor: theme.primary }, step === 1 && styles.nextButtonFull]}
          onPress={step === 3 ? handleSubmit : handleNext}
        >
          <Text style={[styles.nextButtonText, { color: theme.background }]}>
            {step === 3 ? (editMode ? 'Update Trip' : 'Create Trip') : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
      </View>

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />

      {/* Themed Alert */}
      <ThemedAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
        theme={theme}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  progressDot: {
    width: 40,
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  countryCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  countryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  countryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
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
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInput: {
    flex: 1,
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    gap: 10,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 10,
  },
  backButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  nextButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 2,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
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
