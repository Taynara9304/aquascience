// telas/GerenciarVisitas.js - VERSÃO FINAL COMPLETA
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import VisitasContainer from '../componentes/VisitasContainer';
import GerenciarSolicitacoesVisitas from '../componentes/GerenciarSolicitacoesVisitas';
import useVisitas from '../hooks/useTabelaVisitas';
import { useAuth } from '../contexts/authContext';

const GerenciarVisitas = () => {
  const { userData } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('visitas');
  
  const {
    visits,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    addVisit,
    editVisit,
    deleteVisit,
    enviarVisitaParaAprovacao,
    aprovarVisita,
    rejeitarVisita
  } = useVisitas();

  const handleDeleteVisit = async (visitId) => {
    try {
      await deleteVisit(visitId);
      Alert.alert('Sucesso', 'Visita deletada com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar visita:', error);
      Alert.alert('Erro', 'Não foi possível deletar a visita.');
    }
  };

  const handleAdicionarVisita = async (novaVisita) => {
    try {
      console.log('🎯 GerenciarVisitas: Recebendo nova visita', novaVisita);
      
      if (userData?.tipoUsuario === 'analista') {
        await enviarVisitaParaAprovacao(novaVisita);
        Alert.alert('Sucesso', 'Visita enviada para aprovação!');
      } else {
        await addVisit(novaVisita);
        Alert.alert('Sucesso', 'Visita cadastrada com sucesso!');
      }
    } catch (error) {
      console.error('❌ GerenciarVisitas: Erro:', error);
      Alert.alert('Erro', `Não foi possível processar a visita: ${error.message}`);
    }
  };

  const renderAbas = () => {
    if (userData?.tipoUsuario !== 'administrador') {
      return null;
    }

    return (
      <View style={styles.abasContainer}>
        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'visitas' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('visitas')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'visitas' && styles.abaTextoAtivo]}>
            📋 Todas as Visitas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.aba, abaAtiva === 'solicitacoes' && styles.abaAtiva]}
          onPress={() => setAbaAtiva('solicitacoes')}
        >
          <Text style={[styles.abaTexto, abaAtiva === 'solicitacoes' && styles.abaTextoAtivo]}>
            Solicitações
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderConteudo = () => {
    if (abaAtiva === 'solicitacoes' && userData?.tipoUsuario === 'administrador') {
      return <GerenciarSolicitacoesVisitas />;
    }

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2685BF" />
          <Text style={styles.loadingText}>Carregando visitas...</Text>
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
      <VisitasContainer 
        onAdicionarVisita={handleAdicionarVisita}
        enviarVisitaParaAprovacao={enviarVisitaParaAprovacao}
        visits={visits}
        loading={loading}
        error={error}
        sortField={sortField}
        sortDirection={sortDirection}
        handleSort={handleSort}
        editVisit={editVisit}
        deleteVisit={handleDeleteVisit}
        onSolicitarAlteracao={(visitId, motivo) => {
          console.log('Solicitar alteração:', visitId, motivo);
          Alert.alert('Solicitação Enviada', 'Sua solicitação foi enviada para o administrador');
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
      {renderAbas()}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {renderConteudo()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  abasContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  aba: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  abaAtiva: {
    borderBottomColor: '#2685BF',
  },
  abaTexto: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  abaTextoAtivo: {
    color: '#2685BF',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 16,
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

export default GerenciarVisitas;