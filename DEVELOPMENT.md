# Development Guide

Technical documentation for developers working on the Travel Planner App.

## Architecture Overview

### State Management

The app uses React hooks for state management:

- **useState** - Local component state
- **useEffect** - Side effects and lifecycle
- **Route params** - Data passing between screens

Currently, there's NO global state manager (Redux/Context). Data flows through:
1. Route parameters (navigation.navigate with params)
2. Callback functions passed via route params
3. Re-fetching from route.params on screen focus

### Navigation Structure

```
HomeScreen (no header)
  └─> DashboardScreen
       ├─> MyTripsScreen
       │    ├─> CreateTripScreen
       │    └─> TripDetailScreen
       ├─> BudgetMakerScreen
       ├─> MyBudgetScreen
       ├─> TravelMapperScreen
       │    └─> AddCompletedTripScreen
       ├─> YourStatsScreen
       └─> WorldBankScreen
            └─> CountryDetailScreen
```

### Screen Responsibilities

#### HomeScreen.js
- Welcome screen with animated globe
- Entry point to Dashboard
- Uses Animated API for floating animation

#### DashboardScreen.js
- Main hub with 6 feature cards
- Navigation to all major features
- Grid layout with icon cards

#### MyTripsScreen.js
- Lists all created trips
- Floating Action Button (FAB) to create trips
- Delete functionality per trip
- Empty state when no trips

#### CreateTripScreen.js
- 3-step wizard: Name → Countries → Budget
- Dynamic country list (add/remove)
- Form validation at each step
- Progress indicator dots

#### TripDetailScreen.js
- Read-only view of trip details
- Shows budget, countries, and dates
- Icon-based visual design

#### BudgetMakerScreen.js
- Create budget categories
- Preset templates (6 common categories)
- Custom category creation
- Manages category list

#### MyBudgetScreen.js
- Expense tracking per category
- Visual progress bars
- Color-coded warnings (green/yellow/red)
- Summary card with totals
- Alert.prompt for adding expenses

#### TravelMapperScreen.js
- React Native Maps integration
- Displays visited countries as markers
- Country coordinates from lookup table
- Stats overlay card
- FAB to add completed trips

#### AddCompletedTripScreen.js
- Simple form: country name + optional year
- Adds to completed trips list
- Navigates back with updated data

#### YourStatsScreen.js
- Aggregated statistics display
- Calculates totals from trips data
- World coverage percentage
- Continent tracking
- Milestone badges

#### WorldBankScreen.js
- Hardcoded list of top 10 countries
- Rank badges with colors
- Navigates to country details

#### CountryDetailScreen.js
- Shows country information
- Highlights and attractions
- Travel tips section

## Data Models

### Trip Object
```javascript
{
  name: String,           // Trip name
  countries: [            // Array of country objects
    {
      name: String,       // Country name
      startDate: String,  // Optional start date
      endDate: String     // Optional end date
    }
  ],
  budget: Number          // Total trip budget
}
```

### Budget Category Object
```javascript
{
  name: String,           // Category name
  budgetAmount: Number,   // Allocated budget
  spent: Number,          // Amount spent
  icon: String,           // Ionicons icon name
  color: String           // Hex color code
}
```

### Completed Trip Object
```javascript
{
  country: String,        // Country name
  date: String            // Year visited
}
```

### Country Object (World Bank)
```javascript
{
  name: String,           // Country name
  rank: Number,           // World rank
  visitors: String,       // Annual visitors (formatted)
  continent: String,      // Continent name
  highlights: [String]    // Array of attractions
}
```

## Styling Patterns

### Color Palette
```javascript
background: '#0a0a0a'     // Pure black
card: '#1a1a1a'           // Dark gray cards
border: '#2a2a2a'         // Card borders
primary: '#4ade80'        // Green accent
text: '#ffffff'           // White text
subtext: '#888888'        // Gray text
error: '#ef4444'          // Red
warning: '#fbbf24'        // Yellow/Gold
```

### Common Styles
- Border radius: 10-15px for cards
- Padding: 15-20px standard
- Gap: 10px for flexbox spacing
- Font sizes: 14 (small), 16 (normal), 18-20 (subtitle), 24-32 (title)

