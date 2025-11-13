// componentes/FallbackMap.jsx
import React, { useState } from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Alert } from 'react-native';

const FallbackMap = ({ onLocationSelect, onAddressSelect }) => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [manualAddress, setManualAddress] = useState('');

  const handleConfirmLocation = () => {
    if (!latitude || !longitude) {
      Alert.alert('Erro', 'Por favor, informe latitude e longitude.');
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      Alert.alert('Erro', 'Latitude e longitude devem ser números válidos.');
      return;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      Alert.alert('Erro', 'Latitude deve estar entre -90 e 90, Longitude entre -180 e 180.');
      return;
    }

    const location = { latitude: lat, longitude: lng };
    onLocationSelect(location);
    
    // Criar um endereço manual baseado nas coordenadas
    const address = {
      enderecoCompleto: manualAddress || `Localização manual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      latitude: lat,
      longitude: lng
    };
    
    onAddressSelect(address);
    Alert.alert('Sucesso', 'Localização definida manualmente.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Informe suas coordenadas manualmente</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Latitude (ex: -14.2350)"
          value={latitude}
          onChangeText={setLatitude}
          keyboardType="numeric"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Longitude (ex: -51.9253)"
          value={longitude}
          onChangeText={setLongitude}
          keyboardType="numeric"
        />
      </View>
      
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descreva sua localização (ex: Fazenda Santa Maria, km 12 da estrada...)"
        value={manualAddress}
        onChangeText={setManualAddress}
        multiline
        numberOfLines={3}
      />
      
      <TouchableOpacity style={styles.button} onPress={handleConfirmLocation}>
        <Text style={styles.buttonText}>Confirmar Localização</Text>
      </TouchableOpacity>
      
      <Text style={styles.helpText}>
        Você pode obter suas coordenadas usando apps como Google Maps ou GPS.
        Toque e segure no mapa para ver as coordenadas.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginVertical: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    marginHorizontal: 0,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2685BF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default FallbackMap;