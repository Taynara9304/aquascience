import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import MapaSelecaoSimples from './MapaSelecaoSimples';

const InputMapa = ({ label, value, onChange, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  
  const handleLocationSelect = (location) => {
    console.log('Localização selecionada:', location); // Debug
    onChange(location);
    // REMOVIDO: Não fechar automaticamente
    // setModalVisible(false);
  };

  const handleConfirmAndClose = () => {
    if (!value) {
      Alert.alert('Atenção', 'Por favor, selecione uma localização no mapa antes de confirmar.');
      return;
    }
    setModalVisible(false);
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.inputContainer}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[
          styles.label, 
          !value && styles.placeholder
        ]}>
          {value 
            ? `📍 ${label}: ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}` 
            : placeholder
          }
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={handleClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>🗺️ Selecionar Localização do Poço</Text>
            <TouchableOpacity onPress={handleClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.mapWrapper}>
            <MapaSelecaoSimples 
              onLocationSelected={handleLocationSelect}
              initialLocation={value}
            />
          </View>

          <View style={styles.modalFooter}>
            <Text style={styles.footerText}>
              {value 
                ? `✅ Localização selecionada: ${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}`
                : '👆 Selecione um ponto no mapa ou use sua localização atual'
              }
            </Text>
            <View style={styles.footerButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleClose}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.confirmButton, !value && styles.disabledButton]}
                onPress={handleConfirmAndClose}
                disabled={!value}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#2685BF',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  mapWrapper: {
    flex: 1,
    padding: 16,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2685BF',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#2685BF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  confirmButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#2685BF',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default InputMapa;