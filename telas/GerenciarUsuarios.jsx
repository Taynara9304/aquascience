// telas/GerenciarUsuarios.js - VERSÃO CORRIGIDA
import React from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Text, 
  Alert,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import TabelaUsuarios from '../componentes/TabelaUsuarios';
import useUsuarios from '../hooks/useTabelaUsuarios';
import { useAuth } from '../contexts/authContext';

const GerenciarUsuarios = () => {
  const { userData } = useAuth();
  const {
    users,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    editUser,
    deleteUser,
  } = useUsuarios();

  console.log('GerenciarUsuarios: Tipo de usuário:', userData?.tipoUsuario);

  if (!userData || userData.tipoUsuario !== 'administrador') {
    return (
      <View style={styles.accessDeniedContainer}>
        <Text style={styles.accessDeniedTitle}>Acesso Restrito</Text>
        <Text style={styles.accessDeniedText}>
          Esta funcionalidade está disponível apenas para administradores do sistema.
        </Text>
        <Text style={styles.accessDeniedSubtext}>
          Se você deveria ter acesso, entre em contato com o administrador.
        </Text>
      </View>
    );
  }

  const handleEditarUsuario = async (user) => {
    console.log('✏️ GerenciarUsuarios: Editando usuário:', user.id, user.nome);
    
    try {
      Alert.alert(
        'Editar Usuário',
        `Editando: ${user.nome || user.email}\n\nFuncionalidade em desenvolvimento.`,
        [{ text: 'OK', style: 'default' }]
      );
    } catch (error) {
      console.error('GerenciarUsuarios: Erro ao editar usuário:', error);
      Alert.alert('Erro', `Não foi possível editar o usuário: ${error.message}`);
    }
  };

  const handleDeletarUsuario = async (user) => {
    console.log('GerenciarUsuarios: Solicitando exclusão do usuário:', user.id, user.nome);
    
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o usuário "${user.nome || user.email}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { 
          text: 'Cancelar', 
          style: 'cancel',
          onPress: () => console.log('GerenciarUsuarios: Exclusão cancelada pelo usuário')
        },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ GerenciarUsuarios: CONFIRMADA exclusão do usuário:', user.id);
              await deleteUser(user.id);
              Alert.alert('Sucesso', 'Usuário excluído com sucesso!');
            } catch (error) {
              console.error('GerenciarUsuarios: ERRO ao excluir usuário:', error);
              
              let mensagemErro = 'Não foi possível excluir o usuário.';
              
              if (error.message.includes('permission-denied')) {
                mensagemErro = 'Você não tem permissão para excluir usuários. Verifique as regras do Firebase.';
              } else if (error.message.includes('not-found')) {
                mensagemErro = 'Usuário não encontrado no sistema.';
              } else {
                mensagemErro = `Erro: ${error.message}`;
              }
              
              Alert.alert('Erro', mensagemErro);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando usuários...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}> Erro ao Carregar</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubtext}>
          Verifique sua conexão com a internet e tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}> Gerenciar Usuários</Text>
        <Text style={styles.headerSubtitle}>
          {users.length} usuário(s) cadastrado(s) no sistema
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
      >
        <View style={styles.tableContainer}>
          <TabelaUsuarios
            users={users}
            onEdit={handleEditarUsuario}
            onDelete={handleDeletarUsuario}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardTitle}>Informações</Text>
          <Text style={styles.infoCardText}>
            • Apenas administradores podem gerenciar usuários{'\n'}
            • É possível filtrar e ordenar os usuários{'\n'}
            • Clique em "Detalhes" para ver informações completas{'\n'}
            • Use "Editar" para modificar dados do usuário{'\n'}
            • Use "Excluir" para remover usuários do sistema
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    paddingTop: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6c757d',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  tableContainer: {
    margin: 16,
    marginBottom: 8,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 8,
  },
  infoCardText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  testeButton: {
    backgroundColor: '#FF6B6B',
    padding: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  testeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
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
    padding: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#495057',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  accessDeniedSubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default GerenciarUsuarios;