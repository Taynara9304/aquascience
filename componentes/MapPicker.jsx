// components/MapPicker.jsx
import React from 'react';
import { Platform } from 'react-native';
import WebMap from './WebMap';
import MobileMap from './MobileMap';

// Coordenadas do IFPR Cascavel
const IFPR_CASCAVEL = {
  latitude: -24.943611,
  longitude: -53.495806
};

const MapPicker = ({ onLocationSelect, onAddressSelect, initialLocation = IFPR_CASCAVEL }) => {
  if (Platform.OS === 'web') {
    return (
      <WebMap 
        onLocationSelect={onLocationSelect} 
        onAddressSelect={onAddressSelect} // PASSA A PROP
        initialLocation={initialLocation}
      />
    );
  }

  return (
    <MobileMap 
      onLocationSelect={onLocationSelect} 
      onAddressSelect={onAddressSelect} // PASSA A PROP
      initialLocation={initialLocation}
    />
  );
};

export default MapPicker;