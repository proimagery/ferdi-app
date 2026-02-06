import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useAuthGuard } from '../hooks/useAuthGuard';
import AuthPromptModal from '../components/AuthPromptModal';
import { supabase } from '../lib/supabase';
import Avatar from '../components/Avatar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

export default function SearchScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { travelBuddies, sentRequests, sendBuddyRequest } = useAppContext();
  const { checkAuth, showAuthModal, setShowAuthModal, featureMessage } = useAuthGuard();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceTimer = useRef(null);

  // Debounced search function
  const searchProfiles = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchTerm = query.trim().toLowerCase();

      // Search by username or name (case-insensitive)
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, username, location, bio, avatar, avatar_type')
        .or(`username.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`)
        .neq('id', user?.id) // Exclude current user
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } else {
        // Transform data to match expected format
        const transformedResults = (data || []).map(profile => ({
          id: profile.id,
          name: profile.name || 'Unknown User',
          username: profile.username || '',
          location: profile.location || 'Location not set',
          bio: profile.bio || '',
          avatar: profile.avatar,
          avatarType: profile.avatar_type || 'default',
        }));
        setSearchResults(transformedResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [user?.id]);

  // Handle search input with debounce
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Don't search if query is too short
    if (query.trim().length < 2) {
      setSearchResults([]);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      searchProfiles(query);
    }, 300);
  }, [searchProfiles]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleViewProfile = (profileUser) => {
    navigation.navigate('PublicProfile', { user: profileUser });
  };

  const handleAddBuddy = async (userId) => {
    // Check if guest user is trying to add a buddy
    if (checkAuth('add travel buddies')) return;

    const result = await sendBuddyRequest(userId);
    if (result?.message) {
      // Force re-render to update button state
      setSearchResults([...searchResults]);
    }
  };

  const isBuddy = (userId) => travelBuddies.includes(userId);
  const isRequestSent = (userId) => sentRequests.includes(userId);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchBar, {
          backgroundColor: theme.inputBackground,
          borderColor: theme.inputBorder
        }]}>
          <Ionicons name="search" size={20} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search by name or @username..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            spellCheck={false}
            autoFocus={true}
          />
          {isSearching && (
            <ActivityIndicator size="small" color={theme.primary} />
          )}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={clearSearch}>
              <Ionicons name="close-circle" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <Text style={[styles.hintText, { color: theme.textSecondary }]}>
            Type at least 2 characters to search
          </Text>
        )}
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {searchQuery.trim().length < 2 ? (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              Search for Travelers
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Find friends by name or @username
            </Text>
          </View>
        ) : isSearching ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={theme.primary} />
            <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
              Searching...
            </Text>
          </View>
        ) : hasSearched && searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="person-outline" size={80} color={theme.textSecondary} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Results Found
            </Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try searching for a different name or username
            </Text>
          </View>
        ) : (
          <View style={styles.resultsList}>
            <Text style={[styles.resultsCount, { color: theme.textSecondary }]}>
              {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'} found
            </Text>
            {searchResults.map((profileUser) => (
              <TouchableOpacity
                key={profileUser.id}
                style={[styles.userCard, {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border
                }]}
                onPress={() => handleViewProfile(profileUser)}
              >
                <View style={styles.userInfo}>
                  <Avatar
                    avatar={profileUser.avatar}
                    avatarType={profileUser.avatarType}
                    size={50}
                  />
                  <View style={styles.userDetails}>
                    <Text style={[styles.userName, { color: theme.text }]}>
                      {profileUser.name}
                    </Text>
                    {profileUser.username ? (
                      <Text style={[styles.userUsername, { color: theme.primary }]}>
                        @{profileUser.username}
                      </Text>
                    ) : null}
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={12} color={theme.textSecondary} />
                      <Text style={[styles.userLocation, { color: theme.textSecondary }]}>
                        {profileUser.location}
                      </Text>
                    </View>
                  </View>
                </View>
                {!isBuddy(profileUser.id) && (
                  <TouchableOpacity
                    style={[styles.addButton, {
                      backgroundColor: isRequestSent(profileUser.id) ? theme.border : theme.primary,
                      opacity: isRequestSent(profileUser.id) ? 0.5 : 1
                    }]}
                    onPress={() => handleAddBuddy(profileUser.id)}
                    disabled={isRequestSent(profileUser.id)}
                  >
                    <Ionicons
                      name={isRequestSent(profileUser.id) ? "checkmark" : "person-add"}
                      size={18}
                      color={theme.background}
                    />
                  </TouchableOpacity>
                )}
                {isBuddy(profileUser.id) && (
                  <View style={[styles.buddyBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
                    <Text style={[styles.buddyText, { color: theme.primary }]}>Buddy</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
          <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
        </View>
      </ScrollView>

      {/* Auth Prompt Modal for Guests */}
      <AuthPromptModal
        visible={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        feature={featureMessage}
      />
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
  hintText: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 5,
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
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
    textAlign: 'center',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 13,
    marginBottom: 15,
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
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userUsername: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userLocation: {
    fontSize: 13,
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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerLogo: {
    width: 400,
    height: 120,
  },
});
