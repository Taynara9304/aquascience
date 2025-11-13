import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  ScrollView,
  Dimensions
} from 'react-native';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  where,
  updateDoc,
  doc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

// Cores do tema (mantendo as mesmas da tela de admin)
const COLORS = {
  primary: '#2685BF',
  secondary: '#4CAF50',
  danger: '#F44336',
  warning: '#FFA500',
  light: '#f4f7f6',
  white: '#FFFFFF',
  gray: {
    100: '#f8f9fa',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#ced4da',
    500: '#adb5bd',
    600: '#6c757d',
    700: '#495057',
    800: '#343a40',
    900: '#212529',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#888888',
  }
};

// Espaçamentos
const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Bordas
const BORDER = {
  radius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  width: {
    thin: 1,
    thick: 5,
  }
};

// Sombras
const SHADOW = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  }
};

const NotificacoesProprietario = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filterStatus, searchQuery]);

  const loadNotifications = () => {
    setLoading(true);
    
    try {
      const q = query(
        collection(db, 'notifications'),
        where('idDoUsuario', '==', user?.uid),
        orderBy('dataSolicitacao', 'desc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const notificationsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notificationsList.push({ 
            id: doc.id, 
            ...data,
            // Garantir compatibilidade com os campos usados na interface
            tipo: data.tipoNotificacao,
            dataCriacao: data.dataSolicitacao,
            status: data.status || 'pendente'
          });
        });
        
        setNotifications(notificationsList);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error("Erro ao carregar notificações: ", error);
        setLoading(false);
        setRefreshing(false);
        Alert.alert('Erro', 'Não foi possível carregar as notificações');
      });

      return unsubscribe;
    } catch (error) {
      console.error("Erro: ", error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(notificacao => 
        notificacao.status && notificacao.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    // Filtro por busca
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notificacao => {
        const buscaTitulo = notificacao.titulo?.toLowerCase().includes(query);
        const buscaMensagem = notificacao.mensagem?.toLowerCase().includes(query);
        const buscaTipo = notificacao.tipoNotificacao?.toLowerCase().includes(query);
        
        return buscaTitulo || buscaMensagem || buscaTipo;
      });
    }

    setFilteredNotifications(filtered);
  };

  const getTipoInfo = (tipo) => {
    const tipoMap = {
      'visita': { icon: '📅', text: 'Visita', color: COLORS.primary },
      'cadastro': { icon: '📝', text: 'Cadastro', color: COLORS.secondary },
      'edicao': { icon: '✏️', text: 'Edição', color: COLORS.warning },
      'analise_concluida': { icon: '📊', text: 'Análise', color: '#9C27B0' },
      'teste': { icon: '🧪', text: 'Teste', color: COLORS.gray[500] }
    };

    return tipoMap[tipo] || { icon: '🔔', text: 'Notificação', color: COLORS.gray[500] };
  };

  const getStatusInfo = (status) => {
    const statusLower = status ? status.toLowerCase() : '';
    
    const statusMap = {
      'pendente': { text: 'Pendente', color: COLORS.warning },
      'aceita': { text: 'Agendada', color: COLORS.secondary },
      'recusada': { text: 'Recusada', color: COLORS.danger },
      'editada': { text: 'Reagendada', color: COLORS.primary },
      'concluida': { text: 'Concluída', color: COLORS.gray[600] }
    };

    return statusMap[statusLower] || { text: status, color: COLORS.gray[500] };
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const formatVisitDate = (visitDateStr) => {
    if (!visitDateStr) return 'N/A';
    try {
      const date = new Date(visitDateStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'Data inválida';
    }
  };

  const viewNotificationDetails = (notification) => {
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const handleAvaliarServico = (notificacao) => {
    setModalVisible(false);
    
    if (!notificacao.idDaAnalise || !notificacao.idDoPoco) {
      Alert.alert('Erro', 'Dados incompletos para avaliação. Contate o suporte.');
      return;
    }
    
    setTimeout(() => {
      navigation.navigate('DeixarAvaliacao', { 
        notificationId: notificacao.id,
        analiseId: notificacao.idDaAnalise,
        pocoId: notificacao.idDoPoco
      });
    }, 300);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const limparFiltros = () => {
    setFilterStatus('todos');
    setSearchQuery('');
  };

  const renderNotificationItem = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipoNotificacao);
    const statusInfo = getStatusInfo(item.status);

    return (
      <View style={[
        styles.card,
        { borderLeftColor: tipoInfo.color }
      ]}>
        <View style={styles.cardHeader}>
          <View style={styles.tipoContainer}>
            <Text style={styles.tipoIcon}>{tipoInfo.icon}</Text>
            <Text style={styles.tipoText}>{tipoInfo.text}</Text>
          </View>
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>

        <Text style={styles.cardTitle}>
          {item.titulo || 'Notificação'}
        </Text>
        
        <Text style={styles.cardMessage} numberOfLines={2}>
          {item.mensagem}
        </Text>
        
        {item.dadosVisita?.dataVisita && (
          <View style={styles.cardData}>
            <Text style={styles.dataText}>
              <Text style={styles.dataLabel}>Data da Visita:</Text> {formatVisitDate(item.dadosVisita.dataVisita)}
            </Text>
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {formatDate(item.dataSolicitacao)}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={() => viewNotificationDetails(item)}
          >
            <Text style={styles.buttonSecondaryText}>👁️ Detalhes</Text>
          </TouchableOpacity>
          
          {/* Botão de avaliação - apenas para análises concluídas com avaliação pendente */}
          {item.tipoNotificacao === 'analise_concluida' && 
           item.statusAvaliacao === 'pendente' && (
            <TouchableOpacity 
              style={styles.buttonSuccess}
              onPress={() => handleAvaliarServico(item)}
            >
              <Text style={styles.buttonText}>⭐ Avaliar</Text>
            </TouchableOpacity>
          )}

          {/* Indicador de já avaliado */}
          {item.tipoNotificacao === 'analise_concluida' && 
           item.statusAvaliacao === 'concluida' && (
            <View style={styles.ratedBadge}>
              <Text style={styles.ratedText}>✅ Avaliado</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.sectionTitle}>Filtrar Notificações</Text>
      
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, mensagem ou tipo..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery !== '' && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filtros de Status */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'pendente', label: 'Pendentes' },
              { key: 'aceita', label: 'Agendadas' },
              { key: 'concluida', label: 'Concluídas' },
              { key: 'recusada', label: 'Recusadas' }
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  filterStatus === key && styles.filterButtonActive
                ]}
                onPress={() => setFilterStatus(key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === key && styles.filterButtonTextActive
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Contadores e Limpar Filtros */}
      <View style={styles.filterFooter}>
        <Text style={styles.counterText}>
          Mostrando {filteredNotifications.length} de {notifications.length}
        </Text>
        {(filterStatus !== 'todos' || searchQuery !== '') && (
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={limparFiltros}
          >
            <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando notificações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Minhas Notificações</Text>
      <Text style={styles.subHeader}>Acompanhe suas solicitações e visitas</Text>
      
      {renderFilterSection()}
      
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {notifications.length === 0 
                ? 'Nenhuma notificação encontrada' 
                : 'Nenhuma notificação com os filtros selecionados'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {notifications.length === 0 
                ? 'Você está em dia com suas notificações!' 
                : 'Tente ajustar os filtros de busca'}
            </Text>
            {(filterStatus !== 'todos' || searchQuery !== '') && (
              <TouchableOpacity 
                style={styles.clearFiltersButton}
                onPress={limparFiltros}
              >
                <Text style={styles.clearFiltersText}>Limpar Filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de Detalhes */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes da Notificação</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedNotification && (
              <>
                <View style={styles.modalIconTitle}>
                  <Text style={styles.modalIcon}>
                    {getTipoInfo(selectedNotification.tipoNotificacao).icon}
                  </Text>
                  <Text style={styles.modalNotificationTitle}>
                    {selectedNotification.titulo}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusInfo(selectedNotification.status).color + '20' 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: getStatusInfo(selectedNotification.status).color 
                    }]}>
                      {getStatusInfo(selectedNotification.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mensagem</Text>
                  <Text style={styles.detailValue}>{selectedNotification.mensagem}</Text>
                </View>

                {selectedNotification.dadosVisita && (
                  <>
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Data da Visita</Text>
                      <Text style={styles.detailValue}>
                        {formatVisitDate(selectedNotification.dadosVisita.dataVisita)}
                      </Text>
                    </View>
                    {selectedNotification.dadosVisita.confirmada === false && (
                      <Text style={[styles.detailValue, styles.rejectionReason]}>
                        ⚠️ O analista não pôde confirmar esta data.
                      </Text>
                    )}
                  </>
                )}

                {selectedNotification.motivoRejeicao && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Motivo da Rejeição</Text>
                    <Text style={[styles.detailValue, styles.rejectionReason]}>
                      {selectedNotification.motivoRejeicao}
                    </Text>
                  </View>
                )}

                {/* Botão de Avaliação no Modal */}
                {selectedNotification.tipoNotificacao === 'analise_concluida' && 
                 selectedNotification.statusAvaliacao === 'pendente' && (
                  <TouchableOpacity 
                    style={styles.evaluateButton}
                    onPress={() => handleAvaliarServico(selectedNotification)}
                  >
                    <Text style={styles.evaluateButtonText}>⭐ Avaliar Serviço</Text>
                  </TouchableOpacity>
                )}
                
                {selectedNotification.tipoNotificacao === 'analise_concluida' && 
                 selectedNotification.statusAvaliacao === 'concluida' && (
                  <View style={styles.ratedBadge}>
                    <Text style={styles.ratedText}>✅ Você já avaliou este serviço</Text>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Data de Criação</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedNotification.dataSolicitacao)}
                  </Text>
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.closeModalButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },

  // Cabeçalho
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  // Filtros
  filterContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: BORDER.radius.md,
    ...SHADOW.light,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
    color: COLORS.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: COLORS.gray[100],
    borderWidth: BORDER.width.thin,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER.radius.md,
    padding: SPACING.sm,
    fontSize: 14,
  },
  clearButton: {
    position: 'absolute',
    right: SPACING.sm,
    backgroundColor: COLORS.gray[400],
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 12,
    color: COLORS.gray[700],
    fontWeight: 'bold',
  },
  filterGroup: {
    marginBottom: SPACING.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  filterButton: {
    backgroundColor: COLORS.gray[200],
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.xl,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 13,
    color: COLORS.text.secondary,
  },
  filterButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  filterFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  counterText: {
    fontSize: 12,
    color: COLORS.text.light,
  },

  // Cards de Notificação
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER.radius.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderLeftWidth: BORDER.width.thick,
    ...SHADOW.light,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tipoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray[200],
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.lg,
  },
  tipoIcon: {
    fontSize: 14,
    marginRight: SPACING.xs,
  },
  tipoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  cardData: {
    borderTopWidth: BORDER.width.thin,
    borderTopColor: COLORS.gray[300],
    paddingTop: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  dataText: {
    fontSize: 13,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  dataLabel: {
    fontWeight: 'bold',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.light,
    textAlign: 'right',
  },

  // Botões
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: SPACING.xs,
    borderTopWidth: BORDER.width.thin,
    borderTopColor: COLORS.gray[300],
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
  },
  buttonSecondary: {
    backgroundColor: COLORS.gray[200],
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
  },
  buttonSecondaryText: {
    color: COLORS.text.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  buttonSuccess: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Badge de Avaliado
  ratedBadge: {
    backgroundColor: '#E8F5E8',
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
  },
  ratedText: {
    color: COLORS.secondary,
    fontWeight: 'bold',
    fontSize: 12,
  },

  // Estados Vazios
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.text.light,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },

  // Botões de Ação
  clearFiltersButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.xl,
    marginTop: SPACING.sm,
  },
  clearFiltersText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: 'bold',
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.light,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: SPACING.md,
    borderBottomWidth: BORDER.width.thin,
    borderBottomColor: COLORS.gray[300],
    backgroundColor: COLORS.white,
  },
  modalContent: {
    flex: 1,
    padding: SPACING.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  closeButton: {
    backgroundColor: COLORS.gray[200],
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },

  // Conteúdo do Modal
  modalIconTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  modalNotificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    flex: 1,
  },

  // Seções de Detalhes
  detailSection: {
    marginBottom: SPACING.md,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  statusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
    alignSelf: 'flex-start',
  },

  // Botão de Avaliação
  evaluateButton: {
    backgroundColor: '#FFA500',
    padding: SPACING.md,
    borderRadius: BORDER.radius.md,
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  evaluateButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Textos Especiais
  rejectionReason: {
    color: COLORS.danger,
    fontStyle: 'italic',
  },

  // Ações do Modal
  modalActions: {
    marginTop: SPACING.lg,
  },
  modalButton: {
    padding: SPACING.md,
    borderRadius: BORDER.radius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeModalButton: {
    backgroundColor: COLORS.gray[600],
  },

  // Textos
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.text.secondary,
  },
});

export default NotificacoesProprietario;