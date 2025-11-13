// telas/GerenciarPocos.jsx - VERSÃO CORRIGIDA
import React from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, Text } from 'react-native';
import TabelaPocos from '../componentes/TabelaPocos';
import PocosContainer from '../componentes/PocosContainer';
import usePocos from '../hooks/useTabelaPocos';
import { useAuth } from '../contexts/authContext';

const GerenciarPocos = () => {
  const { userData } = useAuth();
  const {
    pocos,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    addPoco,
    editPoco,
    deletePoco,
  } = usePocos();

  console.log('📊 GerenciarPocos: pocos =', pocos);
  console.log('📊 GerenciarPocos: loading =', loading);
  console.log('📊 GerenciarPocos: error =', error);

  const handleAdicionarPoco = async (novoPoco) => {
    try {
      console.log('🎯 GerenciarPocos: Recebendo novo poço', novoPoco);
      await addPoco(novoPoco);
      Alert.alert('Sucesso', 'Poço cadastrado com sucesso!');
    } catch (error) {
      console.error('❌ GerenciarPocos: Erro no addPoco:', error);
      Alert.alert('Erro', `Não foi possível cadastrar o poço: ${error.message}`);
    }
  };

  const handleDeletePoco = async (pocoId) => {
    try {
      await deletePoco(pocoId);
      Alert.alert('Sucesso', 'Poço deletado com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar poço:', error);
      Alert.alert('Erro', 'Não foi possível deletar o poço.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando poços...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <Text style={styles.errorSubtext}>Verifique a conexão com o Firebase</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            Debug: {pocos?.length || 0} poços | Usuário: {userData?.tipoUsuario || 'não definido'}
          </Text>
          <Text style={styles.debugSubtext}>
            Ordenação: {sortField} {sortDirection}
          </Text>
        </View>
        
        <TabelaPocos
          wells={pocos}
          onEdit={editPoco}
          onDelete={handleDeletePoco}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          loading={loading}
        />
        
        <PocosContainer 
          onAdicionarPoco={handleAdicionarPoco}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  debugContainer: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  debugText: {
    fontSize: 12,
    color: '#2685BF',
    fontWeight: 'bold',
  },
  debugSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF4444',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default GerenciarPocos;