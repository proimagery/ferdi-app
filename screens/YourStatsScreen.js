import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, StatusBar, Alert, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import SpinningGlobe from '../components/SpinningGlobe';
import ShareableStatsCard from '../components/ShareableStatsCard';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function YourStatsScreen({ navigation }) {
  const { completedTrips, visitedCities, trips, profile } = useAppContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showGlobeFullscreen, setShowGlobeFullscreen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const shareCardRef = useRef(null);

  // Countries visited is based only on manually added countries (completedTrips)
  const totalCountriesVisited = completedTrips.length;

  const totalPlannedTrips = trips.length;
  const totalCitiesVisited = visitedCities.length;

  // Approximate world countries count
  const worldCountries = 195;
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
  };

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
    setShowShareModal(true);
  };

  const saveToDevice = async () => {
    if (!shareCardRef.current) return;

    try {
      setIsSaving(true);

      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to save images to your device.');
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
      Alert.alert('Saved!', 'Your travel stats have been saved to your photos.');
    } catch (error) {
      console.log('Error saving image:', error);
      Alert.alert('Error', 'Failed to save image. Please try again.');
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
        Alert.alert('Sharing not available', 'Sharing is not available on this device.');
      }
    } catch (error) {
      console.log('Error sharing image:', error);
      Alert.alert('Error', 'Failed to share image. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Your Travel Stats</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Track your journey around the world</Text>
      </View>

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

      {/* Globe with Markers */}
      {completedTrips.length > 0 && (
        <View style={styles.globeSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Your World</Text>
          <View style={styles.globeContainer}>
            <SpinningGlobe
              completedTrips={completedTrips}
              visitedCities={visitedCities}
              onFullscreen={() => setShowGlobeFullscreen(true)}
              onDownload={handleDownloadStats}
            />
          </View>
        </View>
      )}

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
            <Text style={styles.hintText}>Pinch to zoom • Drag to rotate</Text>
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

            <Text style={[styles.shareModalTitle, { color: theme.text }]}>Share Your Stats</Text>

            {/* The card to capture */}
            <View style={styles.shareCardWrapper}>
              <ShareableStatsCard
                ref={shareCardRef}
                completedTrips={completedTrips}
                visitedCities={visitedCities}
                trips={trips}
                profile={profile}
              />
            </View>

            {/* Action buttons */}
            <View style={styles.shareButtonsRow}>
              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: theme.primary }]}
                onPress={saveToDevice}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="download" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>Save to Photos</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.shareActionButton, { backgroundColor: '#3b82f6' }]}
                onPress={shareImage}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="share-social" size={20} color="#fff" />
                    <Text style={styles.shareActionButtonText}>Share</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {visitedContinents.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Continents Visited</Text>
          <View style={styles.continentsList}>
            {visitedContinents.map((continent, index) => (
              <View key={index} style={[styles.continentChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Ionicons name="location" size={16} color={theme.primary} />
                <Text style={[styles.continentText, { color: theme.text }]}>{continent}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Trends</Text>
        <View style={[styles.trendsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>Most Visited Continent</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{mostVisitedContinent}</Text>
              <Ionicons name="earth" size={20} color="#60a5fa" />
            </View>
          </View>
          <View style={[styles.trendDivider, { backgroundColor: theme.border }]} />
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>Favorite Season</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{favoriteSeason}</Text>
              <Ionicons name="sunny" size={20} color="#fbbf24" />
            </View>
          </View>
          <View style={[styles.trendDivider, { backgroundColor: theme.border }]} />
          <View style={styles.trendItem}>
            <Text style={[styles.trendLabel, { color: theme.textSecondary }]}>Average Trip Length</Text>
            <View style={styles.trendValueContainer}>
              <Text style={[styles.trendValue, { color: theme.text }]}>{avgTripLengthDisplay}</Text>
              <Ionicons name="time" size={20} color={theme.primary} />
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Milestones</Text>
        <View style={[styles.milestoneCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <View style={styles.milestoneContent}>
            <Text style={[styles.milestoneTitle, { color: theme.text }]}>Getting Started</Text>
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
  continentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  continentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  continentText: {
    fontSize: 14,
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
