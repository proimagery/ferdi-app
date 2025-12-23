import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import SpinningGlobe from '../components/SpinningGlobe';
import { getTravelerRank, allRanks } from '../utils/rankingSystem';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function DashboardScreen({ navigation }) {
  const { completedTrips, visitedCities, trips } = useAppContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [showRankInfo, setShowRankInfo] = useState(false);
  const [showGlobeFullscreen, setShowGlobeFullscreen] = useState(false);

  // Rank is based only on manually added countries (completedTrips)
  const totalCountriesVisited = completedTrips.length;
  const travelerRank = getTravelerRank(totalCountriesVisited);

  const features = [
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
      title: 'Your Stats',
      description: 'View travel statistics',
      icon: 'stats-chart',
      color: '#a78bfa',
      screen: 'YourStats',
    },
    {
      title: 'World Rank',
      description: 'Explore country rankings',
      icon: 'globe',
      color: '#34d399',
      screen: 'WorldRank',
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
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Dashboard</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Choose a feature to get started</Text>
      </View>

      <View style={styles.grid}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => navigation.navigate(feature.screen)}
          >
            <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
              <Ionicons name={feature.icon} size={32} color={feature.color} />
            </View>
            <Text style={[styles.cardTitle, { color: theme.text }]}>{feature.title}</Text>
            <Text style={[styles.cardDescription, { color: theme.textSecondary }]}>{feature.description}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
              <Text style={[styles.dropdownTitle, { color: theme.text }]}>All Ranks</Text>
              <Text style={[styles.dropdownSubtitle, { color: theme.textSecondary }]}>
                Countries needed to reach each rank
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

      {/* Spinning Globe Section */}
      <View style={styles.globeSection}>
        <View style={styles.globeHeader}>
          <Ionicons name="earth" size={24} color={theme.primary} />
          <Text style={[styles.globeTitle, { color: theme.text }]}>Your Travel Journey</Text>
        </View>
        <Text style={[styles.globeSubtitle, { color: theme.textSecondary }]}>
          {completedTrips.length + visitedCities.length > 0
            ? `${completedTrips.length} ${completedTrips.length === 1 ? 'country' : 'countries'} • ${visitedCities.length} ${visitedCities.length === 1 ? 'city' : 'cities'}`
            : 'Add countries and cities to see them on your globe'}
        </Text>
        <SpinningGlobe
          completedTrips={completedTrips}
          visitedCities={visitedCities}
          onFullscreen={() => setShowGlobeFullscreen(true)}
        />
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
            <Text style={styles.hintText}>Pinch to zoom • Drag to rotate</Text>
          </View>
        </View>
      </Modal>

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
    paddingTop: 40,
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
    paddingTop: 20,
    paddingBottom: 10,
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
  globeSection: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  globeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  globeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  globeSubtitle: {
    fontSize: 14,
    marginBottom: 20,
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
});
