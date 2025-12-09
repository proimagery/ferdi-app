# Travel Planner App

A fully-functional React Native mobile application built with Expo for comprehensive travel planning and tracking.

## Features

### Trip Planning
- Create and manage multiple trips
- Add multiple countries per trip with dates
- Set and track budgets for each trip
- View detailed trip information

### Budget Management
- Create custom budget categories
- Quick-add preset categories (Accommodation, Food, Transport, etc.)
- Track expenses in real-time
- Visual progress indicators with over-budget warnings

### Travel Tracking
- Log completed trips
- View comprehensive travel statistics
- Interactive world map visualization
- Country visit tracking with world coverage percentage

### Exploration Tools
- Browse world country rankings
- View detailed country information
- Discover top attractions
- Access travel tips and information

## Tech Stack

- **Expo SDK 51** - Development platform
- **React Native** - Mobile framework
- **React Navigation 6** - Navigation
- **React Native Maps** - Map visualization
- **Expo Vector Icons** - Icon library

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device

### Installation

1. Navigate to the project directory:
```bash
cd TravelPlannerApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

## Project Structure

```
TravelPlannerApp/
├── App.js                          # Main app with navigation
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── babel.config.js                 # Babel config
├── screens/                        # All app screens
│   ├── HomeScreen.js              # Welcome screen
│   ├── DashboardScreen.js         # Main dashboard
│   ├── MyTripsScreen.js           # Trip list
│   ├── CreateTripScreen.js        # Trip creation
│   ├── TripDetailScreen.js        # Trip details
│   ├── BudgetMakerScreen.js       # Budget categories
│   ├── MyBudgetScreen.js          # Expense tracking
│   ├── TravelMapperScreen.js      # World map
│   ├── AddCompletedTripScreen.js  # Log past trips
│   ├── YourStatsScreen.js         # Statistics
│   ├── WorldBankScreen.js         # Country rankings
│   └── CountryDetailScreen.js     # Country info
└── assets/                         # App icons and images
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Open on Android emulator/device
- `npm run ios` - Open on iOS simulator/device
- `npm run web` - Open in web browser

## Key Features Explained

### Trip Creation (3-Step Process)
1. **Name Your Trip** - Give your trip a memorable name
2. **Add Countries** - Add multiple countries with date ranges
3. **Set Budget** - Define your total trip budget

### Budget Tracking
- Create categories with preset templates or custom names
- Add expenses to each category
- View real-time spending progress
- Get warnings when approaching or exceeding budget

### Travel Mapper
- Interactive world map powered by React Native Maps
- Visual markers for visited countries
- Track total countries visited
- Add completed trips directly from the map

### Statistics Dashboard
- Total completed trips
- Planned trips and countries
- Budget overview
- World coverage percentage
- Continents visited
- Travel milestones

## Design

- **Theme**: Dark mode with sleek black background (#0a0a0a)
- **Accent Color**: Vibrant green (#4ade80)
- **Typography**: Bold headings with clear hierarchy
- **Components**: Native feel with smooth animations
- **Navigation**: Intuitive stack navigation with gestures

## Known Limitations

1. **Data Persistence**: Currently uses in-memory storage (data resets on app close)
2. **Country Data**: Uses hardcoded sample country coordinates
3. **No Backend**: All processing happens client-side
4. **Limited Country Database**: Only includes popular destinations

## Future Enhancements

### High Priority
- [ ] Add AsyncStorage for data persistence
- [ ] Implement pull-to-refresh
- [ ] Add loading states and spinners
- [ ] Error boundaries and better error handling

### Feature Additions
- [ ] User authentication
- [ ] Cloud synchronization
- [ ] Photo uploads for trips
- [ ] Social sharing capabilities
- [ ] Receipt scanning for expenses
- [ ] Multi-currency support
- [ ] Offline mode
- [ ] Push notifications for trip reminders

### Technical Improvements
- [ ] TypeScript conversion
- [ ] Redux or Context API for global state
- [ ] GraphQL API integration
- [ ] Comprehensive test suite
- [ ] CI/CD pipeline

## Troubleshooting

### App won't start
- Clear Metro bundler cache: `expo start -c`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Map not displaying
- Check that react-native-maps is properly installed
- Ensure location permissions are granted
- For iOS, check Info.plist configuration

### Navigation issues
- Ensure all screens are properly imported in App.js
- Check navigation params are passed correctly

## Contributing

This is a learning project. Feel free to:
- Add new features
- Improve existing functionality
- Enhance the UI/UX
- Fix bugs
- Add tests

## License

This project is open source and available for educational purposes.

## Support

For issues or questions:
1. Check the documentation in this README
2. Review the code comments in individual files
3. Consult Expo documentation: https://docs.expo.dev/
4. Check React Navigation docs: https://reactnavigation.org/

---

**Built with React Native & Expo**

*Happy Travels!* ✈️🌍
