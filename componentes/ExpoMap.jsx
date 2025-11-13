// componentes/ExpoMap.jsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, Platform } from 'react-native';
import { MapView, Marker } from 'expo-maps';
import * as Location from 'expo-location';

const ExpoMap = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapPress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    const location = { latitude, longitude };
    
    setSelectedLocation(location);
    onLocationSelect(location);
    
    // Feedback visual
    Alert.alert(
      'Localização selecionada',
      `Latitude: ${latitude.toFixed(6)}\nLongitude: ${longitude.toFixed(6)}`,
      [{ text: 'OK' }]
    );
  };

  const focusOnCurrentLocation = async () => {
    try {
      // Solicitar permissão de localização
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da permissão de localização para encontrar sua posição atual.',
          [{ text: 'OK' }]
        );
        return;
      }

      Alert.alert(
        'Buscando localização',
        'Procurando sua localização atual...',
        [{ text: 'OK' }],
        { cancelable: false }
      );

      // Obter localização atual
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      const newLocation = { latitude, longitude };
      
      setSelectedLocation(newLocation);
      onLocationSelect(newLocation);

      // Mover o mapa para a localização atual
      if (mapRef.current) {
        mapRef.current.setCamera({
          center: {
            latitude: latitude,
            longitude: longitude,
          },
          zoom: 15,
        });
      }

      Alert.alert(
        'Localização encontrada',
        `Sua localização atual foi definida.`,
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização. Verifique se o GPS está ativado.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMapReady = () => {
    setIsMapReady(true);
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then(camera => {
        mapRef.current.setCamera({
          ...camera,
          zoom: camera.zoom + 1
        });
      });
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.getCamera().then(camera => {
        mapRef.current.setCamera({
          ...camera,
          zoom: Math.max(camera.zoom - 1, 0)
        });
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Toque no mapa para selecionar sua localização
      </Text>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialCamera={{
          center: {
            latitude: initialLocation.latitude,
            longitude: initialLocation.longitude,
          },
          zoom: 10,
          bearing: 0,
          pitch: 0,
        }}
        onPress={handleMapPress}
        onMapReady={handleMapReady}
        showsUserLocation={true}
        showsMyLocationButton={false}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        loadingEnabled={true}
        loadingIndicatorColor="#2685BF"
        loadingBackgroundColor="#eeeeee"
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Local selecionado"
            description="Sua localização no mapa"
            color="#2685BF"
          />
        )}
      </MapView>
      
      {/* Controles do mapa */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity 
          style={[styles.controlButton, styles.locationButton]}
          onPress={focusOnCurrentLocation}
          disabled={!isMapReady}
        >
          <Text style={styles.controlButtonText}>📍</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.zoomInButton]}
          onPress={zoomIn}
          disabled={!isMapReady}
        >
          <Text style={styles.controlButtonText}>➕</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.controlButton, styles.zoomOutButton]}
          onPress={zoomOut}
          disabled={!isMapReady}
        >
          <Text style={styles.controlButtonText}>➖</Text>
        </TouchableOpacity>
      </View>

      {/* Coordenadas */}
      {selectedLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            📍 Lat: {selectedLocation.latitude.toFixed(6)}
          </Text>
          <Text style={styles.coordinatesText}>
            📍 Long: {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 400,
    borderRadius: 15,
    overflow: 'hidden',
    marginVertical: 10,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  instructionText: {
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#2685BF',
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    flex: 1,
    width: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    right: 15,
    top: 70,
    flexDirection: 'column',
    gap: 12,
  },
  controlButton: {
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  locationButton: {
    backgroundColor: '#2685BF',
  },
  zoomInButton: {
    backgroundColor: '#28a745',
  },
  zoomOutButton: {
    backgroundColor: '#dc3545',
  },
  controlButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 200,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
});

export default ExpoMap;