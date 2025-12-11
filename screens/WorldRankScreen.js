import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function WorldRankScreen({ navigation }) {
  const { theme } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('visitors');

  // Categories available
  const categories = [
    { id: 'visitors', name: 'Most Visited', icon: 'people' },
    { id: 'safety', name: 'Safety', icon: 'shield-checkmark' },
    { id: 'affordability', name: 'Affordability', icon: 'cash' },
    { id: 'food', name: 'Food', icon: 'restaurant' },
    { id: 'beaches', name: 'Beaches', icon: 'water' },
    { id: 'mountains', name: 'Mountains', icon: 'triangle' },
    { id: 'outdoors', name: 'Outdoors', icon: 'leaf' },
  ];

  // Base country data with all rankings
  const allCountriesData = [
    {
      name: 'France',
      flag: '🇫🇷',
      continent: 'Europe',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French Riviera', 'Mont Saint-Michel'],
      rankings: {
        visitors: { rank: 1, value: '89.4M', label: 'visitors' },
        safety: { rank: 23, value: '8.1/10', label: 'safety score' },
        affordability: { rank: 52, value: 'Moderate', label: 'cost level' },
        food: { rank: 1, value: '10/10', label: 'food rating' },
        beaches: { rank: 12, value: '8/10', label: 'beach quality' },
        mountains: { rank: 8, value: '8.5/10', label: 'mountain rating' },
        outdoors: { rank: 15, value: '8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Spain',
      flag: '🇪🇸',
      continent: 'Europe',
      highlights: ['Sagrada Familia', 'Alhambra', 'Park Güell', 'Prado Museum'],
      rankings: {
        visitors: { rank: 2, value: '83.7M', label: 'visitors' },
        safety: { rank: 18, value: '8.3/10', label: 'safety score' },
        affordability: { rank: 38, value: 'Moderate', label: 'cost level' },
        food: { rank: 2, value: '9.8/10', label: 'food rating' },
        beaches: { rank: 3, value: '9.5/10', label: 'beach quality' },
        mountains: { rank: 14, value: '7.8/10', label: 'mountain rating' },
        outdoors: { rank: 10, value: '8.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'United States',
      flag: '🇺🇸',
      continent: 'North America',
      highlights: ['Grand Canyon', 'Statue of Liberty', 'Golden Gate Bridge', 'Times Square'],
      rankings: {
        visitors: { rank: 3, value: '79.3M', label: 'visitors' },
        safety: { rank: 58, value: '6.9/10', label: 'safety score' },
        affordability: { rank: 68, value: 'Expensive', label: 'cost level' },
        food: { rank: 15, value: '8.2/10', label: 'food rating' },
        beaches: { rank: 8, value: '8.8/10', label: 'beach quality' },
        mountains: { rank: 4, value: '9.2/10', label: 'mountain rating' },
        outdoors: { rank: 2, value: '9.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'China',
      flag: '🇨🇳',
      continent: 'Asia',
      highlights: ['Great Wall', 'Forbidden City', 'Terracotta Army', 'Li River'],
      rankings: {
        visitors: { rank: 4, value: '65.7M', label: 'visitors' },
        safety: { rank: 45, value: '7.3/10', label: 'safety score' },
        affordability: { rank: 22, value: 'Affordable', label: 'cost level' },
        food: { rank: 3, value: '9.7/10', label: 'food rating' },
        beaches: { rank: 35, value: '6.5/10', label: 'beach quality' },
        mountains: { rank: 3, value: '9.3/10', label: 'mountain rating' },
        outdoors: { rank: 6, value: '9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Italy',
      flag: '🇮🇹',
      continent: 'Europe',
      highlights: ['Colosseum', 'Venice Canals', 'Vatican City', 'Tuscany'],
      rankings: {
        visitors: { rank: 5, value: '64.5M', label: 'visitors' },
        safety: { rank: 31, value: '7.8/10', label: 'safety score' },
        affordability: { rank: 48, value: 'Moderate', label: 'cost level' },
        food: { rank: 4, value: '9.6/10', label: 'food rating' },
        beaches: { rank: 6, value: '9/10', label: 'beach quality' },
        mountains: { rank: 9, value: '8.4/10', label: 'mountain rating' },
        outdoors: { rank: 18, value: '7.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Turkey',
      flag: '🇹🇷',
      continent: 'Asia/Europe',
      highlights: ['Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Blue Mosque'],
      rankings: {
        visitors: { rank: 6, value: '51.2M', label: 'visitors' },
        safety: { rank: 72, value: '6.2/10', label: 'safety score' },
        affordability: { rank: 12, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 8, value: '9.1/10', label: 'food rating' },
        beaches: { rank: 9, value: '8.7/10', label: 'beach quality' },
        mountains: { rank: 20, value: '7.2/10', label: 'mountain rating' },
        outdoors: { rank: 12, value: '8.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      continent: 'North America',
      highlights: ['Chichen Itza', 'Cancun Beaches', 'Mexico City', 'Tulum'],
      rankings: {
        visitors: { rank: 7, value: '45.0M', label: 'visitors' },
        safety: { rank: 78, value: '5.8/10', label: 'safety score' },
        affordability: { rank: 18, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 7, value: '9.2/10', label: 'food rating' },
        beaches: { rank: 2, value: '9.7/10', label: 'beach quality' },
        mountains: { rank: 16, value: '7.5/10', label: 'mountain rating' },
        outdoors: { rank: 11, value: '8.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      continent: 'Asia',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Temples of Bangkok', 'Phuket'],
      rankings: {
        visitors: { rank: 8, value: '39.8M', label: 'visitors' },
        safety: { rank: 42, value: '7.4/10', label: 'safety score' },
        affordability: { rank: 6, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 5, value: '9.5/10', label: 'food rating' },
        beaches: { rank: 1, value: '10/10', label: 'beach quality' },
        mountains: { rank: 32, value: '6.2/10', label: 'mountain rating' },
        outdoors: { rank: 8, value: '8.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      continent: 'Europe',
      highlights: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Berlin Wall', 'Oktoberfest'],
      rankings: {
        visitors: { rank: 9, value: '39.6M', label: 'visitors' },
        safety: { rank: 8, value: '8.8/10', label: 'safety score' },
        affordability: { rank: 55, value: 'Moderate', label: 'cost level' },
        food: { rank: 28, value: '7.5/10', label: 'food rating' },
        beaches: { rank: 62, value: '4.2/10', label: 'beach quality' },
        mountains: { rank: 17, value: '7.4/10', label: 'mountain rating' },
        outdoors: { rank: 22, value: '7.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'England',
      flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      continent: 'Europe',
      highlights: ['Big Ben', 'Buckingham Palace', 'Stonehenge', 'Tower of London'],
      rankings: {
        visitors: { rank: 10, value: '39.4M', label: 'visitors' },
        safety: { rank: 22, value: '8.1/10', label: 'safety score' },
        affordability: { rank: 72, value: 'Expensive', label: 'cost level' },
        food: { rank: 42, value: '6.8/10', label: 'food rating' },
        beaches: { rank: 58, value: '4.8/10', label: 'beach quality' },
        mountains: { rank: 68, value: '3.5/10', label: 'mountain rating' },
        outdoors: { rank: 35, value: '7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Japan',
      flag: '🇯🇵',
      continent: 'Asia',
      highlights: ['Mount Fuji', 'Tokyo Tower', 'Kyoto Temples', 'Cherry Blossoms'],
      rankings: {
        visitors: { rank: 11, value: '32.2M', label: 'visitors' },
        safety: { rank: 1, value: '9.8/10', label: 'safety score' },
        affordability: { rank: 62, value: 'Expensive', label: 'cost level' },
        food: { rank: 6, value: '9.4/10', label: 'food rating' },
        beaches: { rank: 28, value: '7.2/10', label: 'beach quality' },
        mountains: { rank: 6, value: '8.9/10', label: 'mountain rating' },
        outdoors: { rank: 17, value: '7.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Greece',
      flag: '🇬🇷',
      continent: 'Europe',
      highlights: ['Acropolis', 'Santorini', 'Delphi', 'Mykonos'],
      rankings: {
        visitors: { rank: 12, value: '31.3M', label: 'visitors' },
        safety: { rank: 35, value: '7.7/10', label: 'safety score' },
        affordability: { rank: 32, value: 'Affordable', label: 'cost level' },
        food: { rank: 11, value: '8.8/10', label: 'food rating' },
        beaches: { rank: 4, value: '9.4/10', label: 'beach quality' },
        mountains: { rank: 24, value: '6.9/10', label: 'mountain rating' },
        outdoors: { rank: 20, value: '7.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Austria',
      flag: '🇦🇹',
      continent: 'Europe',
      highlights: ['Schönbrunn Palace', 'Vienna Opera', 'Austrian Alps', 'Salzburg'],
      rankings: {
        visitors: { rank: 13, value: '31.9M', label: 'visitors' },
        safety: { rank: 5, value: '9.1/10', label: 'safety score' },
        affordability: { rank: 58, value: 'Expensive', label: 'cost level' },
        food: { rank: 18, value: '8/10', label: 'food rating' },
        beaches: { rank: 92, value: '1.5/10', label: 'beach quality' },
        mountains: { rank: 5, value: '9.1/10', label: 'mountain rating' },
        outdoors: { rank: 7, value: '8.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      continent: 'Asia',
      highlights: ['Petronas Towers', 'Langkawi', 'Penang', 'Cameron Highlands'],
      rankings: {
        visitors: { rank: 14, value: '26.1M', label: 'visitors' },
        safety: { rank: 28, value: '7.9/10', label: 'safety score' },
        affordability: { rank: 8, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 10, value: '8.9/10', label: 'food rating' },
        beaches: { rank: 7, value: '8.9/10', label: 'beach quality' },
        mountains: { rank: 42, value: '5.5/10', label: 'mountain rating' },
        outdoors: { rank: 14, value: '8.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Portugal',
      flag: '🇵🇹',
      continent: 'Europe',
      highlights: ['Belém Tower', 'Porto Wine Cellars', 'Algarve Beaches', 'Lisbon Trams'],
      rankings: {
        visitors: { rank: 15, value: '27.0M', label: 'visitors' },
        safety: { rank: 12, value: '8.6/10', label: 'safety score' },
        affordability: { rank: 28, value: 'Affordable', label: 'cost level' },
        food: { rank: 13, value: '8.6/10', label: 'food rating' },
        beaches: { rank: 5, value: '9.2/10', label: 'beach quality' },
        mountains: { rank: 52, value: '4.8/10', label: 'mountain rating' },
        outdoors: { rank: 26, value: '7.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Canada',
      flag: '🇨🇦',
      continent: 'North America',
      highlights: ['Niagara Falls', 'Banff National Park', 'CN Tower', 'Quebec City'],
      rankings: {
        visitors: { rank: 16, value: '25.0M', label: 'visitors' },
        safety: { rank: 2, value: '9.7/10', label: 'safety score' },
        affordability: { rank: 65, value: 'Expensive', label: 'cost level' },
        food: { rank: 32, value: '7.2/10', label: 'food rating' },
        beaches: { rank: 52, value: '5.2/10', label: 'beach quality' },
        mountains: { rank: 1, value: '10/10', label: 'mountain rating' },
        outdoors: { rank: 1, value: '10/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Poland',
      flag: '🇵🇱',
      continent: 'Europe',
      highlights: ['Wawel Castle', 'Auschwitz Museum', 'Old Town Warsaw', 'Krakow Square'],
      rankings: {
        visitors: { rank: 17, value: '21.2M', label: 'visitors' },
        safety: { rank: 25, value: '8/10', label: 'safety score' },
        affordability: { rank: 14, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 36, value: '7/10', label: 'food rating' },
        beaches: { rank: 72, value: '3.5/10', label: 'beach quality' },
        mountains: { rank: 28, value: '6.5/10', label: 'mountain rating' },
        outdoors: { rank: 38, value: '6.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Netherlands',
      flag: '🇳🇱',
      continent: 'Europe',
      highlights: ['Amsterdam Canals', 'Keukenhof Gardens', 'Windmills', 'Anne Frank House'],
      rankings: {
        visitors: { rank: 18, value: '20.1M', label: 'visitors' },
        safety: { rank: 6, value: '9/10', label: 'safety score' },
        affordability: { rank: 64, value: 'Expensive', label: 'cost level' },
        food: { rank: 38, value: '6.9/10', label: 'food rating' },
        beaches: { rank: 65, value: '4/10', label: 'beach quality' },
        mountains: { rank: 98, value: '1/10', label: 'mountain rating' },
        outdoors: { rank: 42, value: '6.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'South Korea',
      flag: '🇰🇷',
      continent: 'Asia',
      highlights: ['Gyeongbokgung Palace', 'Jeju Island', 'DMZ', 'Seoul Tower'],
      rankings: {
        visitors: { rank: 19, value: '17.5M', label: 'visitors' },
        safety: { rank: 4, value: '9.2/10', label: 'safety score' },
        affordability: { rank: 42, value: 'Moderate', label: 'cost level' },
        food: { rank: 9, value: '9/10', label: 'food rating' },
        beaches: { rank: 38, value: '6.2/10', label: 'beach quality' },
        mountains: { rank: 22, value: '7.1/10', label: 'mountain rating' },
        outdoors: { rank: 28, value: '7.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Vietnam',
      flag: '🇻🇳',
      continent: 'Asia',
      highlights: ['Ha Long Bay', 'Hoi An Ancient Town', 'Cu Chi Tunnels', 'Mekong Delta'],
      rankings: {
        visitors: { rank: 20, value: '18.0M', label: 'visitors' },
        safety: { rank: 38, value: '7.6/10', label: 'safety score' },
        affordability: { rank: 2, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 12, value: '8.7/10', label: 'food rating' },
        beaches: { rank: 11, value: '8.6/10', label: 'beach quality' },
        mountains: { rank: 15, value: '7.7/10', label: 'mountain rating' },
        outdoors: { rank: 13, value: '8.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Indonesia',
      flag: '🇮🇩',
      continent: 'Asia',
      highlights: ['Bali Beaches', 'Borobudur Temple', 'Komodo Island', 'Jakarta'],
      rankings: {
        visitors: { rank: 21, value: '15.5M', label: 'visitors' },
        safety: { rank: 52, value: '7.1/10', label: 'safety score' },
        affordability: { rank: 4, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 14, value: '8.4/10', label: 'food rating' },
        beaches: { rank: 10, value: '8.7/10', label: 'beach quality' },
        mountains: { rank: 12, value: '8.1/10', label: 'mountain rating' },
        outdoors: { rank: 5, value: '9.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Switzerland',
      flag: '🇨🇭',
      continent: 'Europe',
      highlights: ['Swiss Alps', 'Lake Geneva', 'Matterhorn', 'Zurich'],
      rankings: {
        visitors: { rank: 22, value: '11.7M', label: 'visitors' },
        safety: { rank: 3, value: '9.5/10', label: 'safety score' },
        affordability: { rank: 95, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 22, value: '7.8/10', label: 'food rating' },
        beaches: { rank: 95, value: '1.2/10', label: 'beach quality' },
        mountains: { rank: 2, value: '9.8/10', label: 'mountain rating' },
        outdoors: { rank: 4, value: '9.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'New Zealand',
      flag: '🇳🇿',
      continent: 'Oceania',
      highlights: ['Milford Sound', 'Hobbiton', 'Tongariro Crossing', 'Queenstown'],
      rankings: {
        visitors: { rank: 23, value: '3.9M', label: 'visitors' },
        safety: { rank: 7, value: '8.9/10', label: 'safety score' },
        affordability: { rank: 70, value: 'Expensive', label: 'cost level' },
        food: { rank: 35, value: '7.1/10', label: 'food rating' },
        beaches: { rank: 18, value: '8/10', label: 'beach quality' },
        mountains: { rank: 7, value: '8.7/10', label: 'mountain rating' },
        outdoors: { rank: 3, value: '9.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Norway',
      flag: '🇳🇴',
      continent: 'Europe',
      highlights: ['Norwegian Fjords', 'Northern Lights', 'Bergen', 'Midnight Sun'],
      rankings: {
        visitors: { rank: 24, value: '6.3M', label: 'visitors' },
        safety: { rank: 9, value: '8.7/10', label: 'safety score' },
        affordability: { rank: 92, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 45, value: '6.5/10', label: 'food rating' },
        beaches: { rank: 82, value: '2.5/10', label: 'beach quality' },
        mountains: { rank: 10, value: '8.3/10', label: 'mountain rating' },
        outdoors: { rank: 9, value: '8.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Iceland',
      flag: '🇮🇸',
      continent: 'Europe',
      highlights: ['Blue Lagoon', 'Northern Lights', 'Golden Circle', 'Glacier Hiking'],
      rankings: {
        visitors: { rank: 25, value: '2.3M', label: 'visitors' },
        safety: { rank: 10, value: '8.7/10', label: 'safety score' },
        affordability: { rank: 88, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 52, value: '6.2/10', label: 'food rating' },
        beaches: { rank: 88, value: '2/10', label: 'beach quality' },
        mountains: { rank: 18, value: '7.3/10', label: 'mountain rating' },
        outdoors: { rank: 16, value: '8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Peru',
      flag: '🇵🇪',
      continent: 'South America',
      highlights: ['Machu Picchu', 'Nazca Lines', 'Lake Titicaca', 'Cusco'],
      rankings: {
        visitors: { rank: 26, value: '4.4M', label: 'visitors' },
        safety: { rank: 68, value: '6.5/10', label: 'safety score' },
        affordability: { rank: 16, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 17, value: '8.1/10', label: 'food rating' },
        beaches: { rank: 32, value: '6.8/10', label: 'beach quality' },
        mountains: { rank: 11, value: '8.2/10', label: 'mountain rating' },
        outdoors: { rank: 19, value: '7.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Nepal',
      flag: '🇳🇵',
      continent: 'Asia',
      highlights: ['Mount Everest', 'Kathmandu Temples', 'Pokhara', 'Annapurna Circuit'],
      rankings: {
        visitors: { rank: 27, value: '1.2M', label: 'visitors' },
        safety: { rank: 62, value: '6.8/10', label: 'safety score' },
        affordability: { rank: 1, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 30, value: '7.3/10', label: 'food rating' },
        beaches: { rank: 100, value: '0/10', label: 'beach quality' },
        mountains: { rank: 13, value: '8/10', label: 'mountain rating' },
        outdoors: { rank: 21, value: '7.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Costa Rica',
      flag: '🇨🇷',
      continent: 'North America',
      highlights: ['Arenal Volcano', 'Monteverde Cloud Forest', 'Manuel Antonio', 'Tortuguero'],
      rankings: {
        visitors: { rank: 28, value: '3.1M', label: 'visitors' },
        safety: { rank: 48, value: '7.2/10', label: 'safety score' },
        affordability: { rank: 45, value: 'Moderate', label: 'cost level' },
        food: { rank: 40, value: '6.8/10', label: 'food rating' },
        beaches: { rank: 14, value: '8.4/10', label: 'beach quality' },
        mountains: { rank: 25, value: '6.8/10', label: 'mountain rating' },
        outdoors: { rank: 23, value: '7.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Australia',
      flag: '🇦🇺',
      continent: 'Oceania',
      highlights: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Bondi Beach'],
      rankings: {
        visitors: { rank: 29, value: '9.5M', label: 'visitors' },
        safety: { rank: 11, value: '8.7/10', label: 'safety score' },
        affordability: { rank: 78, value: 'Expensive', label: 'cost level' },
        food: { rank: 24, value: '7.7/10', label: 'food rating' },
        beaches: { rank: 13, value: '8.5/10', label: 'beach quality' },
        mountains: { rank: 42, value: '5.5/10', label: 'mountain rating' },
        outdoors: { rank: 24, value: '7.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Singapore',
      flag: '🇸🇬',
      continent: 'Asia',
      highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa', 'Hawker Centers'],
      rankings: {
        visitors: { rank: 30, value: '14.7M', label: 'visitors' },
        safety: { rank: 13, value: '8.5/10', label: 'safety score' },
        affordability: { rank: 82, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 16, value: '8.2/10', label: 'food rating' },
        beaches: { rank: 48, value: '5.5/10', label: 'beach quality' },
        mountains: { rank: 96, value: '1.2/10', label: 'mountain rating' },
        outdoors: { rank: 58, value: '5.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'India',
      flag: '🇮🇳',
      continent: 'Asia',
      highlights: ['Taj Mahal', 'Golden Temple', 'Kerala Backwaters', 'Goa Beaches'],
      rankings: {
        visitors: { rank: 31, value: '17.9M', label: 'visitors' },
        safety: { rank: 74, value: '6.1/10', label: 'safety score' },
        affordability: { rank: 3, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 19, value: '7.9/10', label: 'food rating' },
        beaches: { rank: 22, value: '7.5/10', label: 'beach quality' },
        mountains: { rank: 14, value: '7.9/10', label: 'mountain rating' },
        outdoors: { rank: 25, value: '7.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Brazil',
      flag: '🇧🇷',
      continent: 'South America',
      highlights: ['Christ the Redeemer', 'Amazon Rainforest', 'Iguazu Falls', 'Copacabana Beach'],
      rankings: {
        visitors: { rank: 32, value: '6.6M', label: 'visitors' },
        safety: { rank: 82, value: '5.5/10', label: 'safety score' },
        affordability: { rank: 35, value: 'Affordable', label: 'cost level' },
        food: { rank: 20, value: '7.9/10', label: 'food rating' },
        beaches: { rank: 15, value: '8.3/10', label: 'beach quality' },
        mountains: { rank: 58, value: '4.2/10', label: 'mountain rating' },
        outdoors: { rank: 27, value: '7.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Egypt',
      flag: '🇪🇬',
      continent: 'Africa',
      highlights: ['Pyramids of Giza', 'Valley of the Kings', 'Karnak Temple', 'Luxor'],
      rankings: {
        visitors: { rank: 33, value: '13.0M', label: 'visitors' },
        safety: { rank: 76, value: '6.0/10', label: 'safety score' },
        affordability: { rank: 10, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 33, value: '7.2/10', label: 'food rating' },
        beaches: { rank: 26, value: '7.3/10', label: 'beach quality' },
        mountains: { rank: 72, value: '3.2/10', label: 'mountain rating' },
        outdoors: { rank: 44, value: '6.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'South Africa',
      flag: '🇿🇦',
      continent: 'Africa',
      highlights: ['Table Mountain', 'Kruger National Park', 'Cape of Good Hope', 'Garden Route'],
      rankings: {
        visitors: { rank: 34, value: '10.5M', label: 'visitors' },
        safety: { rank: 86, value: '5.2/10', label: 'safety score' },
        affordability: { rank: 26, value: 'Affordable', label: 'cost level' },
        food: { rank: 26, value: '7.6/10', label: 'food rating' },
        beaches: { rank: 20, value: '7.8/10', label: 'beach quality' },
        mountains: { rank: 34, value: '6.1/10', label: 'mountain rating' },
        outdoors: { rank: 29, value: '7.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Argentina',
      flag: '🇦🇷',
      continent: 'South America',
      highlights: ['Iguazu Falls', 'Patagonia', 'Buenos Aires', 'Perito Moreno Glacier'],
      rankings: {
        visitors: { rank: 35, value: '7.4M', label: 'visitors' },
        safety: { rank: 64, value: '6.7/10', label: 'safety score' },
        affordability: { rank: 24, value: 'Affordable', label: 'cost level' },
        food: { rank: 21, value: '7.8/10', label: 'food rating' },
        beaches: { rank: 42, value: '6/10', label: 'beach quality' },
        mountains: { rank: 19, value: '7.3/10', label: 'mountain rating' },
        outdoors: { rank: 30, value: '7.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Morocco',
      flag: '🇲🇦',
      continent: 'Africa',
      highlights: ['Marrakech Souks', 'Sahara Desert', 'Fes Medina', 'Chefchaouen'],
      rankings: {
        visitors: { rank: 36, value: '13.1M', label: 'visitors' },
        safety: { rank: 55, value: '7.0/10', label: 'safety score' },
        affordability: { rank: 20, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 23, value: '7.7/10', label: 'food rating' },
        beaches: { rank: 36, value: '6.4/10', label: 'beach quality' },
        mountains: { rank: 26, value: '6.7/10', label: 'mountain rating' },
        outdoors: { rank: 36, value: '6.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Czech Republic',
      flag: '🇨🇿',
      continent: 'Europe',
      highlights: ['Prague Castle', 'Charles Bridge', 'Bohemian Switzerland', 'Český Krumlov'],
      rankings: {
        visitors: { rank: 37, value: '10.0M', label: 'visitors' },
        safety: { rank: 19, value: '8.2/10', label: 'safety score' },
        affordability: { rank: 30, value: 'Affordable', label: 'cost level' },
        food: { rank: 34, value: '7.1/10', label: 'food rating' },
        beaches: { rank: 96, value: '0.8/10', label: 'beach quality' },
        mountains: { rank: 45, value: '5.3/10', label: 'mountain rating' },
        outdoors: { rank: 48, value: '6.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Ireland',
      flag: '🇮🇪',
      continent: 'Europe',
      highlights: ['Cliffs of Moher', 'Trinity College', 'Ring of Kerry', 'Giant\'s Causeway'],
      rankings: {
        visitors: { rank: 38, value: '11.3M', label: 'visitors' },
        safety: { rank: 14, value: '8.4/10', label: 'safety score' },
        affordability: { rank: 66, value: 'Expensive', label: 'cost level' },
        food: { rank: 44, value: '6.6/10', label: 'food rating' },
        beaches: { rank: 55, value: '5/10', label: 'beach quality' },
        mountains: { rank: 62, value: '4/10', label: 'mountain rating' },
        outdoors: { rank: 31, value: '7.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Philippines',
      flag: '🇵🇭',
      continent: 'Asia',
      highlights: ['Palawan', 'Boracay', 'Chocolate Hills', 'Mayon Volcano'],
      rankings: {
        visitors: { rank: 39, value: '8.3M', label: 'visitors' },
        safety: { rank: 70, value: '6.4/10', label: 'safety score' },
        affordability: { rank: 7, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 25, value: '7.6/10', label: 'food rating' },
        beaches: { rank: 16, value: '8.2/10', label: 'beach quality' },
        mountains: { rank: 29, value: '6.4/10', label: 'mountain rating' },
        outdoors: { rank: 32, value: '7.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Croatia',
      flag: '🇭🇷',
      continent: 'Europe',
      highlights: ['Dubrovnik Old Town', 'Plitvice Lakes', 'Split Palace', 'Hvar Island'],
      rankings: {
        visitors: { rank: 40, value: '20.0M', label: 'visitors' },
        safety: { rank: 26, value: '8.0/10', label: 'safety score' },
        affordability: { rank: 36, value: 'Moderate', label: 'cost level' },
        food: { rank: 27, value: '7.5/10', label: 'food rating' },
        beaches: { rank: 17, value: '8.1/10', label: 'beach quality' },
        mountains: { rank: 38, value: '5.8/10', label: 'mountain rating' },
        outdoors: { rank: 33, value: '7.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Sweden',
      flag: '🇸🇪',
      continent: 'Europe',
      highlights: ['Stockholm Archipelago', 'Ice Hotel', 'Vasa Museum', 'Northern Lights'],
      rankings: {
        visitors: { rank: 41, value: '7.6M', label: 'visitors' },
        safety: { rank: 15, value: '8.4/10', label: 'safety score' },
        affordability: { rank: 85, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 48, value: '6.4/10', label: 'food rating' },
        beaches: { rank: 78, value: '2.8/10', label: 'beach quality' },
        mountains: { rank: 35, value: '6/10', label: 'mountain rating' },
        outdoors: { rank: 34, value: '7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Finland',
      flag: '🇫🇮',
      continent: 'Europe',
      highlights: ['Lapland', 'Santa Claus Village', 'Northern Lights', 'Helsinki Cathedral'],
      rankings: {
        visitors: { rank: 42, value: '3.3M', label: 'visitors' },
        safety: { rank: 16, value: '8.3/10', label: 'safety score' },
        affordability: { rank: 80, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 58, value: '5.9/10', label: 'food rating' },
        beaches: { rank: 90, value: '1.8/10', label: 'beach quality' },
        mountains: { rank: 75, value: '3/10', label: 'mountain rating' },
        outdoors: { rank: 37, value: '6.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Chile',
      flag: '🇨🇱',
      continent: 'South America',
      highlights: ['Atacama Desert', 'Torres del Paine', 'Easter Island', 'Patagonia'],
      rankings: {
        visitors: { rank: 43, value: '5.7M', label: 'visitors' },
        safety: { rank: 36, value: '7.7/10', label: 'safety score' },
        affordability: { rank: 48, value: 'Moderate', label: 'cost level' },
        food: { rank: 37, value: '6.9/10', label: 'food rating' },
        beaches: { rank: 44, value: '5.8/10', label: 'beach quality' },
        mountains: { rank: 21, value: '7.2/10', label: 'mountain rating' },
        outdoors: { rank: 39, value: '6.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Colombia',
      flag: '🇨🇴',
      continent: 'South America',
      highlights: ['Cartagena Old Town', 'Coffee Region', 'Tayrona National Park', 'Bogotá'],
      rankings: {
        visitors: { rank: 44, value: '4.5M', label: 'visitors' },
        safety: { rank: 84, value: '5.4/10', label: 'safety score' },
        affordability: { rank: 15, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 29, value: '7.4/10', label: 'food rating' },
        beaches: { rank: 24, value: '7.4/10', label: 'beach quality' },
        mountains: { rank: 30, value: '6.3/10', label: 'mountain rating' },
        outdoors: { rank: 40, value: '6.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Israel',
      flag: '🇮🇱',
      continent: 'Middle East',
      highlights: ['Western Wall', 'Dead Sea', 'Tel Aviv Beaches', 'Masada'],
      rankings: {
        visitors: { rank: 45, value: '4.6M', label: 'visitors' },
        safety: { rank: 88, value: '5.1/10', label: 'safety score' },
        affordability: { rank: 75, value: 'Expensive', label: 'cost level' },
        food: { rank: 31, value: '7.3/10', label: 'food rating' },
        beaches: { rank: 30, value: '7/10', label: 'beach quality' },
        mountains: { rank: 64, value: '3.9/10', label: 'mountain rating' },
        outdoors: { rank: 50, value: '6.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Belgium',
      flag: '🇧🇪',
      continent: 'Europe',
      highlights: ['Grand Place', 'Bruges Canals', 'Atomium', 'Belgian Chocolate'],
      rankings: {
        visitors: { rank: 46, value: '9.2M', label: 'visitors' },
        safety: { rank: 30, value: '7.8/10', label: 'safety score' },
        affordability: { rank: 60, value: 'Expensive', label: 'cost level' },
        food: { rank: 39, value: '6.8/10', label: 'food rating' },
        beaches: { rank: 70, value: '3.8/10', label: 'beach quality' },
        mountains: { rank: 88, value: '1.8/10', label: 'mountain rating' },
        outdoors: { rank: 62, value: '5.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Scotland',
      flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      continent: 'Europe',
      highlights: ['Edinburgh Castle', 'Loch Ness', 'Isle of Skye', 'Highlands'],
      rankings: {
        visitors: { rank: 47, value: '3.5M', label: 'visitors' },
        safety: { rank: 17, value: '8.3/10', label: 'safety score' },
        affordability: { rank: 68, value: 'Expensive', label: 'cost level' },
        food: { rank: 50, value: '6.3/10', label: 'food rating' },
        beaches: { rank: 62, value: '4.4/10', label: 'beach quality' },
        mountains: { rank: 31, value: '6.2/10', label: 'mountain rating' },
        outdoors: { rank: 41, value: '6.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Denmark',
      flag: '🇩🇰',
      continent: 'Europe',
      highlights: ['Tivoli Gardens', 'Nyhavn', 'Little Mermaid', 'Kronborg Castle'],
      rankings: {
        visitors: { rank: 48, value: '10.8M', label: 'visitors' },
        safety: { rank: 20, value: '8.2/10', label: 'safety score' },
        affordability: { rank: 90, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 46, value: '6.5/10', label: 'food rating' },
        beaches: { rank: 68, value: '3.9/10', label: 'beach quality' },
        mountains: { rank: 95, value: '1.3/10', label: 'mountain rating' },
        outdoors: { rank: 56, value: '5.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Jordan',
      flag: '🇯🇴',
      continent: 'Middle East',
      highlights: ['Petra', 'Wadi Rum', 'Dead Sea', 'Amman Citadel'],
      rankings: {
        visitors: { rank: 49, value: '5.4M', label: 'visitors' },
        safety: { rank: 66, value: '6.6/10', label: 'safety score' },
        affordability: { rank: 40, value: 'Moderate', label: 'cost level' },
        food: { rank: 41, value: '6.7/10', label: 'food rating' },
        beaches: { rank: 75, value: '3.2/10', label: 'beach quality' },
        mountains: { rank: 50, value: '4.9/10', label: 'mountain rating' },
        outdoors: { rank: 43, value: '6.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Hungary',
      flag: '🇭🇺',
      continent: 'Europe',
      highlights: ['Parliament Building', 'Thermal Baths', 'Buda Castle', 'Danube River'],
      rankings: {
        visitors: { rank: 50, value: '15.8M', label: 'visitors' },
        safety: { rank: 40, value: '7.5/10', label: 'safety score' },
        affordability: { rank: 25, value: 'Affordable', label: 'cost level' },
        food: { rank: 43, value: '6.7/10', label: 'food rating' },
        beaches: { rank: 94, value: '1.3/10', label: 'beach quality' },
        mountains: { rank: 70, value: '3.4/10', label: 'mountain rating' },
        outdoors: { rank: 55, value: '6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Romania',
      flag: '🇷🇴',
      continent: 'Europe',
      highlights: ['Bran Castle', 'Transfăgărășan', 'Painted Monasteries', 'Transylvania'],
      rankings: {
        visitors: { rank: 51, value: '2.8M', label: 'visitors' },
        safety: { rank: 50, value: '7.1/10', label: 'safety score' },
        affordability: { rank: 11, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 47, value: '6.4/10', label: 'food rating' },
        beaches: { rank: 60, value: '4.6/10', label: 'beach quality' },
        mountains: { rank: 23, value: '7/10', label: 'mountain rating' },
        outdoors: { rank: 45, value: '6.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Cambodia',
      flag: '🇰🇭',
      continent: 'Asia',
      highlights: ['Angkor Wat', 'Tonle Sap Lake', 'Royal Palace', 'Koh Rong'],
      rankings: {
        visitors: { rank: 52, value: '6.6M', label: 'visitors' },
        safety: { rank: 60, value: '6.9/10', label: 'safety score' },
        affordability: { rank: 5, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 49, value: '6.4/10', label: 'food rating' },
        beaches: { rank: 34, value: '6.6/10', label: 'beach quality' },
        mountains: { rank: 55, value: '4.5/10', label: 'mountain rating' },
        outdoors: { rank: 46, value: '6.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Taiwan',
      flag: '🇹🇼',
      continent: 'Asia',
      highlights: ['Taipei 101', 'Taroko Gorge', 'Night Markets', 'Sun Moon Lake'],
      rankings: {
        visitors: { rank: 53, value: '11.9M', label: 'visitors' },
        safety: { rank: 21, value: '8.2/10', label: 'safety score' },
        affordability: { rank: 44, value: 'Moderate', label: 'cost level' },
        food: { rank: 26, value: '7.6/10', label: 'food rating' },
        beaches: { rank: 40, value: '6.1/10', label: 'beach quality' },
        mountains: { rank: 27, value: '6.6/10', label: 'mountain rating' },
        outdoors: { rank: 47, value: '6.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Hong Kong',
      flag: '🇭🇰',
      continent: 'Asia',
      highlights: ['Victoria Peak', 'Tian Tan Buddha', 'Hong Kong Disneyland', 'Star Ferry'],
      rankings: {
        visitors: { rank: 54, value: '26.7M', label: 'visitors' },
        safety: { rank: 24, value: '8.0/10', label: 'safety score' },
        affordability: { rank: 85, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 24, value: '7.7/10', label: 'food rating' },
        beaches: { rank: 50, value: '5.4/10', label: 'beach quality' },
        mountains: { rank: 60, value: '4.1/10', label: 'mountain rating' },
        outdoors: { rank: 65, value: '5.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Sri Lanka',
      flag: '🇱🇰',
      continent: 'Asia',
      highlights: ['Sigiriya Rock', 'Tea Plantations', 'Yala National Park', 'Galle Fort'],
      rankings: {
        visitors: { rank: 55, value: '1.9M', label: 'visitors' },
        safety: { rank: 71, value: '6.3/10', label: 'safety score' },
        affordability: { rank: 9, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 51, value: '6.3/10', label: 'food rating' },
        beaches: { rank: 19, value: '7.9/10', label: 'beach quality' },
        mountains: { rank: 40, value: '5.7/10', label: 'mountain rating' },
        outdoors: { rank: 49, value: '6.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      continent: 'Middle East',
      highlights: ['Burj Khalifa', 'Palm Jumeirah', 'Sheikh Zayed Mosque', 'Dubai Mall'],
      rankings: {
        visitors: { rank: 56, value: '21.3M', label: 'visitors' },
        safety: { rank: 27, value: '7.9/10', label: 'safety score' },
        affordability: { rank: 74, value: 'Expensive', label: 'cost level' },
        food: { rank: 53, value: '6.2/10', label: 'food rating' },
        beaches: { rank: 46, value: '5.7/10', label: 'beach quality' },
        mountains: { rank: 78, value: '2.8/10', label: 'mountain rating' },
        outdoors: { rank: 72, value: '5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Maldives',
      flag: '🇲🇻',
      continent: 'Asia',
      highlights: ['Private Islands', 'Coral Reefs', 'Underwater Restaurant', 'Marine Life'],
      rankings: {
        visitors: { rank: 57, value: '1.7M', label: 'visitors' },
        safety: { rank: 32, value: '7.8/10', label: 'safety score' },
        affordability: { rank: 96, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 62, value: '5.8/10', label: 'food rating' },
        beaches: { rank: 21, value: '7.7/10', label: 'beach quality' },
        mountains: { rank: 100, value: '0/10', label: 'mountain rating' },
        outdoors: { rank: 60, value: '5.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Russia',
      flag: '🇷🇺',
      continent: 'Europe/Asia',
      highlights: ['Red Square', 'Trans-Siberian Railway', 'Hermitage Museum', 'Lake Baikal'],
      rankings: {
        visitors: { rank: 58, value: '24.6M', label: 'visitors' },
        safety: { rank: 80, value: '5.7/10', label: 'safety score' },
        affordability: { rank: 34, value: 'Affordable', label: 'cost level' },
        food: { rank: 56, value: '6/10', label: 'food rating' },
        beaches: { rank: 85, value: '2.3/10', label: 'beach quality' },
        mountains: { rank: 33, value: '6.1/10', label: 'mountain rating' },
        outdoors: { rank: 51, value: '6.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Kenya',
      flag: '🇰🇪',
      continent: 'Africa',
      highlights: ['Masai Mara', 'Mount Kenya', 'Diani Beach', 'Amboseli National Park'],
      rankings: {
        visitors: { rank: 59, value: '2.0M', label: 'visitors' },
        safety: { rank: 75, value: '6.1/10', label: 'safety score' },
        affordability: { rank: 32, value: 'Affordable', label: 'cost level' },
        food: { rank: 68, value: '5.5/10', label: 'food rating' },
        beaches: { rank: 31, value: '6.9/10', label: 'beach quality' },
        mountains: { rank: 36, value: '5.9/10', label: 'mountain rating' },
        outdoors: { rank: 52, value: '6.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Tanzania',
      flag: '🇹🇿',
      continent: 'Africa',
      highlights: ['Serengeti', 'Mount Kilimanjaro', 'Zanzibar', 'Ngorongoro Crater'],
      rankings: {
        visitors: { rank: 60, value: '1.5M', label: 'visitors' },
        safety: { rank: 69, value: '6.5/10', label: 'safety score' },
        affordability: { rank: 28, value: 'Affordable', label: 'cost level' },
        food: { rank: 70, value: '5.4/10', label: 'food rating' },
        beaches: { rank: 23, value: '7.5/10', label: 'beach quality' },
        mountains: { rank: 37, value: '5.9/10', label: 'mountain rating' },
        outdoors: { rank: 53, value: '6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Laos',
      flag: '🇱🇦',
      continent: 'Asia',
      highlights: ['Luang Prabang', 'Kuang Si Falls', 'Vang Vieng', 'Plain of Jars'],
      rankings: {
        visitors: { rank: 61, value: '4.2M', label: 'visitors' },
        safety: { rank: 44, value: '7.3/10', label: 'safety score' },
        affordability: { rank: 13, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 60, value: '5.9/10', label: 'food rating' },
        beaches: { rank: 93, value: '1.4/10', label: 'beach quality' },
        mountains: { rank: 44, value: '5.4/10', label: 'mountain rating' },
        outdoors: { rank: 54, value: '6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Myanmar',
      flag: '🇲🇲',
      continent: 'Asia',
      highlights: ['Bagan Temples', 'Inle Lake', 'Shwedagon Pagoda', 'Golden Rock'],
      rankings: {
        visitors: { rank: 62, value: '4.4M', label: 'visitors' },
        safety: { rank: 92, value: '4.8/10', label: 'safety score' },
        affordability: { rank: 17, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 54, value: '6.1/10', label: 'food rating' },
        beaches: { rank: 45, value: '5.8/10', label: 'beach quality' },
        mountains: { rank: 48, value: '5.1/10', label: 'mountain rating' },
        outdoors: { rank: 57, value: '5.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Bolivia',
      flag: '🇧🇴',
      continent: 'South America',
      highlights: ['Salar de Uyuni', 'La Paz', 'Lake Titicaca', 'Death Road'],
      rankings: {
        visitors: { rank: 63, value: '1.1M', label: 'visitors' },
        safety: { rank: 85, value: '5.3/10', label: 'safety score' },
        affordability: { rank: 19, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 64, value: '5.7/10', label: 'food rating' },
        beaches: { rank: 97, value: '0.5/10', label: 'beach quality' },
        mountains: { rank: 39, value: '5.7/10', label: 'mountain rating' },
        outdoors: { rank: 59, value: '5.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Slovenia',
      flag: '🇸🇮',
      continent: 'Europe',
      highlights: ['Lake Bled', 'Ljubljana Castle', 'Postojna Cave', 'Triglav National Park'],
      rankings: {
        visitors: { rank: 64, value: '6.2M', label: 'visitors' },
        safety: { rank: 29, value: '7.9/10', label: 'safety score' },
        affordability: { rank: 46, value: 'Moderate', label: 'cost level' },
        food: { rank: 55, value: '6/10', label: 'food rating' },
        beaches: { rank: 66, value: '4/10', label: 'beach quality' },
        mountains: { rank: 41, value: '5.6/10', label: 'mountain rating' },
        outdoors: { rank: 61, value: '5.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Bulgaria',
      flag: '🇧🇬',
      continent: 'Europe',
      highlights: ['Rila Monastery', 'Plovdiv Old Town', 'Black Sea Coast', 'Sofia'],
      rankings: {
        visitors: { rank: 65, value: '9.3M', label: 'visitors' },
        safety: { rank: 46, value: '7.2/10', label: 'safety score' },
        affordability: { rank: 21, value: 'Very Affordable', label: 'cost level' },
        food: { rank: 59, value: '5.9/10', label: 'food rating' },
        beaches: { rank: 52, value: '5.2/10', label: 'beach quality' },
        mountains: { rank: 46, value: '5.2/10', label: 'mountain rating' },
        outdoors: { rank: 63, value: '5.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Georgia',
      flag: '🇬🇪',
      continent: 'Asia/Europe',
      highlights: ['Tbilisi Old Town', 'Kazbegi', 'Wine Region', 'Uplistsikhe'],
      rankings: {
        visitors: { rank: 66, value: '9.4M', label: 'visitors' },
        safety: { rank: 54, value: '7.0/10', label: 'safety score' },
        affordability: { rank: 23, value: 'Affordable', label: 'cost level' },
        food: { rank: 57, value: '6/10', label: 'food rating' },
        beaches: { rank: 64, value: '4.1/10', label: 'beach quality' },
        mountains: { rank: 43, value: '5.5/10', label: 'mountain rating' },
        outdoors: { rank: 64, value: '5.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Mongolia',
      flag: '🇲🇳',
      continent: 'Asia',
      highlights: ['Gobi Desert', 'Genghis Khan Statue', 'Hustai National Park', 'Ulaanbaatar'],
      rankings: {
        visitors: { rank: 67, value: '0.5M', label: 'visitors' },
        safety: { rank: 53, value: '7.1/10', label: 'safety score' },
        affordability: { rank: 27, value: 'Affordable', label: 'cost level' },
        food: { rank: 78, value: '4.8/10', label: 'food rating' },
        beaches: { rank: 99, value: '0.1/10', label: 'beach quality' },
        mountains: { rank: 47, value: '5.2/10', label: 'mountain rating' },
        outdoors: { rank: 66, value: '5.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Ecuador',
      flag: '🇪🇨',
      continent: 'South America',
      highlights: ['Galápagos Islands', 'Quito', 'Cotopaxi', 'Amazon Rainforest'],
      rankings: {
        visitors: { rank: 68, value: '2.4M', label: 'visitors' },
        safety: { rank: 79, value: '5.8/10', label: 'safety score' },
        affordability: { rank: 29, value: 'Affordable', label: 'cost level' },
        food: { rank: 61, value: '5.8/10', label: 'food rating' },
        beaches: { rank: 37, value: '6.3/10', label: 'beach quality' },
        mountains: { rank: 49, value: '5/10', label: 'mountain rating' },
        outdoors: { rank: 67, value: '5.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Uruguay',
      flag: '🇺🇾',
      continent: 'South America',
      highlights: ['Montevideo', 'Punta del Este', 'Colonia del Sacramento', 'Wine Region'],
      rankings: {
        visitors: { rank: 69, value: '3.5M', label: 'visitors' },
        safety: { rank: 33, value: '7.8/10', label: 'safety score' },
        affordability: { rank: 56, value: 'Moderate', label: 'cost level' },
        food: { rank: 63, value: '5.8/10', label: 'food rating' },
        beaches: { rank: 54, value: '5.1/10', label: 'beach quality' },
        mountains: { rank: 82, value: '2.3/10', label: 'mountain rating' },
        outdoors: { rank: 68, value: '5.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Nicaragua',
      flag: '🇳🇮',
      continent: 'North America',
      highlights: ['Granada', 'Ometepe Island', 'León', 'Corn Islands'],
      rankings: {
        visitors: { rank: 70, value: '1.5M', label: 'visitors' },
        safety: { rank: 87, value: '5.2/10', label: 'safety score' },
        affordability: { rank: 33, value: 'Affordable', label: 'cost level' },
        food: { rank: 66, value: '5.6/10', label: 'food rating' },
        beaches: { rank: 41, value: '6.1/10', label: 'beach quality' },
        mountains: { rank: 56, value: '4.4/10', label: 'mountain rating' },
        outdoors: { rank: 69, value: '5.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Guatemala',
      flag: '🇬🇹',
      continent: 'North America',
      highlights: ['Tikal', 'Antigua Guatemala', 'Lake Atitlán', 'Semuc Champey'],
      rankings: {
        visitors: { rank: 71, value: '2.4M', label: 'visitors' },
        safety: { rank: 89, value: '5.0/10', label: 'safety score' },
        affordability: { rank: 31, value: 'Affordable', label: 'cost level' },
        food: { rank: 65, value: '5.7/10', label: 'food rating' },
        beaches: { rank: 56, value: '4.9/10', label: 'beach quality' },
        mountains: { rank: 51, value: '4.8/10', label: 'mountain rating' },
        outdoors: { rank: 70, value: '5.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Ethiopia',
      flag: '🇪🇹',
      continent: 'Africa',
      highlights: ['Lalibela Churches', 'Simien Mountains', 'Danakil Depression', 'Addis Ababa'],
      rankings: {
        visitors: { rank: 72, value: '0.9M', label: 'visitors' },
        safety: { rank: 90, value: '4.9/10', label: 'safety score' },
        affordability: { rank: 37, value: 'Moderate', label: 'cost level' },
        food: { rank: 72, value: '5.3/10', label: 'food rating' },
        beaches: { rank: 98, value: '0.3/10', label: 'beach quality' },
        mountains: { rank: 53, value: '4.7/10', label: 'mountain rating' },
        outdoors: { rank: 71, value: '5.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Madagascar',
      flag: '🇲🇬',
      continent: 'Africa',
      highlights: ['Avenue of the Baobabs', 'Tsingy de Bemaraha', 'Lemurs', 'Nosy Be'],
      rankings: {
        visitors: { rank: 73, value: '0.3M', label: 'visitors' },
        safety: { rank: 73, value: '6.2/10', label: 'safety score' },
        affordability: { rank: 41, value: 'Moderate', label: 'cost level' },
        food: { rank: 74, value: '5.2/10', label: 'food rating' },
        beaches: { rank: 33, value: '6.7/10', label: 'beach quality' },
        mountains: { rank: 59, value: '4.2/10', label: 'mountain rating' },
        outdoors: { rank: 73, value: '5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Bhutan',
      flag: '🇧🇹',
      continent: 'Asia',
      highlights: ['Tiger\'s Nest', 'Punakha Dzong', 'Thimphu', 'Dochula Pass'],
      rankings: {
        visitors: { rank: 74, value: '0.3M', label: 'visitors' },
        safety: { rank: 34, value: '7.7/10', label: 'safety score' },
        affordability: { rank: 86, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 76, value: '5/10', label: 'food rating' },
        beaches: { rank: 101, value: '0/10', label: 'beach quality' },
        mountains: { rank: 54, value: '4.6/10', label: 'mountain rating' },
        outdoors: { rank: 74, value: '4.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Albania',
      flag: '🇦🇱',
      continent: 'Europe',
      highlights: ['Albanian Riviera', 'Berat', 'Gjirokastër', 'Butrint'],
      rankings: {
        visitors: { rank: 75, value: '7.5M', label: 'visitors' },
        safety: { rank: 63, value: '6.7/10', label: 'safety score' },
        affordability: { rank: 39, value: 'Moderate', label: 'cost level' },
        food: { rank: 67, value: '5.5/10', label: 'food rating' },
        beaches: { rank: 29, value: '7.1/10', label: 'beach quality' },
        mountains: { rank: 57, value: '4.3/10', label: 'mountain rating' },
        outdoors: { rank: 75, value: '4.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Cuba',
      flag: '🇨🇺',
      continent: 'North America',
      highlights: ['Old Havana', 'Varadero Beach', 'Viñales Valley', 'Trinidad'],
      rankings: {
        visitors: { rank: 76, value: '4.7M', label: 'visitors' },
        safety: { rank: 48, value: '7.2/10', label: 'safety score' },
        affordability: { rank: 50, value: 'Moderate', label: 'cost level' },
        food: { rank: 69, value: '5.5/10', label: 'food rating' },
        beaches: { rank: 25, value: '7.4/10', label: 'beach quality' },
        mountains: { rank: 74, value: '3.1/10', label: 'mountain rating' },
        outdoors: { rank: 76, value: '4.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Uganda',
      flag: '🇺🇬',
      continent: 'Africa',
      highlights: ['Mountain Gorillas', 'Murchison Falls', 'Queen Elizabeth Park', 'Lake Victoria'],
      rankings: {
        visitors: { rank: 77, value: '1.5M', label: 'visitors' },
        safety: { rank: 77, value: '6.0/10', label: 'safety score' },
        affordability: { rank: 43, value: 'Moderate', label: 'cost level' },
        food: { rank: 80, value: '4.6/10', label: 'food rating' },
        beaches: { rank: 87, value: '2.1/10', label: 'beach quality' },
        mountains: { rank: 61, value: '4.1/10', label: 'mountain rating' },
        outdoors: { rank: 77, value: '4.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Zambia',
      flag: '🇿🇲',
      continent: 'Africa',
      highlights: ['Victoria Falls', 'South Luangwa', 'Lower Zambezi', 'Kafue National Park'],
      rankings: {
        visitors: { rank: 78, value: '1.1M', label: 'visitors' },
        safety: { rank: 65, value: '6.7/10', label: 'safety score' },
        affordability: { rank: 47, value: 'Moderate', label: 'cost level' },
        food: { rank: 82, value: '4.4/10', label: 'food rating' },
        beaches: { rank: 91, value: '1.7/10', label: 'beach quality' },
        mountains: { rank: 76, value: '2.9/10', label: 'mountain rating' },
        outdoors: { rank: 78, value: '4.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Namibia',
      flag: '🇳🇦',
      continent: 'Africa',
      highlights: ['Sossusvlei Dunes', 'Etosha National Park', 'Skeleton Coast', 'Fish River Canyon'],
      rankings: {
        visitors: { rank: 79, value: '1.6M', label: 'visitors' },
        safety: { rank: 37, value: '7.6/10', label: 'safety score' },
        affordability: { rank: 54, value: 'Moderate', label: 'cost level' },
        food: { rank: 84, value: '4.2/10', label: 'food rating' },
        beaches: { rank: 76, value: '3.1/10', label: 'beach quality' },
        mountains: { rank: 65, value: '3.8/10', label: 'mountain rating' },
        outdoors: { rank: 79, value: '4.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Botswana',
      flag: '🇧🇼',
      continent: 'Africa',
      highlights: ['Okavango Delta', 'Chobe National Park', 'Makgadikgadi Pans', 'Kalahari Desert'],
      rankings: {
        visitors: { rank: 80, value: '2.5M', label: 'visitors' },
        safety: { rank: 39, value: '7.5/10', label: 'safety score' },
        affordability: { rank: 76, value: 'Expensive', label: 'cost level' },
        food: { rank: 86, value: '4/10', label: 'food rating' },
        beaches: { rank: 102, value: '0/10', label: 'beach quality' },
        mountains: { rank: 90, value: '1.6/10', label: 'mountain rating' },
        outdoors: { rank: 80, value: '4.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Rwanda',
      flag: '🇷🇼',
      continent: 'Africa',
      highlights: ['Mountain Gorillas', 'Volcanoes National Park', 'Lake Kivu', 'Kigali Genocide Memorial'],
      rankings: {
        visitors: { rank: 81, value: '1.3M', label: 'visitors' },
        safety: { rank: 41, value: '7.4/10', label: 'safety score' },
        affordability: { rank: 58, value: 'Moderate', label: 'cost level' },
        food: { rank: 88, value: '3.8/10', label: 'food rating' },
        beaches: { rank: 103, value: '0/10', label: 'beach quality' },
        mountains: { rank: 63, value: '3.9/10', label: 'mountain rating' },
        outdoors: { rank: 81, value: '4.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Mozambique',
      flag: '🇲🇿',
      continent: 'Africa',
      highlights: ['Bazaruto Archipelago', 'Gorongosa National Park', 'Tofo Beach', 'Ilha de Mozambique'],
      rankings: {
        visitors: { rank: 82, value: '2.7M', label: 'visitors' },
        safety: { rank: 81, value: '5.6/10', label: 'safety score' },
        affordability: { rank: 49, value: 'Moderate', label: 'cost level' },
        food: { rank: 85, value: '4.1/10', label: 'food rating' },
        beaches: { rank: 27, value: '7.2/10', label: 'beach quality' },
        mountains: { rank: 80, value: '2.5/10', label: 'mountain rating' },
        outdoors: { rank: 82, value: '4.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Zimbabwe',
      flag: '🇿🇼',
      continent: 'Africa',
      highlights: ['Victoria Falls', 'Great Zimbabwe Ruins', 'Hwange National Park', 'Matobo Hills'],
      rankings: {
        visitors: { rank: 83, value: '2.6M', label: 'visitors' },
        safety: { rank: 83, value: '5.5/10', label: 'safety score' },
        affordability: { rank: 51, value: 'Moderate', label: 'cost level' },
        food: { rank: 90, value: '3.6/10', label: 'food rating' },
        beaches: { rank: 104, value: '0/10', label: 'beach quality' },
        mountains: { rank: 69, value: '3.4/10', label: 'mountain rating' },
        outdoors: { rank: 83, value: '4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Panama',
      flag: '🇵🇦',
      continent: 'North America',
      highlights: ['Panama Canal', 'Bocas del Toro', 'Casco Viejo', 'San Blas Islands'],
      rankings: {
        visitors: { rank: 84, value: '2.5M', label: 'visitors' },
        safety: { rank: 59, value: '6.9/10', label: 'safety score' },
        affordability: { rank: 53, value: 'Moderate', label: 'cost level' },
        food: { rank: 71, value: '5.4/10', label: 'food rating' },
        beaches: { rank: 39, value: '6.2/10', label: 'beach quality' },
        mountains: { rank: 66, value: '3.7/10', label: 'mountain rating' },
        outdoors: { rank: 84, value: '3.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Belize',
      flag: '🇧🇿',
      continent: 'North America',
      highlights: ['Great Blue Hole', 'Mayan Ruins', 'Barrier Reef', 'Caye Caulker'],
      rankings: {
        visitors: { rank: 85, value: '0.5M', label: 'visitors' },
        safety: { rank: 67, value: '6.6/10', label: 'safety score' },
        affordability: { rank: 67, value: 'Expensive', label: 'cost level' },
        food: { rank: 73, value: '5.3/10', label: 'food rating' },
        beaches: { rank: 43, value: '5.9/10', label: 'beach quality' },
        mountains: { rank: 79, value: '2.7/10', label: 'mountain rating' },
        outdoors: { rank: 85, value: '3.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'El Salvador',
      flag: '🇸🇻',
      continent: 'North America',
      highlights: ['Surf Beaches', 'Mayan Ruins', 'Ruta de las Flores', 'Santa Ana Volcano'],
      rankings: {
        visitors: { rank: 86, value: '2.6M', label: 'visitors' },
        safety: { rank: 96, value: '4.2/10', label: 'safety score' },
        affordability: { rank: 38, value: 'Moderate', label: 'cost level' },
        food: { rank: 75, value: '5.1/10', label: 'food rating' },
        beaches: { rank: 49, value: '5.5/10', label: 'beach quality' },
        mountains: { rank: 67, value: '3.6/10', label: 'mountain rating' },
        outdoors: { rank: 86, value: '3.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Honduras',
      flag: '🇭🇳',
      continent: 'North America',
      highlights: ['Roatán', 'Copán Ruins', 'Bay Islands', 'Lake Yojoa'],
      rankings: {
        visitors: { rank: 87, value: '2.8M', label: 'visitors' },
        safety: { rank: 94, value: '4.5/10', label: 'safety score' },
        affordability: { rank: 42, value: 'Moderate', label: 'cost level' },
        food: { rank: 77, value: '4.9/10', label: 'food rating' },
        beaches: { rank: 47, value: '5.6/10', label: 'beach quality' },
        mountains: { rank: 71, value: '3.3/10', label: 'mountain rating' },
        outdoors: { rank: 87, value: '3.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Fiji',
      flag: '🇫🇯',
      continent: 'Oceania',
      highlights: ['Yasawa Islands', 'Cloud 9', 'Coral Coast', 'Nadi'],
      rankings: {
        visitors: { rank: 88, value: '0.9M', label: 'visitors' },
        safety: { rank: 43, value: '7.4/10', label: 'safety score' },
        affordability: { rank: 71, value: 'Expensive', label: 'cost level' },
        food: { rank: 79, value: '4.7/10', label: 'food rating' },
        beaches: { rank: 35, value: '6.5/10', label: 'beach quality' },
        mountains: { rank: 84, value: '2.1/10', label: 'mountain rating' },
        outdoors: { rank: 88, value: '3.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Seychelles',
      flag: '🇸🇨',
      continent: 'Africa',
      highlights: ['Anse Source d\'Argent', 'Vallée de Mai', 'La Digue', 'Praslin'],
      rankings: {
        visitors: { rank: 89, value: '0.4M', label: 'visitors' },
        safety: { rank: 47, value: '7.2/10', label: 'safety score' },
        affordability: { rank: 94, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 81, value: '4.5/10', label: 'food rating' },
        beaches: { rank: 51, value: '5.3/10', label: 'beach quality' },
        mountains: { rank: 86, value: '1.9/10', label: 'mountain rating' },
        outdoors: { rank: 89, value: '3.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Mauritius',
      flag: '🇲🇺',
      continent: 'Africa',
      highlights: ['Le Morne Beach', 'Black River Gorges', 'Chamarel', 'Port Louis'],
      rankings: {
        visitors: { rank: 90, value: '1.4M', label: 'visitors' },
        safety: { rank: 49, value: '7.1/10', label: 'safety score' },
        affordability: { rank: 77, value: 'Expensive', label: 'cost level' },
        food: { rank: 83, value: '4.3/10', label: 'food rating' },
        beaches: { rank: 53, value: '5.2/10', label: 'beach quality' },
        mountains: { rank: 77, value: '2.8/10', label: 'mountain rating' },
        outdoors: { rank: 90, value: '3.3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Senegal',
      flag: '🇸🇳',
      continent: 'Africa',
      highlights: ['Gorée Island', 'Pink Lake', 'Saint-Louis', 'Niokolo-Koba National Park'],
      rankings: {
        visitors: { rank: 91, value: '1.9M', label: 'visitors' },
        safety: { rank: 61, value: '6.8/10', label: 'safety score' },
        affordability: { rank: 45, value: 'Moderate', label: 'cost level' },
        food: { rank: 87, value: '3.9/10', label: 'food rating' },
        beaches: { rank: 59, value: '4.7/10', label: 'beach quality' },
        mountains: { rank: 92, value: '1.5/10', label: 'mountain rating' },
        outdoors: { rank: 91, value: '3.2/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Ghana',
      flag: '🇬🇭',
      continent: 'Africa',
      highlights: ['Cape Coast Castle', 'Kakum National Park', 'Mole National Park', 'Accra'],
      rankings: {
        visitors: { rank: 92, value: '1.1M', label: 'visitors' },
        safety: { rank: 56, value: '7.0/10', label: 'safety score' },
        affordability: { rank: 52, value: 'Moderate', label: 'cost level' },
        food: { rank: 89, value: '3.7/10', label: 'food rating' },
        beaches: { rank: 63, value: '4.3/10', label: 'beach quality' },
        mountains: { rank: 85, value: '2/10', label: 'mountain rating' },
        outdoors: { rank: 92, value: '3.1/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Pakistan',
      flag: '🇵🇰',
      continent: 'Asia',
      highlights: ['K2', 'Hunza Valley', 'Lahore Fort', 'Skardu'],
      rankings: {
        visitors: { rank: 93, value: '0.9M', label: 'visitors' },
        safety: { rank: 98, value: '3.8/10', label: 'safety score' },
        affordability: { rank: 57, value: 'Moderate', label: 'cost level' },
        food: { rank: 91, value: '3.5/10', label: 'food rating' },
        beaches: { rank: 74, value: '3.3/10', label: 'beach quality' },
        mountains: { rank: 73, value: '3.2/10', label: 'mountain rating' },
        outdoors: { rank: 93, value: '3/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Tunisia',
      flag: '🇹🇳',
      continent: 'Africa',
      highlights: ['Carthage', 'Sahara Desert', 'Sidi Bou Said', 'El Djem Amphitheatre'],
      rankings: {
        visitors: { rank: 94, value: '9.5M', label: 'visitors' },
        safety: { rank: 78, value: '5.9/10', label: 'safety score' },
        affordability: { rank: 59, value: 'Moderate', label: 'cost level' },
        food: { rank: 92, value: '3.4/10', label: 'food rating' },
        beaches: { rank: 57, value: '4.8/10', label: 'beach quality' },
        mountains: { rank: 81, value: '2.4/10', label: 'mountain rating' },
        outdoors: { rank: 94, value: '2.9/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Algeria',
      flag: '🇩🇿',
      continent: 'Africa',
      highlights: ['Sahara Desert', 'Algiers Casbah', 'Tassili n\'Ajjer', 'Timgad Ruins'],
      rankings: {
        visitors: { rank: 95, value: '2.4M', label: 'visitors' },
        safety: { rank: 91, value: '4.8/10', label: 'safety score' },
        affordability: { rank: 61, value: 'Moderate', label: 'cost level' },
        food: { rank: 93, value: '3.3/10', label: 'food rating' },
        beaches: { rank: 71, value: '3.6/10', label: 'beach quality' },
        mountains: { rank: 83, value: '2.2/10', label: 'mountain rating' },
        outdoors: { rank: 95, value: '2.8/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Bangladesh',
      flag: '🇧🇩',
      continent: 'Asia',
      highlights: ['Sundarbans', 'Cox\'s Bazar', 'Dhaka', 'Srimangal'],
      rankings: {
        visitors: { rank: 96, value: '0.3M', label: 'visitors' },
        safety: { rank: 93, value: '4.6/10', label: 'safety score' },
        affordability: { rank: 63, value: 'Moderate', label: 'cost level' },
        food: { rank: 94, value: '3.2/10', label: 'food rating' },
        beaches: { rank: 67, value: '3.9/10', label: 'beach quality' },
        mountains: { rank: 87, value: '1.9/10', label: 'mountain rating' },
        outdoors: { rank: 96, value: '2.7/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Libya',
      flag: '🇱🇾',
      continent: 'Africa',
      highlights: ['Leptis Magna', 'Sahara Desert', 'Ghadames', 'Cyrene'],
      rankings: {
        visitors: { rank: 97, value: '0.1M', label: 'visitors' },
        safety: { rank: 100, value: '2.5/10', label: 'safety score' },
        affordability: { rank: 69, value: 'Expensive', label: 'cost level' },
        food: { rank: 95, value: '3.1/10', label: 'food rating' },
        beaches: { rank: 80, value: '2.6/10', label: 'beach quality' },
        mountains: { rank: 91, value: '1.5/10', label: 'mountain rating' },
        outdoors: { rank: 97, value: '2.6/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Iraq',
      flag: '🇮🇶',
      continent: 'Middle East',
      highlights: ['Babylon', 'Erbil Citadel', 'Ziggurat of Ur', 'Marsh Arabs'],
      rankings: {
        visitors: { rank: 98, value: '0.1M', label: 'visitors' },
        safety: { rank: 99, value: '3.2/10', label: 'safety score' },
        affordability: { rank: 73, value: 'Expensive', label: 'cost level' },
        food: { rank: 96, value: '3/10', label: 'food rating' },
        beaches: { rank: 84, value: '2.4/10', label: 'beach quality' },
        mountains: { rank: 89, value: '1.7/10', label: 'mountain rating' },
        outdoors: { rank: 98, value: '2.5/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Yemen',
      flag: '🇾🇪',
      continent: 'Middle East',
      highlights: ['Sana\'a Old City', 'Socotra Island', 'Shibam', 'Marib'],
      rankings: {
        visitors: { rank: 99, value: '0.05M', label: 'visitors' },
        safety: { rank: 97, value: '4.0/10', label: 'safety score' },
        affordability: { rank: 79, value: 'Expensive', label: 'cost level' },
        food: { rank: 97, value: '2.9/10', label: 'food rating' },
        beaches: { rank: 79, value: '2.7/10', label: 'beach quality' },
        mountains: { rank: 93, value: '1.4/10', label: 'mountain rating' },
        outdoors: { rank: 99, value: '2.4/10', label: 'outdoors score' },
      },
    },
    {
      name: 'Afghanistan',
      flag: '🇦🇫',
      continent: 'Asia',
      highlights: ['Band-e Amir', 'Bamiyan Buddhas', 'Hindu Kush', 'Herat'],
      rankings: {
        visitors: { rank: 100, value: '0.02M', label: 'visitors' },
        safety: { rank: 95, value: '4.3/10', label: 'safety score' },
        affordability: { rank: 81, value: 'Very Expensive', label: 'cost level' },
        food: { rank: 98, value: '2.8/10', label: 'food rating' },
        beaches: { rank: 105, value: '0/10', label: 'beach quality' },
        mountains: { rank: 94, value: '1.4/10', label: 'mountain rating' },
        outdoors: { rank: 100, value: '2.3/10', label: 'outdoors score' },
      },
    },
  ];

  // Get sorted countries based on selected category
  const getSortedCountries = () => {
    return [...allCountriesData].sort((a, b) => {
      return a.rankings[selectedCategory].rank - b.rankings[selectedCategory].rank;
    });
  };

  const sortedCountries = getSortedCountries();
  const topTen = sortedCountries.slice(0, 10);
  const remainingCountries = sortedCountries.slice(10);

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#4ade80';
  };

  const getCategoryTitle = () => {
    const category = categories.find(c => c.id === selectedCategory);
    return category ? category.name : 'Rankings';
  };

  const getCategorySubtitle = () => {
    const subtitles = {
      visitors: 'Most visited countries worldwide',
      safety: 'Safest countries for travelers',
      affordability: 'Most affordable travel destinations',
      food: 'Countries with the best food',
      beaches: 'Best beach destinations',
      mountains: 'Best mountain destinations',
      outdoors: 'Best for outdoor adventures',
    };
    return subtitles[selectedCategory] || '';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{getCategoryTitle()}</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>{getCategorySubtitle()}</Text>
      </View>

      {/* Category Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === category.id ? theme.primary : theme.cardBackground,
                borderColor: selectedCategory === category.id ? theme.primary : theme.border,
              }
            ]}
            onPress={() => {
              setSelectedCategory(category.id);
              setDropdownVisible(false);
            }}
          >
            <Ionicons
              name={category.icon}
              size={18}
              color={selectedCategory === category.id ? theme.background : theme.text}
            />
            <Text style={[
              styles.categoryChipText,
              { color: selectedCategory === category.id ? theme.background : theme.text }
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.topSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Top 10 Countries</Text>
        {topTen.map((country, index) => {
          const rankData = country.rankings[selectedCategory];
          return (
            <TouchableOpacity
              key={index}
              style={[styles.countryCard, {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border
              }]}
              onPress={() => navigation.navigate('CountryDetail', {
                country: {
                  ...country,
                  rank: rankData.rank,
                  visitors: rankData.value,
                  rankings: {
                    transportation: 8,
                    food: 8,
                    activities: 8,
                    crowdedness: 7
                  }
                }
              })}
            >
              <View style={styles.rankContainer}>
                <View style={[styles.rankBadge, { backgroundColor: getRankColor(rankData.rank) }]}>
                  <Text style={[styles.rankText, { color: theme.background }]}>#{rankData.rank}</Text>
                </View>
              </View>

              <Text style={styles.flagEmoji}>{country.flag}</Text>

              <View style={styles.countryInfo}>
                <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
                <View style={styles.infoRow}>
                  <Ionicons name={categories.find(c => c.id === selectedCategory)?.icon || 'star'} size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>
                    {rankData.value} {rankData.label}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color={theme.textSecondary} />
                  <Text style={[styles.infoText, { color: theme.textSecondary }]}>{country.continent}</Text>
                </View>
              </View>

              <Ionicons name="chevron-forward" size={24} color={theme.textSecondary} />
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.dropdownSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>More Countries</Text>
        <TouchableOpacity
          style={[styles.dropdownButton, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Ionicons name="search" size={20} color={theme.primary} />
          <Text style={[styles.dropdownButtonText, { color: theme.text }]}>
            Browse Countries #11-#{sortedCountries.length}
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            {remainingCountries.map((country, index) => {
              const rankData = country.rankings[selectedCategory];
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.dropdownItem, {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border
                  }]}
                  onPress={() => {
                    setDropdownVisible(false);
                    navigation.navigate('CountryDetail', {
                      country: {
                        ...country,
                        rank: rankData.rank,
                        visitors: rankData.value,
                        rankings: {
                          transportation: 8,
                          food: 8,
                          activities: 8,
                          crowdedness: 7
                        }
                      }
                    });
                  }}
                >
                  <View style={[styles.smallRankBadge, { backgroundColor: getRankColor(rankData.rank) }]}>
                    <Text style={[styles.smallRankText, { color: theme.background }]}>#{rankData.rank}</Text>
                  </View>
                  <Text style={styles.dropdownFlag}>{country.flag}</Text>
                  <View style={styles.dropdownCountryInfo}>
                    <Text style={[styles.dropdownCountryName, { color: theme.text }]}>{country.name}</Text>
                    <Text style={[styles.dropdownCountryVisitors, { color: theme.textSecondary }]}>
                      {rankData.value} {rankData.label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  categoryScroll: {
    marginBottom: 15,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 8,
    marginRight: 10,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  topSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  countryCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
  },
  rankContainer: {
    marginRight: 12,
  },
  rankBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  flagEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 3,
  },
  infoText: {
    fontSize: 14,
  },
  dropdownSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    gap: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
  },
  dropdownList: {
    marginTop: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  smallRankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  smallRankText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  dropdownFlag: {
    fontSize: 28,
    marginRight: 12,
  },
  dropdownCountryInfo: {
    flex: 1,
  },
  dropdownCountryName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  dropdownCountryVisitors: {
    fontSize: 13,
  },
});
