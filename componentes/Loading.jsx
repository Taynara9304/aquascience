// componentes/Loading.js
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

const Loading = ({ message = "Carregando..." }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#2685BF" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    marginTop: 10,
    color: '#2685BF',
    fontSize: 16,
  },
});

export default Loading;