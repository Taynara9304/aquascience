import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Dropdown = ({ title, infoText }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown} 
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.dropdownText}>
          {isOpen ? 'Ocultar informações' : title}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownContent}>
          <Text style={styles.infoText}>{infoText}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  dropdown: {
    padding: 12,
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    borderColor: '#007bff',
    borderWidth: 1,
  },
  dropdownText: {
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  dropdownContent: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#000000',
  },
});

export default Dropdown;
