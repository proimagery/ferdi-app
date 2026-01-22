import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import { getTravelerRank } from '../utils/rankingSystem';
import { supabase } from '../lib/supabase';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function LeaderboardScreen({ navigation }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [selectedTab, setSelectedTab] = useState('allTime'); // 'year', 'allTime'
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, name, username, location, bio, avatar, avatar_type');

      if (profileError) {
        console.log('Error fetching profiles:', profileError);
        return;
      }

      // For each profile, count their completed trips (countries visited)
      const leaderboardEntries = await Promise.all(
        profiles.map(async (profile) => {
          // Get ALL completed trips for rank calculation (all-time)
          const { data: allTrips, error: allTripsError } = await supabase
            .from('completed_trips')
            .select('id, country, created_at')
            .eq('user_id', profile.id);

          if (allTripsError) {
            console.log('Error fetching all trips for user:', profile.id, allTripsError);
            return null;
          }

          // Get all-time unique countries for rank calculation
          const allTimeCountries = [...new Set(allTrips?.map(t => t.country) || [])];

          // Get timeframe-specific count for display
          let displayTrips = allTrips;
          if (selectedTab === 'year') {
            const startOfYear = new Date();
            startOfYear.setMonth(0, 1);
            startOfYear.setHours(0, 0, 0, 0);
            displayTrips = allTrips.filter(trip => new Date(trip.created_at) >= startOfYear);
          }

          // Get unique countries for the selected timeframe
          const displayCountries = [...new Set(displayTrips?.map(t => t.country) || [])];

          return {
            id: profile.id,
            name: profile.name || profile.username || 'Traveler',
            username: profile.username,
            location: profile.location || '',
            bio: profile.bio || '',
            avatar: profile.avatar,
            avatarType: profile.avatar_type || 'default',
            countriesVisited: allTimeCountries, // All-time for rank
            allTimeCount: allTimeCountries.length, // All-time count for rank calculation
            countryCount: displayCountries.length, // Display count for the selected timeframe
          };
        })
      );

      // Filter out nulls and users with 0 countries, sort by country count, limit to top 50
      const sortedData = leaderboardEntries
        .filter(entry => entry !== null && entry.countryCount > 0)
        .sort((a, b) => b.countryCount - a.countryCount)
        .slice(0, 50); // Limit to top 50 travelers

      setLeaderboardData(sortedData);
    } catch (error) {
      console.log('Error in fetchLeaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleViewProfile = (leaderboardUser) => {
    // Format user data for PublicProfile screen
    const formattedUser = {
      id: leaderboardUser.id,
      name: leaderboardUser.name,
      username: leaderboardUser.username,
      location: leaderboardUser.location,
      bio: leaderboardUser.bio,
      avatar: leaderboardUser.avatar,
      avatarType: leaderboardUser.avatarType,
      countriesVisited: leaderboardUser.countriesVisited,
    };
    navigation.navigate('PublicProfile', { user: formattedUser });
  };

  const getRankColor = (position) => {
    if (position === 0) return '#FFD700'; // Gold
    if (position === 1) return '#C0C0C0'; // Silver
    if (position === 2) return '#CD7F32'; // Bronze
    return theme.textSecondary;
  };

  const getRankIcon = (position) => {
    if (position === 0) return 'trophy';
    if (position === 1) return 'medal';
    if (position === 2) return 'medal';
    return 'ribbon';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="trophy" size={28} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Leaderboard</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Top 50 travelers worldwide
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'year' && [styles.tabActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedTab('year')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            selectedTab === 'year' && [styles.tabTextActive, { color: theme.background }]
          ]}>
            Year
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'allTime' && [styles.tabActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedTab('allTime')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            selectedTab === 'allTime' && [styles.tabTextActive, { color: theme.background }]
          ]}>
            All Time
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leaderboard List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
            Loading leaderboard...
          </Text>
        </View>
      ) : leaderboardData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={60} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Travelers Yet</Text>
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            {selectedTab === 'year'
              ? 'No countries have been added this year yet.'
              : 'Be the first to add countries to your travel history!'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.leaderboardList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
            />
          }
        >
          {leaderboardData.map((leaderboardUser, index) => {
            // Always use all-time count for rank badge
            const rank = getTravelerRank(leaderboardUser.allTimeCount);
            const rankColor = getRankColor(index);
            const rankIcon = getRankIcon(index);
            const isCurrentUser = leaderboardUser.id === user?.id;

            return (
              <TouchableOpacity
                key={leaderboardUser.id}
                style={[styles.leaderboardCard, {
                  backgroundColor: isCurrentUser ? theme.primary + '15' : theme.cardBackground,
                  borderColor: index < 3 ? rankColor : (isCurrentUser ? theme.primary : theme.border),
                  borderWidth: index < 3 || isCurrentUser ? 2 : 1,
                }]}
                onPress={() => handleViewProfile(leaderboardUser)}
              >
                {/* Rank Number */}
                <View style={[styles.rankNumber, { backgroundColor: rankColor + '20' }]}>
                  <Ionicons name={rankIcon} size={18} color={rankColor} />
                  <Text style={[styles.rankText, { color: rankColor }]}>
                    #{index + 1}
                  </Text>
                </View>

                {/* User Info */}
                <Avatar
                  avatar={leaderboardUser.avatar}
                  avatarType={leaderboardUser.avatarType}
                  size={50}
                />
                <View style={styles.userInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                      {leaderboardUser.name}
                    </Text>
                    {isCurrentUser && (
                      <View style={[styles.youBadge, { backgroundColor: theme.primary }]}>
                        <Text style={[styles.youBadgeText, { color: theme.background }]}>You</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.userLocation, { color: theme.textSecondary }]} numberOfLines={1}>
                    {leaderboardUser.location || (leaderboardUser.username ? `@${leaderboardUser.username}` : 'Traveler')}
                  </Text>
                  <View style={styles.rankBadge}>
                    <Ionicons name="star" size={12} color={theme.primary} />
                    <Text style={[styles.rankBadgeText, { color: theme.primary }]}>
                      {rank}
                    </Text>
                  </View>
                </View>

                {/* Country Count */}
                <View style={styles.countrySection}>
                  <Text style={[styles.countryCount, { color: theme.primary }]}>
                    {leaderboardUser.countryCount}
                  </Text>
                  <Text style={[styles.countryLabel, { color: theme.textSecondary }]}>
                    countries
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Footer */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
            <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
          </View>
        </ScrollView>
      )}
    </View>
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
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginLeft: 38,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabActive: {
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  leaderboardList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    gap: 12,
  },
  rankNumber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    flexShrink: 1,
  },
  youBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  userLocation: {
    fontSize: 12,
    marginBottom: 4,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  countrySection: {
    alignItems: 'center',
  },
  countryCount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  countryLabel: {
    fontSize: 11,
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
