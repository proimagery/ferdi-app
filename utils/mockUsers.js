// Mock users database for development/testing
// In production, this would come from a backend API

export const mockUsers = [
  {
    id: 'user1',
    name: 'Sarah Chen',
    location: 'San Francisco, CA',
    bio: 'Digital nomad exploring the world one country at a time 🌍',
    countriesVisited: ['United States', 'Japan', 'Thailand', 'France', 'Italy', 'Spain', 'Germany', 'England', 'Australia', 'New Zealand', 'Singapore', 'South Korea', 'Vietnam', 'Indonesia', 'Malaysia', 'Philippines', 'Cambodia', 'Laos', 'Myanmar', 'India', 'Nepal', 'Sri Lanka', 'China', 'Taiwan', 'Hong Kong', 'Mexico', 'Canada', 'Brazil', 'Argentina', 'Chile'],
    monthCount: 5,  // Countries visited this month
    yearCount: 15,  // Countries visited this year
    avatar: 'preset1',
    avatarType: 'preset',
    top3: ['Japan', 'Thailand', 'Italy'],
    next3: ['Greece', 'Portugal', 'Iceland'],
    travelBuddies: ['user2', 'user3', 'user4', 'user5', 'user6'],
    highlightedBuddies: ['user2', 'user3', 'user4'],
  },
  {
    id: 'user2',
    name: 'Marcus Johnson',
    location: 'London, UK',
    bio: 'Adventure seeker | Mountain climber | 52 countries and counting',
    countriesVisited: ['England', 'Scotland', 'France', 'Spain', 'Italy', 'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Greece', 'Turkey', 'Egypt', 'Morocco', 'South Africa', 'Kenya', 'Tanzania', 'United States', 'Canada', 'Mexico', 'Peru', 'Chile', 'Argentina', 'Brazil', 'Japan', 'China', 'Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Indonesia', 'Malaysia', 'Singapore', 'Philippines', 'Australia', 'New Zealand', 'India', 'Nepal', 'Sri Lanka', 'United Arab Emirates', 'Qatar', 'Jordan', 'Israel', 'Russia', 'Ukraine', 'Norway', 'Sweden', 'Finland', 'Iceland'],
    monthCount: 3,
    yearCount: 18,
    avatar: 'preset2',
    avatarType: 'preset',
    top3: ['Switzerland', 'New Zealand', 'Iceland'],
    next3: ['Bhutan', 'Mongolia', 'Antarctica'],
    travelBuddies: ['user1', 'user3', 'user7'],
    highlightedBuddies: ['user1', 'user3', 'user7'],
  },
  {
    id: 'user3',
    name: 'Elena Rodriguez',
    location: 'Barcelona, Spain',
    bio: 'Food lover & culture enthusiast. Traveling to taste the world! 🍜',
    countriesVisited: ['Spain', 'France', 'Italy', 'Portugal', 'Greece', 'Turkey', 'Morocco', 'Egypt', 'England', 'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Croatia', 'Slovenia', 'Czech Republic', 'Poland', 'Hungary', 'Romania', 'Bulgaria', 'Serbia', 'Montenegro', 'Albania', 'North Macedonia', 'Bosnia and Herzegovina', 'Slovakia', 'Malta', 'Cyprus', 'Tunisia', 'Algeria', 'Jordan', 'Israel', 'United Arab Emirates', 'Mexico', 'United States', 'Canada', 'Colombia', 'Peru', 'Argentina', 'Chile', 'Brazil'],
    monthCount: 7,
    yearCount: 20,
    avatar: 'preset3',
    avatarType: 'preset',
    top3: ['Italy', 'Greece', 'Morocco'],
    next3: ['Lebanon', 'Georgia', 'Armenia'],
    travelBuddies: ['user1', 'user2', 'user4', 'user5'],
    highlightedBuddies: ['user1', 'user2', 'user4'],
  },
  {
    id: 'user4',
    name: 'Yuki Tanaka',
    location: 'Tokyo, Japan',
    bio: 'Photographer | Nature lover | Capturing moments around the globe 📸',
    countriesVisited: ['Japan', 'South Korea', 'China', 'Taiwan', 'Hong Kong', 'Macau', 'Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Brunei', 'India', 'Nepal', 'Sri Lanka', 'Bhutan', 'Maldives', 'Australia', 'New Zealand', 'United States', 'Canada', 'Mexico', 'France', 'Italy', 'Spain', 'Germany', 'Scotland', 'Switzerland', 'Norway', 'Iceland', 'Finland'],
    monthCount: 2,
    yearCount: 12,
    avatar: 'preset4',
    avatarType: 'preset',
    top3: ['Iceland', 'New Zealand', 'Norway'],
    next3: ['Patagonia', 'Alaska', 'Greenland'],
    travelBuddies: ['user1', 'user3', 'user6'],
    highlightedBuddies: ['user1', 'user3', 'user6'],
  },
  {
    id: 'user5',
    name: 'David Smith',
    location: 'New York, NY',
    bio: 'Business traveler turned wanderer. Life is too short to stay in one place!',
    countriesVisited: ['United States', 'Canada', 'Mexico', 'England', 'France', 'Germany', 'Italy', 'Spain', 'Netherlands', 'Belgium', 'Switzerland', 'Japan', 'China', 'South Korea', 'Singapore', 'Australia', 'Brazil', 'Argentina', 'Chile', 'Peru', 'Colombia', 'United Arab Emirates', 'India', 'Thailand', 'Vietnam', 'Indonesia'],
    monthCount: 4,
    yearCount: 10,
    avatar: 'preset5',
    avatarType: 'preset',
    top3: ['Japan', 'Switzerland', 'New Zealand'],
    next3: ['South Africa', 'Egypt', 'Morocco'],
    travelBuddies: ['user1', 'user3', 'user8'],
    highlightedBuddies: ['user1', 'user3', 'user8'],
  },
  {
    id: 'user6',
    name: 'Amara Okafor',
    location: 'Lagos, Nigeria',
    bio: 'African explorer | Adventure racer | Discovering hidden gems across continents',
    countriesVisited: ['Nigeria', 'Ghana', 'Kenya', 'Tanzania', 'South Africa', 'Morocco', 'Egypt', 'Ethiopia', 'Uganda', 'Rwanda', 'Botswana', 'Namibia', 'Zimbabwe', 'Zambia', 'Mozambique', 'Senegal', 'Ivory Coast', 'Cameroon', 'Tunisia', 'Algeria', 'Wales', 'France', 'Spain', 'Italy', 'Germany', 'United States', 'Canada', 'Brazil', 'United Arab Emirates', 'India', 'Thailand', 'China', 'Japan', 'Australia'],
    monthCount: 6,
    yearCount: 14,
    avatar: 'preset6',
    avatarType: 'preset',
    top3: ['Tanzania', 'Morocco', 'Ethiopia'],
    next3: ['Madagascar', 'Seychelles', 'Mauritius'],
    travelBuddies: ['user1', 'user4', 'user7'],
    highlightedBuddies: ['user1', 'user4', 'user7'],
  },
  {
    id: 'user7',
    name: 'Liam O\'Connor',
    location: 'Dublin, Ireland',
    bio: 'Backpacker | Hostel hopper | Budget travel expert 🎒',
    countriesVisited: ['Ireland', 'Northern Ireland', 'France', 'Spain', 'Portugal', 'Italy', 'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Greece', 'Turkey', 'Morocco', 'Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Indonesia', 'Malaysia', 'Philippines', 'India', 'Nepal', 'Sri Lanka', 'Australia', 'New Zealand', 'United States', 'Canada', 'Mexico', 'Guatemala', 'Costa Rica', 'Peru', 'Bolivia', 'Chile', 'Argentina', 'Brazil'],
    monthCount: 1,
    yearCount: 8,
    avatar: 'preset7',
    avatarType: 'preset',
    top3: ['Nepal', 'Peru', 'Thailand'],
    next3: ['Pakistan', 'Kyrgyzstan', 'Tajikistan'],
    travelBuddies: ['user2', 'user6', 'user8'],
    highlightedBuddies: ['user2', 'user6', 'user8'],
  },
  {
    id: 'user8',
    name: 'Priya Sharma',
    location: 'Mumbai, India',
    bio: 'Solo female traveler | Yoga instructor | Spreading positive vibes worldwide ✨',
    countriesVisited: ['India', 'Nepal', 'Sri Lanka', 'Bhutan', 'Maldives', 'Thailand', 'Vietnam', 'Cambodia', 'Laos', 'Myanmar', 'Malaysia', 'Singapore', 'Indonesia', 'Philippines', 'Japan', 'South Korea', 'China', 'Taiwan', 'United Arab Emirates', 'Oman', 'Jordan', 'Turkey', 'Greece', 'Italy', 'Spain', 'France', 'England', 'Germany', 'Switzerland', 'Australia', 'New Zealand', 'United States', 'Canada', 'Mexico', 'Peru', 'Brazil'],
    monthCount: 8,
    yearCount: 16,
    avatar: 'preset8',
    avatarType: 'preset',
    top3: ['Bhutan', 'Greece', 'Peru'],
    next3: ['Tibet', 'Nepal', 'Myanmar'],
    travelBuddies: ['user5', 'user7', 'user9'],
    highlightedBuddies: ['user5', 'user7', 'user9'],
  },
  {
    id: 'user9',
    name: 'Sophie Martin',
    location: 'Paris, France',
    bio: 'Art historian | Museum enthusiast | Exploring culture and history',
    countriesVisited: ['France', 'Italy', 'Spain', 'Greece', 'Turkey', 'Egypt', 'England', 'Germany', 'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Czech Republic', 'Poland', 'Hungary', 'Croatia', 'Portugal', 'Morocco', 'Tunisia', 'Jordan', 'Israel', 'United States', 'Mexico', 'Peru', 'Japan', 'China', 'India', 'Thailand', 'Vietnam', 'Australia'],
    monthCount: 3,
    yearCount: 11,
    avatar: 'preset9',
    avatarType: 'preset',
    top3: ['Italy', 'Egypt', 'Greece'],
    next3: ['Iran', 'Uzbekistan', 'Syria'],
    travelBuddies: ['user8', 'user10'],
    highlightedBuddies: ['user8', 'user10'],
  },
  {
    id: 'user10',
    name: 'Alex Kim',
    location: 'Seoul, South Korea',
    bio: 'K-pop fan | Street food addict | Urban explorer 🏙️',
    countriesVisited: ['South Korea', 'Japan', 'China', 'Taiwan', 'Hong Kong', 'Thailand', 'Vietnam', 'Singapore', 'Malaysia', 'Indonesia', 'Philippines', 'United States', 'Canada', 'England', 'France', 'Germany', 'Italy', 'Spain', 'Australia', 'New Zealand'],
    monthCount: 2,
    yearCount: 7,
    avatar: 'preset10',
    avatarType: 'preset',
    top3: ['Japan', 'Taiwan', 'Thailand'],
    next3: ['Vietnam', 'Philippines', 'Indonesia'],
    travelBuddies: ['user9'],
    highlightedBuddies: ['user9'],
  },
];

// Helper function to get a user by ID
export const getUserById = (userId) => {
  return mockUsers.find(user => user.id === userId);
};

// Helper function to search users by name
export const searchUsers = (query) => {
  if (!query || query.trim() === '') return [];

  const lowerQuery = query.toLowerCase();
  return mockUsers.filter(user =>
    user.name.toLowerCase().includes(lowerQuery) ||
    user.location.toLowerCase().includes(lowerQuery)
  );
};

// Helper function to get leaderboard (sorted by countries visited)
export const getLeaderboard = (timeframe = 'allTime') => {
  // Sort based on the selected timeframe
  return [...mockUsers].sort((a, b) => {
    if (timeframe === 'month') {
      return b.monthCount - a.monthCount;
    } else if (timeframe === 'year') {
      return b.yearCount - a.yearCount;
    } else {
      // allTime - use total countries visited
      return b.countriesVisited.length - a.countriesVisited.length;
    }
  });
};
