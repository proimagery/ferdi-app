import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [visitedCities, setVisitedCities] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [profile, setProfile] = useState({
    name: '',
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
  const [travelBuddies, setTravelBuddies] = useState([]);
  const [highlightedBuddies, setHighlightedBuddies] = useState([]);
  const [buddyRequests, setBuddyRequests] = useState([]);

  // ============================================
  // LOAD ALL USER DATA ON LOGIN
  // ============================================
  useEffect(() => {
    if (user) {
      loadAllUserData();
    } else {
      // Reset state when user logs out
      setTrips([]);
      setCompletedTrips([]);
      setVisitedCities([]);
      setBudgets([]);
      setProfile({
        name: '',
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
      setHighlightedBuddies([]);
      setBuddyRequests([]);
      setLoading(false);
    }
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

    const formattedCities = data.map(city => ({
      id: city.id,
      city: city.city_name,
      country: city.country,
      date: city.visit_date,
    }));

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
      .select(`
        *,
        budget_categories (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading budgets:', error);
      return;
    }

    const formattedBudgets = budgetsData.map(budget => ({
      id: budget.id,
      tripName: budget.trip_name,
      totalBudget: budget.total_budget,
      currencyCode: budget.currency_code,
      currencySymbol: budget.currency_symbol,
      tripDuration: budget.trip_duration,
      tripType: budget.trip_type,
      accommodationPercent: budget.accommodation_percent,
      categories: budget.budget_categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        budgetAmount: cat.budget_amount,
        spent: cat.spent,
        icon: cat.icon,
        color: cat.color,
      })),
    }));

    setBudgets(formattedBudgets);
  };

  const addBudget = async (budget) => {
    const tempId = Date.now().toString();
    const newBudget = { ...budget, id: tempId };
    setBudgets(prev => [...prev, newBudget]);

    if (!user) return;

    const { data: budgetData, error: budgetError } = await supabase
      .from('budgets')
      .insert({
        user_id: user.id,
        trip_name: budget.tripName,
        total_budget: budget.totalBudget || 0,
        currency_code: budget.currencyCode || 'USD',
        currency_symbol: budget.currencySymbol || '$',
        trip_duration: budget.tripDuration || 1,
        trip_type: budget.tripType || 'single',
        accommodation_percent: budget.accommodationPercent || 30,
      })
      .select()
      .single();

    if (budgetError) {
      console.error('Error adding budget:', budgetError);
      setBudgets(prev => prev.filter(b => b.id !== tempId));
      return;
    }

    // Insert budget categories
    if (budget.categories && budget.categories.length > 0) {
      const categoriesData = budget.categories.map(cat => ({
        budget_id: budgetData.id,
        name: cat.name,
        budget_amount: cat.budgetAmount || 0,
        spent: cat.spent || 0,
        icon: cat.icon || 'cash-outline',
        color: cat.color || '#4ade80',
      }));

      await supabase.from('budget_categories').insert(categoriesData);
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

    const { error: budgetError } = await supabase
      .from('budgets')
      .update({
        trip_name: updatedBudget.tripName,
        total_budget: updatedBudget.totalBudget || 0,
        currency_code: updatedBudget.currencyCode || 'USD',
        currency_symbol: updatedBudget.currencySymbol || '$',
        trip_duration: updatedBudget.tripDuration || 1,
        trip_type: updatedBudget.tripType || 'single',
        accommodation_percent: updatedBudget.accommodationPercent || 30,
        updated_at: new Date().toISOString(),
      })
      .eq('id', updatedBudget.id);

    if (budgetError) {
      console.error('Error updating budget:', budgetError);
      setBudgets(oldBudgets);
      return;
    }

    // Delete old categories and insert new ones
    await supabase
      .from('budget_categories')
      .delete()
      .eq('budget_id', updatedBudget.id);

    if (updatedBudget.categories && updatedBudget.categories.length > 0) {
      const categoriesData = updatedBudget.categories.map(cat => ({
        budget_id: updatedBudget.id,
        name: cat.name,
        budget_amount: cat.budgetAmount || 0,
        spent: cat.spent || 0,
        icon: cat.icon || 'cash-outline',
        color: cat.color || '#4ade80',
      }));

      await supabase.from('budget_categories').insert(categoriesData);
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
  const loadTravelBuddies = async () => {
    if (!user) return;

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

    const accepted = data.filter(b => b.status === 'accepted');
    const pending = data.filter(b => b.status === 'pending' && b.buddy_id === user.id);
    const highlighted = data.filter(b => b.is_highlighted && b.user_id === user.id);

    setTravelBuddies(accepted.map(b => b.user_id === user.id ? b.buddy_id : b.user_id));
    setBuddyRequests(pending.map(b => b.user_id));
    setHighlightedBuddies(highlighted.map(b => b.buddy_id));
  };

  const sendBuddyRequest = async (buddyId) => {
    if (!user || travelBuddies.includes(buddyId) || buddyRequests.includes(buddyId)) return;

    const { error } = await supabase
      .from('travel_buddies')
      .insert({
        user_id: user.id,
        buddy_id: buddyId,
        status: 'pending',
      });

    if (error) {
      console.error('Error sending buddy request:', error);
    }
  };

  const acceptBuddyRequest = async (buddyId) => {
    setBuddyRequests(prev => prev.filter(id => id !== buddyId));
    setTravelBuddies(prev => [...prev, buddyId]);

    if (!user) return;

    const { error } = await supabase
      .from('travel_buddies')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('user_id', buddyId)
      .eq('buddy_id', user.id);

    if (error) {
      console.error('Error accepting buddy request:', error);
    }
  };

  const rejectBuddyRequest = async (buddyId) => {
    setBuddyRequests(prev => prev.filter(id => id !== buddyId));

    if (!user) return;

    const { error } = await supabase
      .from('travel_buddies')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('user_id', buddyId)
      .eq('buddy_id', user.id);

    if (error) {
      console.error('Error rejecting buddy request:', error);
    }
  };

  const removeTravelBuddy = async (buddyId) => {
    setTravelBuddies(prev => prev.filter(id => id !== buddyId));
    setHighlightedBuddies(prev => prev.filter(id => id !== buddyId));

    if (!user) return;

    const { error } = await supabase
      .from('travel_buddies')
      .delete()
      .or(`and(user_id.eq.${user.id},buddy_id.eq.${buddyId}),and(user_id.eq.${buddyId},buddy_id.eq.${user.id})`);

    if (error) {
      console.error('Error removing travel buddy:', error);
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

    // Set highlighted flags for selected buddies
    for (const buddyId of limitedIds) {
      await supabase
        .from('travel_buddies')
        .update({ is_highlighted: true })
        .eq('user_id', user.id)
        .eq('buddy_id', buddyId);
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
        setTravelBuddies,
        highlightedBuddies,
        setHighlightedBuddies: setHighlightedBuddiesFunc,
        buddyRequests,
        sendBuddyRequest,
        acceptBuddyRequest,
        rejectBuddyRequest,
        removeTravelBuddy,
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
