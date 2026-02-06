import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import CountryHeaderImage from '../components/CountryHeaderImage';
import AttractionCard from '../components/AttractionCard';
import HotelCard from '../components/HotelCard';
import CityCard from '../components/CityCard';
import { getCountryFlag } from '../utils/countryFlags';

const ferdiLogo = require('../assets/Ferdi-transparent.png');

// Top 10 cities by population for each country
const countryCities = {
  'France': [
    { name: 'Paris', population: 2161000 },
    { name: 'Marseille', population: 870018 },
    { name: 'Lyon', population: 522969 },
    { name: 'Toulouse', population: 493465 },
    { name: 'Nice', population: 342669 },
    { name: 'Nantes', population: 314138 },
    { name: 'Montpellier', population: 290053 },
    { name: 'Strasbourg', population: 284677 },
    { name: 'Bordeaux', population: 260958 },
    { name: 'Lille', population: 236234 },
  ],
  'Spain': [
    { name: 'Madrid', population: 3223334 },
    { name: 'Barcelona', population: 1620343 },
    { name: 'Valencia', population: 791413 },
    { name: 'Seville', population: 688592 },
    { name: 'Zaragoza', population: 674317 },
    { name: 'Málaga', population: 578460 },
    { name: 'Murcia', population: 453258 },
    { name: 'Palma', population: 409661 },
    { name: 'Las Palmas', population: 378517 },
    { name: 'Bilbao', population: 346574 },
  ],
  'Italy': [
    { name: 'Rome', population: 2873000 },
    { name: 'Milan', population: 1396059 },
    { name: 'Naples', population: 967069 },
    { name: 'Turin', population: 870952 },
    { name: 'Palermo', population: 663401 },
    { name: 'Genoa', population: 580097 },
    { name: 'Bologna', population: 392203 },
    { name: 'Florence', population: 382808 },
    { name: 'Bari', population: 322751 },
    { name: 'Catania', population: 311620 },
  ],
  'Germany': [
    { name: 'Berlin', population: 3644826 },
    { name: 'Hamburg', population: 1841179 },
    { name: 'Munich', population: 1471508 },
    { name: 'Cologne', population: 1085664 },
    { name: 'Frankfurt', population: 753056 },
    { name: 'Stuttgart', population: 634830 },
    { name: 'Düsseldorf', population: 619294 },
    { name: 'Leipzig', population: 587857 },
    { name: 'Dortmund', population: 586852 },
    { name: 'Essen', population: 583109 },
  ],
  'United Kingdom': [
    { name: 'London', population: 8982000 },
    { name: 'Birmingham', population: 1141816 },
    { name: 'Glasgow', population: 635640 },
    { name: 'Liverpool', population: 498042 },
    { name: 'Bristol', population: 467099 },
    { name: 'Manchester', population: 547627 },
    { name: 'Sheffield', population: 584853 },
    { name: 'Leeds', population: 793139 },
    { name: 'Edinburgh', population: 518500 },
    { name: 'Leicester', population: 354224 },
  ],
  'USA': [
    { name: 'New York City', population: 8336817 },
    { name: 'Los Angeles', population: 3979576 },
    { name: 'Chicago', population: 2693976 },
    { name: 'Houston', population: 2320268 },
    { name: 'Phoenix', population: 1680992 },
    { name: 'Philadelphia', population: 1584064 },
    { name: 'San Antonio', population: 1547253 },
    { name: 'San Diego', population: 1423851 },
    { name: 'Dallas', population: 1343573 },
    { name: 'San Jose', population: 1013240 },
  ],
  'United States': [
    { name: 'New York City', population: 8336817 },
    { name: 'Los Angeles', population: 3979576 },
    { name: 'Chicago', population: 2693976 },
    { name: 'Houston', population: 2320268 },
    { name: 'Phoenix', population: 1680992 },
    { name: 'Philadelphia', population: 1584064 },
    { name: 'San Antonio', population: 1547253 },
    { name: 'San Diego', population: 1423851 },
    { name: 'Dallas', population: 1343573 },
    { name: 'San Jose', population: 1013240 },
  ],
  'Japan': [
    { name: 'Tokyo', population: 13960000 },
    { name: 'Yokohama', population: 3749000 },
    { name: 'Osaka', population: 2753000 },
    { name: 'Nagoya', population: 2320000 },
    { name: 'Sapporo', population: 1973000 },
    { name: 'Fukuoka', population: 1603000 },
    { name: 'Kobe', population: 1528000 },
    { name: 'Kawasaki', population: 1530000 },
    { name: 'Kyoto', population: 1461000 },
    { name: 'Saitama', population: 1324000 },
  ],
  'China': [
    { name: 'Shanghai', population: 28516904 },
    { name: 'Beijing', population: 21893095 },
    { name: 'Chongqing', population: 16382376 },
    { name: 'Tianjin', population: 13866009 },
    { name: 'Guangzhou', population: 13501100 },
    { name: 'Shenzhen', population: 12528300 },
    { name: 'Chengdu', population: 11581000 },
    { name: 'Wuhan', population: 11081000 },
    { name: 'Xi\'an', population: 10135000 },
    { name: 'Hangzhou', population: 10360000 },
  ],
  'India': [
    { name: 'Mumbai', population: 20667656 },
    { name: 'Delhi', population: 16787941 },
    { name: 'Bangalore', population: 12765000 },
    { name: 'Hyderabad', population: 10268653 },
    { name: 'Ahmedabad', population: 8253226 },
    { name: 'Chennai', population: 7088000 },
    { name: 'Kolkata', population: 14850000 },
    { name: 'Surat', population: 6564100 },
    { name: 'Pune', population: 6629347 },
    { name: 'Jaipur', population: 3073350 },
  ],
  'Brazil': [
    { name: 'São Paulo', population: 12325232 },
    { name: 'Rio de Janeiro', population: 6747815 },
    { name: 'Brasília', population: 3055149 },
    { name: 'Salvador', population: 2886698 },
    { name: 'Fortaleza', population: 2686612 },
    { name: 'Belo Horizonte', population: 2521564 },
    { name: 'Manaus', population: 2219580 },
    { name: 'Curitiba', population: 1948626 },
    { name: 'Recife', population: 1653461 },
    { name: 'Goiânia', population: 1536097 },
  ],
  'Mexico': [
    { name: 'Mexico City', population: 9209944 },
    { name: 'Tijuana', population: 1922523 },
    { name: 'León', population: 1721215 },
    { name: 'Puebla', population: 1692181 },
    { name: 'Guadalajara', population: 1495182 },
    { name: 'Zapopan', population: 1476491 },
    { name: 'Monterrey', population: 1142994 },
    { name: 'Ciudad Juárez', population: 1512354 },
    { name: 'Mérida', population: 1143000 },
    { name: 'Cancún', population: 888797 },
  ],
  'Canada': [
    { name: 'Toronto', population: 2794356 },
    { name: 'Montreal', population: 1780000 },
    { name: 'Calgary', population: 1336000 },
    { name: 'Ottawa', population: 1017449 },
    { name: 'Edmonton', population: 1010899 },
    { name: 'Mississauga', population: 721599 },
    { name: 'Winnipeg', population: 749534 },
    { name: 'Vancouver', population: 675218 },
    { name: 'Brampton', population: 656480 },
    { name: 'Hamilton', population: 569353 },
  ],
  'Australia': [
    { name: 'Sydney', population: 5312000 },
    { name: 'Melbourne', population: 5078000 },
    { name: 'Brisbane', population: 2514000 },
    { name: 'Perth', population: 2085000 },
    { name: 'Adelaide', population: 1376000 },
    { name: 'Gold Coast', population: 709000 },
    { name: 'Newcastle', population: 322278 },
    { name: 'Canberra', population: 457000 },
    { name: 'Sunshine Coast', population: 354000 },
    { name: 'Wollongong', population: 305000 },
  ],
  'Thailand': [
    { name: 'Bangkok', population: 10539000 },
    { name: 'Samut Prakan', population: 1337000 },
    { name: 'Nonthaburi', population: 270000 },
    { name: 'Udon Thani', population: 247231 },
    { name: 'Chiang Mai', population: 131091 },
    { name: 'Hat Yai', population: 159477 },
    { name: 'Pak Kret', population: 191000 },
    { name: 'Nakhon Ratchasima', population: 174332 },
    { name: 'Pattaya', population: 120000 },
    { name: 'Phuket', population: 83000 },
  ],
  'Turkey': [
    { name: 'Istanbul', population: 15462452 },
    { name: 'Ankara', population: 5663322 },
    { name: 'Izmir', population: 4367251 },
    { name: 'Bursa', population: 3101833 },
    { name: 'Antalya', population: 2548308 },
    { name: 'Adana', population: 2263373 },
    { name: 'Gaziantep', population: 2154051 },
    { name: 'Konya', population: 2277017 },
    { name: 'Mersin', population: 1868757 },
    { name: 'Diyarbakır', population: 1783431 },
  ],
  'Greece': [
    { name: 'Athens', population: 664046 },
    { name: 'Thessaloniki', population: 325182 },
    { name: 'Patras', population: 168034 },
    { name: 'Piraeus', population: 163688 },
    { name: 'Larissa', population: 144651 },
    { name: 'Heraklion', population: 140730 },
    { name: 'Peristeri', population: 139981 },
    { name: 'Kallithea', population: 100641 },
    { name: 'Acharnes', population: 99346 },
    { name: 'Kalamaria', population: 91518 },
  ],
  'Netherlands': [
    { name: 'Amsterdam', population: 872680 },
    { name: 'Rotterdam', population: 651446 },
    { name: 'The Hague', population: 548320 },
    { name: 'Utrecht', population: 361924 },
    { name: 'Eindhoven', population: 234456 },
    { name: 'Groningen', population: 233218 },
    { name: 'Tilburg', population: 220308 },
    { name: 'Almere', population: 215055 },
    { name: 'Breda', population: 184403 },
    { name: 'Nijmegen', population: 177701 },
  ],
  'Portugal': [
    { name: 'Lisbon', population: 545245 },
    { name: 'Porto', population: 237559 },
    { name: 'Vila Nova de Gaia', population: 302296 },
    { name: 'Amadora', population: 178858 },
    { name: 'Braga', population: 193333 },
    { name: 'Setúbal', population: 98131 },
    { name: 'Coimbra', population: 106582 },
    { name: 'Funchal', population: 111892 },
    { name: 'Almada', population: 174030 },
    { name: 'Agualva-Cacém', population: 81845 },
  ],
  'South Korea': [
    { name: 'Seoul', population: 9733509 },
    { name: 'Busan', population: 3429887 },
    { name: 'Incheon', population: 2954642 },
    { name: 'Daegu', population: 2446144 },
    { name: 'Daejeon', population: 1502227 },
    { name: 'Gwangju', population: 1469216 },
    { name: 'Suwon', population: 1199554 },
    { name: 'Ulsan', population: 1142190 },
    { name: 'Changwon', population: 1046054 },
    { name: 'Goyang', population: 1073069 },
  ],
  'Singapore': [
    { name: 'Singapore', population: 5453600 },
  ],
  'Malaysia': [
    { name: 'Kuala Lumpur', population: 1982112 },
    { name: 'George Town', population: 794313 },
    { name: 'Ipoh', population: 759952 },
    { name: 'Shah Alam', population: 650000 },
    { name: 'Petaling Jaya', population: 638516 },
    { name: 'Johor Bahru', population: 497097 },
    { name: 'Kota Kinabalu', population: 500421 },
    { name: 'Kuching', population: 570407 },
    { name: 'Malacca City', population: 579000 },
    { name: 'Seremban', population: 419536 },
  ],
  'Indonesia': [
    { name: 'Jakarta', population: 10562088 },
    { name: 'Surabaya', population: 2874314 },
    { name: 'Bandung', population: 2575478 },
    { name: 'Medan', population: 2435252 },
    { name: 'Semarang', population: 1653524 },
    { name: 'Makassar', population: 1526677 },
    { name: 'Palembang', population: 1455284 },
    { name: 'Depok', population: 2330333 },
    { name: 'Tangerang', population: 1895486 },
    { name: 'Bekasi', population: 2543676 },
  ],
  'Vietnam': [
    { name: 'Ho Chi Minh City', population: 8993082 },
    { name: 'Hanoi', population: 8053663 },
    { name: 'Haiphong', population: 2028514 },
    { name: 'Can Tho', population: 1235171 },
    { name: 'Da Nang', population: 1134310 },
    { name: 'Bien Hoa', population: 1104000 },
    { name: 'Nha Trang', population: 535000 },
    { name: 'Hue', population: 455230 },
    { name: 'Buon Ma Thuot', population: 340000 },
    { name: 'Vung Tau', population: 327000 },
  ],
  'Egypt': [
    { name: 'Cairo', population: 10025657 },
    { name: 'Alexandria', population: 5200000 },
    { name: 'Giza', population: 4146340 },
    { name: 'Shubra El Kheima', population: 1099354 },
    { name: 'Port Said', population: 749371 },
    { name: 'Suez', population: 728180 },
    { name: 'Luxor', population: 507000 },
    { name: 'Mansoura', population: 495630 },
    { name: 'Tanta', population: 466000 },
    { name: 'Asyut', population: 462000 },
  ],
  'South Africa': [
    { name: 'Johannesburg', population: 5635127 },
    { name: 'Cape Town', population: 4618000 },
    { name: 'Durban', population: 3720953 },
    { name: 'Pretoria', population: 2473000 },
    { name: 'Port Elizabeth', population: 1263000 },
    { name: 'Bloemfontein', population: 759693 },
    { name: 'Nelspruit', population: 110246 },
    { name: 'Polokwane', population: 130028 },
    { name: 'Kimberley', population: 227647 },
    { name: 'Pietermaritzburg', population: 750845 },
  ],
  'Morocco': [
    { name: 'Casablanca', population: 3359818 },
    { name: 'Rabat', population: 577827 },
    { name: 'Fes', population: 1112072 },
    { name: 'Marrakech', population: 928850 },
    { name: 'Tangier', population: 947952 },
    { name: 'Agadir', population: 421844 },
    { name: 'Meknes', population: 632079 },
    { name: 'Oujda', population: 494252 },
    { name: 'Kenitra', population: 431282 },
    { name: 'Tetouan', population: 380787 },
  ],
  'Argentina': [
    { name: 'Buenos Aires', population: 3075646 },
    { name: 'Córdoba', population: 1391000 },
    { name: 'Rosario', population: 1193605 },
    { name: 'Mendoza', population: 115041 },
    { name: 'San Miguel de Tucumán', population: 548866 },
    { name: 'La Plata', population: 654324 },
    { name: 'Mar del Plata', population: 614350 },
    { name: 'Salta', population: 618375 },
    { name: 'Santa Fe', population: 405683 },
    { name: 'San Juan', population: 471389 },
  ],
  'Colombia': [
    { name: 'Bogotá', population: 7181469 },
    { name: 'Medellín', population: 2569007 },
    { name: 'Cali', population: 2227642 },
    { name: 'Barranquilla', population: 1274250 },
    { name: 'Cartagena', population: 1028736 },
    { name: 'Cúcuta', population: 750000 },
    { name: 'Bucaramanga', population: 528575 },
    { name: 'Ibagué', population: 564197 },
    { name: 'Pereira', population: 476660 },
    { name: 'Santa Marta', population: 515556 },
  ],
  'Peru': [
    { name: 'Lima', population: 10883000 },
    { name: 'Arequipa', population: 1008290 },
    { name: 'Callao', population: 994806 },
    { name: 'Trujillo', population: 919899 },
    { name: 'Chiclayo', population: 600440 },
    { name: 'Piura', population: 484475 },
    { name: 'Iquitos', population: 437620 },
    { name: 'Cusco', population: 428450 },
    { name: 'Huancayo', population: 364725 },
    { name: 'Tacna', population: 325965 },
  ],
  'Chile': [
    { name: 'Santiago', population: 5614000 },
    { name: 'Puente Alto', population: 568106 },
    { name: 'Antofagasta', population: 390832 },
    { name: 'Viña del Mar', population: 334248 },
    { name: 'Valparaíso', population: 295917 },
    { name: 'Talcahuano', population: 252968 },
    { name: 'San Bernardo', population: 316760 },
    { name: 'Temuco', population: 282415 },
    { name: 'Iquique', population: 227499 },
    { name: 'Concepción', population: 223574 },
  ],
  'Russia': [
    { name: 'Moscow', population: 12655050 },
    { name: 'Saint Petersburg', population: 5601911 },
    { name: 'Novosibirsk', population: 1625631 },
    { name: 'Yekaterinburg', population: 1545734 },
    { name: 'Kazan', population: 1308660 },
    { name: 'Nizhny Novgorod', population: 1263873 },
    { name: 'Chelyabinsk', population: 1188118 },
    { name: 'Samara', population: 1156659 },
    { name: 'Omsk', population: 1154116 },
    { name: 'Rostov-on-Don', population: 1137904 },
  ],
  'Poland': [
    { name: 'Warsaw', population: 1790658 },
    { name: 'Kraków', population: 779115 },
    { name: 'Łódź', population: 672185 },
    { name: 'Wrocław', population: 643782 },
    { name: 'Poznań', population: 534813 },
    { name: 'Gdańsk', population: 470907 },
    { name: 'Szczecin', population: 401907 },
    { name: 'Bydgoszcz', population: 348190 },
    { name: 'Lublin', population: 339784 },
    { name: 'Białystok', population: 297554 },
  ],
  'Austria': [
    { name: 'Vienna', population: 1911191 },
    { name: 'Graz', population: 291072 },
    { name: 'Linz', population: 206595 },
    { name: 'Salzburg', population: 155021 },
    { name: 'Innsbruck', population: 132236 },
    { name: 'Klagenfurt', population: 101765 },
    { name: 'Villach', population: 63267 },
    { name: 'Wels', population: 62470 },
    { name: 'Sankt Pölten', population: 55514 },
    { name: 'Dornbirn', population: 50194 },
  ],
  'Switzerland': [
    { name: 'Zürich', population: 421878 },
    { name: 'Geneva', population: 203856 },
    { name: 'Basel', population: 177595 },
    { name: 'Lausanne', population: 139111 },
    { name: 'Bern', population: 134591 },
    { name: 'Winterthur', population: 114220 },
    { name: 'Lucerne', population: 82620 },
    { name: 'St. Gallen', population: 76253 },
    { name: 'Lugano', population: 63932 },
    { name: 'Biel/Bienne', population: 55206 },
  ],
  'Sweden': [
    { name: 'Stockholm', population: 978770 },
    { name: 'Gothenburg', population: 583056 },
    { name: 'Malmö', population: 347949 },
    { name: 'Uppsala', population: 177074 },
    { name: 'Västerås', population: 128660 },
    { name: 'Örebro', population: 124207 },
    { name: 'Linköping', population: 115927 },
    { name: 'Helsingborg', population: 112496 },
    { name: 'Jönköping', population: 99280 },
    { name: 'Norrköping', population: 97292 },
  ],
  'Norway': [
    { name: 'Oslo', population: 697010 },
    { name: 'Bergen', population: 285911 },
    { name: 'Trondheim', population: 207595 },
    { name: 'Stavanger', population: 144147 },
    { name: 'Drammen', population: 101859 },
    { name: 'Fredrikstad', population: 83193 },
    { name: 'Kristiansand', population: 112765 },
    { name: 'Sandnes', population: 81722 },
    { name: 'Tromsø', population: 77095 },
    { name: 'Sarpsborg', population: 57372 },
  ],
  'Denmark': [
    { name: 'Copenhagen', population: 644431 },
    { name: 'Aarhus', population: 285273 },
    { name: 'Odense', population: 180760 },
    { name: 'Aalborg', population: 119862 },
    { name: 'Frederiksberg', population: 104305 },
    { name: 'Esbjerg', population: 72205 },
    { name: 'Randers', population: 62482 },
    { name: 'Kolding', population: 61989 },
    { name: 'Horsens', population: 59449 },
    { name: 'Vejle', population: 59478 },
  ],
  'Finland': [
    { name: 'Helsinki', population: 658864 },
    { name: 'Espoo', population: 299273 },
    { name: 'Tampere', population: 244315 },
    { name: 'Vantaa', population: 239216 },
    { name: 'Oulu', population: 209648 },
    { name: 'Turku', population: 195301 },
    { name: 'Jyväskylä', population: 144347 },
    { name: 'Lahti', population: 120027 },
    { name: 'Kuopio', population: 120932 },
    { name: 'Kouvola', population: 82114 },
  ],
  'Ireland': [
    { name: 'Dublin', population: 1173179 },
    { name: 'Cork', population: 210000 },
    { name: 'Limerick', population: 94192 },
    { name: 'Galway', population: 83456 },
    { name: 'Waterford', population: 53504 },
    { name: 'Drogheda', population: 44116 },
    { name: 'Swords', population: 42738 },
    { name: 'Dundalk', population: 39004 },
    { name: 'Bray', population: 35711 },
    { name: 'Navan', population: 30173 },
  ],
  'New Zealand': [
    { name: 'Auckland', population: 1657200 },
    { name: 'Christchurch', population: 389300 },
    { name: 'Wellington', population: 215100 },
    { name: 'Hamilton', population: 176500 },
    { name: 'Tauranga', population: 155200 },
    { name: 'Lower Hutt', population: 112000 },
    { name: 'Dunedin', population: 134100 },
    { name: 'Palmerston North', population: 88300 },
    { name: 'Napier', population: 67500 },
    { name: 'Porirua', population: 59400 },
  ],
};

