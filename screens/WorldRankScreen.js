import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function WorldRankScreen({ navigation }) {
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Real-world tourism data based on UNWTO statistics
  const allCountries = [
    {
      name: 'France',
      flag: '🇫🇷',
      rank: 1,
      visitors: '89.4M',
      continent: 'Europe',
      highlights: ['Eiffel Tower', 'Louvre Museum', 'French Riviera', 'Mont Saint-Michel'],
      rankings: { transportation: 9, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Spain',
      flag: '🇪🇸',
      rank: 2,
      visitors: '83.7M',
      continent: 'Europe',
      highlights: ['Sagrada Familia', 'Alhambra', 'Park Güell', 'Prado Museum'],
      rankings: { transportation: 8, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'United States',
      flag: '🇺🇸',
      rank: 3,
      visitors: '79.3M',
      continent: 'North America',
      highlights: ['Grand Canyon', 'Statue of Liberty', 'Golden Gate Bridge', 'Times Square'],
      rankings: { transportation: 7, food: 8, activities: 10, crowdedness: 6 },
    },
    {
      name: 'China',
      flag: '🇨🇳',
      rank: 4,
      visitors: '65.7M',
      continent: 'Asia',
      highlights: ['Great Wall', 'Forbidden City', 'Terracotta Army', 'Li River'],
      rankings: { transportation: 8, food: 9, activities: 9, crowdedness: 4 },
    },
    {
      name: 'Italy',
      flag: '🇮🇹',
      rank: 5,
      visitors: '64.5M',
      continent: 'Europe',
      highlights: ['Colosseum', 'Venice Canals', 'Vatican City', 'Tuscany'],
      rankings: { transportation: 7, food: 10, activities: 9, crowdedness: 4 },
    },
    {
      name: 'Turkey',
      flag: '🇹🇷',
      rank: 6,
      visitors: '51.2M',
      continent: 'Asia/Europe',
      highlights: ['Hagia Sophia', 'Cappadocia', 'Pamukkale', 'Blue Mosque'],
      rankings: { transportation: 6, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Mexico',
      flag: '🇲🇽',
      rank: 7,
      visitors: '45.0M',
      continent: 'North America',
      highlights: ['Chichen Itza', 'Cancun Beaches', 'Mexico City', 'Tulum'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Thailand',
      flag: '🇹🇭',
      rank: 8,
      visitors: '39.8M',
      continent: 'Asia',
      highlights: ['Grand Palace', 'Phi Phi Islands', 'Temples of Bangkok', 'Phuket'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Germany',
      flag: '🇩🇪',
      rank: 9,
      visitors: '39.6M',
      continent: 'Europe',
      highlights: ['Brandenburg Gate', 'Neuschwanstein Castle', 'Berlin Wall', 'Oktoberfest'],
      rankings: { transportation: 10, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'United Kingdom',
      flag: '🇬🇧',
      rank: 10,
      visitors: '39.4M',
      continent: 'Europe',
      highlights: ['Big Ben', 'Buckingham Palace', 'Stonehenge', 'Tower of London'],
      rankings: { transportation: 8, food: 7, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Japan',
      flag: '🇯🇵',
      rank: 11,
      visitors: '32.2M',
      continent: 'Asia',
      highlights: ['Mount Fuji', 'Tokyo Tower', 'Kyoto Temples', 'Cherry Blossoms'],
      rankings: { transportation: 10, food: 10, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Greece',
      flag: '🇬🇷',
      rank: 12,
      visitors: '31.3M',
      continent: 'Europe',
      highlights: ['Acropolis', 'Santorini', 'Delphi', 'Mykonos'],
      rankings: { transportation: 6, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Austria',
      flag: '🇦🇹',
      rank: 13,
      visitors: '31.9M',
      continent: 'Europe',
      highlights: ['Schönbrunn Palace', 'Vienna Opera', 'Austrian Alps', 'Salzburg'],
      rankings: { transportation: 9, food: 8, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Malaysia',
      flag: '🇲🇾',
      rank: 14,
      visitors: '26.1M',
      continent: 'Asia',
      highlights: ['Petronas Towers', 'Langkawi', 'Penang', 'Cameron Highlands'],
      rankings: { transportation: 7, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Portugal',
      flag: '🇵🇹',
      rank: 15,
      visitors: '27.0M',
      continent: 'Europe',
      highlights: ['Belém Tower', 'Porto Wine Cellars', 'Algarve Beaches', 'Lisbon Trams'],
      rankings: { transportation: 7, food: 9, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Canada',
      flag: '🇨🇦',
      rank: 16,
      visitors: '25.0M',
      continent: 'North America',
      highlights: ['Niagara Falls', 'Banff National Park', 'CN Tower', 'Quebec City'],
      rankings: { transportation: 8, food: 7, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Poland',
      flag: '🇵🇱',
      rank: 17,
      visitors: '21.2M',
      continent: 'Europe',
      highlights: ['Wawel Castle', 'Auschwitz Museum', 'Old Town Warsaw', 'Krakow Square'],
      rankings: { transportation: 7, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Netherlands',
      flag: '🇳🇱',
      rank: 18,
      visitors: '20.1M',
      continent: 'Europe',
      highlights: ['Amsterdam Canals', 'Keukenhof Gardens', 'Windmills', 'Anne Frank House'],
      rankings: { transportation: 9, food: 7, activities: 8, crowdedness: 6 },
    },
    {
      name: 'South Korea',
      flag: '🇰🇷',
      rank: 19,
      visitors: '17.5M',
      continent: 'Asia',
      highlights: ['Gyeongbokgung Palace', 'Jeju Island', 'DMZ', 'Seoul Tower'],
      rankings: { transportation: 10, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Vietnam',
      flag: '🇻🇳',
      rank: 20,
      visitors: '18.0M',
      continent: 'Asia',
      highlights: ['Ha Long Bay', 'Hoi An Ancient Town', 'Cu Chi Tunnels', 'Mekong Delta'],
      rankings: { transportation: 6, food: 9, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Russia',
      flag: '🇷🇺',
      rank: 21,
      visitors: '24.6M',
      continent: 'Europe/Asia',
      highlights: ['Red Square', 'Hermitage Museum', 'Trans-Siberian Railway', 'St. Basil\'s Cathedral'],
      rankings: { transportation: 6, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Hong Kong',
      flag: '🇭🇰',
      rank: 22,
      visitors: '26.1M',
      continent: 'Asia',
      highlights: ['Victoria Peak', 'Hong Kong Disneyland', 'Big Buddha', 'Night Markets'],
      rankings: { transportation: 10, food: 9, activities: 9, crowdedness: 3 },
    },
    {
      name: 'Croatia',
      flag: '🇭🇷',
      rank: 23,
      visitors: '19.6M',
      continent: 'Europe',
      highlights: ['Dubrovnik Old Town', 'Plitvice Lakes', 'Split Palace', 'Hvar Island'],
      rankings: { transportation: 7, food: 8, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Hungary',
      flag: '🇭🇺',
      rank: 24,
      visitors: '15.8M',
      continent: 'Europe',
      highlights: ['Parliament Building', 'Thermal Baths', 'Fisherman\'s Bastion', 'Danube River'],
      rankings: { transportation: 8, food: 8, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Morocco',
      flag: '🇲🇦',
      rank: 25,
      visitors: '13.0M',
      continent: 'Africa',
      highlights: ['Marrakech Souks', 'Sahara Desert', 'Fes Medina', 'Casablanca'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Czech Republic',
      flag: '🇨🇿',
      rank: 26,
      visitors: '14.3M',
      continent: 'Europe',
      highlights: ['Prague Castle', 'Charles Bridge', 'Old Town Square', 'Czech Beer'],
      rankings: { transportation: 8, food: 8, activities: 8, crowdedness: 6 },
    },
    {
      name: 'United Arab Emirates',
      flag: '🇦🇪',
      rank: 27,
      visitors: '16.7M',
      continent: 'Asia',
      highlights: ['Burj Khalifa', 'Palm Islands', 'Dubai Mall', 'Sheikh Zayed Mosque'],
      rankings: { transportation: 9, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Indonesia',
      flag: '🇮🇩',
      rank: 28,
      visitors: '15.5M',
      continent: 'Asia',
      highlights: ['Bali Beaches', 'Borobudur Temple', 'Komodo Island', 'Jakarta'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 5 },
    },
    {
      name: 'Saudi Arabia',
      flag: '🇸🇦',
      rank: 29,
      visitors: '17.5M',
      continent: 'Asia',
      highlights: ['Mecca', 'Medina', 'Al-Ula', 'Riyadh'],
      rankings: { transportation: 7, food: 7, activities: 7, crowdedness: 6 },
    },
    {
      name: 'India',
      flag: '🇮🇳',
      rank: 30,
      visitors: '17.9M',
      continent: 'Asia',
      highlights: ['Taj Mahal', 'Golden Temple', 'Kerala Backwaters', 'Rajasthan Palaces'],
      rankings: { transportation: 5, food: 9, activities: 10, crowdedness: 3 },
    },
    {
      name: 'Singapore',
      flag: '🇸🇬',
      rank: 31,
      visitors: '14.7M',
      continent: 'Asia',
      highlights: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa', 'Hawker Centers'],
      rankings: { transportation: 10, food: 9, activities: 8, crowdedness: 5 },
    },
    {
      name: 'Switzerland',
      flag: '🇨🇭',
      rank: 32,
      visitors: '11.7M',
      continent: 'Europe',
      highlights: ['Swiss Alps', 'Lake Geneva', 'Matterhorn', 'Zurich'],
      rankings: { transportation: 10, food: 8, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Ireland',
      flag: '🇮🇪',
      rank: 33,
      visitors: '11.2M',
      continent: 'Europe',
      highlights: ['Cliffs of Moher', 'Dublin Pubs', 'Ring of Kerry', 'Giant\'s Causeway'],
      rankings: { transportation: 7, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Belgium',
      flag: '🇧🇪',
      rank: 34,
      visitors: '9.2M',
      continent: 'Europe',
      highlights: ['Grand Place', 'Bruges Canals', 'Atomium', 'Belgian Chocolate'],
      rankings: { transportation: 9, food: 9, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Denmark',
      flag: '🇩🇰',
      rank: 35,
      visitors: '10.4M',
      continent: 'Europe',
      highlights: ['Tivoli Gardens', 'Nyhavn', 'Little Mermaid', 'LEGO House'],
      rankings: { transportation: 9, food: 7, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Sweden',
      flag: '🇸🇪',
      rank: 36,
      visitors: '7.6M',
      continent: 'Europe',
      highlights: ['Stockholm Archipelago', 'Vasa Museum', 'Ice Hotel', 'Northern Lights'],
      rankings: { transportation: 9, food: 7, activities: 8, crowdedness: 8 },
    },
    {
      name: 'Norway',
      flag: '🇳🇴',
      rank: 37,
      visitors: '6.3M',
      continent: 'Europe',
      highlights: ['Norwegian Fjords', 'Northern Lights', 'Bergen', 'Midnight Sun'],
      rankings: { transportation: 8, food: 7, activities: 9, crowdedness: 9 },
    },
    {
      name: 'Finland',
      flag: '🇫🇮',
      rank: 38,
      visitors: '5.8M',
      continent: 'Europe',
      highlights: ['Helsinki', 'Lapland', 'Santa Claus Village', 'Northern Lights'],
      rankings: { transportation: 8, food: 6, activities: 8, crowdedness: 9 },
    },
    {
      name: 'Brazil',
      flag: '🇧🇷',
      rank: 39,
      visitors: '6.6M',
      continent: 'South America',
      highlights: ['Christ the Redeemer', 'Amazon Rainforest', 'Iguazu Falls', 'Copacabana Beach'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Egypt',
      flag: '🇪🇬',
      rank: 40,
      visitors: '13.0M',
      continent: 'Africa',
      highlights: ['Pyramids of Giza', 'Sphinx', 'Valley of the Kings', 'Nile River'],
      rankings: { transportation: 5, food: 7, activities: 9, crowdedness: 5 },
    },
    {
      name: 'South Africa',
      flag: '🇿🇦',
      rank: 41,
      visitors: '10.2M',
      continent: 'Africa',
      highlights: ['Table Mountain', 'Kruger National Park', 'Cape of Good Hope', 'Robben Island'],
      rankings: { transportation: 6, food: 8, activities: 9, crowdedness: 7 },
    },
    {
      name: 'New Zealand',
      flag: '🇳🇿',
      rank: 42,
      visitors: '3.9M',
      continent: 'Oceania',
      highlights: ['Milford Sound', 'Hobbiton', 'Tongariro Crossing', 'Queenstown'],
      rankings: { transportation: 7, food: 7, activities: 10, crowdedness: 9 },
    },
    {
      name: 'Australia',
      flag: '🇦🇺',
      rank: 43,
      visitors: '9.5M',
      continent: 'Oceania',
      highlights: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru', 'Bondi Beach'],
      rankings: { transportation: 7, food: 8, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Argentina',
      flag: '🇦🇷',
      rank: 44,
      visitors: '7.4M',
      continent: 'South America',
      highlights: ['Iguazu Falls', 'Buenos Aires', 'Patagonia', 'Mendoza Wine Region'],
      rankings: { transportation: 6, food: 8, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Chile',
      flag: '🇨🇱',
      rank: 45,
      visitors: '5.7M',
      continent: 'South America',
      highlights: ['Easter Island', 'Atacama Desert', 'Torres del Paine', 'Valparaiso'],
      rankings: { transportation: 6, food: 7, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Peru',
      flag: '🇵🇪',
      rank: 46,
      visitors: '4.4M',
      continent: 'South America',
      highlights: ['Machu Picchu', 'Nazca Lines', 'Lake Titicaca', 'Cusco'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Colombia',
      flag: '🇨🇴',
      rank: 47,
      visitors: '4.5M',
      continent: 'South America',
      highlights: ['Cartagena', 'Bogotá', 'Coffee Region', 'Tayrona National Park'],
      rankings: { transportation: 5, food: 8, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Philippines',
      flag: '🇵🇭',
      rank: 48,
      visitors: '8.3M',
      continent: 'Asia',
      highlights: ['Boracay', 'Palawan', 'Chocolate Hills', 'Manila'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Cambodia',
      flag: '🇰🇭',
      rank: 49,
      visitors: '6.6M',
      continent: 'Asia',
      highlights: ['Angkor Wat', 'Phnom Penh', 'Tonle Sap Lake', 'Siem Reap'],
      rankings: { transportation: 4, food: 7, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Jordan',
      flag: '🇯🇴',
      rank: 50,
      visitors: '5.4M',
      continent: 'Asia',
      highlights: ['Petra', 'Dead Sea', 'Wadi Rum', 'Jerash'],
      rankings: { transportation: 6, food: 7, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Iceland',
      flag: '🇮🇸',
      rank: 51,
      visitors: '2.3M',
      continent: 'Europe',
      highlights: ['Blue Lagoon', 'Northern Lights', 'Golden Circle', 'Glacier Hiking'],
      rankings: { transportation: 7, food: 6, activities: 9, crowdedness: 9 },
    },
    {
      name: 'Luxembourg',
      flag: '🇱🇺',
      rank: 52,
      visitors: '2.1M',
      continent: 'Europe',
      highlights: ['Luxembourg City', 'Vianden Castle', 'Mullerthal Trail', 'Moselle Valley'],
      rankings: { transportation: 9, food: 7, activities: 6, crowdedness: 8 },
    },
    {
      name: 'Romania',
      flag: '🇷🇴',
      rank: 53,
      visitors: '12.9M',
      continent: 'Europe',
      highlights: ['Bran Castle', 'Transylvania', 'Peles Castle', 'Bucharest'],
      rankings: { transportation: 6, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Bulgaria',
      flag: '🇧🇬',
      rank: 54,
      visitors: '9.3M',
      continent: 'Europe',
      highlights: ['Sofia', 'Rila Monastery', 'Black Sea Coast', 'Plovdiv'],
      rankings: { transportation: 6, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Slovakia',
      flag: '🇸🇰',
      rank: 55,
      visitors: '6.0M',
      continent: 'Europe',
      highlights: ['Bratislava Castle', 'High Tatras', 'Spiš Castle', 'Slovak Paradise'],
      rankings: { transportation: 7, food: 7, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Slovenia',
      flag: '🇸🇮',
      rank: 56,
      visitors: '4.7M',
      continent: 'Europe',
      highlights: ['Lake Bled', 'Ljubljana', 'Postojna Cave', 'Triglav National Park'],
      rankings: { transportation: 8, food: 8, activities: 8, crowdedness: 8 },
    },
    {
      name: 'Estonia',
      flag: '🇪🇪',
      rank: 57,
      visitors: '3.8M',
      continent: 'Europe',
      highlights: ['Tallinn Old Town', 'Lahemaa National Park', 'Saaremaa Island', 'Tartu'],
      rankings: { transportation: 8, food: 6, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Latvia',
      flag: '🇱🇻',
      rank: 58,
      visitors: '3.4M',
      continent: 'Europe',
      highlights: ['Riga Old Town', 'Gauja National Park', 'Jurmala Beach', 'Rundale Palace'],
      rankings: { transportation: 7, food: 6, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Lithuania',
      flag: '🇱🇹',
      rank: 59,
      visitors: '3.6M',
      continent: 'Europe',
      highlights: ['Vilnius Old Town', 'Trakai Castle', 'Curonian Spit', 'Hill of Crosses'],
      rankings: { transportation: 7, food: 6, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Tunisia',
      flag: '🇹🇳',
      rank: 60,
      visitors: '9.5M',
      continent: 'Africa',
      highlights: ['Carthage Ruins', 'Sahara Desert', 'Sidi Bou Said', 'El Djem Amphitheatre'],
      rankings: { transportation: 5, food: 7, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Sri Lanka',
      flag: '🇱🇰',
      rank: 61,
      visitors: '1.9M',
      continent: 'Asia',
      highlights: ['Sigiriya Rock', 'Ella', 'Kandy Temple', 'Tea Plantations'],
      rankings: { transportation: 5, food: 8, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Maldives',
      flag: '🇲🇻',
      rank: 62,
      visitors: '1.7M',
      continent: 'Asia',
      highlights: ['Private Islands', 'Coral Reefs', 'Water Villas', 'Underwater Restaurant'],
      rankings: { transportation: 6, food: 7, activities: 8, crowdedness: 8 },
    },
    {
      name: 'Cuba',
      flag: '🇨🇺',
      rank: 63,
      visitors: '4.7M',
      continent: 'North America',
      highlights: ['Havana Old Town', 'Varadero Beach', 'Viñales Valley', 'Trinidad'],
      rankings: { transportation: 4, food: 6, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Costa Rica',
      flag: '🇨🇷',
      rank: 64,
      visitors: '3.1M',
      continent: 'North America',
      highlights: ['Arenal Volcano', 'Monteverde Cloud Forest', 'Manuel Antonio', 'Tortuguero'],
      rankings: { transportation: 5, food: 7, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Dominican Republic',
      flag: '🇩🇴',
      rank: 65,
      visitors: '7.4M',
      continent: 'North America',
      highlights: ['Punta Cana', 'Santo Domingo', 'Samaná Peninsula', 'Los Haitises'],
      rankings: { transportation: 5, food: 7, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Jamaica',
      flag: '🇯🇲',
      rank: 66,
      visitors: '4.3M',
      continent: 'North America',
      highlights: ['Dunn\'s River Falls', 'Montego Bay', 'Blue Mountains', 'Negril Beach'],
      rankings: { transportation: 5, food: 8, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Kenya',
      flag: '🇰🇪',
      rank: 67,
      visitors: '2.0M',
      continent: 'Africa',
      highlights: ['Masai Mara', 'Mount Kenya', 'Amboseli National Park', 'Lamu Island'],
      rankings: { transportation: 5, food: 6, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Tanzania',
      flag: '🇹🇿',
      rank: 68,
      visitors: '1.5M',
      continent: 'Africa',
      highlights: ['Serengeti', 'Mount Kilimanjaro', 'Zanzibar', 'Ngorongoro Crater'],
      rankings: { transportation: 4, food: 6, activities: 10, crowdedness: 7 },
    },
    {
      name: 'Ethiopia',
      flag: '🇪🇹',
      rank: 69,
      visitors: '0.9M',
      continent: 'Africa',
      highlights: ['Lalibela Churches', 'Simien Mountains', 'Addis Ababa', 'Danakil Depression'],
      rankings: { transportation: 4, food: 6, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Nepal',
      flag: '🇳🇵',
      rank: 70,
      visitors: '1.2M',
      continent: 'Asia',
      highlights: ['Mount Everest', 'Kathmandu Temples', 'Pokhara', 'Annapurna Circuit'],
      rankings: { transportation: 4, food: 7, activities: 10, crowdedness: 6 },
    },
    {
      name: 'Bhutan',
      flag: '🇧🇹',
      rank: 71,
      visitors: '0.3M',
      continent: 'Asia',
      highlights: ['Tiger\'s Nest', 'Punakha Dzong', 'Paro Valley', 'Buddhist Monasteries'],
      rankings: { transportation: 4, food: 6, activities: 9, crowdedness: 9 },
    },
    {
      name: 'Myanmar',
      flag: '🇲🇲',
      rank: 72,
      visitors: '4.4M',
      continent: 'Asia',
      highlights: ['Bagan Temples', 'Inle Lake', 'Shwedagon Pagoda', 'Mandalay'],
      rankings: { transportation: 4, food: 7, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Laos',
      flag: '🇱🇦',
      rank: 73,
      visitors: '4.8M',
      continent: 'Asia',
      highlights: ['Luang Prabang', 'Kuang Si Falls', 'Vang Vieng', 'Plain of Jars'],
      rankings: { transportation: 4, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Oman',
      flag: '🇴🇲',
      rank: 74,
      visitors: '3.5M',
      continent: 'Asia',
      highlights: ['Muscat', 'Wahiba Sands', 'Jebel Akhdar', 'Nizwa Fort'],
      rankings: { transportation: 7, food: 7, activities: 8, crowdedness: 8 },
    },
    {
      name: 'Qatar',
      flag: '🇶🇦',
      rank: 75,
      visitors: '2.1M',
      continent: 'Asia',
      highlights: ['Museum of Islamic Art', 'Souq Waqif', 'Katara Cultural Village', 'The Pearl'],
      rankings: { transportation: 9, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Kuwait',
      flag: '🇰🇼',
      rank: 76,
      visitors: '0.5M',
      continent: 'Asia',
      highlights: ['Kuwait Towers', 'Grand Mosque', 'Souq Al-Mubarakiya', 'Failaka Island'],
      rankings: { transportation: 8, food: 7, activities: 6, crowdedness: 7 },
    },
    {
      name: 'Bahrain',
      flag: '🇧🇭',
      rank: 77,
      visitors: '11.0M',
      continent: 'Asia',
      highlights: ['Bahrain Fort', 'Manama Souq', 'Tree of Life', 'Bahrain National Museum'],
      rankings: { transportation: 8, food: 7, activities: 6, crowdedness: 6 },
    },
    {
      name: 'Lebanon',
      flag: '🇱🇧',
      rank: 78,
      visitors: '1.9M',
      continent: 'Asia',
      highlights: ['Baalbek', 'Byblos', 'Beirut', 'Jeita Grotto'],
      rankings: { transportation: 5, food: 9, activities: 8, crowdedness: 6 },
    },
    {
      name: 'Malta',
      flag: '🇲🇹',
      rank: 79,
      visitors: '2.8M',
      continent: 'Europe',
      highlights: ['Valletta', 'Blue Lagoon', 'Mdina', 'Megalithic Temples'],
      rankings: { transportation: 7, food: 8, activities: 7, crowdedness: 6 },
    },
    {
      name: 'Cyprus',
      flag: '🇨🇾',
      rank: 80,
      visitors: '4.0M',
      continent: 'Europe',
      highlights: ['Paphos', 'Troodos Mountains', 'Kyrenia', 'Ayia Napa'],
      rankings: { transportation: 7, food: 8, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Albania',
      flag: '🇦🇱',
      rank: 81,
      visitors: '6.4M',
      continent: 'Europe',
      highlights: ['Albanian Riviera', 'Berat', 'Gjirokastër', 'Tirana'],
      rankings: { transportation: 5, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'North Macedonia',
      flag: '🇲🇰',
      rank: 82,
      visitors: '1.2M',
      continent: 'Europe',
      highlights: ['Lake Ohrid', 'Skopje', 'Matka Canyon', 'Bitola'],
      rankings: { transportation: 6, food: 7, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Serbia',
      flag: '🇷🇸',
      rank: 83,
      visitors: '1.8M',
      continent: 'Europe',
      highlights: ['Belgrade', 'Novi Sad', 'Đavolja Varoš', 'Studenica Monastery'],
      rankings: { transportation: 6, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Bosnia and Herzegovina',
      flag: '🇧🇦',
      rank: 84,
      visitors: '1.6M',
      continent: 'Europe',
      highlights: ['Mostar Bridge', 'Sarajevo', 'Kravica Waterfalls', 'Blagaj Tekke'],
      rankings: { transportation: 5, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Montenegro',
      flag: '🇲🇪',
      rank: 85,
      visitors: '2.5M',
      continent: 'Europe',
      highlights: ['Kotor Bay', 'Budva', 'Durmitor National Park', 'Perast'],
      rankings: { transportation: 6, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Uruguay',
      flag: '🇺🇾',
      rank: 86,
      visitors: '3.0M',
      continent: 'South America',
      highlights: ['Montevideo', 'Punta del Este', 'Colonia del Sacramento', 'Cabo Polonio'],
      rankings: { transportation: 6, food: 8, activities: 7, crowdedness: 8 },
    },
    {
      name: 'Paraguay',
      flag: '🇵🇾',
      rank: 87,
      visitors: '1.3M',
      continent: 'South America',
      highlights: ['Asunción', 'Itaipu Dam', 'Jesuit Missions', 'Ybycuí National Park'],
      rankings: { transportation: 5, food: 6, activities: 6, crowdedness: 8 },
    },
    {
      name: 'Bolivia',
      flag: '🇧🇴',
      rank: 88,
      visitors: '1.1M',
      continent: 'South America',
      highlights: ['Salar de Uyuni', 'La Paz', 'Lake Titicaca', 'Death Road'],
      rankings: { transportation: 4, food: 6, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Ecuador',
      flag: '🇪🇨',
      rank: 89,
      visitors: '2.4M',
      continent: 'South America',
      highlights: ['Galápagos Islands', 'Quito', 'Amazon Rainforest', 'Cotopaxi'],
      rankings: { transportation: 5, food: 7, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Panama',
      flag: '🇵🇦',
      rank: 90,
      visitors: '2.5M',
      continent: 'North America',
      highlights: ['Panama Canal', 'Casco Viejo', 'San Blas Islands', 'Bocas del Toro'],
      rankings: { transportation: 6, food: 7, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Guatemala',
      flag: '🇬🇹',
      rank: 91,
      visitors: '2.6M',
      continent: 'North America',
      highlights: ['Tikal', 'Lake Atitlán', 'Antigua', 'Semuc Champey'],
      rankings: { transportation: 4, food: 7, activities: 9, crowdedness: 6 },
    },
    {
      name: 'Nicaragua',
      flag: '🇳🇮',
      rank: 92,
      visitors: '1.8M',
      continent: 'North America',
      highlights: ['Granada', 'León', 'Ometepe Island', 'Corn Islands'],
      rankings: { transportation: 4, food: 6, activities: 8, crowdedness: 7 },
    },
    {
      name: 'El Salvador',
      flag: '🇸🇻',
      rank: 93,
      visitors: '2.7M',
      continent: 'North America',
      highlights: ['El Tunco Beach', 'Joya de Cerén', 'Santa Ana Volcano', 'Suchitoto'],
      rankings: { transportation: 5, food: 7, activities: 7, crowdedness: 7 },
    },
    {
      name: 'Honduras',
      flag: '🇭🇳',
      rank: 94,
      visitors: '1.1M',
      continent: 'North America',
      highlights: ['Roatán', 'Copán Ruins', 'Utila', 'La Ceiba'],
      rankings: { transportation: 4, food: 6, activities: 8, crowdedness: 7 },
    },
    {
      name: 'Belize',
      flag: '🇧🇿',
      rank: 95,
      visitors: '0.5M',
      continent: 'North America',
      highlights: ['Great Blue Hole', 'Mayan Ruins', 'Barrier Reef', 'Caye Caulker'],
      rankings: { transportation: 5, food: 6, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Fiji',
      flag: '🇫🇯',
      rank: 96,
      visitors: '0.9M',
      continent: 'Oceania',
      highlights: ['Coral Coast', 'Mamanuca Islands', 'Suva', 'Yasawa Islands'],
      rankings: { transportation: 5, food: 7, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Papua New Guinea',
      flag: '🇵🇬',
      rank: 97,
      visitors: '0.2M',
      continent: 'Oceania',
      highlights: ['Kokoda Track', 'Port Moresby', 'Sepik River', 'Mount Hagen'],
      rankings: { transportation: 3, food: 5, activities: 9, crowdedness: 9 },
    },
    {
      name: 'Madagascar',
      flag: '🇲🇬',
      rank: 98,
      visitors: '0.4M',
      continent: 'Africa',
      highlights: ['Avenue of Baobabs', 'Tsingy de Bemaraha', 'Nosy Be', 'Lemurs'],
      rankings: { transportation: 3, food: 5, activities: 9, crowdedness: 8 },
    },
    {
      name: 'Zimbabwe',
      flag: '🇿🇼',
      rank: 99,
      visitors: '2.6M',
      continent: 'Africa',
      highlights: ['Victoria Falls', 'Great Zimbabwe', 'Hwange National Park', 'Matobo Hills'],
      rankings: { transportation: 4, food: 6, activities: 9, crowdedness: 7 },
    },
    {
      name: 'Zambia',
      flag: '🇿🇲',
      rank: 100,
      visitors: '1.1M',
      continent: 'Africa',
      highlights: ['Victoria Falls', 'South Luangwa', 'Lower Zambezi', 'Devil\'s Pool'],
      rankings: { transportation: 4, food: 6, activities: 9, crowdedness: 8 },
    },
  ];

  const topTen = allCountries.slice(0, 10);
  const remainingCountries = allCountries.slice(10);

  const getRankColor = (rank) => {
    if (rank === 1) return '#fbbf24';
    if (rank === 2) return '#94a3b8';
    if (rank === 3) return '#f97316';
    return '#4ade80';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>World Rank</Text>
        <Text style={styles.headerSubtitle}>Most visited countries worldwide</Text>
      </View>

      <View style={styles.topSection}>
        <Text style={styles.sectionTitle}>Top 10 Countries</Text>
        {topTen.map((country, index) => (
          <TouchableOpacity
            key={index}
            style={styles.countryCard}
            onPress={() => navigation.navigate('CountryDetail', { country })}
          >
            <View style={styles.rankContainer}>
              <View style={[styles.rankBadge, { backgroundColor: getRankColor(country.rank) }]}>
                <Text style={styles.rankText}>#{country.rank}</Text>
              </View>
            </View>

            <Text style={styles.flagEmoji}>{country.flag}</Text>

            <View style={styles.countryInfo}>
              <Text style={styles.countryName}>{country.name}</Text>
              <View style={styles.infoRow}>
                <Ionicons name="people" size={16} color="#888" />
                <Text style={styles.infoText}>{country.visitors} annual visitors</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#888" />
                <Text style={styles.infoText}>{country.continent}</Text>
              </View>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#888" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.dropdownSection}>
        <Text style={styles.sectionTitle}>More Countries</Text>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => setDropdownVisible(!dropdownVisible)}
        >
          <Ionicons name="search" size={20} color="#4ade80" />
          <Text style={styles.dropdownButtonText}>
            Browse Countries #11-#100
          </Text>
          <Ionicons
            name={dropdownVisible ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#4ade80"
          />
        </TouchableOpacity>

        {dropdownVisible && (
          <View style={styles.dropdownList}>
            {remainingCountries.map((country, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownItem}
                onPress={() => {
                  setDropdownVisible(false);
                  navigation.navigate('CountryDetail', { country });
                }}
              >
                <View style={[styles.smallRankBadge, { backgroundColor: getRankColor(country.rank) }]}>
                  <Text style={styles.smallRankText}>#{country.rank}</Text>
                </View>
                <Text style={styles.dropdownFlag}>{country.flag}</Text>
                <View style={styles.dropdownCountryInfo}>
                  <Text style={styles.dropdownCountryName}>{country.name}</Text>
                  <Text style={styles.dropdownCountryVisitors}>{country.visitors} visitors</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#888888',
  },
  topSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  countryCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    color: '#0a0a0a',
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
    color: '#ffffff',
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
    color: '#888',
  },
  dropdownSection: {
    padding: 20,
    paddingTop: 0,
    marginBottom: 30,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    gap: 12,
  },
  dropdownButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  dropdownList: {
    marginTop: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
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
    color: '#0a0a0a',
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
    color: '#ffffff',
    marginBottom: 3,
  },
  dropdownCountryVisitors: {
    fontSize: 13,
    color: '#888',
  },
});
