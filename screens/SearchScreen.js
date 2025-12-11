import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { searchUsers } from '../utils/mockUsers';
import Avatar from '../components/Avatar';

export default function SearchScreen({ navigation }) {
  const { theme } = useTheme();
  const { travelBuddies, buddyRequests, sendBuddyRequest } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length > 0) {
      const results = searchUsers(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleViewProfile = (user) => {
    navigation.navigate('PublicProfile', { user });
  };

  const handleAddBuddy = (userId) => {
    sendBuddyRequest(userId);
  };

  const isBuddy = (userId) => travelBuddies.includes(userId);
  const isRequestSent = (userId) => buddyRequests.includes(userId);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border
        }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search for travelers..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoFocus={true}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {searchQuery.trim().length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Search for Travelers
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Find friends and fellow adventurers
            </Text>
          </View>
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Results Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try searching for a different name
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            {searchResults.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                onPress={() => handleViewProfile(user)}
              >
                <View style={styles.userInfo}>
                  <Avatar
                    avatar={user.avatar}
                    avatarType={user.avatarType}
                    size={50}
                  />
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userLocation, { color: theme.textSecondary }]}>
                      {user.location}
                    </Text>
                    <View style={styles.countryCount}>
                      <Ionicons name="earth" size={14} color={theme.primary} />
                      <Text style={[styles.countryCountText, { color: theme.primary }]}>
                        {user.countriesVisited.length} countries
                      </Text>
                    </View>
                  </View>
                </View>
                {!isBuddy(user.id) && (
                  <TouchableOpacity
                    style={[styles.addButton, {
                      backgroundColor: isRequestSent(user.id) ? theme.border : theme.primary,
                      opacity: isRequestSent(user.id) ? 0.5 : 1
                    }]}
                    onPress={() => handleAddBuddy(user.id)}
                    disabled={isRequestSent(user.id)}
                  >
                    <Ionicons
                      name={isRequestSent(user.id) ? "checkmark" : "person-add"}
                      size={18}
                      color={theme.background}
                    />
                  </TouchableOpacity>
                )}
                {isBuddy(user.id) && (
                  <View style={[styles.buddyBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[styles.buddyText, { color: theme.primary }]}>Buddy</Text>
                  </View>
                )}
              </TouchableOpacity>
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
  searchSection: {
    padding: 20,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 5,
  },
  resultsContainer: {
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
  },
  resultsList: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  userInfo: {
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  userLocation: {
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
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  buddyText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
