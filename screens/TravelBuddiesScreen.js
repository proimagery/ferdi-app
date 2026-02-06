import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  RefreshControl,
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
  const [selectedTab, setSelectedTab] = useState('buddies'); // 'buddies' or 'requests'
  const [refreshing, setRefreshing] = useState(false);
  const {
    travelBuddyProfiles,
    buddyRequestProfiles,
    removeTravelBuddy,
    acceptBuddyRequest,
    rejectBuddyRequest,
    refreshData
  } = useAppContext();

  // Handle pull-to-refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.log('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshData]);

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

  const renderBuddiesList = () => {
    if (travelBuddyProfiles.length === 0) {
      return (
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
      );
    }

    return (
      <View style={styles.listContainer}>
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
    );
  };

  const renderRequestsList = () => {
    if (buddyRequestProfiles.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="mail-outline" size={80} color={theme.textSecondary} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            No Pending Requests
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            When someone sends you a buddy request, it will appear here
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
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

      {/* Toggle Tabs */}
      <View style={[styles.tabsContainer, { backgroundColor: theme.cardBackground }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'buddies' && [styles.tabActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedTab('buddies')}
        >
          <Ionicons
            name="people"
            size={18}
            color={selectedTab === 'buddies' ? theme.background : theme.textSecondary}
          />
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            selectedTab === 'buddies' && [styles.tabTextActive, { color: theme.background }]
          ]}>
            Travel Buddies
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'requests' && [styles.tabActive, { backgroundColor: theme.primary }]
          ]}
          onPress={() => setSelectedTab('requests')}
        >
          <View style={styles.tabWithBadge}>
            <Ionicons
              name="mail"
              size={18}
              color={selectedTab === 'requests' ? theme.background : theme.textSecondary}
            />
            {buddyRequestProfiles.length > 0 && selectedTab !== 'requests' && (
              <View style={[styles.tabBadge, { backgroundColor: theme.danger }]}>
                <Text style={styles.tabBadgeText}>{buddyRequestProfiles.length}</Text>
              </View>
            )}
          </View>
          <Text style={[
            styles.tabText,
            { color: theme.textSecondary },
            selectedTab === 'requests' && [styles.tabTextActive, { color: theme.background }]
          ]}>
            Buddy Requests
          </Text>
          {buddyRequestProfiles.length > 0 && selectedTab === 'requests' && (
            <View style={[styles.tabBadgeActive, { backgroundColor: theme.background }]}>
              <Text style={[styles.tabBadgeTextActive, { color: theme.primary }]}>
                {buddyRequestProfiles.length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.contentList}
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
        {selectedTab === 'buddies' ? renderBuddiesList() : renderRequestsList()}

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
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
  },
  tabWithBadge: {
    position: 'relative',
  },
  tabBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tabBadgeActive: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeTextActive: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  contentList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listContainer: {
    paddingBottom: 20,
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
    paddingHorizontal: 20,
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
