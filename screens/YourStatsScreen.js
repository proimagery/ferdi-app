import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, StatusBar, Alert, ActivityIndicator, Platform, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import SpinningGlobe from '../components/SpinningGlobe';
import ShareableStatsCard from '../components/ShareableStatsCard';
import { useTranslation } from 'react-i18next';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function YourStatsScreen({ navigation }) {
  const { completedTrips, visitedCities, trips, profile, refreshData } = useAppContext();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showGlobeFullscreen, setShowGlobeFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [globeKey, setGlobeKey] = useState(0);
  const shareCardRef = useRef(null);

  // Force globe to remount when screen gains focus to fix loading issues
  useFocusEffect(
    useCallback(() => {
      // Small delay to ensure the screen is fully rendered before mounting the globe
      const timer = setTimeout(() => {
        setGlobeKey(prev => prev + 1);
      }, 100);
      return () => clearTimeout(timer);
    }, [])
  );

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

  // Countries visited is based only on manually added countries (completedTrips)
  const totalCountriesVisited = completedTrips.length;

  const totalPlannedTrips = trips.length;
  const totalCitiesVisited = visitedCities.length;

  // FIFA member count (211 territories) - most comprehensive list including individual nations
  // This includes UN members (193) plus territories like England, Scotland, Wales, etc.
  const worldCountries = 211;
  const worldCoverage = ((totalCountriesVisited / worldCountries) * 100).toFixed(1);

  const stats = [
    {
      icon: 'map',
      label: 'Countries Visited',
      value: totalCountriesVisited,
      color: '#4ade80',
      clickable: true,
      onPress: () => navigation.navigate('ManageCountries', {
        returnScreen: 'YourStats'
      }),
    },
    {
      icon: 'calendar',
      label: 'Planned Trips',
      value: totalPlannedTrips,
      color: '#60a5fa',
      clickable: false,
    },
    {
      icon: 'airplane',
      label: 'Completed Trips',
      value: completedTrips.length,
      color: '#f472b6',
      clickable: false,
    },
    {
      icon: 'business',
      label: 'Cities Visited',
      value: totalCitiesVisited,
      color: '#fb923c',
      clickable: true,
      onPress: () => navigation.navigate('ManageCities', {
        returnScreen: 'YourStats'
      }),
    },
    {
      icon: 'globe',
      label: 'World Coverage',
      value: `${worldCoverage}%`,
      color: '#a78bfa',
      clickable: true,
      onPress: () => navigation.navigate('WorldMap'),
    },
  ];

  // Get unique continents (comprehensive map)
  const continentMap = {
    // North America
    'USA': 'North America', 'United States': 'North America', 'Canada': 'North America',
    'Mexico': 'North America', 'Cuba': 'North America', 'Jamaica': 'North America',
    'Costa Rica': 'North America', 'Panama': 'North America', 'Guatemala': 'North America',
    'Belize': 'North America', 'Honduras': 'North America', 'Nicaragua': 'North America',
    'El Salvador': 'North America', 'Dominican Republic': 'North America',
    // Europe
    'France': 'Europe', 'Italy': 'Europe', 'Spain': 'Europe', 'Germany': 'Europe',
    'UK': 'Europe', 'England': 'Europe', 'Scotland': 'Europe', 'Wales': 'Europe', 'Northern Ireland': 'Europe', 'Netherlands': 'Europe', 'Belgium': 'Europe',
    'Switzerland': 'Europe', 'Austria': 'Europe', 'Greece': 'Europe', 'Portugal': 'Europe',
    'Poland': 'Europe', 'Sweden': 'Europe', 'Norway': 'Europe', 'Denmark': 'Europe',
    'Finland': 'Europe', 'Iceland': 'Europe', 'Ireland': 'Europe', 'Croatia': 'Europe',
    'Czech Republic': 'Europe', 'Hungary': 'Europe', 'Romania': 'Europe', 'Bulgaria': 'Europe',
    'Slovakia': 'Europe', 'Slovenia': 'Europe', 'Estonia': 'Europe', 'Latvia': 'Europe',
    'Lithuania': 'Europe', 'Luxembourg': 'Europe', 'Malta': 'Europe', 'Cyprus': 'Europe',
    'Albania': 'Europe', 'North Macedonia': 'Europe', 'Serbia': 'Europe', 'Montenegro': 'Europe',
    'Bosnia and Herzegovina': 'Europe', 'Russia': 'Europe',
    // Asia
    'Japan': 'Asia', 'China': 'Asia', 'India': 'Asia', 'Thailand': 'Asia', 'Vietnam': 'Asia',
    'South Korea': 'Asia', 'Singapore': 'Asia', 'Malaysia': 'Asia', 'Indonesia': 'Asia',
    'Philippines': 'Asia', 'Cambodia': 'Asia', 'Laos': 'Asia', 'Myanmar': 'Asia',
    'Hong Kong': 'Asia', 'Turkey': 'Asia', 'United Arab Emirates': 'Asia', 'Saudi Arabia': 'Asia',
    'Jordan': 'Asia', 'Oman': 'Asia', 'Qatar': 'Asia', 'Kuwait': 'Asia', 'Bahrain': 'Asia',
    'Lebanon': 'Asia', 'Nepal': 'Asia', 'Bhutan': 'Asia', 'Sri Lanka': 'Asia', 'Maldives': 'Asia',
    // South America
    'Brazil': 'South America', 'Argentina': 'South America', 'Chile': 'South America',
    'Peru': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Bolivia': 'South America', 'Uruguay': 'South America', 'Paraguay': 'South America',
    // Africa
    'Egypt': 'Africa', 'South Africa': 'Africa', 'Morocco': 'Africa', 'Kenya': 'Africa',
    'Tanzania': 'Africa', 'Ethiopia': 'Africa', 'Tunisia': 'Africa', 'Madagascar': 'Africa',
    'Zimbabwe': 'Africa', 'Zambia': 'Africa',
    // Oceania
    'Australia': 'Oceania', 'New Zealand': 'Oceania', 'Fiji': 'Oceania', 'Papua New Guinea': 'Oceania',
    // Antarctica
    'Antarctica': 'Antarctica',
  };

  // All 7 continents
  const allContinents = [
    'Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America'
  ];

  // UN Geoscheme Subregion mapping (22 subregions)
  const subregionMap = {
    // Eastern Africa
    'Burundi': 'Eastern Africa', 'Comoros': 'Eastern Africa', 'Djibouti': 'Eastern Africa',
    'Eritrea': 'Eastern Africa', 'Ethiopia': 'Eastern Africa', 'Kenya': 'Eastern Africa',
    'Madagascar': 'Eastern Africa', 'Malawi': 'Eastern Africa', 'Mauritius': 'Eastern Africa',
    'Mayotte': 'Eastern Africa', 'Mozambique': 'Eastern Africa', 'Réunion': 'Eastern Africa',
    'Rwanda': 'Eastern Africa', 'Seychelles': 'Eastern Africa', 'Somalia': 'Eastern Africa',
    'South Sudan': 'Eastern Africa', 'Tanzania': 'Eastern Africa', 'Uganda': 'Eastern Africa',
    'Zambia': 'Eastern Africa', 'Zimbabwe': 'Eastern Africa',
    // Middle Africa
    'Angola': 'Middle Africa', 'Cameroon': 'Middle Africa', 'Central African Republic': 'Middle Africa',
    'Chad': 'Middle Africa', 'Congo': 'Middle Africa', 'Democratic Republic of the Congo': 'Middle Africa',
    'Equatorial Guinea': 'Middle Africa', 'Gabon': 'Middle Africa', 'São Tomé and Príncipe': 'Middle Africa',
    // Northern Africa
    'Algeria': 'Northern Africa', 'Egypt': 'Northern Africa', 'Libya': 'Northern Africa',
    'Morocco': 'Northern Africa', 'Sudan': 'Northern Africa', 'Tunisia': 'Northern Africa',
    'Western Sahara': 'Northern Africa',
    // Southern Africa
    'Botswana': 'Southern Africa', 'Eswatini': 'Southern Africa', 'Lesotho': 'Southern Africa',
    'Namibia': 'Southern Africa', 'South Africa': 'Southern Africa',
    // Western Africa
    'Benin': 'Western Africa', 'Burkina Faso': 'Western Africa', 'Cabo Verde': 'Western Africa',
    'Côte d\'Ivoire': 'Western Africa', 'Ivory Coast': 'Western Africa', 'Gambia': 'Western Africa',
    'Ghana': 'Western Africa', 'Guinea': 'Western Africa', 'Guinea-Bissau': 'Western Africa',
    'Liberia': 'Western Africa', 'Mali': 'Western Africa', 'Mauritania': 'Western Africa',
    'Niger': 'Western Africa', 'Nigeria': 'Western Africa', 'Senegal': 'Western Africa',
    'Sierra Leone': 'Western Africa', 'Togo': 'Western Africa',
    // Caribbean
    'Anguilla': 'Caribbean', 'Antigua and Barbuda': 'Caribbean', 'Aruba': 'Caribbean',
    'Bahamas': 'Caribbean', 'Barbados': 'Caribbean', 'British Virgin Islands': 'Caribbean',
    'Cayman Islands': 'Caribbean', 'Cuba': 'Caribbean', 'Curaçao': 'Caribbean',
    'Dominica': 'Caribbean', 'Dominican Republic': 'Caribbean', 'Grenada': 'Caribbean',
    'Guadeloupe': 'Caribbean', 'Haiti': 'Caribbean', 'Jamaica': 'Caribbean',
    'Martinique': 'Caribbean', 'Montserrat': 'Caribbean', 'Puerto Rico': 'Caribbean',
    'Saint Barthélemy': 'Caribbean', 'Saint Kitts and Nevis': 'Caribbean',
    'Saint Lucia': 'Caribbean', 'Saint Martin': 'Caribbean', 'Saint Vincent and the Grenadines': 'Caribbean',
    'Sint Maarten': 'Caribbean', 'Trinidad and Tobago': 'Caribbean', 'Turks and Caicos Islands': 'Caribbean',
    'Virgin Islands': 'Caribbean',
    // Central America
    'Belize': 'Central America', 'Costa Rica': 'Central America', 'El Salvador': 'Central America',
    'Guatemala': 'Central America', 'Honduras': 'Central America', 'Mexico': 'Central America',
    'Nicaragua': 'Central America', 'Panama': 'Central America',
    // South America
    'Argentina': 'South America', 'Bolivia': 'South America', 'Brazil': 'South America',
    'Chile': 'South America', 'Colombia': 'South America', 'Ecuador': 'South America',
    'Falkland Islands': 'South America', 'French Guiana': 'South America', 'Guyana': 'South America',
    'Paraguay': 'South America', 'Peru': 'South America', 'Suriname': 'South America',
    'Uruguay': 'South America', 'Venezuela': 'South America',
    // Northern America
    'Bermuda': 'Northern America', 'Canada': 'Northern America', 'Greenland': 'Northern America',
    'Saint Pierre and Miquelon': 'Northern America', 'USA': 'Northern America',
    'United States': 'Northern America',
    // Central Asia
    'Kazakhstan': 'Central Asia', 'Kyrgyzstan': 'Central Asia', 'Tajikistan': 'Central Asia',
    'Turkmenistan': 'Central Asia', 'Uzbekistan': 'Central Asia',
    // Eastern Asia
    'China': 'Eastern Asia', 'Hong Kong': 'Eastern Asia', 'Japan': 'Eastern Asia',
    'Macao': 'Eastern Asia', 'Mongolia': 'Eastern Asia', 'North Korea': 'Eastern Asia',
    'South Korea': 'Eastern Asia', 'Taiwan': 'Eastern Asia',
    // South-eastern Asia
    'Brunei': 'South-eastern Asia', 'Cambodia': 'South-eastern Asia', 'Indonesia': 'South-eastern Asia',
    'Laos': 'South-eastern Asia', 'Malaysia': 'South-eastern Asia', 'Myanmar': 'South-eastern Asia',
    'Philippines': 'South-eastern Asia', 'Singapore': 'South-eastern Asia', 'Thailand': 'South-eastern Asia',
    'Timor-Leste': 'South-eastern Asia', 'Vietnam': 'South-eastern Asia',
    // Southern Asia
    'Afghanistan': 'Southern Asia', 'Bangladesh': 'Southern Asia', 'Bhutan': 'Southern Asia',
    'India': 'Southern Asia', 'Iran': 'Southern Asia', 'Maldives': 'Southern Asia',
    'Nepal': 'Southern Asia', 'Pakistan': 'Southern Asia', 'Sri Lanka': 'Southern Asia',
    // Western Asia
    'Armenia': 'Western Asia', 'Azerbaijan': 'Western Asia', 'Bahrain': 'Western Asia',
    'Cyprus': 'Western Asia', 'Georgia': 'Western Asia', 'Iraq': 'Western Asia',
    'Israel': 'Western Asia', 'Jordan': 'Western Asia', 'Kuwait': 'Western Asia',
    'Lebanon': 'Western Asia', 'Oman': 'Western Asia', 'Palestine': 'Western Asia',
    'Qatar': 'Western Asia', 'Saudi Arabia': 'Western Asia', 'Syria': 'Western Asia',
    'Turkey': 'Western Asia', 'United Arab Emirates': 'Western Asia', 'Yemen': 'Western Asia',
    // Eastern Europe
    'Belarus': 'Eastern Europe', 'Bulgaria': 'Eastern Europe', 'Czech Republic': 'Eastern Europe',
    'Czechia': 'Eastern Europe', 'Hungary': 'Eastern Europe', 'Moldova': 'Eastern Europe',
    'Poland': 'Eastern Europe', 'Romania': 'Eastern Europe', 'Russia': 'Eastern Europe',
    'Slovakia': 'Eastern Europe', 'Ukraine': 'Eastern Europe',
    // Northern Europe
    'Denmark': 'Northern Europe', 'Estonia': 'Northern Europe', 'Faroe Islands': 'Northern Europe',
    'Finland': 'Northern Europe', 'Iceland': 'Northern Europe', 'Ireland': 'Northern Europe',
    'Latvia': 'Northern Europe', 'Lithuania': 'Northern Europe', 'Norway': 'Northern Europe',
    'Sweden': 'Northern Europe', 'UK': 'Northern Europe', 'United Kingdom': 'Northern Europe',
    'England': 'Northern Europe', 'Scotland': 'Northern Europe', 'Wales': 'Northern Europe',
    'Northern Ireland': 'Northern Europe',
    // Southern Europe
    'Albania': 'Southern Europe', 'Andorra': 'Southern Europe', 'Bosnia and Herzegovina': 'Southern Europe',
    'Croatia': 'Southern Europe', 'Gibraltar': 'Southern Europe', 'Greece': 'Southern Europe',
    'Italy': 'Southern Europe', 'Kosovo': 'Southern Europe', 'Malta': 'Southern Europe',
    'Montenegro': 'Southern Europe', 'North Macedonia': 'Southern Europe', 'Portugal': 'Southern Europe',
    'San Marino': 'Southern Europe', 'Serbia': 'Southern Europe', 'Slovenia': 'Southern Europe',
    'Spain': 'Southern Europe', 'Vatican City': 'Southern Europe',
    // Western Europe
    'Austria': 'Western Europe', 'Belgium': 'Western Europe', 'France': 'Western Europe',
    'Germany': 'Western Europe', 'Liechtenstein': 'Western Europe', 'Luxembourg': 'Western Europe',
    'Monaco': 'Western Europe', 'Netherlands': 'Western Europe', 'Switzerland': 'Western Europe',
    // Australia and New Zealand
    'Australia': 'Australia and New Zealand', 'New Zealand': 'Australia and New Zealand',
    'Norfolk Island': 'Australia and New Zealand',
    // Melanesia
    'Fiji': 'Melanesia', 'New Caledonia': 'Melanesia', 'Papua New Guinea': 'Melanesia',
    'Solomon Islands': 'Melanesia', 'Vanuatu': 'Melanesia',
    // Micronesia
    'Guam': 'Micronesia', 'Kiribati': 'Micronesia', 'Marshall Islands': 'Micronesia',
    'Micronesia': 'Micronesia', 'Nauru': 'Micronesia', 'Northern Mariana Islands': 'Micronesia',
    'Palau': 'Micronesia',
    // Polynesia
    'American Samoa': 'Polynesia', 'Cook Islands': 'Polynesia', 'French Polynesia': 'Polynesia',
    'Niue': 'Polynesia', 'Pitcairn Islands': 'Polynesia', 'Samoa': 'Polynesia',
    'Tokelau': 'Polynesia', 'Tonga': 'Polynesia', 'Tuvalu': 'Polynesia', 'Wallis and Futuna': 'Polynesia',
  };

  // All 22 UN geoscheme subregions
  const allSubregions = [
    'Eastern Africa', 'Middle Africa', 'Northern Africa', 'Southern Africa', 'Western Africa',
    'Caribbean', 'Central America', 'South America', 'Northern America',
    'Central Asia', 'Eastern Asia', 'South-eastern Asia', 'Southern Asia', 'Western Asia',
    'Eastern Europe', 'Northern Europe', 'Southern Europe', 'Western Europe',
    'Australia and New Zealand', 'Melanesia', 'Micronesia', 'Polynesia'
  ];

  // Calculate visited subregions
  const visitedSubregions = [
    ...new Set(completedTrips.map((trip) => subregionMap[trip.country]).filter(Boolean)),
  ];
  const subregionCoverage = ((visitedSubregions.length / 22) * 100).toFixed(1);

  const visitedContinents = [
    ...new Set(completedTrips.map((trip) => continentMap[trip.country]).filter(Boolean)),
  ];

  // Calculate Travel Trends
  // 1. Most Visited Continent
  const continentCounts = {};
  [...completedTrips, ...trips.flatMap(t => t.countries)].forEach(trip => {
    const country = trip.country || trip.name;
    const continent = continentMap[country];
    if (continent) {
      continentCounts[continent] = (continentCounts[continent] || 0) + 1;
    }
  });

  const mostVisitedContinent = Object.keys(continentCounts).length > 0
    ? Object.entries(continentCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'Not enough data';

  // 2. Favorite Season (based on trip start dates)
  const seasonCounts = { Spring: 0, Summer: 0, Fall: 0, Winter: 0 };
  trips.forEach(trip => {
    trip.countries.forEach(country => {
      if (country.startDate) {
        const date = typeof country.startDate === 'string' ? new Date(country.startDate) : country.startDate;
        const month = date.getMonth();
        if (month >= 2 && month <= 4) seasonCounts.Spring++;
        else if (month >= 5 && month <= 7) seasonCounts.Summer++;
        else if (month >= 8 && month <= 10) seasonCounts.Fall++;
        else seasonCounts.Winter++;
      }
    });
  });

  const favoriteSeason = Object.keys(seasonCounts).length > 0 && Math.max(...Object.values(seasonCounts)) > 0
    ? Object.entries(seasonCounts).sort((a, b) => b[1] - a[1])[0][0]
    : 'Not enough data';

  // 3. Average Trip Length
  let totalDays = 0;
  let tripCount = 0;
  trips.forEach(trip => {
    trip.countries.forEach(country => {
      if (country.startDate && country.endDate) {
        const start = typeof country.startDate === 'string' ? new Date(country.startDate) : country.startDate;
        const end = typeof country.endDate === 'string' ? new Date(country.endDate) : country.endDate;
        const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (days > 0) {
          totalDays += days;
          tripCount++;
        }
      }
    });
  });

  const avgTripLength = tripCount > 0 ? Math.round(totalDays / tripCount) : 0;
  const avgTripLengthDisplay = avgTripLength > 0 ? `${avgTripLength} days` : 'Not enough data';

  // Handle download/share stats image
  const handleDownloadStats = () => {
    setMapReady(false); // Reset map ready state when opening modal
    setShowShareModal(true);
  };

  const saveToDevice = async () => {
    if (!shareCardRef.current) return;

    try {
      setIsSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.permissionRequired'), t('editProfile.cameraRollPermission'));
        setIsSaving(false);
        return;
      }

      // Capture the view
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Save to media library
      const asset = await MediaLibrary.createAssetAsync(uri);
      await MediaLibrary.createAlbumAsync('Ferdi', asset, false);

      setShowShareModal(false);
      Alert.alert(t('common.saved'), t('yourStats.shareYourStats'));
    } catch (error) {
      console.log('Error saving image:', error);
      Alert.alert(t('common.error'), t('editProfile.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  const shareImage = async () => {
    if (!shareCardRef.current) return;

    try {
      setIsSaving(true);

      // Capture the view
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share your Ferdi travel stats',
        });
      } else {
        Alert.alert(t('common.error'), t('editProfile.saveError'));
      }
    } catch (error) {
      console.log('Error sharing image:', error);
      Alert.alert(t('common.error'), t('editProfile.saveError'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.primary}
          colors={[theme.primary]}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('yourStats.title')}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{t('yourStats.subtitle')}</Text>
      </View>

      {/* Globe with Markers - At top of page */}
      {completedTrips.length > 0 && (
        <View style={styles.globeSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('yourStats.yourWorld')}</Text>
          <View style={styles.globeContainer}>
            <SpinningGlobe
              key={`globe-stats-${globeKey}`}
              completedTrips={completedTrips}
              visitedCities={visitedCities}
              onFullscreen={() => setShowGlobeFullscreen(true)}
              onDownload={handleDownloadStats}
            />
          </View>
        </View>
      )}

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => {
          const CardComponent = stat.clickable ? TouchableOpacity : View;
          return (
            <CardComponent
              key={index}
              style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={stat.clickable ? stat.onPress : undefined}
              activeOpacity={stat.clickable ? 0.7 : 1}
            >
              <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
                <Ionicons name={stat.icon} size={32} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: theme.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
              {stat.clickable && (
                <View style={styles.clickableIndicator}>
                  <Ionicons name="add-circle" size={20} color={stat.color} />
                </View>
              )}
            </CardComponent>
          );
        })}
      </View>

      {/* Fullscreen Globe Modal */}
      <Modal
        visible={showGlobeFullscreen}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setShowGlobeFullscreen(false)}
      >
        <View style={styles.fullscreenModal}>
          <StatusBar hidden />
          <SpinningGlobe
            completedTrips={completedTrips}
            visitedCities={visitedCities}
            isFullscreen={true}
          />
          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 10 }]}
            onPress={() => setShowGlobeFullscreen(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <View style={[styles.fullscreenHint, { bottom: insets.bottom + 20 }]}>
            <Text style={styles.hintText}>{t('yourStats.globeHint')}</Text>
          </View>
        </View>
      </Modal>

      {/* Share Stats Modal */}
      <Modal
        visible={showShareModal}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.shareModalOverlay}>
          <View style={[styles.shareModalContent, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              style={styles.shareModalClose}
              onPress={() => setShowShareModal(false)}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.shareModalTitle, { color: theme.text }]}>{t('yourStats.shareYourStats')}</Text>

            {/* The card to capture */}
            <View style={styles.shareCardWrapper}>
              <ShareableStatsCard
                ref={shareCardRef}
                completedTrips={completedTrips}
                visitedCities={visitedCities}
                trips={trips}
                profile={profile}
                onMapReady={(ready) => setMapReady(ready)}
              />
            </View>

            {/* Action buttons */}
            <View style={styles.shareButtonsRow}>
              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: theme.primary, opacity: (!mapReady || isSaving) ? 0.5 : 1 }]}
                onPress={saveToDevice}
                disabled={!mapReady || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : !mapReady ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.loading')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.saveToPhotos')}</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: '#3b82f6', opacity: (!mapReady || isSaving) ? 0.5 : 1 }]}
                onPress={shareImage}
                disabled={!mapReady || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : !mapReady ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.loading')}</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>{t('common.share')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Continents Visited */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('yourStats.continentsVisited')}</Text>
          <View style={[styles.subregionBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.subregionBadgeText, { color: theme.background }]}>
              {visitedContinents.length}/7
            </Text>
          </View>
        </View>
        <Text style={[styles.subregionSubtitle, { color: theme.textSecondary }]}>
          {t('yourStats.regionsDesc')}
        </Text>

        {/* Progress Bar */}
        <View style={[styles.subregionProgressContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.subregionProgressHeader}>
            <Text style={[styles.subregionProgressLabel, { color: theme.textSecondary }]}>{t('yourStats.continentCoverage')}</Text>
            <Text style={[styles.subregionProgressValue, { color: theme.primary }]}>
              {((visitedContinents.length / 7) * 100).toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.subregionProgressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.subregionProgressFill,
                { backgroundColor: theme.primary, width: `${(visitedContinents.length / 7) * 100}%` }
              ]}
            />
          </View>
        </View>

        {/* Visited Continents List */}
        {visitedContinents.length > 0 && (
          <View style={styles.subregionsList}>
            {visitedContinents.map((continent, index) => (
              <View
                key={index}
                style={[styles.subregionChip, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
              >
                <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                <Text style={[styles.subregionChipText, { color: theme.text }]}>{continent}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Remaining Continents */}
        {visitedContinents.length < 7 && (
          <View style={styles.unvisitedSubregions}>
            <Text style={[styles.unvisitedLabel, { color: theme.textSecondary }]}>
              {7 - visitedContinents.length} continent{7 - visitedContinents.length !== 1 ? 's' : ''} remaining
            </Text>
            <View style={styles.unvisitedList}>
              {allContinents.filter(c => !visitedContinents.includes(c)).map((continent, index) => (
                <View
                  key={index}
                  style={[styles.unvisitedChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                >
                  <Ionicons name="ellipse-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.unvisitedChipText, { color: theme.textSecondary }]}>{continent}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Subregions Section (UN Geoscheme) */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('yourStats.subregions')}</Text>
          <View style={[styles.subregionBadge, { backgroundColor: theme.primary }]}>
            <Text style={[styles.subregionBadgeText, { color: theme.background }]}>
              {visitedSubregions.length}/22
            </Text>
          </View>
        </View>
        <Text style={[styles.subregionSubtitle, { color: theme.textSecondary }]}>
          {t('yourStats.subregionsDesc')}
        </Text>

        {/* Progress Bar */}
        <View style={[styles.subregionProgressContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.subregionProgressHeader}>
            <Text style={[styles.subregionProgressLabel, { color: theme.textSecondary }]}>{t('yourStats.worldSubregionCoverage')}</Text>
            <Text style={[styles.subregionProgressValue, { color: theme.primary }]}>{subregionCoverage}%</Text>
          </View>
          <View style={[styles.subregionProgressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.subregionProgressFill,
                { backgroundColor: theme.primary, width: `${subregionCoverage}%` }
              ]}
            />
          </View>
        </View>

        {/* Visited Subregions List */}
        {visitedSubregions.length > 0 && (
          <View style={styles.subregionsList}>
            {visitedSubregions.map((subregion, index) => (
              <View
                key={index}
                style={[styles.subregionChip, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
              >
                <Ionicons name="checkmark-circle" size={14} color={theme.primary} />
                <Text style={[styles.subregionChipText, { color: theme.text }]}>{subregion}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Unvisited Subregions (collapsed view) */}
        {visitedSubregions.length < 22 && (
          <View style={styles.unvisitedSubregions}>
            <Text style={[styles.unvisitedLabel, { color: theme.textSecondary }]}>
              {22 - visitedSubregions.length} subregion{22 - visitedSubregions.length !== 1 ? 's' : ''} remaining
            </Text>
            <View style={styles.unvisitedList}>
              {allSubregions.filter(sr => !visitedSubregions.includes(sr)).map((subregion, index) => (
                <View
                  key={index}
                  style={[styles.unvisitedChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                >
                  <Ionicons name="ellipse-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.unvisitedChipText, { color: theme.textSecondary }]}>{subregion}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('yourStats.travelTrends')}</Text>
        <View style={[styles.trendsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>{t('yourStats.mostVisitedContinent')}</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{mostVisitedContinent}</Text>
              <Ionicons name="earth" size={20} color="#60a5fa" />
            </View>
          </View>
          <View style={[styles.trendDivider, { backgroundColor: theme.border }]} />
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>{t('yourStats.favoriteSeason')}</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{favoriteSeason}</Text>
              <Ionicons name="sunny" size={20} color="#fbbf24" />
            </View>
          </View>
          <View style={[styles.trendDivider, { backgroundColor: theme.border }]} />
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>{t('yourStats.averageTripLength')}</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{avgTripLengthDisplay}</Text>
              <Ionicons name="time" size={20} color={theme.primary} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('yourStats.travelMilestones')}</Text>
        <View style={[styles.milestoneCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <View style={styles.milestoneContent}>
            <Text style={[styles.milestoneTitle, { color: theme.text }]}>{t('yourStats.gettingStarted')}</Text>
            <Text style={[styles.milestoneDescription, { color: theme.textSecondary }]}>
              {totalCountriesVisited === 0
                ? 'Start your travel journey!'
                : totalCountriesVisited < 5
                ? 'You\'re just getting started!'
                : totalCountriesVisited < 10
                ? 'Novice Traveler'
                : totalCountriesVisited < 25
                ? 'Experienced Explorer'
                : totalCountriesVisited < 50
                ? 'World Wanderer'
                : 'Globe Trotter!'}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>
    </ScrollView>
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
  statsGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  clickableIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  globeSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  globeContainer: {
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  subregionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subregionBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  subregionSubtitle: {
    fontSize: 13,
    marginBottom: 15,
  },
  subregionProgressContainer: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  subregionProgressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subregionProgressLabel: {
    fontSize: 14,
  },
  subregionProgressValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subregionProgressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  subregionProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  subregionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 15,
  },
  subregionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
  },
  subregionChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  unvisitedSubregions: {
    marginTop: 5,
  },
  unvisitedLabel: {
    fontSize: 13,
    marginBottom: 10,
  },
  unvisitedList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  unvisitedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  unvisitedChipText: {
    fontSize: 12,
  },
  milestoneCard: {
    flexDirection: 'row',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    gap: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  milestoneDescription: {
    fontSize: 16,
  },
  trendsCard: {
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
  },
  trendItem: {
    paddingVertical: 12,
  },
  trendLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  trendValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trendValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendDivider: {
    height: 1,
    marginVertical: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
  fullscreenModal: {
    flex: 1,
    backgroundColor: '#000',
  },
  closeButton: {
    position: 'absolute',
    right: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullscreenHint: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  hintText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
  },
  shareModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  shareModalContent: {
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 420,
    alignItems: 'center',
  },
  shareModalClose: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  shareModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  shareCardWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  shareButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  shareActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  shareActionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
