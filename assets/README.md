# Assets Directory

This directory contains all the static assets for the Travel Planner App.

## ℹ️ Assets Not Required for Development

**Good news!** The app is configured to work without custom assets during development. Expo will use default placeholders automatically.

## Optional: Create Custom Assets for Production

If you want to add custom branding, create these image files:

### App Icons (Optional)
- **icon.png** - 1024x1024px - Main app icon
- **adaptive-icon.png** - 1024x1024px - Android adaptive icon (foreground)
- **favicon.png** - 48x48px - Web favicon
- **splash.png** - 1284x2778px - Splash screen image

## How to Add Custom Icons

### Method 1: Using an Image Editor
1. Create images with dimensions listed above
2. Save them in this `assets/` directory
3. Update `app.json` to reference them

### Method 2: Using Online Tools
- [Canva](https://www.canva.com/) - Free design tool
- [Figma](https://www.figma.com/) - Professional design
- [Icon Kitchen](https://icon.kitchen/) - App icon generator

### Method 3: Using Expo's Icon Generator
```bash
# Install the tool
npm install -g @expo/icon-generator

# Generate icons from a single image
npx @expo/icon-generator --icon path/to/your-icon.png
```

## Design Guidelines

When creating custom assets, use the app's color scheme:
- **Background**: #0a0a0a (black)
- **Primary**: #4ade80 (green)
- **Icon concept**: Globe, airplane, or travel-related symbol
- **Style**: Minimalist, modern, high contrast

## Updating app.json

If you add custom icons, update `app.json`:

```json
{
  "expo": {
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#0a0a0a"
      }
    },
    "web": {
      "favicon": "./assets/favicon.png"
    }
  }
}
```

## Current Status

✅ **App configured to work without custom assets**
✅ **Expo will provide default icons automatically**
✅ **Ready to run on iOS and Android**

For now, just focus on running and testing the app. Add custom assets when you're ready to publish!