export default function CountryDetailScreen({ route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { country } = route.params;

  const getRatingColor = (rating) => {
    if (rating >= 8) return '#4ade80'; // Green - Excellent
    if (rating >= 6) return '#fbbf24'; // Yellow - Good
    if (rating >= 4) return '#fb923c'; // Orange - Fair
    return '#ef4444'; // Red - Poor
  };

  const getRatingLabel = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Very Good';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Fair';
    return 'Poor';
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <CountryHeaderImage
        countryName={country.name}
        flag={country.flag}
        theme={theme}
        customImageUrl={country.headerImageUrl}
      />
      <View style={styles.header}>
        <View style={styles.countryNameRow}>
          <Text style={[styles.countryName, { color: theme.text }]}>{country.name}</Text>
          <Text style={styles.countryFlag}>{getCountryFlag(country.name)}</Text>
        </View>
        <Text style={[styles.continent, { color: theme.primary }]}>{country.continent}</Text>
      </View>

      <View style={[styles.statsCard, {
        backgroundColor: theme.cardBackground,
        borderColor: theme.border
      }]}>
        <View style={styles.statItem}>
          <Ionicons name="trophy" size={24} color="#fbbf24" />
          <Text style={[styles.statValue, { color: theme.text }]}>#{country.rank}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>World Rank</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={theme.primary} />
          <Text style={[styles.statValue, { color: theme.text }]}>{country.visitors}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Annual Visitors</Text>
        </View>
      </View>

      {country.rankings && country.rankings.transportation && typeof country.rankings.transportation === 'number' && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Category Rankings</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>Based on public travel data (1-10 scale)</Text>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="car" size={24} color="#60a5fa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Transportation</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.transportation * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.transportation)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.transportation}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.transportation) }]}>
                {getRatingLabel(country.rankings.transportation)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="restaurant" size={24} color="#f472b6" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Food & Dining</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.food * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.food)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.food}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.food) }]}>
                {getRatingLabel(country.rankings.food)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="camera" size={24} color="#a78bfa" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Tourist Activities</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.activities * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.activities)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.activities}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.activities) }]}>
                {getRatingLabel(country.rankings.activities)}
              </Text>
            </View>
          </View>

          <View style={[styles.rankingCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            <View style={styles.rankingHeader}>
              <Ionicons name="people" size={24} color="#fb923c" />
              <Text style={[styles.rankingTitle, { color: theme.text }]}>Crowdedness</Text>
            </View>
            <View style={[styles.rankingBar, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.rankingFill,
                  {
                    width: `${country.rankings.crowdedness * 10}%`,
                    backgroundColor: getRatingColor(country.rankings.crowdedness)
                  }
                ]}
              />
            </View>
            <View style={styles.rankingFooter}>
              <Text style={[styles.rankingScore, { color: theme.text }]}>{country.rankings.crowdedness}/10</Text>
              <Text style={[styles.rankingLabel, { color: getRatingColor(country.rankings.crowdedness) }]}>
                {getRatingLabel(country.rankings.crowdedness)}
              </Text>
            </View>
            <Text style={[styles.rankingNote, { color: theme.textSecondary }]}>Higher is less crowded</Text>
          </View>
        </View>
      )}

      {/* Educational Information Section */}
      {(country.population || country.capital || country.leader || country.language || country.currency) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Educational Information</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.population && (
              <View style={styles.infoRow}>
                <Ionicons name="people" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Population</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.population}</Text>
                </View>
              </View>
            )}
            {country.capital && (
              <View style={styles.infoRow}>
                <Ionicons name="business" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Capital</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.capital}</Text>
                </View>
              </View>
            )}
            {country.leader && (
              <View style={styles.infoRow}>
                <Ionicons name="person" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Leader</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.leader}</Text>
                </View>
              </View>
            )}
            {country.language && (
              <View style={styles.infoRow}>
                <Ionicons name="language" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Language</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.language}</Text>
                </View>
              </View>
            )}
            {country.currency && (
              <View style={styles.infoRow}>
                <Ionicons name="cash" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Currency</Text>
                  <Text style={[styles.infoValue, { color: theme.text }]}>{country.currency}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Top 10 Cities Section */}
      {countryCities[country.name] && countryCities[country.name].length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Largest Cities</Text>
          {countryCities[country.name].map((city, index) => (
            <CityCard
              key={index}
              cityName={city.name}
              countryName={country.name}
              rank={index + 1}
              population={city.population}
              theme={theme}
            />
          ))}
        </View>
      )}

      {country.highlights && country.highlights.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Attractions</Text>
          {country.highlights.map((highlight, index) => (
            <AttractionCard
              key={index}
              attractionName={highlight}
              countryName={country.name}
              theme={theme}
              customImageUrl={country.attractionImages?.[highlight]}
            />
          ))}
        </View>
      )}

      {/* Transportation Section */}
      {(country.mainAirports || country.mainTrainStations || country.avgFlightCost || country.avgTrainCost) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Transportation</Text>

          {country.mainAirports && country.mainAirports.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="airplane" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>Main Airports</Text>
              </View>
              {country.mainAirports.map((airport, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>• {airport}</Text>
              ))}
              {country.avgFlightCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Flight Cost: {country.avgFlightCost}</Text>
              )}
            </View>
          )}

          {country.mainTrainStations && country.mainTrainStations.length > 0 && (
            <View style={[styles.infoCard, {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              marginTop: 15
            }]}>
              <View style={styles.subsectionHeader}>
                <Ionicons name="train" size={18} color={theme.secondary} />
                <Text style={[styles.subsectionTitle, { color: theme.text }]}>Main Train Stations</Text>
              </View>
              {country.mainTrainStations.map((station, index) => (
                <Text key={index} style={[styles.listItem, { color: theme.textSecondary }]}>• {station}</Text>
              ))}
              {country.avgTrainCost && (
                <Text style={[styles.costInfo, { color: theme.primary }]}>Avg Train Cost: {country.avgTrainCost}</Text>
              )}
            </View>
          )}
        </View>
      )}

      {/* Accommodations Section */}
      {country.topHotels && country.topHotels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.subsectionHeader}>
            <Ionicons name="bed" size={18} color={theme.secondary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Top Hotels</Text>
          </View>
          {country.topHotels.map((hotel, index) => (
            <HotelCard
              key={index}
              hotelName={hotel}
              countryName={country.name}
              theme={theme}
              customImageUrl={country.hotelImages?.[hotel]}
            />
          ))}
        </View>
      )}

      {/* Travel Tips Section */}
      {(country.bestTimeToVisit || country.visaRequired) && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Travel Tips</Text>
          <View style={[styles.infoCard, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border
          }]}>
            {country.bestTimeToVisit && (
              <View style={styles.infoRow}>
                <Ionicons name="sunny" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Best Time to Visit</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.bestTimeToVisit}</Text>
                </View>
              </View>
            )}
            {country.visaRequired && (
              <View style={styles.infoRow}>
                <Ionicons name="document-text" size={20} color={theme.primary} />
                <View style={styles.infoTextContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>Visa Requirements</Text>
                  <Text style={[styles.infoText, { color: theme.text }]}>{country.visaRequired}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
        <Image source={ferdiLogo} style={styles.footerLogo} resizeMode="contain" />
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
  countryName: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  countryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 5,
  },
  countryFlag: {
    fontSize: 36,
  },
  continent: {
    fontSize: 18,
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    justifyContent: 'space-around',
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 15,
    marginTop: -10,
  },
  rankingCard: {
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
  },
  rankingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  rankingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingBar: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  rankingFill: {
    height: '100%',
    borderRadius: 5,
  },
  rankingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankingScore: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rankingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  rankingNote: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 5,
  },
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    gap: 10,
  },
  highlightText: {
    fontSize: 16,
    flex: 1,
  },
  infoCard: {
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  subsectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  listItem: {
    fontSize: 14,
    marginBottom: 6,
    marginLeft: 26,
  },
  costInfo: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginLeft: 26,
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
