import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function YourStatsScreen({ route }) {
  const completedTrips = route.params?.completedTrips || [];
  const trips = route.params?.trips || [];

  // Calculate statistics
  const totalCountriesVisited = completedTrips.length;
  const totalPlannedTrips = trips.length;
  const totalPlannedCountries = trips.reduce((sum, trip) => sum + trip.countries.length, 0);
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget, 0);

  // Approximate world countries count
  const worldCountries = 195;
  const worldCoverage = ((totalCountriesVisited / worldCountries) * 100).toFixed(1);

  const stats = [
    {
      icon: 'airplane',
      label: 'Completed Trips',
      value: totalCountriesVisited,
      color: '#4ade80',
    },
    {
      icon: 'calendar',
      label: 'Planned Trips',
      value: totalPlannedTrips,
      color: '#60a5fa',
    },
    {
      icon: 'map',
      label: 'Planned Countries',
      value: totalPlannedCountries,
      color: '#f472b6',
    },
    {
      icon: 'wallet',
      label: 'Total Budget',
      value: `$${totalBudget}`,
      color: '#fb923c',
    },
    {
      icon: 'globe',
      label: 'World Coverage',
      value: `${worldCoverage}%`,
      color: '#a78bfa',
    },
  ];

  // Get unique continents (simplified)
  const continentMap = {
    'USA': 'North America',
    'United States': 'North America',
    'Canada': 'North America',
    'Mexico': 'North America',
    'France': 'Europe',
    'Italy': 'Europe',
    'Spain': 'Europe',
    'Germany': 'Europe',
    'UK': 'Europe',
    'United Kingdom': 'Europe',
    'Japan': 'Asia',
    'China': 'Asia',
    'India': 'Asia',
    'Thailand': 'Asia',
    'Australia': 'Oceania',
    'Brazil': 'South America',
  };

  const visitedContinents = [
    ...new Set(completedTrips.map((trip) => continentMap[trip.country]).filter(Boolean)),
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Travel Stats</Text>
        <Text style={styles.headerSubtitle}>Track your journey around the world</Text>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: stat.color + '20' }]}>
              <Ionicons name={stat.icon} size={32} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {visitedContinents.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Continents Visited</Text>
          <View style={styles.continentsList}>
            {visitedContinents.map((continent, index) => (
              <View key={index} style={styles.continentChip}>
                <Ionicons name="location" size={16} color="#4ade80" />
                <Text style={styles.continentText}>{continent}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Milestones</Text>
        <View style={styles.milestoneCard}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <View style={styles.milestoneContent}>
            <Text style={styles.milestoneTitle}>Getting Started</Text>
            <Text style={styles.milestoneDescription}>
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
    </ScrollView>
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
  statsGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    color: '#ffffff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
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
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 5,
  },
  continentText: {
    color: '#ffffff',
    fontSize: 14,
  },
  milestoneCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 15,
  },
  milestoneContent: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  milestoneDescription: {
    fontSize: 16,
    color: '#888888',
  },
});
