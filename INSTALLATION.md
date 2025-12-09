# Installation & Setup Guide

Complete guide to get the Travel Planner App running on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

1. **Node.js** (v14 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node -v`

2. **npm** (comes with Node.js)
   - Verify installation: `npm -v`

3. **Expo CLI** (globally installed)
   ```bash
   npm install -g expo-cli
   ```
   - Verify installation: `expo --version`

4. **Mobile Device with Expo Go**
   - iOS: Install from App Store
   - Android: Install from Play Store

### Optional (for emulator/simulator)

- **Android Studio** - For Android emulator
- **Xcode** - For iOS simulator (Mac only)

## Installation Steps

### 1. Navigate to Project Directory

```bash
cd TravelPlannerApp
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- expo (~51.0.0)
- react & react-native
- @react-navigation/native
- @react-navigation/native-stack
- react-native-maps
- react-native-safe-area-context
- react-native-screens
- @expo/vector-icons

**Expected installation time:** 2-5 minutes

### 3. Verify Installation

Check that package.json dependencies are installed:
```bash
npm list --depth=0
```

You should see all packages listed in package.json.

## Running the App

### Method 1: Physical Device (Recommended)

1. Start the development server:
   ```bash
   npm start
   ```

2. A QR code will appear in the terminal

3. Scan the QR code:
   - **iOS**: Use the Camera app, then tap the notification
   - **Android**: Open Expo Go app and use the built-in scanner

4. Wait for the bundle to load (first time may take 1-2 minutes)

### Method 2: iOS Simulator (Mac Only)

1. Install Xcode from Mac App Store
2. Install Xcode Command Line Tools
3. Start the app:
   ```bash
   npm start
   ```
4. Press `i` in the terminal
5. Simulator will launch automatically

### Method 3: Android Emulator

1. Install Android Studio
2. Create an AVD (Android Virtual Device)
3. Start the emulator
4. Start the app:
   ```bash
   npm start
   ```
5. Press `a` in the terminal

### Method 4: Web Browser

```bash
npm run web
```

**Note:** Maps functionality may be limited in web mode.

## Troubleshooting

### Common Issues

#### Issue: "npm: command not found"
**Solution:** Install Node.js from nodejs.org

#### Issue: "expo: command not found"
**Solution:**
```bash
npm install -g expo-cli
```

#### Issue: Dependencies installation fails
**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

#### Issue: Metro bundler stuck at "Building JavaScript bundle"
**Solution:**
```bash
# Stop the server (Ctrl+C) and restart with cache clear
expo start -c
```

#### Issue: "Error: Unable to resolve module..."
**Solution:**
```bash
# Reset Metro bundler cache
expo start -c

# Or restart with fresh install
rm -rf node_modules
npm install
expo start
```

#### Issue: QR code won't scan
**Solution:**
- Use tunnel mode: Press `t` in terminal
- Ensure phone and computer are on same WiFi
- Try typing the URL manually in Expo Go

#### Issue: "Network response timed out"
**Solution:**
- Check firewall settings
- Ensure ports 19000-19006 are not blocked
- Try tunnel mode: `expo start --tunnel`

#### Issue: Maps not displaying
**Solution:**
- Maps require real device or simulator
- Web version has limited map support
- Check that react-native-maps installed correctly

## Configuration Files

### package.json
Contains all dependencies and scripts. Do not modify unless adding new packages.

### app.json
Expo configuration file. Modify for:
- App name
- Bundle identifiers
- Icon/splash screen paths
- Permissions

### babel.config.js
Babel configuration. Usually no changes needed.

## Development Tips

### Hot Reload
The app automatically reloads when you save changes to files.

### Developer Menu
- **Shake device** - Open developer menu
- **iOS Simulator**: Cmd+D
- **Android Emulator**: Cmd+M (Mac) or Ctrl+M (Windows)

### Useful Commands in Terminal

While the dev server is running:
- `r` - Reload app
- `m` - Toggle developer menu
- `c` - Clear cache and reload
- `d` - Open developer tools
- `i` - Open iOS simulator
- `a` - Open Android emulator
- `w` - Open web browser

## Next Steps

Once the app is running:

1. **Explore the App**
   - Navigate through all screens
   - Create a sample trip
   - Add budget categories
   - Log completed trips

2. **Read Documentation**
   - [README.md](README.md) - Full feature overview
   - [QUICKSTART.md](QUICKSTART.md) - Quick user guide
   - [DEVELOPMENT.md](DEVELOPMENT.md) - Developer guide

3. **Start Developing**
   - Modify screens in `/screens` folder
   - Update styles to match your preferences
   - Add new features as needed

## Production Build

To create a production build:

### Android APK
```bash
expo build:android
```

### iOS IPA
```bash
expo build:ios
```

**Note:** You'll need Apple Developer account for iOS builds.

## Environment

- **Development**: Uses Expo Go for quick testing
- **Production**: Requires standalone builds for app stores

## Support

If you encounter issues:

1. Check this guide first
2. Review error messages carefully
3. Search Expo documentation: https://docs.expo.dev/
4. Check React Native docs: https://reactnative.dev/
5. Search Stack Overflow for specific errors

## Additional Resources

- Expo Documentation: https://docs.expo.dev/
- React Native: https://reactnative.dev/
- React Navigation: https://reactnavigation.org/
- Expo Forums: https://forums.expo.dev/

---

**Installation complete!** You're ready to start using and developing the Travel Planner App! 🚀
