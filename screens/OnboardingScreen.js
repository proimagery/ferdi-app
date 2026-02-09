import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { officialCountryNames } from '../utils/coordinates';
import { currencyData } from '../utils/currencyData';
import { getCountryFlag } from '../utils/countryFlags';
import { supabase } from '../lib/supabase';
import { uploadImage, isLocalUri } from '../utils/imageUpload';
import * as ImagePicker from 'expo-image-picker';
import LanguageSelector from '../components/LanguageSelector';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TOTAL_STEPS = 5;

export default function OnboardingScreen({ onComplete }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Home Country & Currency
  const [homeCountry, setHomeCountry] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  // Step 2: Top 3 Countries
  const [top1, setTop1] = useState('');
  const [top2, setTop2] = useState('');
  const [top3, setTop3] = useState('');
  const [activeTopPicker, setActiveTopPicker] = useState(null);
  const [topSearch, setTopSearch] = useState('');

  // Step 3: Next 3 Destinations
  const [next1, setNext1] = useState('');
  const [next2, setNext2] = useState('');
  const [next3, setNext3] = useState('');
  const [activeNextPicker, setActiveNextPicker] = useState(null);
  const [nextSearch, setNextSearch] = useState('');

  // Step 4: Bio & Photos
  const [bio, setBio] = useState('');
  const [travelPhotos, setTravelPhotos] = useState([]);

  const countries = officialCountryNames;

  const selectHomeCountry = (country) => {
    setHomeCountry(country);
    setShowCountryPicker(false);
    setCountrySearch('');
    // Auto-fill currency
    const countryInfo = currencyData[country];
    if (countryInfo) {
      setCurrency(countryInfo.currency);
    }
  };

  const selectTopCountry = (country) => {
    if (activeTopPicker === 1) setTop1(country);
    else if (activeTopPicker === 2) setTop2(country);
    else if (activeTopPicker === 3) setTop3(country);
    setActiveTopPicker(null);
    setTopSearch('');
  };

  const selectNextCountry = (country) => {
    if (activeNextPicker === 1) setNext1(country);
    else if (activeNextPicker === 2) setNext2(country);
    else if (activeNextPicker === 3) setNext3(country);
    setActiveNextPicker(null);
    setNextSearch('');
  };

  const pickTravelPhoto = async () => {
    if (travelPhotos.length >= 5) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setTravelPhotos([...travelPhotos, result.assets[0].uri]);
    }
  };

  const removeTravelPhoto = (index) => {
    setTravelPhotos(travelPhotos.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      // Upload travel photos
      const uploadedPhotos = [];
      for (const photo of travelPhotos) {
        if (isLocalUri(photo)) {
          const { url } = await uploadImage(photo, user.id, 'travel');
          if (url) uploadedPhotos.push(url);
        } else {
          uploadedPhotos.push(photo);
        }
      }

      // Save profile data
      const profileData = {
        onboarding_complete: true,
      };

      if (homeCountry) profileData.location = homeCountry;
      if (bio) profileData.bio = bio;
      if (top1) profileData.top1 = top1;
      if (top2) profileData.top2 = top2;
      if (top3) profileData.top3 = top3;
      if (next1) profileData.next1 = next1;
      if (next2) profileData.next2 = next2;
      if (next3) profileData.next3 = next3;
      if (uploadedPhotos.length > 0) profileData.travel_photos = uploadedPhotos;

      await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);

      if (onComplete) onComplete();
    } catch (err) {
      console.error('Onboarding save error:', err);
      // Still complete onboarding even if save fails
      if (onComplete) onComplete();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCountries = useCallback((search) => {
    if (!search) return countries;
    return countries.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  }, [countries]);

  const renderCountryList = (search, onSelect) => {
    const filtered = filteredCountries(search);
    return (
      <View style={[styles.pickerContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={[styles.searchRow, { borderBottomColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('onboarding.searchCountries')}
            placeholderTextColor={theme.textSecondary}
            value={search}
            onChangeText={(text) => {
              if (onSelect === selectHomeCountry) setCountrySearch(text);
              else if (onSelect === selectTopCountry) setTopSearch(text);
              else setNextSearch(text);
            }}
            autoFocus
          />
        </View>
        <ScrollView style={styles.countryScroll} nestedScrollEnabled keyboardShouldPersistTaps="handled">
          {filtered.map((country) => (
            <TouchableOpacity
              key={country}
              style={[styles.countryItem, { borderBottomColor: theme.border }]}
              onPress={() => onSelect(country)}
            >
              <Text style={styles.countryFlag}>{getCountryFlag(country) || ''}</Text>
              <Text style={[styles.countryName, { color: theme.text }]}>{country}</Text>
            </TouchableOpacity>
          ))}
          {filtered.length === 0 && (
            <Text style={[styles.noResults, { color: theme.textSecondary }]}>
              {t('editProfile.noCountriesFound')}
            </Text>
          )}
        </ScrollView>
      </View>
    );
  };

  const renderCountryButton = (value, label, onPress) => (
    <TouchableOpacity
      style={[styles.countryButton, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
      onPress={onPress}
    >
      {value ? (
        <View style={styles.selectedCountry}>
          <Text style={styles.selectedFlag}>{getCountryFlag(value) || ''}</Text>
          <Text style={[styles.selectedName, { color: theme.text }]}>{value}</Text>
        </View>
      ) : (
        <Text style={[styles.placeholderText, { color: theme.textSecondary }]}>{label}</Text>
      )}
      <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <View
          key={i}
          style={[
            styles.progressDot,
            {
              backgroundColor: i + 1 <= currentStep ? theme.primary : theme.border,
              width: i + 1 === currentStep ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );

  // Step 1: Home Country & Currency
  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Ionicons name="home" size={60} color={theme.primary} />
      <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step1Title')}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step1Subtitle')}</Text>

      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>{t('onboarding.homeCountryLabel')}</Text>
        {showCountryPicker ? (
          renderCountryList(countrySearch, selectHomeCountry)
        ) : (
          renderCountryButton(homeCountry, t('onboarding.selectCountry'), () => setShowCountryPicker(true))
        )}

        {homeCountry && (
          <View style={[styles.currencyInfo, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.currencyLabel, { color: theme.textSecondary }]}>{t('onboarding.currencyLabel')}</Text>
            <Text style={[styles.currencyValue, { color: theme.text }]}>
              {currencyData[homeCountry]?.symbol || '$'} {currency}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Step 2: Top 3 Countries
  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepIcon}>{'\u{1F3C6}'}</Text>
      <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step2Title')}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step2Subtitle')}</Text>

      <View style={styles.formSection}>
        {activeTopPicker ? (
          renderCountryList(topSearch, selectTopCountry)
        ) : (
          <>
            <View style={styles.medalRow}>
              <Text style={styles.medal}>{'\u{1F947}'}</Text>
              {renderCountryButton(top1, t('onboarding.selectCountry'), () => setActiveTopPicker(1))}
            </View>
            <View style={styles.medalRow}>
              <Text style={styles.medal}>{'\u{1F948}'}</Text>
              {renderCountryButton(top2, t('onboarding.selectCountry'), () => setActiveTopPicker(2))}
            </View>
            <View style={styles.medalRow}>
              <Text style={styles.medal}>{'\u{1F949}'}</Text>
              {renderCountryButton(top3, t('onboarding.selectCountry'), () => setActiveTopPicker(3))}
            </View>
          </>
        )}
      </View>
    </View>
  );

  // Step 3: Next 3 Destinations
  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Ionicons name="airplane" size={60} color={theme.primary} />
      <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step3Title')}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step3Subtitle')}</Text>

      <View style={styles.formSection}>
        {activeNextPicker ? (
          renderCountryList(nextSearch, selectNextCountry)
        ) : (
          <>
            <View style={styles.destinationRow}>
              <Ionicons name="airplane" size={20} color={theme.primary} />
              {renderCountryButton(next1, t('onboarding.selectCountry'), () => setActiveNextPicker(1))}
            </View>
            <View style={styles.destinationRow}>
              <Ionicons name="airplane" size={20} color={theme.secondary} />
              {renderCountryButton(next2, t('onboarding.selectCountry'), () => setActiveNextPicker(2))}
            </View>
            <View style={styles.destinationRow}>
              <Ionicons name="airplane" size={20} color={theme.orange} />
              {renderCountryButton(next3, t('onboarding.selectCountry'), () => setActiveNextPicker(3))}
            </View>
          </>
        )}
      </View>
    </View>
  );

  // Step 4: Bio & Photos
  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Ionicons name="camera" size={60} color={theme.primary} />
      <Text style={[styles.stepTitle, { color: theme.text }]}>{t('onboarding.step4Title')}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step4Subtitle')}</Text>

      <View style={styles.formSection}>
        <Text style={[styles.formLabel, { color: theme.textSecondary }]}>{t('onboarding.bioLabel')}</Text>
        <TextInput
          style={[styles.bioInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
          placeholder={t('onboarding.bioPlaceholder')}
          placeholderTextColor={theme.textSecondary}
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={200}
        />
        <Text style={[styles.charCount, { color: theme.textSecondary }]}>{bio.length}/200</Text>

        <TouchableOpacity
          style={[styles.addPhotosButton, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
          onPress={pickTravelPhoto}
        >
          <Ionicons name="images" size={24} color={theme.primary} />
          <Text style={[styles.addPhotosText, { color: theme.primary }]}>{t('onboarding.addTravelPhotos')}</Text>
        </TouchableOpacity>

        {travelPhotos.length > 0 && (
          <View style={styles.photosGrid}>
            {travelPhotos.map((photo, index) => (
              <View key={index} style={[styles.photoCard, { borderColor: theme.border }]}>
                <Image source={{ uri: photo }} style={styles.photoImage} />
                <TouchableOpacity
                  style={[styles.removePhotoBtn, { backgroundColor: theme.danger }]}
                  onPress={() => removeTravelPhoto(index)}
                >
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  // Step 5: Welcome Complete
  const renderStep5 = () => (
    <View style={[styles.stepContent, styles.centeredStep]}>
      <Ionicons name="checkmark-circle" size={80} color={theme.primary} />
      <Text style={[styles.stepTitle, { color: theme.text, marginTop: 20 }]}>{t('onboarding.step5Title')}</Text>
      <Text style={[styles.stepSubtitle, { color: theme.textSecondary }]}>{t('onboarding.step5Subtitle')}</Text>

      {/* Summary */}
      <View style={[styles.summaryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        {homeCountry && (
          <View style={styles.summaryRow}>
            <Ionicons name="home" size={18} color={theme.primary} />
            <Text style={[styles.summaryText, { color: theme.text }]}>{homeCountry}</Text>
          </View>
        )}
        {(top1 || top2 || top3) && (
          <View style={styles.summaryRow}>
            <Text style={{ fontSize: 18 }}>{'\u{1F3C6}'}</Text>
            <Text style={[styles.summaryText, { color: theme.text }]}>
              {[top1, top2, top3].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
        {(next1 || next2 || next3) && (
          <View style={styles.summaryRow}>
            <Ionicons name="airplane" size={18} color={theme.primary} />
            <Text style={[styles.summaryText, { color: theme.text }]}>
              {[next1, next2, next3].filter(Boolean).join(', ')}
            </Text>
          </View>
        )}
        {bio && (
          <View style={styles.summaryRow}>
            <Ionicons name="chatbubble" size={18} color={theme.primary} />
            <Text style={[styles.summaryText, { color: theme.text }]} numberOfLines={2}>{bio}</Text>
          </View>
        )}
        {travelPhotos.length > 0 && (
          <View style={styles.summaryRow}>
            <Ionicons name="images" size={18} color={theme.primary} />
            <Text style={[styles.summaryText, { color: theme.text }]}>{travelPhotos.length} photo(s)</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.startButton, { backgroundColor: theme.primary, opacity: isSaving ? 0.7 : 1 }]}
        onPress={handleFinish}
        disabled={isSaving}
      >
        {isSaving ? (
          <ActivityIndicator size="small" color={theme.background} />
        ) : (
          <>
            <Ionicons name="rocket" size={22} color={theme.background} />
            <Text style={[styles.startButtonText, { color: theme.background }]}>{t('onboarding.startExploring')}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return null;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header with Language Selector */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {currentStep > 1 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={theme.primary} />
            </TouchableOpacity>
          )}
        </View>
        <LanguageSelector />
      </View>

      {/* Progress Bar */}
      {renderProgressBar()}

      {/* Step Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderCurrentStep()}
      </ScrollView>

      {/* Bottom Navigation */}
      {currentStep < TOTAL_STEPS && (
        <View style={[styles.bottomBar, { borderTopColor: theme.border, paddingBottom: Math.max(insets.bottom, 16) }]}>
          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: theme.primary }]}
            onPress={handleNext}
          >
            <Text style={[styles.nextButtonText, { color: theme.background }]}>{t('common.next')}</Text>
            <Ionicons name="arrow-forward" size={18} color={theme.background} />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerLeft: {
    width: 40,
  },
  backButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  progressDot: {
    height: 8,
    borderRadius: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  stepContent: {
    paddingTop: 20,
    alignItems: 'center',
  },
  centeredStep: {
    justifyContent: 'center',
    paddingTop: 40,
  },
  stepIcon: {
    fontSize: 60,
  },
  stepTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 16,
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
    lineHeight: 22,
  },
  formSection: {
    width: '100%',
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  countryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
  },
  selectedCountry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  selectedFlag: {
    fontSize: 22,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '500',
  },
  placeholderText: {
    fontSize: 16,
  },
  pickerContainer: {
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 300,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  countryScroll: {
    maxHeight: 240,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
    borderBottomWidth: 0.5,
  },
  countryFlag: {
    fontSize: 22,
  },
  countryName: {
    fontSize: 16,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    fontSize: 14,
  },
  currencyInfo: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currencyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  medalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  medal: {
    fontSize: 28,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  addPhotosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  addPhotosText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  photoCard: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 20,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryText: {
    fontSize: 15,
    flex: 1,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginTop: 30,
    width: '100%',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
