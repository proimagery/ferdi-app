// Traveler ranking system based on countries visited
export const getTravelerRank = (countries) => {
  if (countries < 5) return 'Drifter';
  if (countries >= 5 && countries <= 9) return 'Pilgrim';
  if (countries >= 10 && countries <= 13) return 'Wanderer Lvl 1';
  if (countries >= 14 && countries <= 16) return 'Wanderer Lvl 2';
  if (countries >= 17 && countries <= 19) return 'Wanderer Lvl 3';
  if (countries >= 20 && countries <= 23) return 'Seeker Lvl 1';
  if (countries >= 24 && countries <= 26) return 'Seeker Lvl 2';
  if (countries >= 27 && countries <= 29) return 'Seeker Lvl 3';
  if (countries >= 30 && countries <= 33) return 'Adventurer Lvl 1';
  if (countries >= 34 && countries <= 36) return 'Adventurer Lvl 2';
  if (countries >= 37 && countries <= 39) return 'Adventurer Lvl 3';
  if (countries >= 40 && countries <= 43) return 'Traveler Lvl 1';
  if (countries >= 44 && countries <= 46) return 'Traveler Lvl 2';
  if (countries >= 47 && countries <= 49) return 'Traveler Lvl 3';
  if (countries >= 50 && countries <= 53) return 'Explorer Lvl 1';
  if (countries >= 54 && countries <= 56) return 'Explorer Lvl 2';
  if (countries >= 57 && countries <= 59) return 'Explorer Lvl 3';
  if (countries >= 60 && countries <= 63) return 'Voyager Lvl 1';
  if (countries >= 64 && countries <= 66) return 'Voyager Lvl 2';
  if (countries >= 67 && countries <= 69) return 'Voyager Lvl 3';
  if (countries >= 70 && countries <= 75) return 'Globetrotter Lvl 1';
  if (countries >= 76 && countries <= 79) return 'Globetrotter Lvl 2';
  if (countries >= 80 && countries <= 85) return 'Globetrotter Lvl 3';
  if (countries >= 86 && countries <= 90) return 'Globetrotter Lvl 4';
  if (countries >= 91 && countries <= 99) return 'Nomad Lvl 1';
  if (countries >= 100 && countries <= 114) return 'Nomad Lvl 2';
  if (countries >= 115 && countries <= 124) return 'Nomad Lvl 3';
  if (countries >= 125 && countries <= 140) return 'Nomad Lvl 4';
  if (countries >= 141) return 'Nomad Lvl 5';
  return 'Drifter';
};

// All ranks with their requirements for the info dropdown
export const allRanks = [
  { rank: 'Drifter', countries: 'Under 5' },
  { rank: 'Pilgrim', countries: '5-9' },
  { rank: 'Wanderer Lvl 1', countries: '10-13' },
  { rank: 'Wanderer Lvl 2', countries: '14-16' },
  { rank: 'Wanderer Lvl 3', countries: '17-19' },
  { rank: 'Seeker Lvl 1', countries: '20-23' },
  { rank: 'Seeker Lvl 2', countries: '24-26' },
  { rank: 'Seeker Lvl 3', countries: '27-29' },
  { rank: 'Adventurer Lvl 1', countries: '30-33' },
  { rank: 'Adventurer Lvl 2', countries: '34-36' },
  { rank: 'Adventurer Lvl 3', countries: '37-39' },
  { rank: 'Traveler Lvl 1', countries: '40-43' },
  { rank: 'Traveler Lvl 2', countries: '44-46' },
  { rank: 'Traveler Lvl 3', countries: '47-49' },
  { rank: 'Explorer Lvl 1', countries: '50-53' },
  { rank: 'Explorer Lvl 2', countries: '54-56' },
  { rank: 'Explorer Lvl 3', countries: '57-59' },
  { rank: 'Voyager Lvl 1', countries: '60-63' },
  { rank: 'Voyager Lvl 2', countries: '64-66' },
  { rank: 'Voyager Lvl 3', countries: '67-69' },
  { rank: 'Globetrotter Lvl 1', countries: '70-75' },
  { rank: 'Globetrotter Lvl 2', countries: '76-79' },
  { rank: 'Globetrotter Lvl 3', countries: '80-85' },
  { rank: 'Globetrotter Lvl 4', countries: '86-90' },
  { rank: 'Nomad Lvl 1', countries: '91-99' },
  { rank: 'Nomad Lvl 2', countries: '100-114' },
  { rank: 'Nomad Lvl 3', countries: '115-124' },
  { rank: 'Nomad Lvl 4', countries: '125-140' },
  { rank: 'Nomad Lvl 5', countries: '141+' },
];
