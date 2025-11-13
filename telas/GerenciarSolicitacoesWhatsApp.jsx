// screens/GerenciarSolicitacoesWhatsApp.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useAuth } from '../contexts/authContext';
import useSolicitacoesWhatsApp from '../hooks/useSolicitacoesWhatsApp';
import { atualizarStatusSolicitacao } from '../services/whatsappService';
import { useNavigation } from '@react-navigation/native';

const GerenciarSolicitacoesWhatsApp = () => {
  const { userData } = useAuth();
  const navigation = useNavigation();
  const [filtro, setFiltro] = useState('todas');
  const [refreshing, setRefreshing] = useState(false);
  
  const { solicitacoes, loading, error } = useSolicitacoesWhatsApp(filtro);

  // Verificar se é administrador
  if (userData?.tipoUsuario !== 'administrador') {
    return (
      <View style={styles.container}>
        <Text style={styles.acessoNegado}>
          ⚠️ Acesso restrito a administradores
        </Text>
      </View>
    );
  }

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleCadastrarVisita = (solicitacao) => {
    navigation.navigate('CadastrarVisitaWhatsApp', { solicitacao });
  };

  const handleCancelarSolicitacao = async (solicitacao) => {
    Alert.alert(
      'Cancelar Solicitação',
      `Deseja cancelar a solicitação de ${solicitacao.proprietarioNome}?`,
      [
        { text: 'Não', style: 'cancel' },
        { 
          text: 'Sim', 
          onPress: async () => {
            try {
              await atualizarStatusSolicitacao(solicitacao.id, 'cancelada', {
                motivoCancelamento: 'Cancelado pelo administrador'
              });
              Alert.alert('Sucesso', 'Solicitação cancelada com sucesso');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível cancelar a solicitação');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return '#FFA000';
      case 'em_andamento': return '#2196F3';
      case 'concluida': return '#4CAF50';
      case 'cancelada': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pendente': return '🕒 Pendente';
      case 'em_andamento': return '📞 Em Andamento';
      case 'concluida': return '✅ Concluída';
      case 'cancelada': return '❌ Cancelada';
      default: return status;
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando solicitações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitações WhatsApp</Text>
      
      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
      >
        {['todas', 'pendente', 'em_andamento', 'concluida', 'cancelada'].map((filtroItem) => (
          <TouchableOpacity
            key={filtroItem}
            style={[
              styles.filterButton,
              filtro === filtroItem && styles.filterButtonActive
            ]}
            onPress={() => setFiltro(filtroItem)}
          >
            <Text style={[
              styles.filterButtonText,
              filtro === filtroItem && styles.filterButtonTextActive
            ]}>
              {filtroItem === 'todas' ? '📋 Todas' : 
               filtroItem === 'pendente' ? '🕒 Pendentes' :
               filtroItem === 'em_andamento' ? '📞 Em Andamento' :
               filtroItem === 'concluida' ? '✅ Concluídas' : '❌ Canceladas'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de Solicitações */}
      <ScrollView
        style={styles.listaContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {solicitacoes.length === 0 ? (
          <View style={styles.semDados}>
            <Text style={styles.semDadosTexto}>
              {filtro === 'todas' 
                ? '📭 Nenhuma solicitação WhatsApp encontrada'
                : `📭 Nenhuma solicitação ${filtro} encontrada`
              }
            </Text>
          </View>
        ) : (
          solicitacoes.map((solicitacao) => (
            <View key={solicitacao.id} style={styles.solicitacaoCard}>
              <View style={styles.solicitacaoHeader}>
                <Text style={styles.proprietarioNome}>
                  {solicitacao.proprietarioNome}
                </Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(solicitacao.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {getStatusText(solicitacao.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.pocoNome}>
                🏠 {solicitacao.pocoNome}
              </Text>
              
              <Text style={styles.localizacao}>
                📍 {solicitacao.pocoLocalizacao || 'Localização não informada'}
              </Text>
              
              <Text style={styles.data}>
                📅 {solicitacao.dataHoraDesejada 
                  ? new Date(solicitacao.dataHoraDesejada).toLocaleString('pt-BR')
                  : 'Data não informada'
                }
              </Text>
              
              {solicitacao.observacoes && (
                <Text style={styles.observacoes}>
                  📝 {solicitacao.observacoes}
                </Text>
              )}
              
              <Text style={styles.dataSolicitacao}>
                ⏰ Solicitação: {solicitacao.dataSolicitacao 
                  ? new Date(solicitacao.dataSolicitacao).toLocaleString('pt-BR')
                  : 'Data não disponível'
                }
              </Text>

              {/* Ações */}
              {solicitacao.status === 'pendente' && (
                <View style={styles.acoesContainer}>
                  <TouchableOpacity 
                    style={styles.acaoButton}
                    onPress={() => handleCadastrarVisita(solicitacao)}
                  >
                    <Text style={styles.acaoButtonText}>✅ Cadastrar Visita</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.acaoButton, styles.cancelarButton]}
                    onPress={() => handleCancelarSolicitacao(solicitacao)}
                  >
                    <Text style={styles.acaoButtonText}>❌ Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {solicitacao.status === 'em_andamento' && (
                <View style={styles.acoesContainer}>
                  <TouchableOpacity 
                    style={styles.acaoButton}
                    onPress={() => handleCadastrarVisita(solicitacao)}
                  >
                    <Text style={styles.acaoButtonText}>✅ Finalizar Visita</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2685BF',
    marginVertical: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#2685BF',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listaContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  solicitacaoCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#25D366',
  },
  solicitacaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  proprietarioNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
  },
  pocoNome: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  localizacao: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  data: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  observacoes: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    lineHeight: 16,
  },
  dataSolicitacao: {
    fontSize: 11,
    color: '#999',
    marginBottom: 8,
  },
  acoesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  acaoButton: {
    flex: 1,
    padding: 8,
    backgroundColor: '#2685BF',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelarButton: {
    backgroundColor: '#F44336',
  },
  acaoButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2685BF',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  semDados: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  semDadosTexto: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  acessoNegado: {
    fontSize: 18,
    color: '#FF9800',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default GerenciarSolicitacoesWhatsApp;