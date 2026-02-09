import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { getCityCoordinatesFromDB } from '../utils/cities';
import { countryCoordinates } from '../utils/coordinates';
import { scheduleBuddyRequestNotification, setBadgeCount } from '../utils/notifications';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user, isGuest } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [visitedCities, setVisitedCities] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    location: '',
    bio: '',
    instagram: '',
    x: '',
    twitter: '',
    facebook: '',
    youtube: '',
    top1: '',
    top2: '',
    top3: '',
    next1: '',
    next2: '',
    next3: '',
    avatar: null,
    avatarType: 'default',
    sharedTripMaps: [],
    travelPhotos: [],
  });

  // Social features state
  const [travelBuddies, setTravelBuddies] = useState([]); // User IDs of accepted buddies
  const [travelBuddyProfiles, setTravelBuddyProfiles] = useState([]); // Full profile data of buddies
  const [highlightedBuddies, setHighlightedBuddies] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]); // Incoming requests (user IDs)
  const [buddyRequestProfiles, setBuddyRequestProfiles] = useState([]); // Full profile data of requesters
  const [sentRequests, setSentRequests] = useState([]); // Outgoing requests the user has sent

  // Track previous request IDs to detect new requests for notifications
  const previousRequestIds = useRef([]);

  // Loading state for buddy actions (prevents double-taps)
  const [buddyActionLoading, setBuddyActionLoading] = useState(new Set());

  // In-app notification state
  const [inAppNotification, setInAppNotification] = useState(null);

  // ============================================
  // LOAD ALL USER DATA ON LOGIN
  // ============================================
  // Helper function to reset all state to defaults
  const resetAllState = () => {
    setTrips([]);
    setCompletedTrips([]);
    setVisitedCities([]);
    setBudgets([]);
    setProfile({
      name: '',
      username: '',
      location: '',
      bio: '',
      instagram: '',
      x: '',
      twitter: '',
      facebook: '',
      youtube: '',
      top1: '',
      top2: '',
      top3: '',
      next1: '',
      next2: '',
      next3: '',
      avatar: null,
      avatarType: 'default',
      sharedTripMaps: [],
      travelPhotos: [],
    });
    setTravelBuddies([]);
    setTravelBuddyProfiles([]);
    setHighlightedBuddies([]);
    setBuddyRequests([]);
    setBuddyRequestProfiles([]);
    setSentRequests([]);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      // Only load data for authenticated users
      loadAllUserData();
    } else if (isGuest) {
      // Guest users should always have empty/default state
      // No data should be loaded or persisted for guests
      resetAllState();
    } else {
      // Not logged in and not a guest - reset state
      resetAllState();
    }
  }, [user, isGuest]);

  // Supabase Realtime subscription for travel_buddies changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('buddy-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'travel_buddies',
        filter: `buddy_id=eq.${user.id}`,
      }, () => {
        loadTravelBuddies();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'travel_buddies',
        filter: `user_id=eq.${user.id}`,
      }, () => {
        loadTravelBuddies();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const loadAllUserData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await Promise.all([
        loadProfile(),
        loadTrips(),
        loadCompletedTrips(),
        loadVisitedCities(),
        loadBudgets(),
        loadTravelBuddies(),
      ]);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // PROFILE FUNCTIONS
  // ============================================
  const loadProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
      return;
    }

    if (data) {
      setProfile({
        name: data.name || '',
        username: data.username || '',
        location: data.location || '',
        bio: data.bio || '',
        instagram: data.instagram || '',
        x: data.x || '',
        twitter: data.twitter || '',
        facebook: data.facebook || '',
        youtube: data.youtube || '',
        top1: data.top1 || '',
        top2: data.top2 || '',
        top3: data.top3 || '',
        next1: data.next1 || '',
        next2: data.next2 || '',
        next3: data.next3 || '',
        avatar: data.avatar || null,
        avatarType: data.avatar_type || 'default',
        sharedTripMaps: data.shared_trip_maps || [],
        travelPhotos: data.travel_photos || [],
      });
    }
  };

  const updateProfile = async (profileData) => {
    setProfile(profileData);

    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        name: profileData.name,
        username: profileData.username,
        location: profileData.location,
        bio: profileData.bio,
        instagram: profileData.instagram,
        x: profileData.x,
        twitter: profileData.twitter,
        facebook: profileData.facebook,
        youtube: profileData.youtube,
        top1: profileData.top1,
        top2: profileData.top2,
        top3: profileData.top3,
        next1: profileData.next1,
        next2: profileData.next2,
        next3: profileData.next3,
        avatar: profileData.avatar,
        avatar_type: profileData.avatarType,
        shared_trip_maps: profileData.sharedTripMaps,
        travel_photos: profileData.travelPhotos,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
    }
  };

  // ============================================
  // TRIPS FUNCTIONS
  // ============================================
  const loadTrips = async () => {
    if (!user) return;

    const { data: tripsData, error } = await supabase
      .from('trips')
      .select(`
        *,
        trip_countries (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading trips:', error);
      return;
    }

    const formattedTrips = tripsData.map(trip => ({
      id: trip.id,
      name: trip.name,
      budget: trip.budget,
      countries: trip.trip_countries.map(tc => ({
        name: tc.country_name,
        startDate: tc.start_date,
        endDate: tc.end_date,
      })).sort((a, b) => a.order_index - b.order_index),
    }));

    setTrips(formattedTrips);
  };

  const addTrip = async (trip) => {
    // Optimistically update UI
    const tempId = Date.now().toString();
    const newTrip = { ...trip, id: tempId };
    setTrips(prev => [...prev, newTrip]);

    if (!user) return;

    // Insert trip to Supabase
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .insert({
        user_id: user.id,
        name: trip.name,
        budget: trip.budget || 0,
      })
      .select()
      .single();

    if (tripError) {
      console.error('Error adding trip:', tripError);
      // Rollback
      setTrips(prev => prev.filter(t => t.id !== tempId));
      return;
    }

    // Insert trip countries
    if (trip.countries && trip.countries.length > 0) {
      const countriesData = trip.countries.map((country, index) => ({
        trip_id: tripData.id,
        country_name: country.name,
        start_date: country.startDate,
        end_date: country.endDate,
        order_index: index,
      }));

      const { error: countriesError } = await supabase
        .from('trip_countries')
        .insert(countriesData);

      if (countriesError) {
        console.error('Error adding trip countries:', countriesError);
      }
    }

    // Update with real ID
    setTrips(prev => prev.map(t =>
      t.id === tempId ? { ...t, id: tripData.id } : t
    ));
  };

  const updateTrip = async (index, updatedTrip) => {
    const oldTrips = [...trips];
    const newTrips = [...trips];
    newTrips[index] = updatedTrip;
    setTrips(newTrips);

    if (!user || !updatedTrip.id) return;

    // Update trip in Supabase
    const { error: tripError } = await supabase
      .from('trips')
      .update({
        name: updatedTrip.name,
        budget: updatedTrip.budget || 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedTrip.id);

    if (tripError) {
      console.error('Error updating trip:', tripError);
      setTrips(oldTrips);
      return;
    }

    // Delete old countries and insert new ones
    await supabase
      .from('trip_countries')
      .delete()
      .eq('trip_id', updatedTrip.id);

    if (updatedTrip.countries && updatedTrip.countries.length > 0) {
      const countriesData = updatedTrip.countries.map((country, idx) => ({
        trip_id: updatedTrip.id,
        country_name: country.name,
        start_date: country.startDate,
        end_date: country.endDate,
        order_index: idx,
      }));

      await supabase.from('trip_countries').insert(countriesData);
    }
  };

  const deleteTrip = async (index) => {
    const tripToDelete = trips[index];
    const oldTrips = [...trips];
    setTrips(prev => prev.filter((_, i) => i !== index));

    if (!user || !tripToDelete.id) return;

    const { error } = await supabase
      .from('trips')
      .delete()
      .eq('id', tripToDelete.id);

    if (error) {
      console.error('Error deleting trip:', error);
      setTrips(oldTrips);
    }
  };

  // ============================================
  // COMPLETED TRIPS FUNCTIONS
  // ============================================
  const loadCompletedTrips = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('completed_trips')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading completed trips:', error);
      return;
    }

    const formattedTrips = data.map(trip => ({
      id: trip.id,
      country: trip.country,
      date: trip.visit_date,
    }));

    setCompletedTrips(formattedTrips);
  };

  const addCompletedTrip = async (trip) => {
    const tempId = Date.now().toString();
    const newTrip = { ...trip, id: tempId };
    setCompletedTrips(prev => [...prev, newTrip]);

    if (!user) return;

    const { data, error } = await supabase
      .from('completed_trips')
      .insert({
        user_id: user.id,
        country: trip.country,
        visit_date: trip.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding completed trip:', error);
      setCompletedTrips(prev => prev.filter(t => t.id !== tempId));
      return;
    }

    setCompletedTrips(prev => prev.map(t =>
      t.id === tempId ? { ...t, id: data.id } : t
    ));
  };

  const deleteCompletedTrip = async (index) => {
    const tripToDelete = completedTrips[index];
    const oldTrips = [...completedTrips];
    setCompletedTrips(prev => prev.filter((_, i) => i !== index));

    if (!user || !tripToDelete.id) return;

    const { error } = await supabase
      .from('completed_trips')
      .delete()
      .eq('id', tripToDelete.id);

    if (error) {
      console.error('Error deleting completed trip:', error);
      setCompletedTrips(oldTrips);
    }
  };

  // ============================================
  // VISITED CITIES FUNCTIONS
  // ============================================
  const loadVisitedCities = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('visited_cities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet
      if (error.code !== '42P01') {
        console.error('Error loading visited cities:', error);
      }
      return;
    }

    const formattedCities = data.map(city => {
      // Try to get city coordinates from cities database
      const cityCoords = getCityCoordinatesFromDB(city.city_name, city.country);
      // Fall back to country coordinates if city not found
      const countryCoords = countryCoordinates[city.country] || { latitude: 0, longitude: 0 };

      return {
        id: city.id,
        city: city.city_name,
        country: city.country,
        date: city.visit_date,
        latitude: cityCoords?.latitude || countryCoords.latitude || 0,
        longitude: cityCoords?.longitude || countryCoords.longitude || 0,
      };
    });

    setVisitedCities(formattedCities);
  };

  const addVisitedCity = async (city) => {
    const tempId = Date.now().toString();
    const newCity = { ...city, id: tempId };
    setVisitedCities(prev => [...prev, newCity]);

    if (!user) return;

    const { data, error } = await supabase
      .from('visited_cities')
      .insert({
        user_id: user.id,
        city_name: city.city,
        country: city.country,
        visit_date: city.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding visited city:', error);
      setVisitedCities(prev => prev.filter(c => c.id !== tempId));
      return;
    }

    setVisitedCities(prev => prev.map(c =>
      c.id === tempId ? { ...c, id: data.id } : c
    ));
  };

  const deleteVisitedCity = async (index) => {
    const cityToDelete = visitedCities[index];
    const oldCities = [...visitedCities];
    setVisitedCities(prev => prev.filter((_, i) => i !== index));

    if (!user || !cityToDelete.id) return;

    const { error } = await supabase
      .from('visited_cities')
      .delete()
      .eq('id', cityToDelete.id);

    if (error) {
      console.error('Error deleting visited city:', error);
      setVisitedCities(oldCities);
    }
  };

  // ============================================
  // BUDGETS FUNCTIONS
  // ============================================
  const loadBudgets = async () => {
    if (!user) return;

    const { data: budgetsData, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    // Parse budget_data JSON if it exists, otherwise construct from legacy fields
    const formattedBudgets = budgetsData.map(budget => {
      // If budget_data exists (new format), use it directly
      if (budget.budget_data) {
        return {
          id: budget.id,
          ...budget.budget_data,
        };
      }

      // Legacy format fallback - construct budget from old columns
      const accommodationAmount = budget.accommodation_amount ||
        ((budget.total_budget || 0) * (budget.accommodation_percent || 0) / 100);

      return {
        id: budget.id,
        source: 'budgetMaker',
        tripType: budget.trip_type || 'single',
        country: budget.country_name || null,
        countries: null,
        mode: 'manual',
        preset: null,
        totalBudget: budget.total_budget || 0,
        tripDuration: budget.trip_duration || 1,
        accommodation: accommodationAmount,
        lineItems: [],
        countryBreakdowns: null,
        countryLineItems: null,
        currency: budget.currency_code || 'USD',
        currencyRate: 1.0,
      };
    });

    setBudgets(formattedBudgets);
  };

  const addBudget = async (budget) => {
    const tempId = Date.now().toString();
    const newBudget = { ...budget, id: tempId };
    setBudgets(prev => [...prev, newBudget]);

    if (!user) return;

    // Store full budget object in budget_data column for complete preservation
    const { id, ...budgetWithoutId } = budget;

    // Use custom budget name if provided, otherwise generate from country/countries
    const tripName = budget.budgetName
      || (budget.tripType === 'multi' && budget.countries?.length > 0
        ? `${budget.countries[0].name}${budget.countries.length > 1 ? ` + ${budget.countries.length - 1} more` : ''}`
        : budget.country || 'Budget');

    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        // Core fields for querying
        trip_name: tripName,
        total_budget: budget.totalBudget || 0,
        trip_duration: budget.tripDuration || 1,
        trip_type: budget.tripType || 'single',
        country_name: budget.country || null,
        accommodation_amount: budget.accommodation || 0,
        currency_code: budget.currency || 'USD',
        // Store complete budget object as JSON
        budget_data: budgetWithoutId,
      })
      .select()
      .single();

    if (budgetError) {
      console.error('Error adding budget:', budgetError);
      setBudgets(prev => prev.filter(b => b.id !== tempId));
      return;
    }

    setBudgets(prev => prev.map(b =>
      b.id === tempId ? { ...b, id: budgetData.id } : b
    ));
  };

  const updateBudget = async (index, updatedBudget) => {
    const oldBudgets = [...budgets];
    const newBudgets = [...budgets];
    newBudgets[index] = updatedBudget;
    setBudgets(newBudgets);

    if (!user || !updatedBudget.id) return;

    // Store full budget object in budget_data column
    const { id, ...budgetWithoutId } = updatedBudget;

    // Use custom budget name if provided, otherwise generate from country/countries
    const tripName = updatedBudget.budgetName
      || (updatedBudget.tripType === 'multi' && updatedBudget.countries?.length > 0
        ? `${updatedBudget.countries[0].name}${updatedBudget.countries.length > 1 ? ` + ${updatedBudget.countries.length - 1} more` : ''}`
        : updatedBudget.country || 'Budget');

    const { error: budgetError } = await supabase
      .from('budgets')
      .update({
        // Core fields for querying
        trip_name: tripName,
        total_budget: updatedBudget.totalBudget || 0,
        trip_duration: updatedBudget.tripDuration || 1,
        trip_type: updatedBudget.tripType || 'single',
        country_name: updatedBudget.country || null,
        accommodation_amount: updatedBudget.accommodation || 0,
        currency_code: updatedBudget.currency || 'USD',
        // Store complete budget object as JSON
        budget_data: budgetWithoutId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedBudget.id);

    if (budgetError) {
      console.error('Error updating budget:', budgetError);
      setBudgets(oldBudgets);
    }
  };

  const deleteBudget = async (index) => {
    const budgetToDelete = budgets[index];
    const oldBudgets = [...budgets];
    setBudgets(prev => prev.filter((_, i) => i !== index));

    if (!user || !budgetToDelete.id) return;

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetToDelete.id);

    if (error) {
      console.error('Error deleting budget:', error);
      setBudgets(oldBudgets);
    }
  };

  // ============================================
  // TRAVEL BUDDIES FUNCTIONS
  // ============================================
  const addBuddyLoading = useCallback((id) => {
    setBuddyActionLoading(prev => new Set(prev).add(id));
  }, []);

  const removeBuddyLoading = useCallback((id) => {
    setBuddyActionLoading(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const loadTravelBuddies = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('travel_buddies')
        .select('*')
        .or(`user_id.eq.${user.id},buddy_id.eq.${user.id}`);

      if (error) {
        // Table might not exist yet
        if (error.code !== '42P01') {
          console.error('Error loading travel buddies:', error);
        }
        return;
      }

      // Filter relationships
      const accepted = data.filter(b => b.status === 'accepted');
      const incomingPending = data.filter(b => b.status === 'pending' && b.buddy_id === user.id);
      const outgoingPending = data.filter(b => b.status === 'pending' && b.user_id === user.id);
      const highlighted = data.filter(b => b.is_highlighted && b.user_id === user.id);

      // Get buddy IDs
      const buddyIds = accepted.map(b => b.user_id === user.id ? b.buddy_id : b.user_id);
      const incomingRequestIds = incomingPending.map(b => b.user_id);
      const outgoingRequestIds = outgoingPending.map(b => b.buddy_id);
      const highlightedIds = highlighted.map(b => b.buddy_id);

      setTravelBuddies(buddyIds);
      setBuddyRequests(incomingRequestIds);
      setSentRequests(outgoingRequestIds);
      setHighlightedBuddies(highlightedIds);

      // Load profiles for buddies
      if (buddyIds.length > 0) {
        const { data: buddyProfiles, error: profileError } = await supabase
          .from('profiles')
          .select('id, name, username, location, bio, avatar, avatar_type, top1, top2, top3')
          .in('id', buddyIds);

        if (!profileError && buddyProfiles) {
          const formattedProfiles = buddyProfiles.map(p => ({
            id: p.id,
            name: p.name || 'Unknown User',
            username: p.username || '',
            location: p.location || 'Location not set',
            bio: p.bio || '',
            avatar: p.avatar,
            avatarType: p.avatar_type || 'default',
            countriesVisited: [p.top1, p.top2, p.top3].filter(Boolean),
          }));
          setTravelBuddyProfiles(formattedProfiles);
        }
      } else {
        setTravelBuddyProfiles([]);
      }

      // Load profiles for incoming requests
      if (incomingRequestIds.length > 0) {
        const { data: requestProfiles, error: requestError } = await supabase
          .from('profiles')
          .select('id, name, username, location, bio, avatar, avatar_type')
          .in('id', incomingRequestIds);

        if (!requestError && requestProfiles) {
          const formattedProfiles = requestProfiles.map(p => ({
            id: p.id,
            name: p.name || 'Unknown User',
            username: p.username || '',
            location: p.location || 'Location not set',
            bio: p.bio || '',
            avatar: p.avatar,
            avatarType: p.avatar_type || 'default',
          }));
          setBuddyRequestProfiles(formattedProfiles);

          // Check for new requests and send notifications
          const newRequestIds = incomingRequestIds.filter(
            id => !previousRequestIds.current.includes(id)
          );

          // Send notification for each new request
          for (const newId of newRequestIds) {
            const newRequester = formattedProfiles.find(p => p.id === newId);
            if (newRequester) {
              // Device push notification
              scheduleBuddyRequestNotification(newRequester.name);
              // In-app banner notification
              setInAppNotification({
                title: 'New Buddy Request!',
                body: `${newRequester.name} wants to be your travel buddy`,
              });
            }
          }

          // Update the app badge count
          setBadgeCount(incomingRequestIds.length);

          // Update previous request IDs
          previousRequestIds.current = incomingRequestIds;
        }
      } else {
        setBuddyRequestProfiles([]);
        setBadgeCount(0);
        previousRequestIds.current = [];
      }
    } catch (err) {
      console.error('Error loading travel buddies:', err);
    }
  };

  const sendBuddyRequest = async (buddyId) => {
    if (!user) return { success: false, message: 'Not logged in' };
    if (buddyActionLoading.has(buddyId)) return { success: false, message: 'Processing...' };
    if (travelBuddies.includes(buddyId)) return { success: false, message: 'Already a buddy' };
    if (sentRequests.includes(buddyId)) return { success: false, message: 'Request already sent' };
    if (buddyRequests.includes(buddyId)) {
      await acceptBuddyRequest(buddyId);
      return { success: true, message: 'You are now buddies!' };
    }

    addBuddyLoading(buddyId);
    setSentRequests(prev => [...prev, buddyId]);

    try {
      const { error } = await supabase
        .from('travel_buddies')
        .insert({
          user_id: user.id,
          buddy_id: buddyId,
          status: 'pending',
        });

      if (error) {
        console.error('Error sending buddy request:', error);
        setSentRequests(prev => prev.filter(id => id !== buddyId));
        return { success: false, message: 'Failed to send request' };
      }

      return { success: true, message: 'Request sent!' };
    } finally {
      removeBuddyLoading(buddyId);
    }
  };

  const acceptBuddyRequest = async (buddyId) => {
    if (buddyActionLoading.has(buddyId)) return;
    addBuddyLoading(buddyId);

    try {
      const requestProfile = buddyRequestProfiles.find(p => p.id === buddyId);

      setBuddyRequests(prev => {
        const newRequests = prev.filter(id => id !== buddyId);
        setBadgeCount(newRequests.length);
        previousRequestIds.current = newRequests;
        return newRequests;
      });
      setBuddyRequestProfiles(prev => prev.filter(p => p.id !== buddyId));
      setTravelBuddies(prev => [...prev, buddyId]);

      if (requestProfile) {
        setTravelBuddyProfiles(prev => [...prev, { ...requestProfile, countriesVisited: [] }]);
      }

      if (!user) return;

      const { error } = await supabase
        .from('travel_buddies')
        .update({ status: 'accepted', updated_at: new Date().toISOString() })
        .eq('user_id', buddyId)
        .eq('buddy_id', user.id);

      if (error) {
        console.error('Error accepting buddy request:', error);
      }
    } finally {
      removeBuddyLoading(buddyId);
    }
  };

  const rejectBuddyRequest = async (buddyId) => {
    if (buddyActionLoading.has(buddyId)) return;
    addBuddyLoading(buddyId);

    try {
      setBuddyRequests(prev => {
        const newRequests = prev.filter(id => id !== buddyId);
        setBadgeCount(newRequests.length);
        previousRequestIds.current = newRequests;
        return newRequests;
      });
      setBuddyRequestProfiles(prev => prev.filter(p => p.id !== buddyId));

      if (!user) return;

      const { error } = await supabase
        .from('travel_buddies')
        .delete()
        .eq('user_id', buddyId)
        .eq('buddy_id', user.id);

      if (error) {
        console.error('Error rejecting buddy request:', error);
      }
    } finally {
      removeBuddyLoading(buddyId);
    }
  };

  const removeTravelBuddy = async (buddyId) => {
    if (buddyActionLoading.has(buddyId)) return;
    addBuddyLoading(buddyId);

    try {
      setTravelBuddies(prev => prev.filter(id => id !== buddyId));
      setTravelBuddyProfiles(prev => prev.filter(p => p.id !== buddyId));
      setHighlightedBuddies(prev => prev.filter(id => id !== buddyId));

      if (!user) return;

      const { error } = await supabase
        .from('travel_buddies')
        .delete()
        .or(`and(user_id.eq.${user.id},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${user.id})`);

      if (error) {
        console.error('Error removing travel buddy:', error);
      }
    } finally {
      removeBuddyLoading(buddyId);
    }
  };

  const setHighlightedBuddiesFunc = async (buddyIds) => {
    const limitedIds = buddyIds.slice(0, 3);
    setHighlightedBuddies(limitedIds);

    if (!user) return;

    // Reset all highlighted flags for this user
    await supabase
      .from('travel_buddies')
      .update({ is_highlighted: false })
      .eq('user_id', user.id);

    // Batch set highlighted flags for selected buddies
    if (limitedIds.length > 0) {
      await supabase
        .from('travel_buddies')
        .update({ is_highlighted: true })
        .eq('user_id', user.id)
        .in('buddy_id', limitedIds);
    }
  };

  return (
    <AppContext.Provider
      value={{
        loading,
        trips,
        setTrips,
        addTrip,
        updateTrip,
        deleteTrip,
        completedTrips,
        setCompletedTrips,
        addCompletedTrip,
        deleteCompletedTrip,
        visitedCities,
        setVisitedCities,
        addVisitedCity,
        deleteVisitedCity,
        budgets,
        setBudgets,
        addBudget,
        updateBudget,
        deleteBudget,
        profile,
        updateProfile,
        // Social features
        travelBuddies,
        travelBuddyProfiles,
        setTravelBuddies,
        highlightedBuddies,
        setHighlightedBuddies: setHighlightedBuddiesFunc,
        buddyRequests,
        buddyRequestProfiles,
        sentRequests,
        buddyActionLoading,
        sendBuddyRequest,
        acceptBuddyRequest,
        rejectBuddyRequest,
        removeTravelBuddy,
        // In-app notification
        inAppNotification,
        dismissInAppNotification: () => setInAppNotification(null),
        // Refresh function
        refreshData: loadAllUserData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
