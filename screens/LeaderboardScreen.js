import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getLeaderboard } from '../utils/mockUsers';
import Avatar from '../components/Avatar';
import { getTravelerRank } from '../utils/rankingSystem';

export default function LeaderboardScreen({ navigation }) {
  const { theme } = useTheme();
  const [selectedTab, setSelectedTab] = useState('allTime'); // 'month', 'year', 'allTime'

  const leaderboardData = getLeaderboard(selectedTab);

  const handleViewProfile = (user) => {
    navigation.navigate('PublicProfile', { user });
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
          Top travelers worldwide
        </Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'month' && [styles.tabActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedTab('month')}
        >
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            selectedTab === 'month' && [styles.tabTextActive, { color: theme.background }]
          ]}>
            Month
          </Text>
        </TouchableOpacity>
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
      <ScrollView style={styles.leaderboardList} showsVerticalScrollIndicator={false}>
        {leaderboardData.map((user, index) => {
          const rank = getTravelerRank(user.countriesVisited.length);
          const rankColor = getRankColor(index);
          const rankIcon = getRankIcon(index);

          return (
            <TouchableOpacity
              key={user.id}
              style={[styles.leaderboardCard, {
                backgroundColor: theme.cardBackground,
                borderColor: index < 3 ? rankColor : theme.border,
                borderWidth: index < 3 ? 2 : 1,
              }]}
              onPress={() => handleViewProfile(user)}
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
                avatar={user.avatar}
                avatarType={user.avatarType}
                size={50}
              />
              <View style={styles.userInfo}>
                <Text style={[styles.userName, { color: theme.text }]} numberOfLines={1}>
                  {user.name}
                </Text>
                <Text style={[styles.userLocation, { color: theme.textSecondary }]} numberOfLines={1}>
                  {user.location}
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
                  {user.countriesVisited.length}
                </Text>
                <Text style={[styles.countryLabel, { color: theme.textSecondary }]}>
                  countries
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
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
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
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
});
