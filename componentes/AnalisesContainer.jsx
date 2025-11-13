// componentes/AnalisesContainer.js - VERSÃO ATUALIZADA
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../contexts/authContext';
import AddAnalisesAnalista from './AddAnalisesAnalista';
import AddAnalisesAdmin from './AddAnalisesAdmin';

const AnalisesContainer = ({ onAdicionarAnalise, pocos, analistas }) => { // ✅ Removido proprietarios
  const { userData, loading } = useAuth();

  console.log('🎯 AnalisesContainer: userData completo:', userData);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  const userType = userData?.tipoUsuario || 'proprietario';
  
  console.log('🎯 AnalisesContainer: Tipo de usuário detectado:', userType);

  const renderFormByUserType = () => {
    switch (userType) {
      case 'administrador':
        console.log('🎯 Renderizando formulário do ADMIN para análises');
        return <AddAnalisesAdmin 
          onAdicionarAnalise={onAdicionarAnalise}
          pocos={pocos}
          analistas={analistas}
        />;
      
      case 'analista':
        console.log('🎯 Renderizando formulário do ANALISTA para análises');
        return <AddAnalisesAnalista 
          onAdicionarAnalise={onAdicionarAnalise}
          pocos={pocos}
          analistas={analistas}
        />;
      
      case 'proprietario':
      default:
        console.log('🎯 Proprietário não tem acesso a esta funcionalidade');
        return (
          <View style={styles.accessDenied}>
            <Text style={styles.accessDeniedTitle}>Acesso Restrito</Text>
            <Text style={styles.accessDeniedText}>
              A funcionalidade de gerenciar análises está disponível apenas para analistas e administradores.
            </Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
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
  accessDenied: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFF3E0',
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  accessDeniedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 12,
  },
  accessDeniedText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AnalisesContainer;