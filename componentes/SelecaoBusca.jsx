// componentes/SelecaoBusca.js
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';

const SelecaoBuscaSeguro = ({ 
  label, 
  value, 
  onSelect, 
  options = [], 
  placeholder = "Selecione...",
  searchKeys = ['nome'],
  displayKey = 'nome'
}) => {
  const [busca, setBusca] = useState('');
  const [modalVisivel, setModalVisivel] = useState(false);

  // Função segura para obter valor de um campo
  const getSafeValue = (obj, key, defaultValue = '') => {
    if (!obj || typeof obj !== 'object') return defaultValue;
    const value = obj[key];
    return value !== undefined && value !== null ? String(value) : defaultValue;
  };

  // Filtrar opções com segurança máxima
  const opcoesFiltradas = useMemo(() => {
    if (!Array.isArray(options)) return [];

    if (!busca.trim()) return options;

    const termoBusca = busca.toLowerCase().trim();
    
    return options.filter(option => {
      if (!option || typeof option !== 'object') return false;
      
      return searchKeys.some(key => {
        const fieldValue = getSafeValue(option, key, '');
        return fieldValue.toLowerCase().includes(termoBusca);
      });
    });
  }, [options, busca, searchKeys]);

  const handleSelecionar = (item) => {
    if (onSelect && item) {
      onSelect(item);
    }
    setModalVisivel(false);
    setBusca('');
  };

  const getDisplayText = (item) => {
    if (!item) return '';
    return getSafeValue(item, displayKey) || getSafeValue(item, 'nome') || 'Opção';
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <TouchableOpacity
        style={styles.botaoSelecao}
        onPress={() => setModalVisivel(true)}
      >
        <Text style={value ? styles.textoSelecionado : styles.textoPlaceholder}>
          {value ? getDisplayText(value) : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisivel(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisivel(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitulo}>Selecionar {label}</Text>
                
                <TextInput
                  style={styles.inputBusca}
                  placeholder={`Buscar ${label?.toLowerCase() || 'opções'}...`}
                  value={busca}
                  onChangeText={setBusca}
                  autoFocus={true}
                />

                <FlatList
                  data={opcoesFiltradas}
                  keyExtractor={(item, index) => 
                    item && item.id ? item.id.toString() : `item-${index}`
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.itemLista}
                      onPress={() => handleSelecionar(item)}
                    >
                      <Text style={styles.textoItem}>
                        {getDisplayText(item)}
                      </Text>
                      {getSafeValue(item, 'proprietario') && (
                        <Text style={styles.subtextoItem}>
                          Proprietário: {getSafeValue(item, 'proprietario')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.listaVazia}>
                      {options.length === 0 ? 'Nenhuma opção disponível' : 'Nenhum resultado encontrado'}
                    </Text>
                  }
                />

                <TouchableOpacity
                  style={styles.botaoFechar}
                  onPress={() => setModalVisivel(false)}
                >
                  <Text style={styles.textoBotaoFechar}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  botaoSelecao: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
  },
  textoSelecionado: {
    fontSize: 16,
    color: '#333',
  },
  textoPlaceholder: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  inputBusca: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  itemLista: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  textoItem: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  subtextoItem: {
    fontSize: 14,
    color: '#666',
  },
  listaVazia: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontStyle: 'italic',
  },
  botaoFechar: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignItems: 'center',
  },
  textoBotaoFechar: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default SelecaoBuscaSeguro;