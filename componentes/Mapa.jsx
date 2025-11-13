import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapView, Marker } from 'expo-maps';

const Mapa = ({ onLocationSelected }) => {
  const [localizacao, setLocalizacao] = useState(null);

  const handlePress = (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setLocalizacao({ latitude, longitude });
    if (onLocationSelected) {
      onLocationSelected({ latitude, longitude });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instrucao}>Toque no mapa para selecionar o ponto</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: -24.9555, // Cascavel-PR
          longitude: -53.4567,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
      >
        {localizacao && <Marker coordinate={localizacao} />}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  instrucao: {
    marginBottom: 5,
    color: '#444',
  },
  map: {
    width: '90%',
    height: 250,
    borderRadius: 10,
  },
});

export default Mapa;
