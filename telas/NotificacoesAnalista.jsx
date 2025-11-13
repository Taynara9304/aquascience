import React, { useState, useEffect, useRef } from 'react';
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
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc, 
  doc,
  getDocs,
  writeBatch
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

// Cores do tema (mesmo sistema da tela anterior)
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

const NotificacoesAnalista = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterType, setFilterType] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  
  const unsubscribeListener = useRef(null);

  useEffect(() => {
    if (user) {
      setLoading(true);
      const initializeAndLoad = async () => {
        await deleteOldNotifications();
        loadNotifications();
      };

      initializeAndLoad();
    }
    
    return () => {
      if (unsubscribeListener.current) {
        unsubscribeListener.current();
        unsubscribeListener.current = null;
      }
    };
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [notifications, filterStatus, filterType, searchQuery]);

  const deleteOldNotifications = async () => {
    if (!user) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const qOld = query(
        collection(db, 'notifications_analista'),
        where('userId', '==', user.uid),
        where('dataCriacao', '<', thirtyDaysAgo)
      );

      const querySnapshot = await getDocs(qOld);

      if (querySnapshot.empty) return;

      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      
    } catch (error) {
      console.error('Erro ao excluir notificações antigas:', error);
    }
  };

  const loadNotifications = () => {
    if (unsubscribeListener.current) {
      unsubscribeListener.current();
    }
    
    if (!refreshing) setLoading(true);
    
    try {
      const q = query(
        collection(db, 'notifications_analista'),
        where('userId', '==', user?.uid),
        orderBy('dataCriacao', 'desc')
      );

      unsubscribeListener.current = onSnapshot(q, (querySnapshot) => {
        const notificationsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          notificationsList.push({ 
            id: doc.id, 
            ...data
          });
        });
        
        setNotifications(notificationsList);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error('Erro no snapshot:', error);
        setLoading(false);
        setRefreshing(false);
        Alert.alert("Erro", "Não foi possível carregar as notificações.");
      });

    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert("Erro", "Ocorreu um problema ao buscar suas notificações.");
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const notificationRef = doc(db, 'notifications_analista', notificationId);
      await updateDoc(notificationRef, {
        status: 'lida',
        dataLeitura: new Date()
      });
      
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      Alert.alert('Erro', 'Não foi possível marcar a notificação como lida');
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(notif => notif.status === 'nao_lida');
      
      if (unreadNotifications.length === 0) {
        Alert.alert('Info', 'Todas as notificações já estão lidas');
        return;
      }

      const updatePromises = unreadNotifications.map(notif =>
        updateDoc(doc(db, 'notifications_analista', notif.id), {
          status: 'lida',
          dataLeitura: new Date()
        })
      );

      await Promise.all(updatePromises);
      Alert.alert('Sucesso', `${unreadNotifications.length} notificações marcadas como lidas`);
      
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
      Alert.alert('Erro', 'Não foi possível marcar todas as notificações como lidas');
    }
  };

  const applyFilters = () => {
    let filtered = [...notifications];

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(notification => notification.status === filterStatus);
    }

    // Filtro por tipo
    if (filterType === 'aprovadas') {
      filtered = filtered.filter(notification => 
        notification.tipo.includes('aprovada')
      );
    } else if (filterType === 'rejeitadas') {
      filtered = filtered.filter(notification => 
        notification.tipo.includes('rejeitada')
      );
    }

    // Filtro por busca
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(notification => {
        const buscaTitulo = notification.titulo?.toLowerCase().includes(query);
        const buscaMensagem = notification.mensagem?.toLowerCase().includes(query);
        const buscaPoco = notification.dadosAnalise?.pocoNome?.toLowerCase().includes(query) ||
                         notification.dadosVisita?.pocoNome?.toLowerCase().includes(query);
        
        return buscaTitulo || buscaMensagem || buscaPoco;
      });
    }

    setFilteredNotifications(filtered);
  };

  const getTipoInfo = (tipo) => {
    const tipoMap = {
      'analise_aprovada': { icon: '✅', text: 'Análise Aprovada', color: COLORS.secondary },
      'analise_rejeitada': { icon: '❌', text: 'Análise Rejeitada', color: COLORS.danger },
      'visita_aprovada': { icon: '📅', text: 'Visita Aprovada', color: COLORS.secondary },
      'visita_rejeitada': { icon: '❌', text: 'Visita Rejeitada', color: COLORS.danger }
    };

    return tipoMap[tipo] || { icon: '🔔', text: 'Notificação', color: COLORS.primary };
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      'nao_lida': { text: 'Não Lida', color: COLORS.warning, bgColor: '#FFF4E6' },
      'lida': { text: 'Lida', color: COLORS.secondary, bgColor: '#E8F5E8' }
    };

    return statusMap[status] || { text: status, color: COLORS.gray[500], bgColor: COLORS.gray[200] };
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

  const viewNotificationDetails = async (notification) => {
    if (notification.status === 'nao_lida') {
      await markAsRead(notification.id);
    }
    
    setSelectedNotification(notification);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedNotification(null);
  };

  const onRefresh = () => {
    setRefreshing(true);
    const refreshData = async () => {
      await deleteOldNotifications();
      loadNotifications();
    }
    refreshData();
  };

  const limparFiltros = () => {
    setFilterStatus('todos');
    setFilterType('todos');
    setSearchQuery('');
  };

  const renderMarkAllButton = () => {
    const unreadCount = notifications.filter(notif => notif.status === 'nao_lida').length;
    
    if (unreadCount === 0) return null;

    return (
      <TouchableOpacity 
        style={styles.markAllButton}
        onPress={markAllAsRead}
      >
        <Text style={styles.markAllButtonText}>
          📨 Marcar Todas como Lidas ({unreadCount})
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFilterSection = () => (
    <View style={styles.filterContainer}>
      <Text style={styles.sectionTitle}>Filtrar Notificações</Text>
      
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por título, mensagem ou poço..."
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

      {/* Botão Marcar Todas como Lidas */}
      {renderMarkAllButton()}

      {/* Filtros de Status */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Status:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'nao_lida', label: 'Não Lidas' },
              { key: 'lida', label: 'Lidas' }
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

      {/* Filtros de Tipo */}
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>Tipo:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {[
              { key: 'todos', label: 'Todos' },
              { key: 'aprovadas', label: '✅ Aprovadas' },
              { key: 'rejeitadas', label: '❌ Rejeitadas' }
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  filterType === key && styles.filterButtonActive,
                  filterType === 'aprovadas' && key === 'aprovadas' && styles.filterButtonSuccess,
                  filterType === 'rejeitadas' && key === 'rejeitadas' && styles.filterButtonDanger,
                ]}
                onPress={() => setFilterType(key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === key && styles.filterButtonTextActive
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
        {(filterStatus !== 'todos' || filterType !== 'todos' || searchQuery !== '') && (
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

  const renderNotificationItem = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);
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
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bgColor }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.text}
            </Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>
          {item.titulo}
        </Text>
        
        <Text style={styles.cardMessage}>
          {item.mensagem}
        </Text>
        
        {/* Dados da análise */}
        {item.dadosAnalise && (
          <View style={styles.cardData}>
            <Text style={styles.dataText}>
              <Text style={styles.dataLabel}>Poço:</Text> {item.dadosAnalise.pocoNome}
            </Text>
            {item.dadosAnalise.analiseId && (
              <Text style={styles.dataText}>
                <Text style={styles.dataLabel}>ID Análise:</Text> {item.dadosAnalise.analiseId}
              </Text>
            )}
          </View>
        )}

        {/* Dados da visita */}
        {item.dadosVisita && (
          <View style={styles.cardData}>
            <Text style={styles.dataText}>
              <Text style={styles.dataLabel}>Poço:</Text> {item.dadosVisita.pocoNome}
            </Text>
            {item.dadosVisita.visitaId && (
              <Text style={styles.dataText}>
                <Text style={styles.dataLabel}>ID Visita:</Text> {item.dadosVisita.visitaId}
              </Text>
            )}
            {item.dadosVisita.motivoRejeicao && (
              <Text style={[styles.dataText, styles.rejectionText]}>
                <Text style={styles.dataLabel}>Motivo:</Text> {item.dadosVisita.motivoRejeicao}
              </Text>
            )}
          </View>
        )}
        
        <Text style={styles.timestamp}>
          {formatDate(item.dataCriacao)}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity 
            style={styles.buttonSecondary}
            onPress={() => viewNotificationDetails(item)}
          >
            <Text style={styles.buttonSecondaryText}>👁️ Detalhes</Text>
          </TouchableOpacity>
          
          {item.status === 'nao_lida' && (
            <TouchableOpacity 
              style={styles.buttonSuccess}
              onPress={() => markAsRead(item.id)}
            >
              <Text style={styles.buttonText}>📨 Marcar como Lida</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
      <Text style={styles.header}>Notificações do Analista</Text>
      <Text style={styles.subHeader}>Acompanhe o status das suas análises e visitas</Text>
      
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
                ? 'Você receberá notificações quando suas análises/visitas forem processadas' 
                : 'Tente ajustar os filtros de busca'}
            </Text>
            {(filterStatus !== 'todos' || filterType !== 'todos' || searchQuery !== '') && (
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
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Detalhes da Notificação</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={closeModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {selectedNotification && (
              <>
                <View style={styles.modalIconTitle}>
                  <Text style={styles.modalIcon}>
                    {getTipoInfo(selectedNotification.tipo).icon}
                  </Text>
                  <Text style={styles.modalNotificationTitle}>
                    {selectedNotification.titulo}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Status</Text>
                  <View style={[styles.statusBadge, { 
                    backgroundColor: getStatusInfo(selectedNotification.status).bgColor 
                  }]}>
                    <Text style={[styles.statusText, { 
                      color: getStatusInfo(selectedNotification.status).color 
                    }]}>
                      {getStatusInfo(selectedNotification.status).text}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tipo</Text>
                  <Text style={styles.detailValue}>
                    {getTipoInfo(selectedNotification.tipo).text}
                  </Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Mensagem</Text>
                  <Text style={styles.detailValue}>{selectedNotification.mensagem}</Text>
                </View>

                {/* Dados da análise */}
                {selectedNotification.dadosAnalise && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Informações da Análise</Text>
                    <View style={styles.dataGrid}>
                      <View style={styles.dataItem}>
                        <Text style={styles.dataLabel}>Poço</Text>
                        <Text style={styles.dataValue}>{selectedNotification.dadosAnalise.pocoNome}</Text>
                      </View>
                      {selectedNotification.dadosAnalise.analiseId && (
                        <View style={styles.dataItem}>
                          <Text style={styles.dataLabel}>ID da Análise</Text>
                          <Text style={styles.dataValue}>{selectedNotification.dadosAnalise.analiseId}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Dados da visita */}
                {selectedNotification.dadosVisita && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Informações da Visita</Text>
                    <View style={styles.dataGrid}>
                      <View style={styles.dataItem}>
                        <Text style={styles.dataLabel}>Poço</Text>
                        <Text style={styles.dataValue}>{selectedNotification.dadosVisita.pocoNome}</Text>
                      </View>
                      {selectedNotification.dadosVisita.visitaId && (
                        <View style={styles.dataItem}>
                          <Text style={styles.dataLabel}>ID da Visita</Text>
                          <Text style={styles.dataValue}>{selectedNotification.dadosVisita.visitaId}</Text>
                        </View>
                      )}
                      {selectedNotification.dadosVisita.motivoRejeicao && (
                        <View style={styles.dataItem}>
                          <Text style={styles.dataLabel}>Motivo da Rejeição</Text>
                          <Text style={[styles.dataValue, styles.rejectionText]}>
                            {selectedNotification.dadosVisita.motivoRejeicao}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Data de Recebimento</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(selectedNotification.dataCriacao)}
                  </Text>
                </View>

                {selectedNotification.dataLeitura && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Data de Leitura</Text>
                    <Text style={styles.detailValue}>
                      {formatDate(selectedNotification.dataLeitura)}
                    </Text>
                  </View>
                )}

                <View style={styles.modalActions}>
                  <TouchableOpacity 
                    style={[styles.modalButton, styles.closeModalButton]}
                    onPress={closeModal}
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
  markAllButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    borderRadius: BORDER.radius.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  markAllButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
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
  filterButtonSuccess: {
    backgroundColor: COLORS.secondary,
  },
  filterButtonDanger: {
    backgroundColor: COLORS.danger,
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
  statusBadge: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
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
  rejectionText: {
    color: COLORS.danger,
    fontStyle: 'italic',
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
  dataGrid: {
    gap: SPACING.xs,
  },
  dataItem: {
    backgroundColor: '#e8f4fd',
    padding: SPACING.sm,
    borderRadius: BORDER.radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  dataLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.primary,
  },
  dataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
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

export default NotificacoesAnalista;