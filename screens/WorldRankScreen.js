import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorldRankScreen({ navigation }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Real-world tourism data based on UNWTO statistics
  const allCountries = [
    {
      name: 'France',
      flag: '🇫🇷',
      rank: 1,
      visitors: '89.4M',
      continent: 'Europe',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French Riviera', 'Mont Saint-Michel'],
      rankings: { transportation: 9, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Spain',
      flag: '🇪🇸',
      rank: 2,
      visitors: '83.7M',
      continent: 'Europe',
      highlights: ['Sagrada Familia', 'Alhambra', 'Park Güell', 'Prado Museum'],
      rankings: { transportation: 8, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'United States',
      flag: '🇺🇸',
      rank: 3,
      visitors: '79.3M',
      continent: 'North America',
      highlights: ['Grand Canyon', 'Statue of Liberty', 'Golden Gate Bridge', 'Times Square'],
      rankings: { transportation: 7, food: 8, activities: 10, crowdedness: 6 },
    },
    {
      name: 'China',
      flag: '🇨🇳',
      rank: 4,
      visitors: '65.7M',
      continent: 'Asia',
      highlights: ['Great Wall', 'Forbidden City', 'Terracotta Army', 'Li River'],
      rankings: { transportation: 8, food: 9, activities: 9, crowdedness: 4 },
    },
    {
      name: 'Italy',
      flag: '🇮🇹',
      rank: 5,
      visitors: '64.5M',
      continent: 'Europe',
      highlights: ['Colosseum', 'Venice Canals', 'Vatican City', 'Tuscany'],
      rankings: { transportation: 7, food: 10, activities: 9, crowdedness: 4 },
    },
    {
      name: 'Turkey',
      flag: '🇹🇷',
      rank: 6,
      visitors: '51.2M',
      continent: 'Asia/Europe',
      highlights: ['Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Blue Mosque'],
      rankings: { transportation: 6, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      rank: 7,
      visitors: '45.0M',
      continent: 'North America',
      highlights: ['Chichen Itza', 'Cancun Beaches', 'Mexico City', 'Tulum'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      rank: 8,
      visitors: '39.8M',
      continent: 'Asia',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Temples of Bangkok', 'Phuket'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      rank: 9,
      visitors: '39.6M',
      continent: 'Europe',
      highlights: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Berlin Wall', 'Oktoberfest'],
      rankings: { transportation: 10, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'United Kingdom',
      flag: '🇬🇧',
      rank: 10,
      visitors: '39.4M',
      continent: 'Europe',
      highlights: ['Big Ben', 'Buckingham Palace', 'Stonehenge', 'Tower of London'],
      rankings: { transportation: 8, food: 7, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Japan',
      flag: '🇯🇵',
      rank: 11,
      visitors: '32.2M',
      continent: 'Asia',
      highlights: ['Mount Fuji', 'Tokyo Tower', 'Kyoto Temples', 'Cherry Blossoms'],
      rankings: { transportation: 10, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Greece',
      flag: '🇬🇷',
      rank: 12,
      visitors: '31.3M',
      continent: 'Europe',
      highlights: ['Acropolis', 'Santorini', 'Delphi', 'Mykonos'],
      rankings: { transportation: 6, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Austria',
      flag: '🇦🇹',
      rank: 13,
      visitors: '31.9M',
      continent: 'Europe',
      highlights: ['Schönbrunn Palace', 'Vienna Opera', 'Austrian Alps', 'Salzburg'],
      rankings: { transportation: 9, food: 8, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      rank: 14,
      visitors: '26.1M',
      continent: 'Asia',
      highlights: ['Petronas Towers', 'Langkawi', 'Penang', 'Cameron Highlands'],
      rankings: { transportation: 7, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Portugal',
      flag: '🇵🇹',
      rank: 15,
      visitors: '27.0M',
      continent: 'Europe',
      highlights: ['Belém Tower', 'Porto Wine Cellars', 'Algarve Beaches', 'Lisbon Trams'],
      rankings: { transportation: 7, food: 9, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Canada',
      flag: '🇨🇦',
      rank: 16,
      visitors: '25.0M',
      continent: 'North America',
      highlights: ['Niagara Falls', 'Banff National Park', 'CN Tower', 'Quebec City'],
      rankings: { transportation: 8, food: 7, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Poland',
      flag: '🇵🇱',
      rank: 17,
      visitors: '21.2M',
      continent: 'Europe',
      highlights: ['Wawel Castle', 'Auschwitz Museum', 'Old Town Warsaw', 'Krakow Square'],
      rankings: { transportation: 7, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Netherlands',
      flag: '🇳🇱',
      rank: 18,
      visitors: '20.1M',
      continent: 'Europe',
      highlights: ['Amsterdam Canals', 'Keukenhof Gardens', 'Windmills', 'Anne Frank House'],
      rankings: { transportation: 9, food: 7, activities: 8, crowdedness: 6 },
    },
    {
      name: 'South Korea',
      flag: '🇰🇷',
      rank: 19,
      visitors: '17.5M',
      continent: 'Asia',
      highlights: ['Gyeongbokgung Palace', 'Jeju Island', 'DMZ', 'Seoul Tower'],
      rankings: { transportation: 10, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Vietnam',
      flag: '🇻🇳',
      rank: 20,
      visitors: '18.0M',
      continent: 'Asia',
      highlights: ['Ha Long Bay', 'Hoi An Ancient Town', 'Cu Chi Tunnels', 'Mekong Delta'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 5 },
    },
  ];

  const topTen = allCountries.slice(0, 10);
  const remainingCountries = allCountries.slice(10);

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#4ade80';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>World Rank</Text>
        <Text style={styles.headerSubtitle}>Most visited countries worldwide</Text>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.sectionTitle}>Top 10 Countries</Text>
        {topTen.map((country, index) => (
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

            <Text style={styles.flagEmoji}>{country.flag}</Text>

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
      </View>

      <View style={styles.dropdownSection}>
        <Text style={styles.sectionTitle}>More Countries</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Ionicons name="search" size={20} color="#4ade80" />
          <Text style={styles.dropdownButtonText}>
            Browse Countries #11-#20
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#4ade80"
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            {remainingCountries.map((country, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setDropdownVisible(false);
                  navigation.navigate('CountryDetail', { country });
                }}
              >
                <View style={[styles.smallRankBadge, { backgroundColor: getRankColor(country.rank) }]}>
                  <Text style={styles.smallRankText}>#{country.rank}</Text>
                </View>
                <Text style={styles.dropdownFlag}>{country.flag}</Text>
                <View style={styles.dropdownCountryInfo}>
                  <Text style={styles.dropdownCountryName}>{country.name}</Text>
                  <Text style={styles.dropdownCountryVisitors}>{country.visitors} visitors</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        )}
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
  topSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    paddingHorizontal: 20,
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
    marginRight: 12,
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
  flagEmoji: {
    fontSize: 32,
    marginRight: 12,
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
  dropdownSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dropdownList: {
    marginTop: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  smallRankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  dropdownFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  dropdownCountryInfo: {
    flex: 1,
  },
  dropdownCountryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  dropdownCountryVisitors: {
    fontSize: 13,
    color: '#888',
  },
});
