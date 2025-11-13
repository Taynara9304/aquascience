// components/NativeMap.jsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';

const NativeMapFallback = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (error) {
      console.log('Erro ao verificar permissão:', error);
    }
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da permissão de localização para encontrar sua posição.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Abrir Configurações', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      setHasLocationPermission(true);
      
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;
      const newLocation = { latitude, longitude };
      
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);

      Alert.alert(
        'Localização encontrada!',
        `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter sua localização');
    } finally {
      setIsLoading(false);
    }
  };

  const openMapsApp = () => {
    const url = `https://www.google.com/maps?q=${selectedLocation.latitude},${selectedLocation.longitude}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderEmoji}>🗺️</Text>
        <Text style={styles.placeholderTitle}>Mapa</Text>
        <Text style={styles.placeholderSubtitle}>
          {isLoading ? 'Buscando sua localização...' : 'Toque no botão para definir sua localização'}
        </Text>
        
        {isLoading && <ActivityIndicator size="large" color="#2685BF" style={styles.loader} />}
        
        {selectedLocation && (
          <View style={styles.coordinatesBox}>
            <Text style={styles.coordText}>
              📍 Lat: {selectedLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.coordText}>
              📍 Long: {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.locationButton}
        onPress={getCurrentLocation}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>📍 Usar Minha Localização</Text>
        )}
      </TouchableOpacity>

      {selectedLocation && (
        <TouchableOpacity 
          style={[styles.locationButton, styles.mapsButton]}
          onPress={openMapsApp}
        >
          <Text style={styles.buttonText}>🗺️ Ver no Google Maps</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#e8f4f8',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2685BF',
    borderStyle: 'dashed',
    padding: 20,
  },
  placeholderEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 5,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  loader: {
    marginVertical: 10,
  },
  coordinatesBox: {
    backgroundColor: 'rgba(38, 133, 191, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  coordText: {
    fontSize: 12,
    color: '#2685BF',
    fontWeight: '500',
  },
  locationButton: {
    backgroundColor: '#2685BF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  mapsButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NativeMapFallback;