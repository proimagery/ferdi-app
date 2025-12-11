import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
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
    facebook: '',
    youtube: '',
    top1: '',
    top2: '',
    top3: '',
    next1: '',
    next2: '',
    next3: '',
    avatar: null, // Can be 'preset1', 'preset2', etc., or an image URI
    avatarType: 'default', // 'default', 'preset', or 'custom'
    sharedTripMaps: [], // Array of trip IDs from completedTrips to display on profile
    travelPhotos: [], // Array of photo URIs (max 5)
  });

  // Social features state
  const [travelBuddies, setTravelBuddies] = useState([]); // Array of user IDs
  const [highlightedBuddies, setHighlightedBuddies] = useState([]); // Array of 3 user IDs to highlight on profile
  const [buddyRequests, setBuddyRequests] = useState([]); // Pending buddy requests

  const addTrip = (trip) => {
    setTrips([...trips, trip]);
  };

  const updateTrip = (index, updatedTrip) => {
    const newTrips = [...trips];
    newTrips[index] = updatedTrip;
    setTrips(newTrips);
  };

  const deleteTrip = (index) => {
    const newTrips = trips.filter((_, i) => i !== index);
    setTrips(newTrips);
  };

  const addCompletedTrip = (trip) => {
    setCompletedTrips([...completedTrips, trip]);
  };

  const deleteCompletedTrip = (index) => {
    const newTrips = completedTrips.filter((_, i) => i !== index);
    setCompletedTrips(newTrips);
  };

  const addVisitedCity = (city) => {
    setVisitedCities([...visitedCities, city]);
  };

  const deleteVisitedCity = (index) => {
    const newCities = visitedCities.filter((_, i) => i !== index);
    setVisitedCities(newCities);
  };

  const addBudget = (budget) => {
    setBudgets([...budgets, budget]);
  };

  const updateBudget = (index, updatedBudget) => {
    const newBudgets = [...budgets];
    newBudgets[index] = updatedBudget;
    setBudgets(newBudgets);
  };

  const deleteBudget = (index) => {
    const newBudgets = budgets.filter((_, i) => i !== index);
    setBudgets(newBudgets);
  };

  const updateProfile = (profileData) => {
    setProfile(profileData);
  };

  // Social feature functions
  const sendBuddyRequest = (userId) => {
    if (!buddyRequests.includes(userId) && !travelBuddies.includes(userId)) {
      setBuddyRequests([...buddyRequests, userId]);
    }
  };

  const acceptBuddyRequest = (userId) => {
    setTravelBuddies([...travelBuddies, userId]);
    setBuddyRequests(buddyRequests.filter(id => id !== userId));
  };

  const rejectBuddyRequest = (userId) => {
    setBuddyRequests(buddyRequests.filter(id => id !== userId));
  };

  const removeTravelBuddy = (userId) => {
    setTravelBuddies(travelBuddies.filter(id => id !== userId));
    setHighlightedBuddies(highlightedBuddies.filter(id => id !== userId));
  };

  const setHighlightedBuddiesFunc = (buddyIds) => {
    // Only allow max 3 highlighted buddies
    setHighlightedBuddies(buddyIds.slice(0, 3));
  };

  return (
    <AppContext.Provider
      value={{
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
