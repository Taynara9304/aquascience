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
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import DetalhesSolicitacaoAnalise from '../componentes/DetalhesSolicitacaoAnalise';
import DetalhesSolicitacaoVisita from '../componentes/DetalhesSolicitacaoVisita';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

// Cores do tema
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

const NotificacoesAdm = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [carregandoId, setCarregandoId] = useState(null);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterTipo, setFilterTipo] = useState('todos');
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  // Calcular data de 30 dias atrás
  const getThirtyDaysAgo = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return Timestamp.fromDate(date);
  };

  useEffect(() => {
    const unsubscribe = carregarNotificacoes();
    
    // Limpar notificações antigas ao carregar o componente
    limparNotificacoesAntigas();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [notifications, filterStatus, filterTipo, searchQuery]);

  const carregarNotificacoes = async () => {
    try {
      setLoading(true);
      console.log('📥 Carregando notificações dos últimos 30 dias...');
      
      const trintaDiasAtras = getThirtyDaysAgo();
      
      const q = query(
        collection(db, 'notifications'),
        where('dataCriacao', '>=', trintaDiasAtras),
        orderBy('dataCriacao', 'desc')
      );

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const notificacoesList = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            notificacoesList.push({
              id: doc.id,
              ...data
            });
          });
          
          console.log('✅ Notificações carregadas:', notificacoesList.length);
          
          setNotifications(notificacoesList);
          setLoading(false);
          setRefreshing(false);
        }, 
        (error) => {
          console.error('❌ Erro ao carregar notificações:', error);
          setLoading(false);
          setRefreshing(false);
          Alert.alert('Erro', 'Não foi possível carregar as notificações');
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro geral:', error);
      setLoading(false);
      setRefreshing(false);
      Alert.alert('Erro', 'Não foi possível carregar as notificações');
    }
  };

  const aplicarFiltros = () => {
    let filtradas = [...notifications];

    // Filtro por status
    if (filterStatus !== 'todos') {
      filtradas = filtradas.filter(notificacao => notificacao.status === filterStatus);
    }

    // Filtro por tipo
    if (filterTipo !== 'todos') {
      filtradas = filtradas.filter(notificacao => notificacao.tipo === filterTipo);
    }

    // Filtro por busca
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      filtradas = filtradas.filter(notificacao => {
        const buscaAnalista = notificacao.dadosSolicitacao?.analistaNome?.toLowerCase().includes(query) ||
                            notificacao.dadosVisita?.analistaNome?.toLowerCase().includes(query);
        const buscaPoco = notificacao.dadosSolicitacao?.pocoNome?.toLowerCase().includes(query) ||
                         notificacao.dadosVisita?.pocoNome?.toLowerCase().includes(query);
        const buscaProprietario = notificacao.dadosSolicitacao?.proprietarioNome?.toLowerCase().includes(query) ||
                                 notificacao.dadosVisita?.proprietario?.toLowerCase().includes(query);
        
        return buscaAnalista || buscaPoco || buscaProprietario;
      });
    }

    setFilteredNotifications(filtradas);
  };

  // 🔧 FUNÇÃO PARA LIMPAR NOTIFICAÇÕES ANTIGAS
  const limparNotificacoesAntigas = async () => {
    try {
      const trintaDiasAtras = getThirtyDaysAgo();
      const q = query(
        collection(db, 'notifications'),
        where('dataCriacao', '<', trintaDiasAtras)
      );

      const querySnapshot = await getDocs(q);
      const deletarPromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
      
      await Promise.all(deletarPromises);
      console.log(`🗑️ ${deletarPromises.length} notificações antigas removidas`);
    } catch (error) {
      console.error('❌ Erro ao limpar notificações antigas:', error);
    }
  };

  // ✅ FUNÇÃO CORRIGIDA PARA ACEITAR ANÁLISE
  const handleAceitarAnalise = async (notification) => {
    if (carregandoId) return;

    try {
      setCarregandoId(notification.id);
      
      if (notification.status !== 'pendente') {
        Alert.alert('Aviso', 'Esta solicitação já foi processada.');
        setCarregandoId(null);
        return;
      }

      const dados = notification.dadosSolicitacao;
      
      // Verificar dados essenciais
      if (!dados?.idProprietario || !dados?.idAnalista || !dados?.idPoco) {
        Alert.alert('Erro', 'Dados da análise incompletos.');
        setCarregandoId(null);
        return;
      }

      // Criar análise na coleção 'analysis'
      const analiseAprovada = {
        idAnalista: dados.idAnalista,
        analistaNome: dados.analistaNome || 'Analista',
        idProprietario: dados.idProprietario,
        proprietarioNome: dados.proprietarioNome || 'Proprietário',
        idPoco: dados.idPoco,
        pocoNome: dados.pocoNome || 'Poço',
        pocoLocalizacao: dados.pocoLocalizacao || 'Localização não informada',
        dataColeta: dados.dataColeta || Timestamp.now(),
        dataCriacao: Timestamp.now(),
        dataAprovacao: Timestamp.now(),
        aprovadoPor: user.uid,
        aprovadoPorNome: user.displayName || 'Administrador',
        resultado: dados.resultado || 'Resultado não informado',
        parametros: dados.parametros || {},
        status: 'aprovada'
      };

      const docRef = await addDoc(collection(db, 'analysis'), analiseAprovada);

      // Atualizar notificação
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'aceita',
        dataResolucao: Timestamp.now(),
        resolvidoPor: user.uid
      });

      // Notificar analista
      const notificacaoAnalista = {
        tipo: 'analise_aprovada',
        titulo: '✅ Análise Aprovada',
        mensagem: `Sua solicitação de análise para o poço "${dados.pocoNome}" foi aprovada.`,
        userId: dados.idAnalista,
        status: 'nao_lida',
        dataCriacao: Timestamp.now(),
        dadosAnalise: {
          analiseId: docRef.id,
          pocoNome: dados.pocoNome
        }
      };
      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      Alert.alert('Sucesso', 'Análise aceita com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao aceitar análise:', error);
      Alert.alert('Erro', `Não foi possível aceitar a análise: ${error.message}`);
    } finally {
      setCarregandoId(null);
    }
  };

  // ✅ FUNÇÃO PARA REJEITAR ANÁLISE
  const handleRejeitarAnalise = async (notificationId, notification) => {
    if (!motivoRejeicao.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    try {
      setCarregandoId(notificationId);
      
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'rejeitada',
        dataResolucao: Timestamp.now(),
        resolvidoPor: user.uid,
        motivoRejeicao: motivoRejeicao
      });

      // Notificar analista
      const dados = notification.dadosSolicitacao;
      const notificacaoAnalista = {
        tipo: 'analise_rejeitada',
        titulo: '❌ Análise Rejeitada',
        mensagem: `Sua análise para o poço "${dados?.pocoNome}" foi rejeitada. Motivo: ${motivoRejeicao}`,
        userId: dados?.idAnalista,
        status: 'nao_lida',
        dataCriacao: Timestamp.now(),
        motivoRejeicao: motivoRejeicao
      };
      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      Alert.alert('Sucesso', 'Análise rejeitada!');
      setModalVisivel(false);
      setMotivoRejeicao('');
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar análise:', error);
      Alert.alert('Erro', `Não foi possível rejeitar: ${error.message}`);
    } finally {
      setCarregandoId(null);
    }
  };

  // ✅ FUNÇÃO: ACEITAR VISITA
  const handleAceitarVisita = async (notification) => {
    if (carregandoId) return;

    try {
      setCarregandoId(notification.id);
      
      if (notification.status !== 'pendente') {
        Alert.alert('Aviso', 'Esta solicitação já foi processada.');
        setCarregandoId(null);
        return;
      }

      const dados = notification.dadosVisita;
      
      if (!dados?.pocoId || !dados?.analistaId) {
        Alert.alert('Erro', 'Dados da visita incompletos.');
        setCarregandoId(null);
        return;
      }

      const visitaAprovada = {
        pocoId: dados.pocoId,
        pocoNome: dados.pocoNome,
        pocoLocalizacao: dados.pocoLocalizacao,
        proprietario: dados.proprietario,
        dataVisita: dados.dataVisita,
        situacao: dados.situacao || 'concluida',
        observacoes: dados.observacoes,
        resultado: dados.resultado || '',
        recomendacoes: dados.recomendacoes || '',
        analistaId: dados.analistaId,
        analistaNome: dados.analistaNome,
        tipoUsuario: dados.tipoUsuario,
        userId: dados.userId,
        status: 'aprovada',
        dataAprovacao: Timestamp.now(),
        aprovadoPor: user.uid,
        aprovadoPorNome: 'Administrador',
        dataCriacao: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, 'visits'), visitaAprovada);
      
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'aceita',
        dataResolucao: Timestamp.now(),
        resolvidoPor: user.uid
      });

      const notificacaoAnalista = {
        tipo: 'visita_aprovada',
        titulo: '✅ Visita Aprovada',
        mensagem: `Sua visita técnica no poço ${dados.pocoNome} foi aprovada.`,
        userId: dados.analistaId,
        status: 'nao_lida',
        dataCriacao: Timestamp.now(),
        dadosVisita: {
          visitaId: docRef.id,
          pocoNome: dados.pocoNome
        }
      };

      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      Alert.alert('Sucesso', 'Visita aprovada com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao aceitar visita:', error);
      Alert.alert('Erro', `Não foi possível aceitar a visita: ${error.message}`);
    } finally {
      setCarregandoId(null);
    }
  };

  // ✅ FUNÇÃO: REJEITAR VISITA
  const handleRejeitarVisita = async (notification) => {
    if (!motivoRejeicao.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    try {
      setCarregandoId(notification.id);
      
      const dados = notification.dadosVisita;
      
      await updateDoc(doc(db, 'notifications', notification.id), {
        status: 'rejeitada',
        dataResolucao: Timestamp.now(),
        resolvidoPor: user.uid,
        motivoRejeicao: motivoRejeicao
      });

      const notificacaoAnalista = {
        tipo: 'visita_rejeitada',
        titulo: '❌ Visita Rejeitada',
        mensagem: `Sua visita técnica no poço ${dados.pocoNome} foi rejeitada. Motivo: ${motivoRejeicao}`,
        userId: dados.analistaId,
        status: 'nao_lida',
        dataCriacao: Timestamp.now(),
        dadosVisita: {
          pocoNome: dados.pocoNome,
          motivoRejeicao: motivoRejeicao
        }
      };

      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      Alert.alert('Sucesso', 'Visita rejeitada com sucesso!');
      setModalVisivel(false);
      setMotivoRejeicao('');
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar visita:', error);
      Alert.alert('Erro', `Não foi possível rejeitar a visita: ${error.message}`);
    } finally {
      setCarregandoId(null);
    }
  };

  const verDetalhes = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalVisivel(true);
    setMotivoRejeicao('');
  };

  const fecharModal = () => {
    setModalVisivel(false);
    setSolicitacaoSelecionada(null);
    setMotivoRejeicao('');
  };

  const getTipoInfo = (tipo) => {
    switch (tipo) {
      case 'solicitacao_cadastro_analise':
        return { icon: '🔬', text: 'Análise', color: COLORS.primary };
      case 'solicitacao_cadastro_visita':
        return { icon: '📋', text: 'Visita Técnica', color: COLORS.secondary };
      default:
        return { icon: '📄', text: 'Solicitação', color: COLORS.gray[500] };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pendente': return COLORS.warning;
      case 'aceita': return COLORS.secondary;
      case 'rejeitada': return COLORS.danger;
      default: return COLORS.gray[500];
    }
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

  const onRefresh = () => {
    setRefreshing(true);
    carregarNotificacoes();
  };

  const limparFiltros = () => {
    setFilterStatus('todos');
    setFilterTipo('todos');
    setSearchQuery('');
  };

  const renderNotificationItem = ({ item }) => {
    const tipoInfo = getTipoInfo(item.tipo);
    const isAnalise = item.tipo === 'solicitacao_cadastro_analise';
    const isVisita = item.tipo === 'solicitacao_cadastro_visita';

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
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status === 'pendente' ? 'Pendente' : 
             item.status === 'aceita' ? 'Aceita' : 'Rejeitada'}
          </Text>
        </View>

        <Text style={styles.cardTitle}>
          {isAnalise ? 'Nova Análise Solicitada' : 
           isVisita ? 'Nova Visita Técnica' : 'Nova Solicitação'}
        </Text>
        
        <Text style={styles.cardMessage}>
          {isAnalise 
            ? `${item.dadosSolicitacao?.analistaNome || 'Analista'} solicitou cadastro de análise`
            : isVisita 
              ? `${item.dadosVisita?.analistaNome || 'Analista'} registrou uma visita técnica`
              : 'Nova solicitação'
          }
        </Text>
        
        <View style={styles.cardData}>
          <Text style={styles.dataText}>
            <Text style={styles.dataLabel}>Poço:</Text> {isAnalise ? item.dadosSolicitacao?.pocoNome : item.dadosVisita?.pocoNome}
          </Text>
          <Text style={styles.dataText}>
            <Text style={styles.dataLabel}>Analista:</Text> {isAnalise ? item.dadosSolicitacao?.analistaNome : item.dadosVisita?.analistaNome}
          </Text>
          {isVisita && (
            <Text style={styles.dataText}>
              <Text style={styles.dataLabel}>Data:</Text> {formatDate(item.dadosVisita?.dataVisita)}
            </Text>
          )}
        </View>
        
        <Text style={styles.timestamp}>
          {formatDate(item.dataCriacao)}
        </Text>

        {item.status === 'pendente' && (
          <View style={styles.actions}>
            <TouchableOpacity 
              style={styles.buttonSecondary}
              onPress={() => verDetalhes(item)}
            >
              <Text style={styles.buttonSecondaryText}>📋 Detalhes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonSuccess}
              onPress={() => isAnalise ? handleAceitarAnalise(item) : handleAceitarVisita(item)}
              disabled={carregandoId !== null}
            >
              {carregandoId === item.id ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.buttonText}>✅ Aceitar</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.buttonDanger}
              onPress={() => verDetalhes(item)}
              disabled={carregandoId !== null}
            >
              <Text style={styles.buttonText}>❌ Rejeitar</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status !== 'pendente' && (
          <View style={styles.processedContainer}>
            <Text style={styles.processedText}>
              {item.status === 'aceita' ? '✅ Processada - Aceita' : '❌ Processada - Rejeitada'}
            </Text>
            {item.dataResolucao && (
              <Text style={styles.processedDate}>
                Em: {formatDate(item.dataResolucao)}
              </Text>
            )}
            {item.motivoRejeicao && (
              <Text style={styles.motivoText}>
                Motivo: {item.motivoRejeicao}
              </Text>
            )}
          </View>
        )}
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
          placeholder="Buscar por analista, poço ou proprietário..."
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
              { key: 'aceita', label: 'Aceitas' },
              { key: 'rejeitada', label: 'Rejeitadas' }
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
              { key: 'solicitacao_cadastro_analise', label: 'Análises' },
              { key: 'solicitacao_cadastro_visita', label: 'Visitas' }
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.filterButton,
                  filterTipo === key && styles.filterButtonActive
                ]}
                onPress={() => setFilterTipo(key)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterTipo === key && styles.filterButtonTextActive
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
        {(filterStatus !== 'todos' || filterTipo !== 'todos' || searchQuery !== '') && (
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
      <Text style={styles.header}>Central de Notificações</Text>
      <Text style={styles.subHeader}>Solicitações de Análises e Visitas Técnicas</Text>
      
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
                ? 'As notificações são mantidas por 30 dias' 
                : 'Tente ajustar os filtros de busca'}
            </Text>
            {(filterStatus !== 'todos' || filterTipo !== 'todos' || searchQuery !== '') && (
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

      <Modal
        visible={modalVisivel}
        animationType="slide"
        onRequestClose={fecharModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {solicitacaoSelecionada?.tipo === 'solicitacao_cadastro_analise' 
                ? 'Detalhes da Análise' 
                : 'Detalhes da Visita'}
            </Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={fecharModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {solicitacaoSelecionada?.tipo === 'solicitacao_cadastro_analise' ? (
              <>
                <DetalhesSolicitacaoAnalise solicitacao={solicitacaoSelecionada} />
                
                {solicitacaoSelecionada?.status === 'pendente' && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.inputLabel}>Motivo da Rejeição *</Text>
                    <TextInput
                      style={styles.textArea}
                      value={motivoRejeicao}
                      onChangeText={setMotivoRejeicao}
                      placeholder="Informe o motivo da rejeição..."
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    <Text style={styles.helperText}>
                      * Obrigatório apenas para rejeição
                    </Text>
                    
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={[
                          styles.modalButton, 
                          styles.rejectButton,
                          !motivoRejeicao.trim() && styles.buttonDisabled
                        ]}
                        onPress={() => handleRejeitarAnalise(solicitacaoSelecionada.id, solicitacaoSelecionada)}
                        disabled={!motivoRejeicao.trim() || carregandoId !== null}
                      >
                        {carregandoId === solicitacaoSelecionada?.id ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <Text style={styles.modalButtonText}>Rejeitar Análise</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            ) : (
              <>
                <DetalhesSolicitacaoVisita solicitacao={solicitacaoSelecionada} />
                
                {solicitacaoSelecionada?.status === 'pendente' && (
                  <View style={styles.rejectionSection}>
                    <Text style={styles.inputLabel}>Motivo da Rejeição *</Text>
                    <TextInput
                      style={styles.textArea}
                      value={motivoRejeicao}
                      onChangeText={setMotivoRejeicao}
                      placeholder="Informe o motivo da rejeição..."
                      multiline={true}
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    <Text style={styles.helperText}>
                      * Obrigatório apenas para rejeição
                    </Text>
                    
                    <View style={styles.modalActions}>
                      <TouchableOpacity 
                        style={[
                          styles.modalButton, 
                          styles.rejectButton,
                          !motivoRejeicao.trim() && styles.buttonDisabled
                        ]}
                        onPress={() => handleRejeitarVisita(solicitacaoSelecionada)}
                        disabled={!motivoRejeicao.trim() || carregandoId !== null}
                      >
                        {carregandoId === solicitacaoSelecionada?.id ? (
                          <ActivityIndicator size="small" color={COLORS.white} />
                        ) : (
                          <Text style={styles.modalButtonText}>Rejeitar Visita</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
  buttonDanger: {
    backgroundColor: COLORS.danger,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER.radius.sm,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },

  // Estados Processados
  processedContainer: {
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: BORDER.width.thin,
    borderTopColor: COLORS.gray[300],
  },
  processedText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  processedDate: {
    fontSize: 12,
    color: COLORS.text.light,
  },
  motivoText: {
    fontSize: 12,
    color: COLORS.danger,
    fontStyle: 'italic',
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

  // Seção de Rejeição
  rejectionSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    marginTop: SPACING.xs,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  textArea: {
    backgroundColor: COLORS.gray[100],
    borderWidth: BORDER.width.thin,
    borderColor: COLORS.gray[300],
    borderRadius: BORDER.radius.sm,
    padding: SPACING.sm,
    fontSize: 14,
    minHeight: 80,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.text.light,
    marginTop: SPACING.xs,
  },
  modalActions: {
    marginTop: SPACING.md,
  },
  modalButton: {
    padding: SPACING.sm,
    borderRadius: BORDER.radius.sm,
    alignItems: 'center',
  },
  modalButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
  rejectButton: {
    backgroundColor: COLORS.danger,
  },
  buttonDisabled: {
    backgroundColor: COLORS.gray[400],
  },

  // Textos
  loadingText: {
    marginTop: SPACING.sm,
    color: COLORS.text.secondary,
  },
});

export default NotificacoesAdm;