import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, StatusBar, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import SpinningGlobe from '../components/SpinningGlobe';
import ShareableStatsCard from '../components/ShareableStatsCard';
import DashboardWalkthrough from '../components/DashboardWalkthrough';
import { getTravelerRank, allRanks } from '../utils/rankingSystem';
import { useTranslation } from 'react-i18next';
import { getVisitedSubregions } from '../utils/subregionMap';
import { getActiveTrips, getTripProgress, getCurrentCountry } from '../utils/activeTripHelpers';
import { getCountryFlag } from '../utils/countryFlags';
import LocalMapsSection from '../components/LocalMapsSection';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function DashboardScreen({ navigation }) {
  const { completedTrips, visitedCities, trips, buddyRequestProfiles, profile, refreshData, savedSpots } = useAppContext();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showGlobeFullscreen, setShowGlobeFullscreen] = useState(false);
  const [showGlobeInfo, setShowGlobeInfo] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [globeKey, setGlobeKey] = useState(0);
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const shareCardRef = useRef(null);

  // Check if walkthrough should be shown (first visit)
  useEffect(() => {
    const checkWalkthrough = async () => {
      try {
        const completed = await AsyncStorage.getItem('@ferdi_walkthrough_complete');
        if (!completed) {
          setTimeout(() => setShowWalkthrough(true), 500);
        }
      } catch (err) {
        // Silently ignore
      }
    };
    checkWalkthrough();
  }, []);

  const handleWalkthroughComplete = async () => {
    setShowWalkthrough(false);
    try {
      await AsyncStorage.setItem('@ferdi_walkthrough_complete', 'true');
    } catch (err) {
      // Silently ignore
    }
  };

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

  // Active trips
  const activeTrips = getActiveTrips(trips);
  const activeTrip = activeTrips.length > 0 ? activeTrips[0] : null;
  const activeTripProgress = activeTrip ? getTripProgress(activeTrip) : null;
  const activeTripCurrentCountry = activeTrip ? getCurrentCountry(activeTrip) : null;

  // Rank is based only on manually added countries (completedTrips)
  const totalCountriesVisited = completedTrips.length;
  const travelerRank = getTravelerRank(totalCountriesVisited);
  const visitedSubregions = getVisitedSubregions(completedTrips);

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

  const features = [
    {
      title: 'Travel Stats',
      description: 'View and add to your travel stats',
      icon: 'stats-chart',
      color: '#a78bfa',
      screen: 'YourStats',
    },
    {
      title: 'My Trips',
      description: 'Plan and manage your trips',
      icon: 'airplane',
      color: '#4ade80',
      screen: 'MyTrips',
    },
    {
      title: 'Budget Maker',
      description: 'Create budget categories',
      icon: 'calculator',
      color: '#60a5fa',
      screen: 'BudgetMaker',
    },
    {
      title: 'My Budgets',
      description: 'Track your expenses',
      icon: 'wallet',
      color: '#f472b6',
      screen: 'MyBudget',
    },
    {
      title: 'Travel Mapper',
      description: 'Visualize your travels',
      icon: 'map',
      color: '#fb923c',
      screen: 'TravelMapper',
    },
    {
      title: 'World Info',
      description: 'Explore rankings and research the countries of the world',
      icon: 'globe',
      color: '#34d399',
      screen: 'WorldRank',
    },
    {
      title: 'My Profile',
      description: 'View your profile',
      icon: 'person-circle',
      color: '#06b6d4',
      screen: 'Profile',
    },
    {
      title: 'Leaderboard',
      description: 'Top travelers worldwide',
      icon: 'trophy',
      color: '#fbbf24',
      screen: 'Leaderboard',
    },
    {
      title: 'Travel Buddies',
      description: 'Your travel friends',
      icon: 'people',
      color: '#ec4899',
      screen: 'TravelBuddies',
    },
  ];

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
      {/* Active Trip Banner */}
      {activeTrip && (
        <TouchableOpacity
          style={[styles.activeTripBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
          onPress={() => navigation.navigate('ActiveTrip', { trip: activeTrip })}
        >
          <View style={[styles.activeTripIconCircle, { backgroundColor: theme.primary }]}>
            <Ionicons name="airplane" size={22} color="#fff" />
          </View>
          <View style={styles.activeTripBannerInfo}>
            <Text style={[styles.activeTripBannerTitle, { color: theme.text }]} numberOfLines={1}>
              {activeTrip.name}
            </Text>
            <Text style={[styles.activeTripBannerSub, { color: theme.textSecondary }]}>
              {activeTripProgress && t('activeTrip.dayOf', { current: activeTripProgress.daysElapsed, total: activeTripProgress.totalDays })}
              {activeTripCurrentCountry && ` · ${getCountryFlag(activeTripCurrentCountry.country_name || activeTripCurrentCountry.name)}`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.primary} />
        </TouchableOpacity>
      )}

      {/* Local Maps Section */}
      {activeTrip && (
        <LocalMapsSection
          trip={activeTrip}
          savedSpots={savedSpots}
          navigation={navigation}
          theme={theme}
        />
      )}

      {/* Spinning Globe Section */}
      <View style={styles.globeSection}>
        <View style={styles.globeHeaderRow}>
          <View style={styles.globeHeader}>
            <Ionicons name="earth" size={24} color={theme.primary} />
            <Text style={[styles.globeTitle, { color: theme.text }]}>{t('dashboard.title')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowGlobeInfo(!showGlobeInfo)}
            style={[styles.infoButton, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
          >
            <Ionicons name="information-circle" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.globeSubtitle, { color: theme.textSecondary }]}>
          {completedTrips.length > 0
            ? `${completedTrips.length} ${completedTrips.length === 1 ? 'country' : 'countries'} • ${visitedSubregions.length} ${visitedSubregions.length === 1 ? 'subregion' : 'subregions'}`
            : 'Add countries to see them on your globe'}
        </Text>
        <SpinningGlobe
          key={`globe-dashboard-${globeKey}`}
          completedTrips={completedTrips}
          visitedCities={visitedCities}
          onFullscreen={() => setShowGlobeFullscreen(true)}
          onDownload={handleDownloadStats}
        />
      </View>

      {/* Travel Stats Wide Button */}
      <View style={styles.travelStatsSection}>
        <TouchableOpacity
          style={[styles.travelStatsButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => navigation.navigate('YourStats')}
        >
          <View style={[styles.travelStatsIconContainer, { backgroundColor: '#a78bfa20' }]}>
            <Ionicons name="stats-chart" size={28} color="#a78bfa" />
          </View>
          <View style={styles.travelStatsTextContainer}>
            <Text style={[styles.travelStatsTitle, { color: theme.text }]}>{t('dashboard.myTravelStats')}</Text>
            <Text style={[styles.travelStatsDescription, { color: theme.textSecondary }]}>
              {t('dashboard.myTravelStatsDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* World Info Wide Button */}
      <View style={styles.travelStatsSection}>
        <TouchableOpacity
          style={[styles.travelStatsButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => navigation.navigate('WorldRank')}
        >
          <View style={[styles.travelStatsIconContainer, { backgroundColor: '#34d39920' }]}>
            <Ionicons name="globe" size={28} color="#34d399" />
          </View>
          <View style={styles.travelStatsTextContainer}>
            <Text style={[styles.travelStatsTitle, { color: theme.text }]}>{t('dashboard.worldInfo')}</Text>
            <Text style={[styles.travelStatsDescription, { color: theme.textSecondary }]}>
              {t('dashboard.worldInfoDesc')}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Globe Info Modal Overlay */}
      <Modal
        visible={showGlobeInfo}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGlobeInfo(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowGlobeInfo(false)}
        >
          <View style={[styles.infoBubble, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
            <TouchableOpacity
              style={styles.infoBubbleCloseButton}
              onPress={() => setShowGlobeInfo(false)}
            >
              <Ionicons name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
            <Ionicons name="information-circle" size={32} color="#fff" style={styles.infoBubbleIcon} />
            <Text style={styles.infoBubbleText}>
              {t('dashboard.statsInstructions')}
            </Text>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Rank Display Section */}
      <View style={styles.rankSection}>
        <View style={styles.rankHeader}>
          <View style={styles.rankTitleContainer}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={[styles.rankText, { color: theme.text }]}>{travelerRank}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowRankInfo(!showRankInfo)}
            style={[styles.infoButton, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
          >
            <Ionicons name="information-circle" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {/* Rank Info Dropdown */}
        {showRankInfo && (
          <View style={[styles.rankDropdown, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.dropdownHeader}>
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>{t('dashboard.allRanks')}</Text>
              <Text style={[styles.dropdownSubtitle, { color: theme.textSecondary }]}>
                {t('dashboard.allRanksDesc')}
              </Text>
            </View>
            <ScrollView style={styles.rankList} nestedScrollEnabled={true}>
              {allRanks.map((rankItem, index) => {
                const isCurrentRank = rankItem.rank === travelerRank;
                return (
                  <View
                    key={index}
                    style={[
                      styles.rankItem,
                      { backgroundColor: isCurrentRank ? theme.primary + '20' : 'transparent', borderColor: theme.border }
                    ]}
                  >
                    <View style={styles.rankItemLeft}>
                      {isCurrentRank && <Ionicons name="star" size={16} color="#fbbf24" style={{ marginRight: 8 }} />}
                      <Text style={[styles.rankItemName, { color: theme.text, fontWeight: isCurrentRank ? 'bold' : 'normal' }]}>
                        {rankItem.rank}
                      </Text>
                    </View>
                    <Text style={[styles.rankItemCountries, { color: theme.textSecondary }]}>
                      {rankItem.countries} countries
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Quick Access Row - My Profile, Travel Buddies, Leaderboard */}
      <View style={styles.quickAccessRow}>
        {features.filter(f => ['Profile', 'TravelBuddies', 'Leaderboard'].includes(f.screen)).map((feature, index) => {
          const hasBadge = feature.screen === 'TravelBuddies' && buddyRequestProfiles.length > 0;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.quickAccessCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <View style={[styles.quickAccessIconContainer, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon} size={24} color={feature.color} />
                {hasBadge && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {buddyRequestProfiles.length > 9 ? '9+' : buddyRequestProfiles.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.quickAccessTitle, { color: theme.text }]} numberOfLines={1}>{feature.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{t('dashboard.tools')}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{t('dashboard.toolsDesc')}</Text>
      </View>

      <View style={styles.grid}>
        {features.filter(f => !['YourStats', 'WorldRank', 'TravelBuddies', 'Leaderboard', 'Profile'].includes(f.screen)).map((feature, index) => {
          const hasBadge = feature.screen === 'TravelBuddies' && buddyRequestProfiles.length > 0;
          return (
            <TouchableOpacity
              key={index}
              style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => navigation.navigate(feature.screen)}
            >
              <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
                <Ionicons name={feature.icon} size={32} color={feature.color} />
                {hasBadge && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {buddyRequestProfiles.length > 9 ? '9+' : buddyRequestProfiles.length}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{feature.title}</Text>
              <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{feature.description}</Text>
            </TouchableOpacity>
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
            <Text style={styles.hintText}>{t('dashboard.globeHint')}</Text>
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

            <Text style={[styles.shareModalTitle, { color: theme.text }]}>{t('dashboard.shareYourStats')}</Text>

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
                    <Text style={styles.shareActionButtonText}>{t('common.saveToPhotos')}</Text>
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
                    <Text style={styles.shareActionButtonText}>{t('common.share')}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
      </View>

      {/* Dashboard Walkthrough for new users */}
      <DashboardWalkthrough
        visible={showWalkthrough}
        onComplete={handleWalkthroughComplete}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  grid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
  },
  rankSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    marginTop: 0,
    marginBottom: -5,
  },
  rankHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  rankTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rankText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankDropdown: {
    borderRadius: 15,
    borderWidth: 1,
    padding: 15,
    maxHeight: 400,
  },
  dropdownHeader: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dropdownSubtitle: {
    fontSize: 12,
  },
  rankList: {
    maxHeight: 300,
  },
  rankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
  },
  rankItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankItemName: {
    fontSize: 14,
  },
  rankItemCountries: {
    fontSize: 12,
  },
  activeTripBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  activeTripIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTripBannerInfo: {
    flex: 1,
  },
  activeTripBannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeTripBannerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  globeSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  globeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  travelStatsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  travelStatsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
    borderWidth: 1,
  },
  travelStatsIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  travelStatsTextContainer: {
    flex: 1,
  },
  travelStatsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  travelStatsDescription: {
    fontSize: 14,
  },
  globeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  globeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  globeSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  quickAccessRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
    justifyContent: 'space-between',
  },
  quickAccessCard: {
    flex: 1,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    alignItems: 'center',
  },
  quickAccessIconContainer: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  quickAccessTitle: {
    fontSize: 12,
    fontWeight: '600',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  infoBubble: {
    borderRadius: 20,
    padding: 25,
    maxWidth: 320,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  infoBubbleCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  infoBubbleIcon: {
    marginBottom: 15,
  },
  infoBubbleText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: '500',
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
