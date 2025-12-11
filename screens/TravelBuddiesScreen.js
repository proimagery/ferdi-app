import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { getUserById } from '../utils/mockUsers';
import Avatar from '../components/Avatar';

export default function TravelBuddiesScreen({ navigation }) {
  const { theme } = useTheme();
  const { travelBuddies, removeTravelBuddy } = useAppContext();

  const handleViewProfile = (user) => {
    navigation.navigate('PublicProfile', { user });
  };

  const handleRemoveBuddy = (userId, userName) => {
    Alert.alert(
      'Remove Travel Buddy',
      `Remove ${userName} from your travel buddies?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeTravelBuddy(userId),
        },
      ]
    );
  };

  const buddyUsers = travelBuddies.map(id => getUserById(id)).filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="people" size={28} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Buddies</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {buddyUsers.length} {buddyUsers.length === 1 ? 'buddy' : 'buddies'}
        </Text>
      </View>

      {/* Buddies List */}
      <ScrollView style={styles.buddiesList} showsVerticalScrollIndicator={false}>
        {buddyUsers.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Travel Buddies Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Search for travelers and add them as buddies
            </Text>
            <TouchableOpacity
              style={[styles.searchButton, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('Search')}
            >
              <Ionicons name="search" size={20} color={theme.background} />
              <Text style={[styles.searchButtonText, { color: theme.background }]}>
                Search Travelers
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buddiesContainer}>
            {buddyUsers.map((user) => (
              <View
                key={user.id}
                style={[styles.buddyCard, {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
              >
                <TouchableOpacity
                  style={styles.buddyInfo}
                  onPress={() => handleViewProfile(user)}
                >
                  <Avatar
                    avatar={user.avatar}
                    avatarType={user.avatarType}
                    size={50}
                  />
                  <View style={styles.buddyDetails}>
                    <Text style={[styles.buddyName, { color: theme.text }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.buddyLocation, { color: theme.textSecondary }]}>
                      {user.location}
                    </Text>
                    <View style={styles.countryCount}>
                      <Ionicons name="earth" size={14} color={theme.primary} />
                      <Text style={[styles.countryCountText, { color: theme.primary }]}>
                        {user.countriesVisited.length} countries
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.removeButton, { borderColor: theme.danger }]}
                  onPress={() => handleRemoveBuddy(user.id, user.name)}
                >
                  <Ionicons name="person-remove" size={18} color={theme.danger} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
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
  buddiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
    textAlign: 'center',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buddiesContainer: {
    paddingBottom: 20,
  },
  buddyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  buddyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  buddyDetails: {
    flex: 1,
  },
  buddyName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  buddyLocation: {
    fontSize: 13,
    marginBottom: 4,
  },
  countryCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  countryCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
