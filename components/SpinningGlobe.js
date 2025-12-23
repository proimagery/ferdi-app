import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { countryCoordinates } from '../utils/coordinates';

const { width } = Dimensions.get('window');

// Multi-color palette for markers
const markerColors = [
  '#ff4444', // Red
  '#4ade80', // Green
  '#3b82f6', // Blue
  '#f59e0b', // Orange/Amber
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#8b5cf6', // Violet
  '#22c55e', // Emerald
  '#eab308', // Yellow
];

// City marker colors (different from country colors)
const cityColors = [
  '#60a5fa', // Light Blue
  '#34d399', // Emerald
  '#fbbf24', // Amber
  '#f472b6', // Pink
  '#a78bfa', // Purple
  '#fb923c', // Orange
];

export default function SpinningGlobe({ completedTrips = [], visitedCities = [], onFullscreen, isFullscreen = false }) {
  // Convert countries to multi-colored markers with labels and visit info
  const countryMarkers = useMemo(() => {
    // Group trips by country to get all visit dates
    const countryVisits = {};
    completedTrips.forEach(trip => {
      const countryName = trip.country || trip.name || '';
      if (!countryName) return;
      if (!countryVisits[countryName]) {
        countryVisits[countryName] = [];
      }
      if (trip.date || trip.year) {
        countryVisits[countryName].push(trip.date || trip.year);
      }
    });

    return Object.keys(countryVisits).map((countryName, index) => {
      const coords = countryCoordinates[countryName] || { latitude: 0, longitude: 0 };
      const markerColor = markerColors[index % markerColors.length];
      const visits = countryVisits[countryName];

      // Count cities in this country
      const citiesInCountry = visitedCities.filter(c => c.country === countryName).length;

      return {
        lat: coords.latitude || 0,
        lng: coords.longitude || 0,
        label: countryName,
        color: markerColor,
        visits: visits.length > 0 ? visits : ['Date not recorded'],
        visitCount: visits.length || 1,
        cityCount: citiesInCountry,
        type: 'country',
      };
    }).filter(marker => marker.lat !== 0 || marker.lng !== 0);
  }, [completedTrips, visitedCities]);

  // Convert cities to colored dot markers (hidden by default, shown when country selected)
  const cityMarkers = useMemo(() => {
    return visitedCities.map((city, index) => {
      const cityColor = cityColors[index % cityColors.length];

      return {
        lat: city.latitude || 0,
        lng: city.longitude || 0,
        city: city.city || city.name || 'Unknown City',
        country: city.country || '',
        date: city.date || '',
        color: cityColor,
        size: 1.5,
        type: 'city',
      };
    }).filter(marker => marker.lat !== 0 || marker.lng !== 0);
  }, [visitedCities]);

  // Create HTML with globe.gl library
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    body { margin: 0; background: #000; overflow: hidden; }
    #globeViz { width: 100vw; height: 100vh; }

    .marker-container {
      position: relative;
      pointer-events: auto !important;
    }

    .marker-container.city-marker {
      display: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .marker-container.city-marker.visible {
      display: block;
      opacity: 1;
    }

    .marker-label {
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
      cursor: pointer;
      transition: transform 0.2s ease;
    }

    .marker-label:hover {
      transform: scale(1.05);
    }

    .marker-label.selected {
      transform: scale(1.1);
      box-shadow: 0 0 12px rgba(255,255,255,0.5);
    }

    .city-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 0 6px rgba(255,255,255,0.5);
      animation: cityAppear 0.3s ease-out;
    }

    @keyframes cityAppear {
      from { transform: scale(0); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .city-dot:hover {
      transform: scale(1.2);
    }

    .marker-popup {
      position: absolute;
      left: 50%;
      bottom: 100%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid;
      border-radius: 12px;
      padding: 12px 16px;
      color: #fff;
      min-width: 150px;
      max-width: 220px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.5);
      margin-bottom: 8px;
      display: none;
      z-index: 1000;
    }

    .marker-popup.active {
      display: block;
      animation: fadeIn 0.2s ease-out;
      z-index: 10000;
    }

    .marker-container:has(.marker-popup.active) {
      z-index: 10000 !important;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateX(-50%) scale(0.9); }
      to { opacity: 1; transform: translateX(-50%) scale(1); }
    }

    .popup-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
    }

    .popup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .popup-title {
      font-size: 14px;
      font-weight: bold;
      word-wrap: break-word;
    }

    .popup-subtitle {
      font-size: 11px;
      color: #9ca3af;
      margin-bottom: 4px;
    }

    .popup-info {
      font-size: 11px;
      color: #d1d5db;
    }

    .popup-close {
      position: absolute;
      top: 4px;
      right: 6px;
      cursor: pointer;
      font-size: 14px;
      color: #9ca3af;
      line-height: 1;
      padding: 2px;
    }

    .popup-close:hover {
      color: #fff;
    }

    .popup-visits {
      font-size: 11px;
      color: #d1d5db;
      margin-top: 4px;
    }

    .popup-visit-item {
      padding: 2px 0;
    }

    .popup-cities-hint {
      font-size: 10px;
      color: #4ade80;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .popup-cities-hint::before {
      content: '●';
      font-size: 8px;
    }
  </style>
  <script src="https://unpkg.com/three@0.150.0/build/three.min.js"></script>
  <script src="https://unpkg.com/globe.gl@2.26.0/dist/globe.gl.min.js"></script>
</head>
<body>
  <div id="globeViz"></div>
  <script>
    const countryData = ${JSON.stringify(countryMarkers)};
    const cityData = ${JSON.stringify(cityMarkers)};

    let popupOpen = false;
    let currentPopupEl = null;
    let world = null;
    let selectedCountry = null;
    let cityElements = {};

    // Close any open popup and hide cities
    function closeAllPopups(hideCities = true) {
      document.querySelectorAll('.marker-popup.active').forEach(p => {
        p.classList.remove('active');
        const container = p.closest('.marker-container');
        if (container) {
          container.style.zIndex = '';
        }
      });

      // Remove selected state from country labels
      document.querySelectorAll('.marker-label.selected').forEach(l => {
        l.classList.remove('selected');
      });

      popupOpen = false;
      currentPopupEl = null;

      if (hideCities) {
        // Hide all city markers
        document.querySelectorAll('.city-marker').forEach(c => {
          c.classList.remove('visible');
        });
        selectedCountry = null;
      }

      if (world && world.controls()) {
        world.controls().autoRotate = true;
      }
    }

    // Show cities for a specific country
    function showCitiesForCountry(countryName) {
      // First hide all cities
      document.querySelectorAll('.city-marker').forEach(c => {
        c.classList.remove('visible');
      });

      // Show cities for the selected country
      document.querySelectorAll('.city-marker').forEach(c => {
        if (c.dataset.country === countryName) {
          c.classList.add('visible');
        }
      });

      selectedCountry = countryName;
    }

    // Toggle popup for a country marker
    function toggleCountryPopup(popupEl, labelEl, countryName, cityCount, event) {
      event.stopPropagation();

      const wasActive = popupEl.classList.contains('active');
      const wasSelected = selectedCountry === countryName;

      // Close all popups but don't hide cities yet
      closeAllPopups(false);

      if (!wasActive) {
        popupEl.classList.add('active');
        labelEl.classList.add('selected');
        popupOpen = true;
        currentPopupEl = popupEl;

        const container = popupEl.closest('.marker-container');
        if (container) {
          container.style.zIndex = '10000';
        }

        // Show cities for this country
        if (cityCount > 0) {
          showCitiesForCountry(countryName);
        }

        if (world && world.controls()) {
          world.controls().autoRotate = false;
        }
      } else {
        // Clicking again hides cities
        document.querySelectorAll('.city-marker').forEach(c => {
          c.classList.remove('visible');
        });
        selectedCountry = null;
      }
    }

    // Toggle popup for a city marker
    function toggleCityPopup(popupEl, event) {
      event.stopPropagation();

      const wasActive = popupEl.classList.contains('active');

      // Close country popups but keep cities visible
      document.querySelectorAll('.marker-popup.active').forEach(p => {
        if (!p.closest('.city-marker')) {
          p.classList.remove('active');
          const container = p.closest('.marker-container');
          if (container) {
            container.style.zIndex = '';
          }
        }
      });
      document.querySelectorAll('.marker-label.selected').forEach(l => {
        l.classList.remove('selected');
      });

      // Close other city popups
      document.querySelectorAll('.city-marker .marker-popup.active').forEach(p => {
        if (p !== popupEl) {
          p.classList.remove('active');
          const container = p.closest('.marker-container');
          if (container) {
            container.style.zIndex = '';
          }
        }
      });

      if (!wasActive) {
        popupEl.classList.add('active');
        popupOpen = true;
        currentPopupEl = popupEl;

        const container = popupEl.closest('.marker-container');
        if (container) {
          container.style.zIndex = '10000';
        }

        if (world && world.controls()) {
          world.controls().autoRotate = false;
        }
      } else {
        popupOpen = false;
        currentPopupEl = null;
      }
    }

    // Close popup when clicking elsewhere on globe
    document.addEventListener('click', function(e) {
      if (!e.target.closest('.marker-container')) {
        closeAllPopups(true);
      }
    });

    // Build markers data - countries first, then cities
    const allMarkersData = [...countryData, ...cityData];

    world = Globe()
      (document.getElementById('globeViz'))
      .globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-blue-marble.jpg')
      .backgroundColor('#000000')
      .atmosphereColor('#4ade80')
      .atmosphereAltitude(0.15)
      .htmlElementsData(allMarkersData)
      .htmlElement(d => {
        const container = document.createElement('div');
        container.className = 'marker-container';

        if (d.type === 'country') {
          // Country label
          const label = document.createElement('div');
          label.className = 'marker-label';
          label.innerHTML = d.label;
          label.style.backgroundColor = d.color + 'e6';

          // Popup for country
          const popup = document.createElement('div');
          popup.className = 'marker-popup';
          popup.style.borderColor = d.color;

          let visitsHtml = '';
          if (d.visits && d.visits.length > 0) {
            visitsHtml = '<div class="popup-visits">' +
              d.visits.map(v => '<div class="popup-visit-item">• ' + v + '</div>').join('') +
              '</div>';
          }

          let citiesHint = '';
          if (d.cityCount > 0) {
            citiesHint = '<div class="popup-cities-hint">' + d.cityCount + ' ' + (d.cityCount === 1 ? 'city' : 'cities') + ' visited</div>';
          }

          popup.innerHTML =
            '<span class="popup-close">&times;</span>' +
            '<div class="popup-header">' +
              '<div class="popup-dot" style="background-color: ' + d.color + ';"></div>' +
              '<span class="popup-title">' + d.label + '</span>' +
            '</div>' +
            '<div class="popup-subtitle">Visited ' + d.visitCount + ' time' + (d.visitCount > 1 ? 's' : '') + '</div>' +
            visitsHtml +
            citiesHint;

          popup.querySelector('.popup-close').addEventListener('click', function(e) {
            e.stopPropagation();
            closeAllPopups(true);
          });

          label.addEventListener('click', function(e) {
            toggleCountryPopup(popup, label, d.label, d.cityCount, e);
          });

          container.appendChild(popup);
          container.appendChild(label);
        } else {
          // City marker (hidden by default)
          container.classList.add('city-marker');
          container.dataset.country = d.country;

          const dot = document.createElement('div');
          dot.className = 'city-dot';
          dot.style.backgroundColor = d.color;

          // Popup for city
          const popup = document.createElement('div');
          popup.className = 'marker-popup';
          popup.style.borderColor = d.color;

          popup.innerHTML =
            '<span class="popup-close">&times;</span>' +
            '<div class="popup-header">' +
              '<div class="popup-dot" style="background-color: ' + d.color + ';"></div>' +
              '<span class="popup-title">' + d.city + '</span>' +
            '</div>' +
            '<div class="popup-subtitle">' + d.country + '</div>' +
            '<div class="popup-info">Visited: ' + (d.date || 'Date not recorded') + '</div>';

          popup.querySelector('.popup-close').addEventListener('click', function(e) {
            e.stopPropagation();
            // Just close this popup, keep cities visible
            popup.classList.remove('active');
            container.style.zIndex = '';
            popupOpen = false;
            currentPopupEl = null;
          });

          dot.addEventListener('click', function(e) {
            toggleCityPopup(popup, e);
          });

          container.appendChild(popup);
          container.appendChild(dot);
        }

        return container;
      })
      .htmlAltitude(0.02);

    // Auto-rotate
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = ${isFullscreen ? 0.5 : 0.8};
    world.controls().enableZoom = ${isFullscreen ? 'true' : 'false'};
    ${isFullscreen ? `
    world.controls().minDistance = 120;
    world.controls().maxDistance = 500;
    world.controls().zoomSpeed = 0.8;
    world.controls().rotateSpeed = 0.8;

    // Stop auto-rotate when user interacts
    let interactionTimeout;
    const stopAutoRotate = () => {
      world.controls().autoRotate = false;
      clearTimeout(interactionTimeout);
      interactionTimeout = setTimeout(() => {
        // Only resume auto-rotate if popup is not open
        if (!popupOpen) {
          world.controls().autoRotate = true;
        }
      }, 3000);
    };
    document.getElementById('globeViz').addEventListener('pointerdown', stopAutoRotate);
    ` : ''}

    // Set initial view
    world.pointOfView({ altitude: 2.5 });

    // Animate
    (function animate() {
      requestAnimationFrame(animate);
    })();
  </script>
</body>
</html>
  `;

  return (
    <View style={isFullscreen ? styles.fullscreenContainer : styles.container}>
      <View style={styles.webviewWrapper}>
        <WebView
          source={{ html }}
          style={styles.webview}
          scrollEnabled={false}
          bounces={false}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          scalesPageToFit={true}
          originWhitelist={['*']}
        />
      </View>
      {!isFullscreen && onFullscreen && (
        <TouchableOpacity style={styles.fullscreenButton} onPress={onFullscreen} activeOpacity={0.7}>
          <Ionicons name="expand" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: width - 40,
    height: 350,
    backgroundColor: '#000000',
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
  },
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  webviewWrapper: {
    ...StyleSheet.absoluteFillObject,
  },
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
  fullscreenButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(74, 222, 128, 0.9)',
    borderRadius: 8,
    padding: 8,
    zIndex: 10,
    elevation: 10,
  },
});
