import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import { countryCoordinates } from '../utils/coordinates';

const { width } = Dimensions.get('window');

export default function SpinningGlobe({ completedTrips = [], visitedCities = [] }) {
  // Convert countries to red markers with labels - look up coordinates by country name
  const countryMarkers = useMemo(() => {
    return completedTrips.map((trip) => {
      const countryName = trip.country || trip.name || '';
      const coords = countryCoordinates[countryName] || { latitude: 0, longitude: 0 };

      return {
        lat: trip.latitude || coords.latitude || 0,
        lng: trip.longitude || coords.longitude || 0,
        label: countryName,
        color: '#ff4444', // Red for countries
        size: 0.6, // Larger markers for countries
        type: 'country',
      };
    }).filter(marker => marker.lat !== 0 || marker.lng !== 0); // Filter out markers with no coordinates
  }, [completedTrips]);

  // Convert cities to blue markers with labels
  const cityMarkers = useMemo(() => {
    return visitedCities.map((city) => {
      const countryName = city.country || '';
      const coords = countryCoordinates[countryName] || { latitude: 0, longitude: 0 };

      return {
        lat: city.latitude || coords.latitude || 0,
        lng: city.longitude || coords.longitude || 0,
        label: city.city || city.name || 'City',
        color: '#3b82f6', // Blue for cities
        size: 0.4, // Smaller markers for cities
        type: 'city',
      };
    }).filter(marker => marker.lat !== 0 || marker.lng !== 0);
  }, [visitedCities]);

  // Combine all markers
  const allMarkers = [...countryMarkers, ...cityMarkers];

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
    .marker-label {
      color: #fff;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      white-space: nowrap;
      pointer-events: none;
      text-shadow: 0 0 4px rgba(0,0,0,0.8);
    }
    .country-label {
      background-color: rgba(255, 68, 68, 0.9);
    }
    .city-label {
      background-color: rgba(59, 130, 246, 0.9);
      font-size: 10px;
    }
  </style>
  <script src="https://unpkg.com/three@0.150.0/build/three.min.js"></script>
  <script src="https://unpkg.com/globe.gl@2.26.0/dist/globe.gl.min.js"></script>
</head>
<body>
  <div id="globeViz"></div>
  <script>
    const markerData = ${JSON.stringify(allMarkers)};

    const world = Globe()
      (document.getElementById('globeViz'))
      .globeImageUrl('https://unpkg.com/three-globe@2.27.2/example/img/earth-blue-marble.jpg')
      .backgroundColor('#000000')
      .atmosphereColor('#4ade80')
      .atmosphereAltitude(0.15)
      .pointsData(markerData)
      .pointAltitude(0.01)
      .pointColor(d => d.color)
      .pointRadius(d => d.size)
      .pointResolution(12)
      // Add labels using HTML elements
      .htmlElementsData(markerData)
      .htmlElement(d => {
        const el = document.createElement('div');
        el.innerHTML = d.label;
        el.className = 'marker-label ' + (d.type === 'country' ? 'country-label' : 'city-label');
        el.style.pointerEvents = 'none';
        return el;
      })
      .htmlAltitude(0.02);

    // Auto-rotate
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.8;
    world.controls().enableZoom = false;

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
    <View style={styles.container}>
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
  webview: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
