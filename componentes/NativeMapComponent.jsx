// componentes/NativeMapComponent.jsx
import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const NativeMapComponent = ({ onLocationSelect, initialLocation }) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const mapRef = useRef(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const handleMapPress = (event) => {
    const { coordinate } = event.nativeEvent;
    setSelectedLocation(coordinate);
    onLocationSelect(coordinate);
  };

  const focusOnCurrentLocation = () => {
    if (!navigator.geolocation) {
      Alert.alert('Erro', 'Geolocalização não disponível');
      return;
    }

    Alert.alert(
      'Buscando localização',
      'Procurando sua posição atual...',
      [{ text: 'OK' }],
      { cancelable: false }
    );

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const region = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        
        setSelectedLocation({ latitude, longitude });
        
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, 1000);
        }
        
        onLocationSelect({ latitude, longitude });
        
        Alert.alert(
          'Localização encontrada!',
          `Sua localização atual foi definida.`,
          [{ text: 'OK' }]
        );
      },
      (error) => {
        Alert.alert('Erro', 'Não foi possível obter sua localização');
      },
      { 
        enableHighAccuracy: true, 
        timeout: 15000, 
        maximumAge: 10000 
      }
    );
  };

  const handleMapReady = () => {
    setIsMapReady(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructionText}>
        Toque no mapa para selecionar sua localização
      </Text>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
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
        loadingIndicatorColor="#666666"
        loadingBackgroundColor="#eeeeee"
      >
        {selectedLocation && (
          <Marker
            coordinate={selectedLocation}
            title="Local selecionado"
            description="Sua localização no mapa"
            pinColor="#2685BF"
          />
        )}
      </MapView>
      
      <TouchableOpacity 
        style={styles.currentLocationButton}
        onPress={focusOnCurrentLocation}
        disabled={!isMapReady}
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
  currentLocationButton: {
    position: 'absolute',
    bottom: 15,
    right: 15,
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
  currentLocationText: {
    fontSize: 20,
  },
  coordinatesContainer: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  coordinatesText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 2,
  },
});

export default NativeMapComponent;