// componentes/DebugUserType.js (temporário)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/authContext';

const DebugUserType = () => {
  const { userData } = useAuth();
  
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        🔍 DEBUG: tipoUsuario = "{userData?.tipoUsuario || 'não definido'}"
      </Text>
      <Text style={styles.subtext}>
        User ID: {userData?.uid || 'não disponível'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFE082',
    padding: 8,
    margin: 8,
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  text: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65100',
  },
  subtext: {
    fontSize: 10,
    color: '#E65100',
    marginTop: 2,
  },
});

export default DebugUserType;