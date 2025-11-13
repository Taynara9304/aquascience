// componentes/LocationPicker.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, Alert } from 'react-native';
import MapPicker from './MapPicker';
import { getAddressFromCoordinatesWithRetry } from '../services/geocodingService';

const LocationPicker = ({ onLocationSelect, onAddressSelect }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  const initialLocation = {
    latitude: -14.2350,
    longitude: -51.9253,
  };

  const handleLocationSelect = async (coordinate) => {
    setSelectedLocation(coordinate);
    setLoading(true);
    
    try {
      const endereco = await getAddressFromCoordinatesWithRetry(
        coordinate.latitude,
        coordinate.longitude,
        2
      );
      
      setAddress(endereco);
      onLocationSelect(coordinate);
      onAddressSelect(endereco); // CHAMA A PROP onAddressSelect
      
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
      
      const enderecoFallback = {
        enderecoCompleto: `Localização rural: ${coordinate.latitude.toFixed(6)}, ${coordinate.longitude.toFixed(6)}`,
        rua: '',
        numero: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
        latitude: coordinate.latitude,
        longitude: coordinate.longitude
      };
      
      setAddress(enderecoFallback);
      onLocationSelect(coordinate);
      onAddressSelect(enderecoFallback); // CHAMA A PROP onAddressSelect
      
      Alert.alert(
        'Informação', 
        'Não foi possível obter o endereço automaticamente. As coordenadas foram salvas e você pode editar o endereço manualmente abaixo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Selecione sua localização no mapa:</Text>
      <Text style={styles.subLabel}>Toque no mapa para escolher o local ou use o botão de localização</Text>
      
      <MapPicker 
        onLocationSelect={handleLocationSelect}
        onAddressSelect={onAddressSelect} // PASSA A PROP PARA O MapPicker
        initialLocation={initialLocation}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>Buscando endereço...</Text>
        </View>
      )}

      {selectedLocation && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Coordenadas: {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
          </Text>
        </View>
      )}

      {address && (
        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Endereço encontrado:</Text>
          <Text style={styles.addressText}>{address.enderecoCompleto}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  subLabel: {
    fontSize: 12,
    marginBottom: 10,
    color: '#666',
  },
  loadingContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  infoContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e3f2fd',
    borderRadius: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
  },
  addressContainer: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#e8f5e8',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  addressLabel: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#2e7d32',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
  },
});

export default LocationPicker;