import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Image, TextInput, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCountries } from '../context/CountryContext';
import { useTranslation } from 'react-i18next';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function WorldRankScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const {
    countries,
    loading,
    error,
    refreshCountries,
    getFilteredAndSorted,
    isStaleData
  } = useCountries();

  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('visitors');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Categories available
  const categories = [
    { id: 'visitors', name: 'Most Visited', icon: 'people' },
    { id: 'safety', name: 'Safety', icon: 'shield-checkmark' },
    { id: 'affordability', name: 'Affordability', icon: 'cash' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'beaches', name: 'Beaches', icon: 'water' },
    { id: 'mountains', name: 'Mountains', icon: 'triangle' },
    { id: 'outdoors', name: 'Outdoors', icon: 'leaf' },
  ];

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshCountries();
    setRefreshing(false);
  }, [refreshCountries]);

  // Get sorted and filtered countries from context
  const sortedCountries = getFilteredAndSorted(searchQuery, selectedCategory);
  const topTen = sortedCountries.slice(0, 10);
  const remainingCountries = sortedCountries.slice(10);

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#4ade80';
  };

  const getCategoryTitle = () => {
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.name : 'Rankings';
  };

  const getCategorySubtitle = () => {
    const subtitles = {
      visitors: 'Most visited countries worldwide',
      safety: 'Safest countries for travelers',
      affordability: 'Most affordable travel destinations',
      food: 'Countries with the best food',
      beaches: 'Best beach destinations',
      mountains: 'Best mountain destinations',
      outdoors: 'Best for outdoor adventures',
      mostBooked: 'Most booked flight destinations (Amadeus)',
      mostTraveled: 'Most traveled air routes (Amadeus)',
    };
    return subtitles[selectedCategory] || '';
  };

  // Loading state
  if (loading && countries.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>{t('worldRank.loading')}</Text>
      </View>
    );
  }

  // Error state with retry
  if (error && countries.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
        <Ionicons name="cloud-offline" size={48} color={theme.textSecondary} />
        <Text style={[styles.errorText, { color: theme.text }]}>{t('worldRank.unableToLoad')}</Text>
        <Text style={[styles.errorSubtext, { color: theme.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: theme.primary }]}
          onPress={refreshCountries}
        >
          <Ionicons name="refresh" size={20} color="#fff" />
          <Text style={styles.retryButtonText}>{t('worldRank.tapToRetry')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
      {isStaleData && (
        <View style={[styles.staleBanner, { backgroundColor: theme.warning + '20' }]}>
          <Ionicons name="information-circle" size={16} color={theme.warning} />
          <Text style={[styles.staleBannerText, { color: theme.warning }]}>
            Showing cached data. Pull down to refresh.
          </Text>
        </View>
      )}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{getCategoryTitle()}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{getCategorySubtitle()}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder={t('worldRank.searchPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id ? theme.primary : theme.cardBackground,
                borderColor: selectedCategory === category.id ? theme.primary : theme.border,
              }
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              setDropdownVisible(false);
            }}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? theme.background : theme.text}
            />
            <Text style={[
              styles.categoryChipText,
              { color: selectedCategory === category.id ? theme.background : theme.text }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.topSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('worldRank.top10Countries')}</Text>
        {topTen.map((country, index) => {
          const rankData = country.rankings[selectedCategory];
          return (
            <TouchableOpacity
              key={index}
              style={[styles.countryCard, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border
              }]}
              onPress={() => navigation.navigate('CountryDetail', {
                country: {
                  ...country,
                  rank: rankData.rank,
                  visitors: rankData.value,
                  rankings: {
                    transportation: 8,
                    food: 8,
                    activities: 8,
                    crowdedness: 7
                  }
                }
              })}
            >
              <View style={styles.rankContainer}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(rankData.rank) }]}>
                  <Text style={[styles.rankText, { color: theme.background }]}>#{rankData.rank}</Text>
                </View>
              </View>

              <Text style={styles.flagEmoji}>{country.flag}</Text>

              <View style={styles.countryInfo}>
                <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name={categories.find(c => c.id === selectedCategory)?.icon || 'star'} size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {rankData.value} {rankData.label}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>{country.continent}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dropdownSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>{t('worldRank.moreCountries')}</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Ionicons name="search" size={20} color={theme.primary} />
          <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
            Browse Countries #11-#{sortedCountries.length}
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            {remainingCountries.map((country, index) => {
              const rankData = country.rankings[selectedCategory];
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border
                  }]}
                  onPress={() => {
                    setDropdownVisible(false);
                    navigation.navigate('CountryDetail', {
                      country: {
                        ...country,
                        rank: rankData.rank,
                        visitors: rankData.value,
                        rankings: {
                          transportation: 8,
                          food: 8,
                          activities: 8,
                          crowdedness: 7
                        }
                      }
                    });
                  }}
                >
                  <View style={[styles.smallRankBadge, { backgroundColor: getRankColor(rankData.rank) }]}>
                    <Text style={[styles.smallRankText, { color: theme.background }]}>#{rankData.rank}</Text>
                  </View>
                  <Text style={styles.dropdownFlag}>{country.flag}</Text>
                  <View style={styles.dropdownCountryInfo}>
                    <Text style={[styles.dropdownCountryName, { color: theme.text }]}>{country.name}</Text>
                    <Text style={[styles.dropdownCountryVisitors, { color: theme.textSecondary }]}>
                      {rankData.value} {rankData.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
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
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 8,
    gap: 8,
  },
  staleBannerText: {
    fontSize: 13,
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
  categoryScroll: {
    marginBottom: 15,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  countryCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
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
  },
  dropdownSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownList: {
    marginTop: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
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
    marginBottom: 3,
  },
  dropdownCountryVisitors: {
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});
