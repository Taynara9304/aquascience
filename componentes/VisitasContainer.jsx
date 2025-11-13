// componentes/VisitasContainer.js - VERSÃO CORRIGIDA
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/authContext';
import AddVisitasProprietario from './AddVisitasProprietario';
import AddVisitasAnalista from './AddVisitasAnalista';
import AddVisitasAdmin from './AddVisitasAdmin';
import TabelaVisitasAdmin from './TabelaVisitasAdmin';
import TabelaVisitasAnalista from './TabelaVisitasAnalista';
import TabelaVisitasProprietario from './TabelaVisitasProprietario';

const VisitasContainer = ({ 
  onAdicionarVisita, 
  enviarVisitaParaAprovacao,
  aprovarVisita,
  rejeitarVisita,
  visits, 
  loading, 
  error, 
  sortField, 
  sortDirection, 
  handleSort, 
  editVisit, 
  deleteVisit,
  onSolicitarAlteracao 
}) => {
  const { userData, loading: authLoading } = useAuth();

  console.log('🎯 VisitasContainer: userData completo:', userData);

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  const userType = userData?.tipoUsuario || 'proprietario';
  
  console.log('🎯 VisitasContainer: Tipo de usuário detectado:', userType);

  // Renderizar tabela baseada no tipo de usuário
  const renderTabelaByUserType = () => {
    const commonProps = {
      visits: visits,
      sortField: sortField,
      sortDirection: sortDirection,
      onSort: handleSort,
      loading: loading
    };

    switch (userType) {
      case 'administrador':
        return (
          <TabelaVisitasAdmin
            {...commonProps}
            onEdit={editVisit}
            onDelete={deleteVisit}
          />
        );
      
      case 'analista':
        return (
          <TabelaVisitasAnalista
            {...commonProps}
            onSolicitarAlteracao={onSolicitarAlteracao}
          />
        );
      
      case 'proprietario':
      default:
        return (
          <TabelaVisitasProprietario
            {...commonProps}
          />
        );
    }
  };

  // Renderizar formulário baseado no tipo de usuário
  const renderFormByUserType = () => {
    switch (userType) {
      case 'administrador':
        return <AddVisitasAdmin onAdicionarVisita={onAdicionarVisita} />;
      
      case 'analista':
        return (
          <AddVisitasAnalista 
            onAdicionarVisita={onAdicionarVisita}
            enviarVisitaParaAprovacao={enviarVisitaParaAprovacao}
          />
        );
      
      case 'proprietario':
      default:
        return <AddVisitasProprietario onAdicionarVisita={onAdicionarVisita} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabela de Visitas */}
      {renderTabelaByUserType()}
      
      {/* Formulário de Adição */}
      {renderFormByUserType()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default VisitasContainer;