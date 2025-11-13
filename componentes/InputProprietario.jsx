import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet, Modal } from 'react-native';

// Dados mockados de proprietários - você pode substituir por dados reais da sua API
const proprietariosMock = [
  { id: 1, nome: 'João Silva', email: 'joao@email.com', telefone: '(11) 99999-9999' },
  { id: 2, nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 88888-8888' },
  { id: 3, nome: 'Pedro Oliveira', email: 'pedro@email.com', telefone: '(11) 77777-7777' },
  { id: 4, nome: 'Ana Costa', email: 'ana@email.com', telefone: '(11) 66666-6666' },
  { id: 5, nome: 'Carlos Souza', email: 'carlos@email.com', telefone: '(11) 55555-5555' },
  { id: 6, nome: 'Fernanda Lima', email: 'fernanda@email.com', telefone: '(11) 44444-4444' },
  { id: 7, nome: 'Roberto Alves', email: 'roberto@email.com', telefone: '(11) 33333-3333' },
];

const InputProprietario = ({ label, value, onChange, placeholder }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filteredProprietarios, setFilteredProprietarios] = useState(proprietariosMock);
  const [showAddOption, setShowAddOption] = useState(false);

  useEffect(() => {
    if (searchText.trim() === '') {
      setFilteredProprietarios(proprietariosMock);
      setShowAddOption(false);
    } else {
      const filtered = proprietariosMock.filter(prop =>
        prop.nome.toLowerCase().includes(searchText.toLowerCase()) ||
        prop.email.toLowerCase().includes(searchText.toLowerCase()) ||
        prop.telefone.includes(searchText)
      );
      setFilteredProprietarios(filtered);
      setShowAddOption(filtered.length === 0 && searchText.trim() !== '');
    }
  }, [searchText]);

  const handleSelectProprietario = (proprietario) => {
    onChange(proprietario);
    setModalVisible(false);
    setSearchText('');
  };

  const handleAddNewProprietario = () => {
    // Criar novo proprietário temporário
    const novoProprietario = {
      id: Math.max(...proprietariosMock.map(p => p.id), 0) + 1,
      nome: searchText.trim(),
      email: '',
      telefone: '',
      novo: true // Flag para identificar que é novo
    };
    
    // Em uma aplicação real, você faria uma chamada API aqui
    onChange(novoProprietario);
    setModalVisible(false);
    setSearchText('');
  };

  const renderProprietarioItem = ({ item }) => (
    <TouchableOpacity
      style={styles.proprietarioItem}
      onPress={() => handleSelectProprietario(item)}
    >
      <Text style={styles.proprietarioNome}>{item.nome}</Text>
      {item.email && <Text style={styles.proprietarioEmail}>{item.email}</Text>}
      {item.telefone && <Text style={styles.proprietarioTelefone}>{item.telefone}</Text>}
      {item.novo && <Text style={styles.novoBadge}>Novo</Text>}
    </TouchableOpacity>
  );

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
          {value ? `${label}: ${value.nome}` : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Selecionar Proprietário</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>X</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome, email ou telefone do proprietário..."
              value={searchText}
              onChangeText={setSearchText}
              autoFocus={true}
            />
          </View>

          <FlatList
            data={filteredProprietarios}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderProprietarioItem}
            style={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Nenhum proprietário encontrado</Text>
              </View>
            }
          />

          {showAddOption && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddNewProprietario}
            >
              <Text style={styles.addButtonText}>
                + Cadastrar "{searchText}" como novo proprietário
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
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
    borderRadius: 4,
    padding: 16,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 16,
    color: '#333',
  },
  placeholder: {
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    fontSize: 18,
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  proprietarioItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  proprietarioNome: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  proprietarioEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  proprietarioTelefone: {
    fontSize: 14,
    color: '#666',
  },
  novoBadge: {
    fontSize: 12,
    color: '#2685BF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    padding: 16,
    backgroundColor: '#2685BF',
    margin: 16,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#f8f9fa',
  },
  cancelButton: {
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2685BF',
  },
  cancelButtonText: {
    color: '#2685BF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default InputProprietario;