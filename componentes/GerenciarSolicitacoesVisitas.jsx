// componentes/GerenciarSolicitacoesVisitas.js - VERSÃO CORRIGIDA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import DetalhesSolicitacaoVisita from './DetalhesSolicitacaoVisita';

const GerenciarSolicitacoesVisitas = () => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSolicitacao, setSelectedSolicitacao] = useState(null);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [processando, setProcessando] = useState(false);
  const { user, userData } = useAuth();

  useEffect(() => {
    carregarSolicitacoes();
  }, []);

  const carregarSolicitacoes = () => {
    setLoading(true);
    
    try {
      console.log('📥 Carregando solicitações de visitas...');
      
      const q = query(
        collection(db, 'notifications'),
        where('tipo', '==', 'solicitacao_cadastro_visita'),
        where('status', '==', 'pendente'),
        orderBy('dataCriacao', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const solicitacoesList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          solicitacoesList.push({
            id: doc.id,
            ...data
          });
        });
        
        console.log('✅ Solicitações de visitas carregadas:', solicitacoesList.length);
        console.log('🔍 Primeira solicitação:', solicitacoesList[0]);
        setSolicitacoes(solicitacoesList);
        setLoading(false);
        setRefreshing(false);
      }, (error) => {
        console.error('❌ Erro ao carregar solicitações:', error);
        setLoading(false);
        setRefreshing(false);
      });

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro geral:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ✅ CORREÇÃO: Função para aprovar visita
  const aprovarVisita = async (notificationId, visitData) => {
    try {
      console.log('✅ Aprovando visita:', visitData);

      if (!visitData) {
        throw new Error('Dados da visita não encontrados');
      }

      // 1. Adicionar visita na coleção principal
      const visitaAprovada = {
        // Dados básicos da visita
        pocoId: visitData.pocoId,
        pocoNome: visitData.pocoNome,
        pocoLocalizacao: visitData.pocoLocalizacao,
        proprietario: visitData.proprietario,
        dataVisita: visitData.dataVisita,
        situacao: visitData.situacao || 'concluida',
        observacoes: visitData.observacoes,
        resultado: visitData.resultado || '',
        recomendacoes: visitData.recomendacoes || '',
        
        // Informações do analista
        analistaId: visitData.analistaId,
        analistaNome: visitData.analistaNome,
        tipoUsuario: visitData.tipoUsuario,
        userId: visitData.userId, // ID do proprietário do poço
        
        // Metadados de aprovação
        status: 'aprovada',
        dataAprovacao: new Date().toISOString(),
        aprovadoPor: user.uid,
        aprovadoPorNome: userData?.nome || 'Administrador',
        dataCriacao: serverTimestamp()
      };

      console.log('📝 Dados da visita a ser salva:', visitaAprovada);

      const docRef = await addDoc(collection(db, 'visits'), visitaAprovada);
      
      // 2. Atualizar notificação como resolvida
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'aceita',
        dataResolucao: serverTimestamp(),
        resolvidoPor: user.uid,
        resolvidoPorNome: userData?.nome || 'Administrador'
      });

      // 3. Criar notificação para o analista
      const notificacaoAnalista = {
        tipo: 'visita_aprovada',
        titulo: '✅ Visita Aprovada',
        mensagem: `Sua visita técnica no poço ${visitData.pocoNome} foi aprovada e já está disponível no sistema.`,
        userId: visitData.analistaId,
        status: 'nao_lida',
        dataCriacao: serverTimestamp(),
        dadosVisita: {
          visitaId: docRef.id,
          pocoNome: visitData.pocoNome,
          dataVisita: visitData.dataVisita,
          resultado: 'Aprovada'
        }
      };

      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      console.log('✅ Visita aprovada e notificações enviadas');
      return true;
    } catch (error) {
      console.error('❌ Erro ao aprovar visita:', error);
      throw new Error('Não foi possível aprovar a visita: ' + error.message);
    }
  };

  // ✅ CORREÇÃO: Função para rejeitar visita
  const rejeitarVisita = async (notificationId, visitData, motivo) => {
    try {
      console.log('❌ Rejeitando visita:', visitData);

      if (!visitData) {
        throw new Error('Dados da visita não encontrados');
      }

      // 1. Atualizar notificação como rejeitada
      await updateDoc(doc(db, 'notifications', notificationId), {
        status: 'rejeitada',
        dataResolucao: serverTimestamp(),
        resolvidoPor: user.uid,
        resolvidoPorNome: userData?.nome || 'Administrador',
        motivoRejeicao: motivo
      });

      // 2. Criar notificação para o analista
      const notificacaoAnalista = {
        tipo: 'visita_rejeitada',
        titulo: '❌ Visita Rejeitada',
        mensagem: `Sua visita técnica no poço ${visitData.pocoNome} foi rejeitada. Motivo: ${motivo}`,
        userId: visitData.analistaId,
        status: 'nao_lida',
        dataCriacao: serverTimestamp(),
        dadosVisita: {
          pocoNome: visitData.pocoNome,
          dataVisita: visitData.dataVisita,
          motivoRejeicao: motivo
        }
      };

      await addDoc(collection(db, 'notifications_analista'), notificacaoAnalista);

      console.log('✅ Visita rejeitada e notificação enviada');
      return true;
    } catch (error) {
      console.error('❌ Erro ao rejeitar visita:', error);
      throw new Error('Não foi possível rejeitar a visita: ' + error.message);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    carregarSolicitacoes();
  };

  const visualizarDetalhes = (solicitacao) => {
    console.log('🔍 Visualizando detalhes da solicitação:', solicitacao);
    console.log('📋 Dados da visita:', solicitacao.dadosVisita);
    setSelectedSolicitacao(solicitacao);
    setModalVisible(true);
    setMotivoRejeicao(''); // Limpar motivo ao abrir nova solicitação
  };

  const aprovarSolicitacao = async () => {
    if (!selectedSolicitacao) {
      Alert.alert('Erro', 'Nenhuma solicitação selecionada');
      return;
    }
    
    try {
      setProcessando(true);
      
      console.log('📋 Tentando aprovar solicitação:', selectedSolicitacao.id);
      console.log('🔍 Dados da visita:', selectedSolicitacao.dadosVisita);
      
      if (!selectedSolicitacao.dadosVisita) {
        throw new Error('Dados da visita não encontrados na solicitação');
      }
      
      await aprovarVisita(selectedSolicitacao.id, selectedSolicitacao.dadosVisita);
      
      Alert.alert('✅ Sucesso', 'Visita aprovada com sucesso!');
      setModalVisible(false);
      setSelectedSolicitacao(null);
    } catch (error) {
      console.error('❌ Erro ao aprovar:', error);
      Alert.alert('❌ Erro', 'Não foi possível aprovar a visita: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const rejeitarSolicitacao = async () => {
    if (!selectedSolicitacao) {
      Alert.alert('Atenção', 'Nenhuma solicitação selecionada.');
      return;
    }

    if (!motivoRejeicao.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o motivo da rejeição.');
      return;
    }

    try {
      setProcessando(true);
      
      console.log('📋 Tentando rejeitar solicitação:', selectedSolicitacao.id);
      console.log('🔍 Dados da visita:', selectedSolicitacao.dadosVisita);
      
      if (!selectedSolicitacao.dadosVisita) {
        throw new Error('Dados da visita não encontrados na solicitação');
      }
      
      await rejeitarVisita(selectedSolicitacao.id, selectedSolicitacao.dadosVisita, motivoRejeicao);
      
      Alert.alert('✅ Sucesso', 'Visita rejeitada com sucesso!');
      setModalVisible(false);
      setSelectedSolicitacao(null);
      setMotivoRejeicao('');
    } catch (error) {
      console.error('❌ Erro ao rejeitar:', error);
      Alert.alert('❌ Erro', 'Não foi possível rejeitar a visita: ' + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Data não disponível';
    
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  const renderSolicitacaoItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.solicitacaoCard}
      onPress={() => visualizarDetalhes(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.analistaNome}>
          👨‍💼 {item.dadosVisita?.analistaNome || 'Analista'}
        </Text>
        <Text style={styles.dataSolicitacao}>
          {formatDate(item.dataCriacao)}
        </Text>
      </View>
      
      <Text style={styles.pocoNome}>
        🏭 {item.dadosVisita?.pocoNome || 'Poço não informado'}
      </Text>
      
      <Text style={styles.mensagem} numberOfLines={2}>
        {item.mensagem}
      </Text>
      
      <View style={styles.cardFooter}>
        <Text style={styles.statusPendente}>
          ⏳ Aguardando aprovação
        </Text>
        <Text style={styles.detalhesText}>
          Toque para ver detalhes →
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text>Carregando solicitações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Solicitações de Visitas Técnicas</Text>
      <Text style={styles.subHeader}>
        Aprove ou rejeite as visitas técnicas solicitadas pelos analistas
      </Text>

      <FlatList
        data={solicitacoes}
        renderItem={renderSolicitacaoItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2685BF']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              🎉 Nenhuma solicitação pendente!
            </Text>
            <Text style={styles.emptySubText}>
              Todas as visitas técnicas estão em dia
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Modal de detalhes */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Detalhes da Solicitação de Visita</Text>
              
              {/* ✅ USAR O COMPONENTE CORRETO PARA VISITAS */}
              <DetalhesSolicitacaoVisita solicitacao={selectedSolicitacao} />

              {/* Campo para motivo de rejeição */}
              <View style={styles.motivoSection}>
                <Text style={styles.motivoLabel}>Motivo da Rejeição *</Text>
                <TextInput
                  style={styles.textInput}
                  value={motivoRejeicao}
                  onChangeText={setMotivoRejeicao}
                  placeholder="Informe o motivo da rejeição..."
                  multiline={true}
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                <Text style={styles.motivoHelper}>
                  * Obrigatório apenas para rejeição
                </Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[
                    styles.modalButton, 
                    styles.rejectButton,
                    !motivoRejeicao.trim() && styles.rejectButtonDisabled
                  ]}
                  onPress={rejeitarSolicitacao}
                  disabled={processando || !motivoRejeicao.trim()}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>❌ Rejeitar</Text>
                  )}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.modalButton, styles.approveButton]}
                  onPress={aprovarSolicitacao}
                  disabled={processando}
                >
                  {processando ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Text style={styles.modalButtonText}>✅ Aprovar</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>

        <View style={styles.debugContainer}>
  <TouchableOpacity 
    style={styles.debugButton}
    onPress={() => {
      console.log('🔍 DEBUG: Todas as solicitações:', solicitacoes);
      if (solicitacoes.length > 0) {
        console.log('🔍 DEBUG: Primeira solicitação:', solicitacoes[0]);
        console.log('🔍 DEBUG: DadosVisita da primeira:', solicitacoes[0].dadosVisita);
      }
    }}
  >
    <Text style={styles.debugButtonText}>🔍 Debug Solicitações</Text>
  </TouchableOpacity>
</View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 16,
    color: '#333',
  },
  subHeader: {
    fontSize: 14,
    textAlign: 'center',
    color: '#666',
    marginBottom: 16,
  },
  listContent: {
    flexGrow: 1,
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
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analistaNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  dataSolicitacao: {
    fontSize: 12,
    color: '#666',
  },
  pocoNome: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2685BF',
    marginBottom: 8,
  },
  mensagem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPendente: {
    fontSize: 12,
    color: '#FFA500',
    fontWeight: '500',
  },
  detalhesText: {
    fontSize: 12,
    color: '#2685BF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  motivoSection: {
    marginVertical: 16,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
  motivoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: 'white',
  },
  motivoHelper: {
    fontSize: 12,
    color: '#856404',
    marginTop: 4,
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 16,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  rejectButtonDisabled: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  closeButtonText: {
    color: '#2685BF',
    fontWeight: '500',
  },
});

export default GerenciarSolicitacoesVisitas;