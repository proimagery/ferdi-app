# Ferdi - Travel Planner App

A comprehensive React Native mobile application built with Expo for travel planning, tracking, and social connectivity with fellow travelers.

## Version 1.0.8

## Features

### Trip Planning & Management
- Create and manage multiple trips with detailed itineraries
- Add multiple countries per trip with date ranges
- Set and track budgets for each trip
- View detailed trip information with interactive maps

### Budget Management
- Create custom budget categories
- Quick-add preset categories (Accommodation, Food, Transport, etc.)
- Track expenses in real-time
- Visual progress indicators with over-budget warnings
- Multi-currency support

### Travel Tracking & Visualization
- Log completed trips and visited cities
- Interactive 3D spinning globe with country/city markers
- Shareable stats cards with travel achievements
- World map visualization with Google Maps integration
- Track world coverage percentage by country and continent

### Social Features
- User authentication (email/password and guest mode)
- Public user profiles with travel photos
- Search for other travelers by username or name
- Travel buddies system (send/receive friend requests)
- Global leaderboard ranking travelers by countries visited
- Profile customization with avatar presets or custom photos

### Statistics & Rankings
- Comprehensive travel statistics dashboard
- Traveler rank system (Novice to Legendary Explorer)
- World ranking comparison
- Country and city visit tracking
- Continent coverage breakdown

## Tech Stack

- **Expo SDK 54** - Development platform
- **React Native 0.81** - Mobile framework
- **React Navigation 7** - Navigation with native stack
- **Supabase** - Backend (auth, database, storage)
- **React Native Maps** - Map visualization
- **React Native WebView** - 3D globe rendering
- **Globe.gl / Three.js** - Interactive 3D globe
- **Expo Image Picker** - Photo uploads
- **Expo File System** - Local file management

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your mobile device
- Supabase project (for backend features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/proimagery/ferdi-app.git
cd ferdi-app
```

2. Install dependencies:
```bash
npm install
```

3. Configure Supabase:
   - Create a Supabase project at https://supabase.com
   - Run the SQL schemas in `supabase/` folder
   - Update `lib/supabase.js` with your project credentials

4. Start the development server:
```bash
npx expo start
```

5. Scan the QR code with:
   - **iOS**: Camera app or Expo Go
   - **Android**: Expo Go app

## Project Structure

```
ferdi-app/
├── App.js                      # Main app with navigation setup
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json                # Dependencies
├── assets/                     # App icons, images, logos
├── components/                 # Reusable components
│   ├── Avatar.js              # User avatar with fallbacks
│   ├── SpinningGlobe.js       # 3D interactive globe
│   ├── ShareableStatsCard.js  # Downloadable stats image
│   └── AuthPromptModal.js     # Authentication modal
├── context/                    # React Context providers
│   ├── AppContext.js          # App state management
│   ├── AuthContext.js         # Authentication state
│   └── ThemeContext.js        # Dark/light theme
├── hooks/                      # Custom React hooks
│   └── useAuthGuard.js        # Auth protection hook
├── lib/                        # External service configs
│   └── supabase.js            # Supabase client
├── screens/                    # All app screens
│   ├── HomeScreen.js          # Landing page with globe background
│   ├── DashboardScreen.js     # Main dashboard
│   ├── MyTripsScreen.js       # Trip list management
│   ├── CreateTripScreen.js    # Trip creation wizard
│   ├── TripDetailScreen.js    # Trip details and editing
│   ├── BudgetMakerScreen.js   # Budget category setup
│   ├── MyBudgetScreen.js      # Expense tracking
│   ├── TravelMapperScreen.js  # Interactive world map
│   ├── AddCompletedTripScreen.js  # Log visited countries
│   ├── YourStatsScreen.js     # Personal statistics
│   ├── WorldRankScreen.js     # Country rankings
│   ├── CountryDetailScreen.js # Country information
│   ├── LeaderboardScreen.js   # Global traveler rankings
│   ├── SearchScreen.js        # Find other travelers
│   ├── TravelBuddiesScreen.js # Friend management
│   ├── PublicProfileScreen.js # User profiles
│   ├── EditProfileScreen.js   # Profile editing
│   ├── SettingsScreen.js      # App settings
│   ├── LoginScreen.js         # Authentication
│   ├── SignupScreen.js        # Registration
│   └── ForgotPasswordScreen.js # Password recovery
├── supabase/                   # Database schemas
│   ├── schema.sql             # Main tables
│   ├── schema_social.sql      # Social features
│   ├── schema_username.sql    # Username system
│   ├── schema_storage.sql     # Photo storage
│   └── schema_leaderboard.sql # Leaderboard policies
└── utils/                      # Utility functions
    ├── coordinates.js         # Country coordinates
    ├── presetAvatars.js       # Avatar emoji presets
    ├── avatarHelper.js        # Avatar utilities
    ├── rankingSystem.js       # Traveler rank logic
    ├── imageUpload.js         # Cloud photo uploads
    └── notifications.js       # Push notifications
```

## Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Open on Android emulator/device
- `npm run ios` - Open on iOS simulator/device
- `npm run web` - Open in web browser

## Building for App Stores

### iOS (App Store)
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

### Android (Google Play)
```bash
eas build --platform android --profile production
eas submit --platform android
```

## Design

- **Theme**: Dark mode with sleek black background (#0a0a0a)
- **Accent Color**: Vibrant green (#4ade80)
- **Typography**: Bold headings with clear hierarchy
- **Components**: Native feel with smooth animations
- **Navigation**: Intuitive stack navigation with gestures
- **3D Globe**: Interactive WebGL globe with country markers

## Database Schema

The app uses Supabase with the following main tables:
- `profiles` - User profiles and settings
- `trips` - Planned trips
- `trip_countries` - Countries in each trip
- `completed_trips` - Visited countries
- `budgets` - Budget plans
- `budget_categories` - Expense categories
- `travel_buddies` - Friend connections
- `buddy_requests` - Pending friend requests

## Recent Updates (v1.0.8)

- Full-screen spinning globe background on landing page
- Fixed Dashboard back navigation to always go to landing page
- Global leaderboard showing all app users
- Avatar placeholder icons for users without photos
- Cloud photo storage via Supabase Storage
- Guest mode session isolation
- Various UI/UX improvements

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## License

This project is proprietary software owned by Pro Imagery.

## Support

For issues or questions:
- GitHub Issues: https://github.com/proimagery/ferdi-app/issues
- Expo Documentation: https://docs.expo.dev/
- Supabase Documentation: https://supabase.com/docs

---

**Built with React Native, Expo & Supabase**

*Happy Travels!*
