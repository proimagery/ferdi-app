# Quick Start Guide

Get the Travel Planner App running in 3 simple steps!

## Step 1: Install Dependencies

```bash
cd TravelPlannerApp
npm install
```

This installs all required packages including React Navigation, Expo, and React Native Maps.

## Step 2: Start the App

```bash
npm start
```

This launches the Expo development server and displays a QR code.

## Step 3: Run on Your Device

### For iOS (iPhone/iPad):
1. Install **Expo Go** from the App Store
2. Open the Camera app
3. Scan the QR code
4. Tap the notification to open in Expo Go

### For Android:
1. Install **Expo Go** from the Play Store
2. Open Expo Go app
3. Scan the QR code from within the app
4. App will load automatically

### For Emulator/Simulator:
- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

## First Time Using the App?

### Try These Features:

1. **Create Your First Trip**
   - From Dashboard → My Trips
   - Tap the + button
   - Follow the 3-step wizard

2. **Set Up Your Budget**
   - From Dashboard → Budget Maker
   - Use quick presets or create custom categories

3. **Track Your Travels**
   - From Dashboard → Travel Mapper
   - Add countries you've visited
   - See them on the world map

4. **Explore Destinations**
   - From Dashboard → World Bank
   - Browse top tourist destinations
   - View country details

## Troubleshooting

**QR code not scanning?**
- Use the tunnel connection: Press `t` in the terminal

**Metro bundler error?**
- Clear cache: `expo start -c`

**Module not found?**
- Reinstall: `rm -rf node_modules && npm install`

**App crashes on startup?**
- Check Node version: `node -v` (should be 14+)
- Update Expo CLI: `npm install -g expo-cli`

## Tips

- Shake your device to open the developer menu
- Use `r` in terminal to reload the app
- Use `m` to toggle menu

That's it! You're ready to start planning your travels! 🌍✈️
