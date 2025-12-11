import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function CountryDetailScreen({ route }) {
  const { theme } = useTheme();
  const { country } = route.params;

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4ade80'; // Green - Excellent
    if (rating >= 6) return '#fbbf24'; // Yellow - Good
    if (rating >= 4) return '#fb923c'; // Orange - Fair
    return '#ef4444'; // Red - Poor
  };

  const getRatingLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    return 'Poor';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
        <Text style={[styles.continent, { color: theme.primary }]}>{country.continent}</Text>
      </View>

      <View style={[styles.statsCard, {
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }]}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <Text style={[styles.statValue, { color: theme.text }]}>#{country.rank}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>World Rank</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{country.visitors}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Annual Visitors</Text>
        </View>
      </View>

      {country.rankings && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Rankings</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Based on public travel data (1-10 scale)</Text>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="car" size={24} color="#60a5fa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Transportation</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.transportation * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.transportation)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.transportation}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.transportation) }]}>
                {getRatingLabel(country.rankings.transportation)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="restaurant" size={24} color="#f472b6" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Food & Dining</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.food * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.food)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.food}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.food) }]}>
                {getRatingLabel(country.rankings.food)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="camera" size={24} color="#a78bfa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Tourist Activities</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.activities * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.activities)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.activities}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.activities) }]}>
                {getRatingLabel(country.rankings.activities)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="people" size={24} color="#fb923c" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Crowdedness</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.crowdedness * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.crowdedness)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.crowdedness}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.crowdedness) }]}>
                {getRatingLabel(country.rankings.crowdedness)}
              </Text>
            </View>
            <Text style={[styles.rankingNote, { color: theme.textSecondary }]}>Higher is less crowded</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Attractions</Text>
        {country.highlights.map((highlight, index) => (
          <View key={index} style={[styles.highlightCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <Ionicons name="star" size={20} color="#fbbf24" />
            <Text style={[styles.highlightText, { color: theme.text }]}>{highlight}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Information</Text>
        <View style={[styles.infoCard, {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border
        }]}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle" size={20} color="#60a5fa" />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>
              {country.name} is one of the most popular tourist destinations in the world.
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="calendar" size={20} color="#f472b6" />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Best time to visit varies by region and season.</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="cash" size={20} color="#fb923c" />
            <Text style={[styles.infoText, { color: theme.textSecondary }]}>Budget accordingly based on your travel style.</Text>
          </View>
        </View>
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
  countryName: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  continent: {
    fontSize: 18,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-around',
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    marginTop: -10,
  },
  rankingCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rankingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rankingFill: {
    height: '100%',
    borderRadius: 5,
  },
  rankingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankingScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankingNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  highlightText: {
    fontSize: 16,
    flex: 1,
  },
  infoCard: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
