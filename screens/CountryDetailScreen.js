import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function CountryDetailScreen({ route }) {
  const { country } = route.params;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.countryName}>{country.name}</Text>
        <Text style={styles.continent}>{country.continent}</Text>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <Text style={styles.statValue}>#{country.rank}</Text>
          <Text style={styles.statLabel}>World Rank</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color="#4ade80" />
          <Text style={styles.statValue}>{country.visitors}</Text>
          <Text style={styles.statLabel}>Annual Visitors</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top Attractions</Text>
        {country.highlights.map((highlight, index) => (
          <View key={index} style={styles.highlightCard}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={styles.highlightText}>{highlight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Travel Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#60a5fa" />
            <Text style={styles.infoText}>
              {country.name} is one of the most popular tourist destinations in the world.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#f472b6" />
            <Text style={styles.infoText}>Best time to visit varies by region and season.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#fb923c" />
            <Text style={styles.infoText}>Budget accordingly based on your travel style.</Text>
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
  countryName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  continent: {
    fontSize: 18,
    color: '#4ade80',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 10,
  },
  highlightText: {
    fontSize: 16,
    color: '#ffffff',
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    flex: 1,
    lineHeight: 20,
  },
});
