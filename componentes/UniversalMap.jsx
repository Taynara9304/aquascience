// components/UniversalMap.jsx
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform, Linking, Alert } from 'react-native';

const UniversalMap = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleManualLocation = () => {
    const url = `https://www.google.com/maps?q=${initialLocation.latitude},${initialLocation.longitude}`;
    
    Linking.openURL(url).catch(err => {
      Alert.alert('Erro', 'Não foi possível abrir o aplicativo de mapas');
    });
  };

  const focusOnCurrentLocation = () => {
    if (navigator.geolocation) {
      Alert.alert(
        'Localização',
        'Buscando sua localização atual...',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { latitude, longitude };
          setSelectedLocation(location);
          onLocationSelect(location);
          
          Alert.alert(
            'Localização encontrada',
            `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`,
            [{ text: 'OK' }]
          );
        },
        (error) => {
          let errorMessage = 'Não foi possível obter sua localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada. Habilite nas configurações.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível no momento.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo limite excedido.';
              break;
          }
          
          Alert.alert('Erro', errorMessage);
        },
        { enableHighAccuracy: true, timeout: 15000 }
      );
    } else {
      Alert.alert('Erro', 'Geolocalização não é suportada');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.placeholderText}>🌍 Mapa Interativo</Text>
        <Text style={styles.placeholderSubtext}>
          Use os botões abaixo para selecionar sua localização
        </Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.locationButton}
          onPress={focusOnCurrentLocation}
        >
          <Text style={styles.buttonText}>📍 Usar Localização Atual</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.locationButton, styles.manualButton]}
          onPress={handleManualLocation}
        >
          <Text style={styles.buttonText}>🗺️ Abrir Google Maps</Text>
        </TouchableOpacity>
      </View>

      {selectedLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            📍 Latitude: {selectedLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            📍 Longitude: {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bbdefb',
    borderStyle: 'dashed',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 10,
  },
  placeholderSubtext: {
    fontSize: 14,
    color: '#546e7a',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    gap: 10,
  },
  locationButton: {
    backgroundColor: '#2196f3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  manualButton: {
    backgroundColor: '#ff9800',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  coordinatesContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
});

export default UniversalMap;