### Component Patterns

**Card Container:**
```javascript
{
  backgroundColor: '#1a1a1a',
  borderRadius: 15,
  padding: 20,
  borderWidth: 1,
  borderColor: '#2a2a2a',
}
```

**Button (Primary):**
```javascript
{
  backgroundColor: '#4ade80',
  padding: 15,
  borderRadius: 10,
  alignItems: 'center',
}
```

**Input Field:**
```javascript
{
  backgroundColor: '#1a1a1a',
  borderWidth: 1,
  borderColor: '#2a2a2a',
  borderRadius: 10,
  padding: 15,
  color: '#ffffff',
}
```

## Best Practices

### State Updates
Always create new arrays/objects when updating state:
```javascript
// Good
const newTrips = [...trips, newTrip];
setTrips(newTrips);

// Bad (mutates state)
trips.push(newTrip);
setTrips(trips);
```

### Navigation with Data
Pass updated data back through navigation:
```javascript
navigation.navigate('ScreenName', {
  updatedData: newData
});
```

Listen for updates in useEffect:
```javascript
React.useEffect(() => {
  if (route.params?.updatedData) {
    setLocalState(route.params.updatedData);
  }
}, [route.params?.updatedData]);
```

### Form Validation
Always validate before state updates:
```javascript
if (!input.trim()) {
  Alert.alert('Error', 'Field is required');
  return;
}
```

### Icon Usage
Use Ionicons consistently:
- Outlined icons for inactive states
- Filled icons for active states
- Size 20-24 for inline, 32+ for featured

## Adding New Features

### Add a New Screen

1. Create screen file in `/screens/`:
```javascript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function NewScreen({ navigation, route }) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>New Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  text: {
    color: '#ffffff',
  },
});
```

2. Import in App.js:
```javascript
import NewScreen from './screens/NewScreen';
```

3. Add to Stack.Navigator:
```javascript
<Stack.Screen
  name="NewScreen"
  component={NewScreen}
  options={{ title: 'New Screen' }}
/>
```

4. Navigate to it:
```javascript
navigation.navigate('NewScreen');
```

### Add Data Persistence

Use AsyncStorage for permanent storage:

```bash
expo install @react-native-async-storage/async-storage
```

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save
await AsyncStorage.setItem('trips', JSON.stringify(trips));

// Load
const stored = await AsyncStorage.getItem('trips');
const trips = stored ? JSON.parse(stored) : [];
```

## Performance Optimization

### Current Performance
- Simple list rendering (ScrollView)
- No memoization
- Direct state updates

### Recommended Improvements

1. **Use FlatList for long lists:**
```javascript
<FlatList
  data={trips}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => <TripCard trip={item} />}
/>
```

2. **Memoize expensive components:**
```javascript
const MemoizedCard = React.memo(TripCard);
```

3. **Use callbacks properly:**
```javascript
const handlePress = useCallback(() => {
  navigation.navigate('Screen');
}, [navigation]);
```

## Testing Recommendations

### Manual Testing Checklist
- [ ] Create trip with multiple countries
- [ ] Edit/delete trips
- [ ] Create budget categories
- [ ] Add expenses and check calculations
- [ ] Log completed trips
- [ ] Verify map markers appear
- [ ] Check statistics calculations
- [ ] Navigate to country details

### Automated Testing (Future)
- Unit tests for calculations
- Integration tests for navigation
- Snapshot tests for UI components
- E2E tests with Detox

## Common Issues

### Maps not loading
- Check API key configuration
- Verify react-native-maps installation
- Check device location permissions

### Navigation state loss
- Data isn't persisted (use AsyncStorage)
- Route params need proper structure
- Use useEffect to catch param updates

### Styling inconsistencies
- Check device text scaling settings
- Test on multiple screen sizes
- Use relative sizing (flexbox, percentages)

## Resources

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Ionicons](https://ionic.io/ionicons)

## Code Style

- Use functional components (no classes)
- Use hooks for state and effects
- Keep components focused (single responsibility)
- Extract reusable logic into custom hooks
- Comment complex logic
- Use meaningful variable names

## Git Workflow (Recommended)

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

---

Happy coding! If you have questions, check the code comments or Expo/React Native docs.
