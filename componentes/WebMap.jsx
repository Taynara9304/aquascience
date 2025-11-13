// componentes/WebMap.jsx
import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';

const WebMap = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Detectar se é dispositivo móvel
    const checkIfMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    };
    
    setIsMobile(checkIfMobile());
    
    const loadLeaflet = () => {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      if (window.L) {
        initMap();
        return;
      }

      const leafletCss = document.createElement('link');
      leafletCss.rel = 'stylesheet';
      leafletCss.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
      document.head.appendChild(leafletCss);

      const leafletJs = document.createElement('script');
      leafletJs.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
      leafletJs.onload = initMap;
      document.head.appendChild(leafletJs);
    };

    const initMap = () => {
      if (!window.L || !mapContainerRef.current) return;

      const mapInstance = window.L.map(mapContainerRef.current).setView(
        [initialLocation.latitude, initialLocation.longitude],
        isMobile ? 12 : 10 // Zoom diferente para mobile
      );

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance);

      // Configurações para mobile
      if (isMobile) {
        mapInstance.touchZoom.enable();
        mapInstance.doubleClickZoom.enable();
        mapInstance.scrollWheelZoom.enable();
        mapInstance.dragging.enable();
      }

      const markerInstance = window.L.marker([
        initialLocation.latitude,
        initialLocation.longitude
      ]).addTo(mapInstance);

      mapInstance.on('click', (e) => {
        const { lat, lng } = e.latlng;
        const newLocation = { latitude: lat, longitude: lng };
        
        markerInstance.setLatLng([lat, lng]);
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
      });

      setMap(mapInstance);
      setMarker(markerInstance);
    };

    loadLeaflet();

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [isMobile]);

  const focusOnCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocalização não é suportada neste navegador.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { latitude, longitude };
        
        if (map && marker) {
          map.setView([latitude, longitude], 15);
          marker.setLatLng([latitude, longitude]);
        }
        
        setSelectedLocation(newLocation);
        onLocationSelect(newLocation);
      },
      (error) => {
        alert('Não foi possível obter sua localização: ' + error.message);
      }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        {isMobile ? 'Toque no mapa para selecionar' : 'Clique no mapa para selecionar'}
      </Text>
      
      <View 
        ref={mapContainerRef} 
        style={[styles.mapContainer, isMobile && styles.mobileMap]}
      />
      
      <TouchableOpacity 
        style={styles.currentLocationButton}
        onPress={focusOnCurrentLocation}
      >
        <Text style={styles.currentLocationText}>📍</Text>
      </TouchableOpacity>

      {selectedLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            Lat: {selectedLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            Long: {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 10,
  },
  instructionText: {
    textAlign: 'center',
    padding: 8,
    backgroundColor: '#2685BF',
    color: 'white',
    fontSize: 14,
  },
  mapContainer: {
    width: '100%',
    height: '100%',
  },
  mobileMap: {
    cursor: 'pointer',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
  },
  currentLocationText: {
    fontSize: 20,
  },
  coordinatesContainer: {
    position: 'absolute',
    top: 45,
    left: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#333',
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    // Para web:
    boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
    // Para mobile (será ignorado na web):
    ...(Platform.OS !== 'web' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    }),
  },
});

export default WebMap;