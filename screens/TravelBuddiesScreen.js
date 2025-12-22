import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import Avatar from '../components/Avatar';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function TravelBuddiesScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    travelBuddyProfiles,
    buddyRequestProfiles,
    removeTravelBuddy,
    acceptBuddyRequest,
    rejectBuddyRequest
  } = useAppContext();

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

  const handleAcceptRequest = (userId, userName) => {
    acceptBuddyRequest(userId);
    Alert.alert('Success', `You and ${userName} are now travel buddies!`);
  };

  const handleRejectRequest = (userId, userName) => {
    Alert.alert(
      'Decline Request',
      `Decline ${userName}'s buddy request?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => rejectBuddyRequest(userId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="people" size={28} color={theme.primary} />
          <Text style={[styles.headerTitle, { color: theme.text }]}>Travel Buddies</Text>
        </View>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          {travelBuddyProfiles.length} {travelBuddyProfiles.length === 1 ? 'buddy' : 'buddies'}
        </Text>
      </View>

      {/* Buddies List */}
      <ScrollView style={styles.buddiesList} showsVerticalScrollIndicator={false}>

        {/* Pending Requests Section */}
        {buddyRequestProfiles.length > 0 && (
          <View style={styles.requestsSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.requestBadge, { backgroundColor: theme.danger }]}>
                <Ionicons name="person-add" size={16} color="#fff" />
                <Text style={styles.requestBadgeText}>{buddyRequestProfiles.length}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Pending Requests</Text>
            </View>
            {buddyRequestProfiles.map((requestUser) => (
              <View
                key={requestUser.id}
                style={[styles.requestCard, {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.primary
                }]}
              >
                <TouchableOpacity
                  style={styles.buddyInfo}
                  onPress={() => handleViewProfile(requestUser)}
                >
                  <Avatar
                    avatar={requestUser.avatar}
                    avatarType={requestUser.avatarType}
                    size={50}
                  />
                  <View style={styles.buddyDetails}>
                    <Text style={[styles.buddyName, { color: theme.text }]}>
                      {requestUser.name}
                    </Text>
                    {requestUser.username ? (
                      <Text style={[styles.buddyUsername, { color: theme.primary }]}>
                        @{requestUser.username}
                      </Text>
                    ) : null}
                    <Text style={[styles.buddyLocation, { color: theme.textSecondary }]}>
                      {requestUser.location}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: theme.primary }]}
                    onPress={() => handleAcceptRequest(requestUser.id, requestUser.name)}
                  >
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.declineButton, { borderColor: theme.danger }]}
                    onPress={() => handleRejectRequest(requestUser.id, requestUser.name)}
                  >
                    <Ionicons name="close" size={20} color={theme.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Existing Buddies */}
        {travelBuddyProfiles.length === 0 && buddyRequestProfiles.length === 0 ? (
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
        ) : travelBuddyProfiles.length > 0 ? (
          <View style={styles.buddiesContainer}>
            {buddyRequestProfiles.length > 0 && (
              <Text style={[styles.sectionTitle, { color: theme.text, marginBottom: 15 }]}>
                Your Buddies
              </Text>
            )}
            {travelBuddyProfiles.map((user) => (
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
                    {user.username ? (
                      <Text style={[styles.buddyUsername, { color: theme.primary }]}>
                        @{user.username}
                      </Text>
                    ) : null}
                    <Text style={[styles.buddyLocation, { color: theme.textSecondary }]}>
                      {user.location}
                    </Text>
                    {user.countriesVisited && user.countriesVisited.length > 0 && (
                      <View style={styles.countryCount}>
                        <Ionicons name="earth" size={14} color={theme.primary} />
                        <Text style={[styles.countryCountText, { color: theme.primary }]}>
                          {user.countriesVisited.length} countries
                        </Text>
                      </View>
                    )}
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
        ) : null}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
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
    marginBottom: 2,
  },
  buddyUsername: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  buddyLocation: {
    fontSize: 13,
    marginBottom: 4,
  },
  requestsSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  requestBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  requestBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
