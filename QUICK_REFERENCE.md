# Quick Reference Card

One-page reference for the Travel Planner App.

## 🚀 Quick Start

```bash
npm install    # Install dependencies
npm start      # Start development server
# Scan QR code with Expo Go app
```

## 📂 Project Structure

```
TravelPlannerApp/
├── App.js              # Main app + navigation
├── screens/            # 11 screen components
├── assets/             # Icons and images
└── *.md                # Documentation files
```

## 🎨 Color Palette

| Name | Hex | Usage |
|------|-----|-------|
| Background | `#0a0a0a` | Main background |
| Card | `#1a1a1a` | Cards, inputs |
| Border | `#2a2a2a` | Borders |
| Primary | `#4ade80` | Buttons, accents |
| Text | `#ffffff` | Primary text |
| Subtext | `#888888` | Secondary text |

## 📱 Screen Navigation

```
Home → Dashboard → Features:
  • My Trips → Create Trip → Trip Detail
  • Budget Maker
  • My Budget
  • Travel Mapper → Add Completed Trip
  • Your Stats
  • World Bank → Country Detail
```

## 🔧 Key Commands

| Command | Action |
|---------|--------|
| `npm start` | Start dev server |
| `r` | Reload app |
| `m` | Toggle menu |
| `c` | Clear cache |
| `i` | iOS simulator |
| `a` | Android emulator |

## 📊 Data Models

**Trip**
```javascript
{ name, countries: [{name, startDate, endDate}], budget }
```

**Budget Category**
```javascript
{ name, budgetAmount, spent, icon, color }
```

**Completed Trip**
```javascript
{ country, date }
```

## 🎯 Core Features

1. **Trip Planning** - Create multi-country trips with dates and budgets
2. **Budget Tracking** - Categories, expenses, progress bars
3. **Travel Mapping** - Interactive world map with markers
4. **Statistics** - Comprehensive travel analytics
5. **Exploration** - Country rankings and details

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Metro stuck | `expo start -c` |
| Module error | `rm -rf node_modules && npm install` |
| QR won't scan | Press `t` for tunnel mode |
| Map not showing | Use real device/simulator |

## 📚 Documentation

- **README.md** - Full documentation
- **QUICKSTART.md** - 3-step guide
- **INSTALLATION.md** - Setup details
- **DEVELOPMENT.md** - Dev guide
- **CHECKLIST.md** - Testing checklist

## 🔗 Resources

- Expo: https://docs.expo.dev/
- React Navigation: https://reactnavigation.org/
- React Native: https://reactnative.dev/

## ⚡ Pro Tips

- Shake device for dev menu
- Use `console.log()` for debugging
- Test on real devices for best experience
- Check console for errors
- Read error messages carefully

---

**Version:** 1.0.0
**Status:** ✅ Production Ready
