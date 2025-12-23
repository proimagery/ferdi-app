// World cities database with coordinates
// Format: { city, country, latitude, longitude }

export const worldCities = [
  // United States
  { city: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060 },
  { city: 'Los Angeles', country: 'United States', latitude: 34.0522, longitude: -118.2437 },
  { city: 'Chicago', country: 'United States', latitude: 41.8781, longitude: -87.6298 },
  { city: 'Houston', country: 'United States', latitude: 29.7604, longitude: -95.3698 },
  { city: 'Phoenix', country: 'United States', latitude: 33.4484, longitude: -112.0740 },
  { city: 'Philadelphia', country: 'United States', latitude: 39.9526, longitude: -75.1652 },
  { city: 'San Antonio', country: 'United States', latitude: 29.4241, longitude: -98.4936 },
  { city: 'San Diego', country: 'United States', latitude: 32.7157, longitude: -117.1611 },
  { city: 'Dallas', country: 'United States', latitude: 32.7767, longitude: -96.7970 },
  { city: 'San Jose', country: 'United States', latitude: 37.3382, longitude: -121.8863 },
  { city: 'Austin', country: 'United States', latitude: 30.2672, longitude: -97.7431 },
  { city: 'San Francisco', country: 'United States', latitude: 37.7749, longitude: -122.4194 },
  { city: 'Seattle', country: 'United States', latitude: 47.6062, longitude: -122.3321 },
  { city: 'Denver', country: 'United States', latitude: 39.7392, longitude: -104.9903 },
  { city: 'Boston', country: 'United States', latitude: 42.3601, longitude: -71.0589 },
  { city: 'Las Vegas', country: 'United States', latitude: 36.1699, longitude: -115.1398 },
  { city: 'Miami', country: 'United States', latitude: 25.7617, longitude: -80.1918 },
  { city: 'Atlanta', country: 'United States', latitude: 33.7490, longitude: -84.3880 },
  { city: 'Portland', country: 'United States', latitude: 45.5152, longitude: -122.6784 },
  { city: 'Nashville', country: 'United States', latitude: 36.1627, longitude: -86.7816 },
  { city: 'New Orleans', country: 'United States', latitude: 29.9511, longitude: -90.0715 },
  { city: 'Orlando', country: 'United States', latitude: 28.5383, longitude: -81.3792 },
  { city: 'Honolulu', country: 'United States', latitude: 21.3069, longitude: -157.8583 },
  { city: 'Washington DC', country: 'United States', latitude: 38.9072, longitude: -77.0369 },

  // United Kingdom
  { city: 'London', country: 'England', latitude: 51.5074, longitude: -0.1278 },
  { city: 'Manchester', country: 'England', latitude: 53.4808, longitude: -2.2426 },
  { city: 'Birmingham', country: 'England', latitude: 52.4862, longitude: -1.8904 },
  { city: 'Liverpool', country: 'England', latitude: 53.4084, longitude: -2.9916 },
  { city: 'Leeds', country: 'England', latitude: 53.8008, longitude: -1.5491 },
  { city: 'Bristol', country: 'England', latitude: 51.4545, longitude: -2.5879 },
  { city: 'Newcastle', country: 'England', latitude: 54.9783, longitude: -1.6178 },
  { city: 'Sheffield', country: 'England', latitude: 53.3811, longitude: -1.4701 },
  { city: 'Nottingham', country: 'England', latitude: 52.9548, longitude: -1.1581 },
  { city: 'Cambridge', country: 'England', latitude: 52.2053, longitude: 0.1218 },
  { city: 'Oxford', country: 'England', latitude: 51.7520, longitude: -1.2577 },
  { city: 'Brighton', country: 'England', latitude: 50.8225, longitude: -0.1372 },
  { city: 'Edinburgh', country: 'Scotland', latitude: 55.9533, longitude: -3.1883 },
  { city: 'Glasgow', country: 'Scotland', latitude: 55.8642, longitude: -4.2518 },
  { city: 'Aberdeen', country: 'Scotland', latitude: 57.1497, longitude: -2.0943 },
  { city: 'Cardiff', country: 'Wales', latitude: 51.4816, longitude: -3.1791 },
  { city: 'Swansea', country: 'Wales', latitude: 51.6214, longitude: -3.9436 },
  { city: 'Belfast', country: 'Ireland', latitude: 54.5973, longitude: -5.9301 },
  { city: 'Dublin', country: 'Ireland', latitude: 53.3498, longitude: -6.2603 },
  { city: 'Cork', country: 'Ireland', latitude: 51.8985, longitude: -8.4756 },
  { city: 'Galway', country: 'Ireland', latitude: 53.2707, longitude: -9.0568 },

  // France
  { city: 'Paris', country: 'France', latitude: 48.8566, longitude: 2.3522 },
  { city: 'Marseille', country: 'France', latitude: 43.2965, longitude: 5.3698 },
  { city: 'Lyon', country: 'France', latitude: 45.7640, longitude: 4.8357 },
  { city: 'Toulouse', country: 'France', latitude: 43.6047, longitude: 1.4442 },
  { city: 'Nice', country: 'France', latitude: 43.7102, longitude: 7.2620 },
  { city: 'Bordeaux', country: 'France', latitude: 44.8378, longitude: -0.5792 },
  { city: 'Strasbourg', country: 'France', latitude: 48.5734, longitude: 7.7521 },
  { city: 'Cannes', country: 'France', latitude: 43.5528, longitude: 7.0174 },
  { city: 'Monaco', country: 'Monaco', latitude: 43.7384, longitude: 7.4246 },

  // Germany
  { city: 'Berlin', country: 'Germany', latitude: 52.5200, longitude: 13.4050 },
  { city: 'Munich', country: 'Germany', latitude: 48.1351, longitude: 11.5820 },
  { city: 'Frankfurt', country: 'Germany', latitude: 50.1109, longitude: 8.6821 },
  { city: 'Hamburg', country: 'Germany', latitude: 53.5511, longitude: 9.9937 },
  { city: 'Cologne', country: 'Germany', latitude: 50.9375, longitude: 6.9603 },
  { city: 'Stuttgart', country: 'Germany', latitude: 48.7758, longitude: 9.1829 },
  { city: 'Düsseldorf', country: 'Germany', latitude: 51.2277, longitude: 6.7735 },
  { city: 'Dresden', country: 'Germany', latitude: 51.0504, longitude: 13.7373 },

  // Italy
  { city: 'Rome', country: 'Italy', latitude: 41.9028, longitude: 12.4964 },
  { city: 'Milan', country: 'Italy', latitude: 45.4642, longitude: 9.1900 },
  { city: 'Venice', country: 'Italy', latitude: 45.4408, longitude: 12.3155 },
  { city: 'Florence', country: 'Italy', latitude: 43.7696, longitude: 11.2558 },
  { city: 'Naples', country: 'Italy', latitude: 40.8518, longitude: 14.2681 },
  { city: 'Turin', country: 'Italy', latitude: 45.0703, longitude: 7.6869 },
  { city: 'Bologna', country: 'Italy', latitude: 44.4949, longitude: 11.3426 },
  { city: 'Palermo', country: 'Italy', latitude: 38.1157, longitude: 13.3615 },
  { city: 'Verona', country: 'Italy', latitude: 45.4384, longitude: 10.9916 },
  { city: 'Pisa', country: 'Italy', latitude: 43.7228, longitude: 10.4017 },
  { city: 'Amalfi', country: 'Italy', latitude: 40.6340, longitude: 14.6027 },

  // Spain
  { city: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { city: 'Barcelona', country: 'Spain', latitude: 41.3851, longitude: 2.1734 },
  { city: 'Valencia', country: 'Spain', latitude: 39.4699, longitude: -0.3763 },
  { city: 'Seville', country: 'Spain', latitude: 37.3891, longitude: -5.9845 },
  { city: 'Malaga', country: 'Spain', latitude: 36.7213, longitude: -4.4214 },
  { city: 'Bilbao', country: 'Spain', latitude: 43.2630, longitude: -2.9350 },
  { city: 'Granada', country: 'Spain', latitude: 37.1773, longitude: -3.5986 },
  { city: 'Ibiza', country: 'Spain', latitude: 38.9067, longitude: 1.4206 },
  { city: 'Palma de Mallorca', country: 'Spain', latitude: 39.5696, longitude: 2.6502 },

  // Portugal
  { city: 'Lisbon', country: 'Portugal', latitude: 38.7223, longitude: -9.1393 },
  { city: 'Porto', country: 'Portugal', latitude: 41.1579, longitude: -8.6291 },
  { city: 'Faro', country: 'Portugal', latitude: 37.0194, longitude: -7.9322 },

  // Netherlands
  { city: 'Amsterdam', country: 'Netherlands', latitude: 52.3676, longitude: 4.9041 },
  { city: 'Rotterdam', country: 'Netherlands', latitude: 51.9244, longitude: 4.4777 },
  { city: 'The Hague', country: 'Netherlands', latitude: 52.0705, longitude: 4.3007 },
  { city: 'Utrecht', country: 'Netherlands', latitude: 52.0907, longitude: 5.1214 },

  // Belgium
  { city: 'Brussels', country: 'Belgium', latitude: 50.8503, longitude: 4.3517 },
  { city: 'Antwerp', country: 'Belgium', latitude: 51.2194, longitude: 4.4025 },
  { city: 'Bruges', country: 'Belgium', latitude: 51.2093, longitude: 3.2247 },
  { city: 'Ghent', country: 'Belgium', latitude: 51.0543, longitude: 3.7174 },

  // Switzerland
  { city: 'Zurich', country: 'Switzerland', latitude: 47.3769, longitude: 8.5417 },
  { city: 'Geneva', country: 'Switzerland', latitude: 46.2044, longitude: 6.1432 },
  { city: 'Bern', country: 'Switzerland', latitude: 46.9480, longitude: 7.4474 },
  { city: 'Basel', country: 'Switzerland', latitude: 47.5596, longitude: 7.5886 },
  { city: 'Lucerne', country: 'Switzerland', latitude: 47.0502, longitude: 8.3093 },
  { city: 'Interlaken', country: 'Switzerland', latitude: 46.6863, longitude: 7.8632 },

  // Austria
  { city: 'Vienna', country: 'Austria', latitude: 48.2082, longitude: 16.3738 },
  { city: 'Salzburg', country: 'Austria', latitude: 47.8095, longitude: 13.0550 },
  { city: 'Innsbruck', country: 'Austria', latitude: 47.2692, longitude: 11.4041 },

  // Czech Republic
  { city: 'Prague', country: 'Czech Republic', latitude: 50.0755, longitude: 14.4378 },
  { city: 'Brno', country: 'Czech Republic', latitude: 49.1951, longitude: 16.6068 },

  // Poland
  { city: 'Warsaw', country: 'Poland', latitude: 52.2297, longitude: 21.0122 },
  { city: 'Krakow', country: 'Poland', latitude: 50.0647, longitude: 19.9450 },
  { city: 'Gdansk', country: 'Poland', latitude: 54.3520, longitude: 18.6466 },
  { city: 'Wroclaw', country: 'Poland', latitude: 51.1079, longitude: 17.0385 },

  // Hungary
  { city: 'Budapest', country: 'Hungary', latitude: 47.4979, longitude: 19.0402 },

  // Greece
  { city: 'Athens', country: 'Greece', latitude: 37.9838, longitude: 23.7275 },
  { city: 'Thessaloniki', country: 'Greece', latitude: 40.6401, longitude: 22.9444 },
  { city: 'Santorini', country: 'Greece', latitude: 36.3932, longitude: 25.4615 },
  { city: 'Mykonos', country: 'Greece', latitude: 37.4467, longitude: 25.3289 },
  { city: 'Rhodes', country: 'Greece', latitude: 36.4349, longitude: 28.2176 },
  { city: 'Crete', country: 'Greece', latitude: 35.2401, longitude: 24.8093 },

  // Turkey
  { city: 'Istanbul', country: 'Turkey', latitude: 41.0082, longitude: 28.9784 },
  { city: 'Ankara', country: 'Turkey', latitude: 39.9334, longitude: 32.8597 },
  { city: 'Antalya', country: 'Turkey', latitude: 36.8969, longitude: 30.7133 },
  { city: 'Cappadocia', country: 'Turkey', latitude: 38.6431, longitude: 34.8289 },
  { city: 'Bodrum', country: 'Turkey', latitude: 37.0344, longitude: 27.4305 },

  // Russia
  { city: 'Moscow', country: 'Russia', latitude: 55.7558, longitude: 37.6173 },
  { city: 'Saint Petersburg', country: 'Russia', latitude: 59.9311, longitude: 30.3609 },

  // Scandinavia
  { city: 'Copenhagen', country: 'Denmark', latitude: 55.6761, longitude: 12.5683 },
  { city: 'Stockholm', country: 'Sweden', latitude: 59.3293, longitude: 18.0686 },
  { city: 'Gothenburg', country: 'Sweden', latitude: 57.7089, longitude: 11.9746 },
  { city: 'Oslo', country: 'Norway', latitude: 59.9139, longitude: 10.7522 },
  { city: 'Bergen', country: 'Norway', latitude: 60.3913, longitude: 5.3221 },
  { city: 'Helsinki', country: 'Finland', latitude: 60.1699, longitude: 24.9384 },
  { city: 'Reykjavik', country: 'Iceland', latitude: 64.1466, longitude: -21.9426 },

  // Canada
  { city: 'Toronto', country: 'Canada', latitude: 43.6532, longitude: -79.3832 },
  { city: 'Vancouver', country: 'Canada', latitude: 49.2827, longitude: -123.1207 },
  { city: 'Montreal', country: 'Canada', latitude: 45.5017, longitude: -73.5673 },
  { city: 'Calgary', country: 'Canada', latitude: 51.0447, longitude: -114.0719 },
  { city: 'Ottawa', country: 'Canada', latitude: 45.4215, longitude: -75.6972 },
  { city: 'Quebec City', country: 'Canada', latitude: 46.8139, longitude: -71.2080 },
  { city: 'Banff', country: 'Canada', latitude: 51.1784, longitude: -115.5708 },

  // Mexico
  { city: 'Mexico City', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
  { city: 'Cancun', country: 'Mexico', latitude: 21.1619, longitude: -86.8515 },
  { city: 'Guadalajara', country: 'Mexico', latitude: 20.6597, longitude: -103.3496 },
  { city: 'Puerto Vallarta', country: 'Mexico', latitude: 20.6534, longitude: -105.2253 },
  { city: 'Playa del Carmen', country: 'Mexico', latitude: 20.6296, longitude: -87.0739 },
  { city: 'Tulum', country: 'Mexico', latitude: 20.2114, longitude: -87.4654 },

  // Caribbean
  { city: 'Havana', country: 'Cuba', latitude: 23.1136, longitude: -82.3666 },
  { city: 'San Juan', country: 'Puerto Rico', latitude: 18.4655, longitude: -66.1057 },
  { city: 'Nassau', country: 'Bahamas', latitude: 25.0343, longitude: -77.3963 },
  { city: 'Kingston', country: 'Jamaica', latitude: 17.9714, longitude: -76.7920 },
  { city: 'Punta Cana', country: 'Dominican Republic', latitude: 18.5601, longitude: -68.3725 },

  // South America
  { city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.9068, longitude: -43.1729 },
  { city: 'São Paulo', country: 'Brazil', latitude: -23.5505, longitude: -46.6333 },
  { city: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  { city: 'Lima', country: 'Peru', latitude: -12.0464, longitude: -77.0428 },
  { city: 'Cusco', country: 'Peru', latitude: -13.5319, longitude: -71.9675 },
  { city: 'Machu Picchu', country: 'Peru', latitude: -13.1631, longitude: -72.5450 },
  { city: 'Bogota', country: 'Colombia', latitude: 4.7110, longitude: -74.0721 },
  { city: 'Cartagena', country: 'Colombia', latitude: 10.3910, longitude: -75.4794 },
  { city: 'Medellin', country: 'Colombia', latitude: 6.2442, longitude: -75.5812 },
  { city: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693 },
  { city: 'Quito', country: 'Ecuador', latitude: -0.1807, longitude: -78.4678 },
  { city: 'Galapagos', country: 'Ecuador', latitude: -0.9538, longitude: -90.9656 },
  { city: 'Montevideo', country: 'Uruguay', latitude: -34.9011, longitude: -56.1645 },

  // Japan
  { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503 },
  { city: 'Osaka', country: 'Japan', latitude: 34.6937, longitude: 135.5023 },
  { city: 'Kyoto', country: 'Japan', latitude: 35.0116, longitude: 135.7681 },
  { city: 'Hiroshima', country: 'Japan', latitude: 34.3853, longitude: 132.4553 },
  { city: 'Nara', country: 'Japan', latitude: 34.6851, longitude: 135.8048 },
  { city: 'Yokohama', country: 'Japan', latitude: 35.4437, longitude: 139.6380 },
  { city: 'Fukuoka', country: 'Japan', latitude: 33.5902, longitude: 130.4017 },
  { city: 'Sapporo', country: 'Japan', latitude: 43.0618, longitude: 141.3545 },

  // China
  { city: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074 },
  { city: 'Shanghai', country: 'China', latitude: 31.2304, longitude: 121.4737 },
  { city: 'Hong Kong', country: 'Hong Kong', latitude: 22.3193, longitude: 114.1694 },
  { city: 'Shenzhen', country: 'China', latitude: 22.5431, longitude: 114.0579 },
  { city: 'Guangzhou', country: 'China', latitude: 23.1291, longitude: 113.2644 },
  { city: 'Chengdu', country: 'China', latitude: 30.5728, longitude: 104.0668 },
  { city: 'Xi\'an', country: 'China', latitude: 34.3416, longitude: 108.9398 },
  { city: 'Guilin', country: 'China', latitude: 25.2736, longitude: 110.2907 },
  { city: 'Macau', country: 'Macau', latitude: 22.1987, longitude: 113.5439 },

  // South Korea
  { city: 'Seoul', country: 'South Korea', latitude: 37.5665, longitude: 126.9780 },
  { city: 'Busan', country: 'South Korea', latitude: 35.1796, longitude: 129.0756 },
  { city: 'Jeju', country: 'South Korea', latitude: 33.4996, longitude: 126.5312 },

  // Southeast Asia
  { city: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198 },
  { city: 'Bangkok', country: 'Thailand', latitude: 13.7563, longitude: 100.5018 },
  { city: 'Phuket', country: 'Thailand', latitude: 7.8804, longitude: 98.3923 },
  { city: 'Chiang Mai', country: 'Thailand', latitude: 18.7883, longitude: 98.9853 },
  { city: 'Pattaya', country: 'Thailand', latitude: 12.9236, longitude: 100.8825 },
  { city: 'Krabi', country: 'Thailand', latitude: 8.0863, longitude: 98.9063 },
  { city: 'Kuala Lumpur', country: 'Malaysia', latitude: 3.1390, longitude: 101.6869 },
  { city: 'Penang', country: 'Malaysia', latitude: 5.4164, longitude: 100.3327 },
  { city: 'Langkawi', country: 'Malaysia', latitude: 6.3500, longitude: 99.8000 },
  { city: 'Bali', country: 'Indonesia', latitude: -8.3405, longitude: 115.0920 },
  { city: 'Jakarta', country: 'Indonesia', latitude: -6.2088, longitude: 106.8456 },
  { city: 'Manila', country: 'Philippines', latitude: 14.5995, longitude: 120.9842 },
  { city: 'Cebu', country: 'Philippines', latitude: 10.3157, longitude: 123.8854 },
  { city: 'Boracay', country: 'Philippines', latitude: 11.9674, longitude: 121.9248 },
  { city: 'Ho Chi Minh City', country: 'Vietnam', latitude: 10.8231, longitude: 106.6297 },
  { city: 'Hanoi', country: 'Vietnam', latitude: 21.0285, longitude: 105.8542 },
  { city: 'Da Nang', country: 'Vietnam', latitude: 16.0544, longitude: 108.2022 },
  { city: 'Hoi An', country: 'Vietnam', latitude: 15.8801, longitude: 108.3380 },
  { city: 'Phnom Penh', country: 'Cambodia', latitude: 11.5564, longitude: 104.9282 },
  { city: 'Siem Reap', country: 'Cambodia', latitude: 13.3633, longitude: 103.8564 },
  { city: 'Yangon', country: 'Myanmar', latitude: 16.8661, longitude: 96.1951 },

  // India
  { city: 'Mumbai', country: 'India', latitude: 19.0760, longitude: 72.8777 },
  { city: 'Delhi', country: 'India', latitude: 28.7041, longitude: 77.1025 },
  { city: 'Bangalore', country: 'India', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Goa', country: 'India', latitude: 15.2993, longitude: 74.1240 },
  { city: 'Jaipur', country: 'India', latitude: 26.9124, longitude: 75.7873 },
  { city: 'Agra', country: 'India', latitude: 27.1767, longitude: 78.0081 },
  { city: 'Varanasi', country: 'India', latitude: 25.3176, longitude: 82.9739 },
  { city: 'Kerala', country: 'India', latitude: 10.8505, longitude: 76.2711 },
  { city: 'Chennai', country: 'India', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Kolkata', country: 'India', latitude: 22.5726, longitude: 88.3639 },

  // Middle East
  { city: 'Dubai', country: 'United Arab Emirates', latitude: 25.2048, longitude: 55.2708 },
  { city: 'Abu Dhabi', country: 'United Arab Emirates', latitude: 24.4539, longitude: 54.3773 },
  { city: 'Doha', country: 'Qatar', latitude: 25.2854, longitude: 51.5310 },
  { city: 'Tel Aviv', country: 'Israel', latitude: 32.0853, longitude: 34.7818 },
  { city: 'Jerusalem', country: 'Israel', latitude: 31.7683, longitude: 35.2137 },
  { city: 'Amman', country: 'Jordan', latitude: 31.9454, longitude: 35.9284 },
  { city: 'Petra', country: 'Jordan', latitude: 30.3285, longitude: 35.4444 },
  { city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.7136, longitude: 46.6753 },
  { city: 'Jeddah', country: 'Saudi Arabia', latitude: 21.4858, longitude: 39.1925 },
  { city: 'Mecca', country: 'Saudi Arabia', latitude: 21.3891, longitude: 39.8579 },
  { city: 'Muscat', country: 'Oman', latitude: 23.5880, longitude: 58.3829 },
  { city: 'Kuwait City', country: 'Kuwait', latitude: 29.3759, longitude: 47.9774 },
  { city: 'Beirut', country: 'Lebanon', latitude: 33.8938, longitude: 35.5018 },

  // Africa
  { city: 'Cairo', country: 'Egypt', latitude: 30.0444, longitude: 31.2357 },
  { city: 'Luxor', country: 'Egypt', latitude: 25.6872, longitude: 32.6396 },
  { city: 'Sharm El Sheikh', country: 'Egypt', latitude: 27.9158, longitude: 34.3300 },
  { city: 'Marrakech', country: 'Morocco', latitude: 31.6295, longitude: -7.9811 },
  { city: 'Casablanca', country: 'Morocco', latitude: 33.5731, longitude: -7.5898 },
  { city: 'Fes', country: 'Morocco', latitude: 34.0181, longitude: -5.0078 },
  { city: 'Cape Town', country: 'South Africa', latitude: -33.9249, longitude: 18.4241 },
  { city: 'Johannesburg', country: 'South Africa', latitude: -26.2041, longitude: 28.0473 },
  { city: 'Durban', country: 'South Africa', latitude: -29.8587, longitude: 31.0218 },
  { city: 'Nairobi', country: 'Kenya', latitude: -1.2921, longitude: 36.8219 },
  { city: 'Mombasa', country: 'Kenya', latitude: -4.0435, longitude: 39.6682 },
  { city: 'Zanzibar', country: 'Tanzania', latitude: -6.1659, longitude: 39.2026 },
  { city: 'Dar es Salaam', country: 'Tanzania', latitude: -6.7924, longitude: 39.2083 },
  { city: 'Victoria Falls', country: 'Zimbabwe', latitude: -17.9243, longitude: 25.8572 },
  { city: 'Accra', country: 'Ghana', latitude: 5.6037, longitude: -0.1870 },
  { city: 'Lagos', country: 'Nigeria', latitude: 6.5244, longitude: 3.3792 },
  { city: 'Mauritius', country: 'Mauritius', latitude: -20.3484, longitude: 57.5522 },
  { city: 'Seychelles', country: 'Seychelles', latitude: -4.6796, longitude: 55.4920 },

  // Australia & New Zealand
  { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093 },
  { city: 'Melbourne', country: 'Australia', latitude: -37.8136, longitude: 144.9631 },
  { city: 'Brisbane', country: 'Australia', latitude: -27.4698, longitude: 153.0251 },
  { city: 'Perth', country: 'Australia', latitude: -31.9505, longitude: 115.8605 },
  { city: 'Adelaide', country: 'Australia', latitude: -34.9285, longitude: 138.6007 },
  { city: 'Gold Coast', country: 'Australia', latitude: -28.0167, longitude: 153.4000 },
  { city: 'Cairns', country: 'Australia', latitude: -16.9186, longitude: 145.7781 },
  { city: 'Auckland', country: 'New Zealand', latitude: -36.8509, longitude: 174.7645 },
  { city: 'Wellington', country: 'New Zealand', latitude: -41.2865, longitude: 174.7762 },
  { city: 'Queenstown', country: 'New Zealand', latitude: -45.0312, longitude: 168.6626 },
  { city: 'Christchurch', country: 'New Zealand', latitude: -43.5321, longitude: 172.6362 },
  { city: 'Rotorua', country: 'New Zealand', latitude: -38.1368, longitude: 176.2497 },
  { city: 'Fiji', country: 'Fiji', latitude: -17.7134, longitude: 178.0650 },

  // Central Asia
  { city: 'Kathmandu', country: 'Nepal', latitude: 27.7172, longitude: 85.3240 },
  { city: 'Colombo', country: 'Sri Lanka', latitude: 6.9271, longitude: 79.8612 },
  { city: 'Male', country: 'Maldives', latitude: 4.1755, longitude: 73.5093 },
  { city: 'Thimphu', country: 'Bhutan', latitude: 27.4728, longitude: 89.6393 },

  // Additional European Cities
  { city: 'Dubrovnik', country: 'Croatia', latitude: 42.6507, longitude: 18.0944 },
  { city: 'Split', country: 'Croatia', latitude: 43.5081, longitude: 16.4402 },
  { city: 'Zagreb', country: 'Croatia', latitude: 45.8150, longitude: 15.9819 },
  { city: 'Ljubljana', country: 'Slovenia', latitude: 46.0569, longitude: 14.5058 },
  { city: 'Bled', country: 'Slovenia', latitude: 46.3683, longitude: 14.1146 },
  { city: 'Bratislava', country: 'Slovakia', latitude: 48.1486, longitude: 17.1077 },
  { city: 'Bucharest', country: 'Romania', latitude: 44.4268, longitude: 26.1025 },
  { city: 'Sofia', country: 'Bulgaria', latitude: 42.6977, longitude: 23.3219 },
  { city: 'Belgrade', country: 'Serbia', latitude: 44.7866, longitude: 20.4489 },
  { city: 'Sarajevo', country: 'Bosnia and Herzegovina', latitude: 43.8563, longitude: 18.4131 },
  { city: 'Tallinn', country: 'Estonia', latitude: 59.4370, longitude: 24.7536 },
  { city: 'Riga', country: 'Latvia', latitude: 56.9496, longitude: 24.1052 },
  { city: 'Vilnius', country: 'Lithuania', latitude: 54.6872, longitude: 25.2797 },
  { city: 'Valletta', country: 'Malta', latitude: 35.8989, longitude: 14.5146 },
  { city: 'Nicosia', country: 'Cyprus', latitude: 35.1856, longitude: 33.3823 },
  { city: 'Luxembourg City', country: 'Luxembourg', latitude: 49.6116, longitude: 6.1319 },
  { city: 'Andorra la Vella', country: 'Andorra', latitude: 42.5063, longitude: 1.5218 },
];

// Function to search cities by name
export const searchCities = (query) => {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  return worldCities
    .filter(city =>
      city.city.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 20); // Limit to 20 results
};

// Function to get city coordinates
export const getCityCoordinatesFromDB = (cityName, countryName) => {
  const city = worldCities.find(
    c => c.city.toLowerCase() === cityName.toLowerCase() &&
         c.country.toLowerCase() === countryName.toLowerCase()
  );

  if (city) {
    return { latitude: city.latitude, longitude: city.longitude };
  }

  return null;
};
