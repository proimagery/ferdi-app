import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function WorldBankScreen({ navigation }) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const countries = [
    {
      name: 'France',
      rank: 1,
      visitors: '89.4M',
      continent: 'Europe',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French Riviera'],
    },
    {
      name: 'Spain',
      rank: 2,
      visitors: '83.5M',
      continent: 'Europe',
      highlights: ['Sagrada Familia', 'Alhambra', 'Park Güell'],
    },
    {
      name: 'United States',
      rank: 3,
      visitors: '79.3M',
      continent: 'North America',
      highlights: ['Grand Canyon', 'Statue of Liberty', 'Golden Gate Bridge'],
    },
    {
      name: 'China',
      rank: 4,
      visitors: '65.7M',
      continent: 'Asia',
      highlights: ['Great Wall', 'Forbidden City', 'Terracotta Army'],
    },
    {
      name: 'Italy',
      rank: 5,
      visitors: '64.5M',
      continent: 'Europe',
      highlights: ['Colosseum', 'Venice Canals', 'Leaning Tower of Pisa'],
    },
    {
      name: 'Turkey',
      rank: 6,
      visitors: '51.2M',
      continent: 'Asia/Europe',
      highlights: ['Hagia Sophia', 'Cappadocia', 'Pamukkale'],
    },
    {
      name: 'Mexico',
      rank: 7,
      visitors: '45.0M',
      continent: 'North America',
      highlights: ['Chichen Itza', 'Cancun Beaches', 'Mexico City'],
    },
    {
      name: 'Thailand',
      rank: 8,
      visitors: '39.8M',
      continent: 'Asia',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Temples of Bangkok'],
    },
    {
      name: 'Germany',
      rank: 9,
      visitors: '39.6M',
      continent: 'Europe',
      highlights: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Berlin Wall'],
    },
    {
      name: 'England',
      rank: 10,
      visitors: '39.4M',
      continent: 'Europe',
      highlights: ['Big Ben', 'Buckingham Palace', 'Stonehenge'],
    },
  ];

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#4ade80';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Top Travel Destinations</Text>
        <Text style={styles.headerSubtitle}>Most visited countries worldwide</Text>
      </View>

      {countries.map((country, index) => (
        <TouchableOpacity
          key={index}
          style={styles.countryCard}
          onPress={() => navigation.navigate('CountryDetail', { country })}
        >
          <View style={styles.rankContainer}>
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(country.rank) }]}>
              <Text style={styles.rankText}>#{country.rank}</Text>
            </View>
          </View>

          <View style={styles.countryInfo}>
            <Text style={styles.countryName}>{country.name}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="people" size={16} color="#888" />
              <Text style={styles.infoText}>{country.visitors} annual visitors</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color="#888" />
              <Text style={styles.infoText}>{country.continent}</Text>
            </View>
          </View>

          <Ionicons name="chevron-forward" size={24} color="#888" />
        </TouchableOpacity>
      ))}

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
  countryCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  rankContainer: {
    marginRight: 15,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
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
