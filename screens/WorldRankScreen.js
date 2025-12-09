import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorldRankScreen({ navigation }) {

  const allCountries = [
    {
      name: 'France',
      rank: 1,
      visitors: '89.4M',
      continent: 'Europe',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French Riviera'],
      rankings: {
        transportation: 8,
        food: 9,
        activities: 9,
        crowdedness: 6,
      },
    },
    {
      name: 'Spain',
      rank: 2,
      visitors: '83.5M',
      continent: 'Europe',
      highlights: ['Sagrada Familia', 'Alhambra', 'Park Güell'],
      rankings: {
        transportation: 7,
        food: 9,
        activities: 9,
        crowdedness: 6,
      },
    },
    {
      name: 'United States',
      rank: 3,
      visitors: '79.3M',
      continent: 'North America',
      highlights: ['Grand Canyon', 'Statue of Liberty', 'Golden Gate Bridge'],
      rankings: {
        transportation: 7,
        food: 8,
        activities: 10,
        crowdedness: 7,
      },
    },
    {
      name: 'China',
      rank: 4,
      visitors: '65.7M',
      continent: 'Asia',
      highlights: ['Great Wall', 'Forbidden City', 'Terracotta Army'],
      rankings: {
        transportation: 8,
        food: 9,
        activities: 9,
        crowdedness: 4,
      },
    },
    {
      name: 'Italy',
      rank: 5,
      visitors: '64.5M',
      continent: 'Europe',
      highlights: ['Colosseum', 'Venice Canals', 'Leaning Tower of Pisa'],
      rankings: {
        transportation: 7,
        food: 10,
        activities: 9,
        crowdedness: 5,
      },
    },
    {
      name: 'Turkey',
      rank: 6,
      visitors: '51.2M',
      continent: 'Asia/Europe',
      highlights: ['Hagia Sophia', 'Cappadocia', 'Pamukkale'],
      rankings: {
        transportation: 6,
        food: 8,
        activities: 8,
        crowdedness: 6,
      },
    },
    {
      name: 'Mexico',
      rank: 7,
      visitors: '45.0M',
      continent: 'North America',
      highlights: ['Chichen Itza', 'Cancun Beaches', 'Mexico City'],
      rankings: {
        transportation: 6,
        food: 9,
        activities: 9,
        crowdedness: 6,
      },
    },
    {
      name: 'Thailand',
      rank: 8,
      visitors: '39.8M',
      continent: 'Asia',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Temples of Bangkok'],
      rankings: {
        transportation: 6,
        food: 9,
        activities: 9,
        crowdedness: 5,
      },
    },
    {
      name: 'Germany',
      rank: 9,
      visitors: '39.6M',
      continent: 'Europe',
      highlights: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Berlin Wall'],
      rankings: {
        transportation: 9,
        food: 7,
        activities: 8,
        crowdedness: 7,
      },
    },
    {
      name: 'United Kingdom',
      rank: 10,
      visitors: '39.4M',
      continent: 'Europe',
      highlights: ['Big Ben', 'Buckingham Palace', 'Stonehenge'],
      rankings: {
        transportation: 8,
        food: 7,
        activities: 9,
        crowdedness: 7,
      },
    },
    {
      name: 'Japan',
      rank: 11,
      visitors: '32.2M',
      continent: 'Asia',
      highlights: ['Mount Fuji', 'Tokyo Tower', 'Kyoto Temples'],
      rankings: {
        transportation: 10,
        food: 10,
        activities: 9,
        crowdedness: 6,
      },
    },
    {
      name: 'Greece',
      rank: 12,
      visitors: '31.3M',
      continent: 'Europe',
      highlights: ['Acropolis', 'Santorini', 'Delphi'],
      rankings: {
        transportation: 6,
        food: 9,
        activities: 8,
        crowdedness: 6,
      },
    },
    {
      name: 'Portugal',
      rank: 13,
      visitors: '27.0M',
      continent: 'Europe',
      highlights: ['Belém Tower', 'Porto Wine Cellars', 'Algarve Beaches'],
      rankings: {
        transportation: 7,
        food: 9,
        activities: 8,
        crowdedness: 7,
      },
    },
    {
      name: 'Austria',
      rank: 14,
      visitors: '31.9M',
      continent: 'Europe',
      highlights: ['Schönbrunn Palace', 'Vienna Opera', 'Alps'],
      rankings: {
        transportation: 9,
        food: 8,
        activities: 8,
        crowdedness: 7,
      },
    },
    {
      name: 'Malaysia',
      rank: 15,
      visitors: '26.1M',
      continent: 'Asia',
      highlights: ['Petronas Towers', 'Langkawi', 'Penang'],
      rankings: {
        transportation: 7,
        food: 9,
        activities: 8,
        crowdedness: 6,
      },
    },
    {
      name: 'Canada',
      rank: 16,
      visitors: '25.0M',
      continent: 'North America',
      highlights: ['Niagara Falls', 'Banff National Park', 'CN Tower'],
      rankings: {
        transportation: 8,
        food: 7,
        activities: 9,
        crowdedness: 8,
      },
    },
    {
      name: 'Poland',
      rank: 17,
      visitors: '21.2M',
      continent: 'Europe',
      highlights: ['Wawel Castle', 'Auschwitz', 'Old Town Warsaw'],
      rankings: {
        transportation: 7,
        food: 7,
        activities: 7,
        crowdedness: 7,
      },
    },
    {
      name: 'Netherlands',
      rank: 18,
      visitors: '20.1M',
      continent: 'Europe',
      highlights: ['Canals of Amsterdam', 'Keukenhof Gardens', 'Windmills'],
      rankings: {
        transportation: 9,
        food: 7,
        activities: 8,
        crowdedness: 7,
      },
    },
    {
      name: 'South Korea',
      rank: 19,
      visitors: '17.5M',
      continent: 'Asia',
      highlights: ['Gyeongbokgung Palace', 'Jeju Island', 'DMZ'],
      rankings: {
        transportation: 9,
        food: 9,
        activities: 8,
        crowdedness: 6,
      },
    },
    {
      name: 'Vietnam',
      rank: 20,
      visitors: '18.0M',
      continent: 'Asia',
      highlights: ['Ha Long Bay', 'Hoi An', 'Cu Chi Tunnels'],
      rankings: {
        transportation: 6,
        food: 9,
        activities: 9,
        crowdedness: 5,
      },
    },
  ];

  const topTen = allCountries.slice(0, 10);

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

      <View style={styles.searchSection}>
        <Text style={styles.sectionTitle}>All Countries</Text>
        <Text style={styles.searchSubtitle}>Tap any country to view details</Text>

        {allCountries.map((country, index) => (
          <TouchableOpacity
            key={index}
            style={styles.searchCountryCard}
            onPress={() => navigation.navigate('CountryDetail', { country })}
          >
            <View style={[styles.smallRankBadge, { backgroundColor: getRankColor(country.rank) }]}>
              <Text style={styles.smallRankText}>#{country.rank}</Text>
            </View>
            <View style={styles.searchCountryInfo}>
              <Text style={styles.searchCountryName}>{country.name}</Text>
              <Text style={styles.searchCountryVisitors}>{country.visitors} visitors</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#888" />
          </TouchableOpacity>
        ))}
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
  searchSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  searchSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 15,
  },
  searchCountryCard: {
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
    marginRight: 12,
  },
  smallRankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0a0a0a',
  },
  searchCountryInfo: {
    flex: 1,
  },
  searchCountryName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 3,
  },
  searchCountryVisitors: {
    fontSize: 13,
    color: '#888',
  },
});
