import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CountryHeaderImage from '../components/CountryHeaderImage';
import AttractionCard from '../components/AttractionCard';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function CountryDetailScreen({ route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
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
      <CountryHeaderImage
        countryName={country.name}
        flag={country.flag}
        theme={theme}
      />
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

      {country.rankings && country.rankings.transportation && typeof country.rankings.transportation === 'number' && (
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

      {/* Educational Information Section */}
      {(country.population || country.capital || country.leader || country.language || country.currency) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Educational Information</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.population && (
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Population</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.population}</Text>
                </View>
              </View>
            )}
            {country.capital && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Capital</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.capital}</Text>
                </View>
              </View>
            )}
            {country.leader && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Leader</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.leader}</Text>
                </View>
              </View>
            )}
            {country.language && (
              <View style={styles.infoRow}>
                <Ionicons name="language" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Language</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.language}</Text>
                </View>
              </View>
            )}
            {country.currency && (
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Currency</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.currency}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {country.highlights && country.highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Attractions</Text>
          {country.highlights.map((highlight, index) => (
            <AttractionCard
              key={index}
              attractionName={highlight}
              countryName={country.name}
              theme={theme}
            />
          ))}
        </View>
      )}

      {/* Transportation Section */}
      {(country.mainAirports || country.mainTrainStations || country.avgFlightCost || country.avgTrainCost) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transportation</Text>

          {country.mainAirports && country.mainAirports.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="airplane" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>Main Airports</Text>
              </View>
              {country.mainAirports.map((airport, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>• {airport}</Text>
              ))}
              {country.avgFlightCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Flight Cost: {country.avgFlightCost}</Text>
              )}
            </View>
          )}

          {country.mainTrainStations && country.mainTrainStations.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              marginTop: 15
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="train" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>Main Train Stations</Text>
              </View>
              {country.mainTrainStations.map((station, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>• {station}</Text>
              ))}
              {country.avgTrainCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Train Cost: {country.avgTrainCost}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Accommodations Section */}
      {country.topHotels && country.topHotels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.subsectionHeader}>
            <Ionicons name="bed" size={18} color={theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Hotels</Text>
          </View>
          {country.topHotels.map((hotel, index) => (
            <View key={index} style={[styles.highlightCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <Ionicons name="bed" size={20} color={theme.primary} />
              <Text style={[styles.highlightText, { color: theme.text }]}>{hotel}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Travel Tips Section */}
      {(country.bestTimeToVisit || country.visaRequired) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Tips</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.bestTimeToVisit && (
              <View style={styles.infoRow}>
                <Ionicons name="sunny" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Best Time to Visit</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.bestTimeToVisit}</Text>
                </View>
              </View>
            )}
            {country.visaRequired && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Visa Requirements</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.visaRequired}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

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
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 26,
  },
  costInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 26,
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
