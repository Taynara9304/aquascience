// componentes/TabelaVisitasAdmin.js - VERSÃO COM GESTOS CORRIGIDOS
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const CARD_WIDTH = screenWidth * (isMobile ? 0.8 : 0.3);
const CARD_MARGIN = 12;

const TabelaVisitasAdmin = ({ 
  visits = [], 
  onEdit, 
  onDelete, 
  sortField, 
  sortDirection, 
  onSort,
  loading = false
}) => {
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [editandoVisita, setEditandoVisita] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  const flatListRef = useRef(null);

  // ✅ CORREÇÃO: Handlers para gestos
  const handleScrollEndDrag = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN * 2));
    
    if (newIndex >= 0 && newIndex < visits.length) {
      setPaginaAtual(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    // Marca que o scroll horizontal começou
  };

  // Função para formatar data
  const formatarData = (dataString) => {
    if (!dataString) return 'Data não informada';
    try {
      const data = new Date(dataString);
      return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Função para obter cor do status
  const getCorStatus = (situacao) => {
    switch (situacao?.toLowerCase()) {
      case 'concluida':
      case 'aprovada':
        return '#4CAF50';
      case 'pendente':
      case 'solicitada':
        return '#FFA000';
      case 'cancelada':
      case 'recusada':
        return '#F44336';
      case 'em_andamento':
        return '#2196F3';
      default:
        return '#666';
    }
  };

  // Navegação entre páginas
  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
    flatListRef.current?.scrollToIndex({ index: pagina, animated: true });
  };

  // Confirmar exclusão
  const confirmarExclusao = (visit) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a visita do poço "${visit.pocoNome}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDelete(visit.id)
        }
      ]
    );
  };

  // Abrir modal de edição
  const abrirEdicao = (visit) => {
    setEditandoVisita(visit);
    setDadosEdicao({
      dataVisita: visit.dataVisita ? new Date(visit.dataVisita) : new Date(),
      situacao: visit.situacao || 'pendente',
      observacoes: visit.observacoes || '',
      resultado: visit.resultado || '',
      recomendacoes: visit.recomendacoes || ''
    });
  };

  // Salvar edição
  const salvarEdicao = async () => {
    if (!editandoVisita) return;

    try {
      await onEdit(editandoVisita.id, dadosEdicao);
      Alert.alert('Sucesso', 'Visita atualizada com sucesso!');
      setEditandoVisita(null);
      setDadosEdicao({});
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a visita');
    }
  };

  // Renderizar cada card
  const renderItem = ({ item: visit }) => (
    <View style={styles.card}>
      {/* Cabeçalho com Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.pocoNome} numberOfLines={1}>
            {visit.pocoNome || 'Poço não informado'}
          </Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getCorStatus(visit.situacao) }
          ]}>
            <Text style={styles.statusText}>
              {visit.situacao || 'Não informada'}
            </Text>
          </View>
        </View>
        <Text style={styles.data}>
          {formatarData(visit.dataVisita)}
        </Text>
      </View>

      {/* Informações da Visita */}
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>👤 Proprietário:</Text>
          <Text style={styles.infoValue}>
            {visit.proprietarioNome || visit.proprietario || 'Não informado'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📋 Tipo:</Text>
          <Text style={styles.infoValue}>
            {visit.tipo === 'solicitacao_proprietario_whatsapp' ? 'WhatsApp' : 
             visit.tipo === 'solicitacao_analista' ? 'Analista' : 'Administrador'}
          </Text>
        </View>

        {visit.observacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>📝 Observações:</Text>
            <Text style={styles.observacoesText} numberOfLines={3}>
              {visit.observacoes}
            </Text>
          </View>
        )}

        {visit.resultado && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>🔍 Resultados:</Text>
            <Text style={styles.observacoesText} numberOfLines={3}>
              {visit.resultado}
            </Text>
          </View>
        )}
      </View>

      {/* Ações do ADMIN */}
      <View style={styles.cardAcoes}>
        <TouchableOpacity 
          style={styles.botaoEditar}
          onPress={() => abrirEdicao(visit)}
        >
          <Text style={styles.botaoTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoDeletar}
          onPress={() => confirmarExclusao(visit)}
        >
          <Text style={styles.botaoTexto}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando visitas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        📊 Gestão de Visitas ({visits.length})
      </Text>
      
      {/* Ordenação */}
      <View style={styles.ordenacaoContainer}>
        <Text style={styles.ordenacaoTitulo}>Ordenar:</Text>
        <TouchableOpacity 
          style={[
            styles.ordenacaoBotao,
            sortField === 'dataVisita' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('dataVisita')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Data {sortField === 'dataVisita' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.ordenacaoBotao,
            sortField === 'pocoNome' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('pocoNome')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Poço {sortField === 'pocoNome' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ✅ CORREÇÃO: Carousel com gestos otimizados */}
      {visits.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={visits}
            renderItem={renderItem}
            keyExtractor={(item) => item.id || Math.random().toString()}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={true}
            snapToInterval={null}
            snapToAlignment="center"
            decelerationRate="normal"
            // ✅ Handlers para gestos
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleScrollEndDrag}
            // ✅ Configurações para melhor performance de gestos
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            alwaysBounceHorizontal={true}
            alwaysBounceVertical={false}
            bounces={true}
            overScrollMode="always"
            contentContainerStyle={styles.carouselContent}
            style={styles.flatList}
          />
          
          {visits.length > 1 && (
            <View style={styles.paginacaoContainer}>
              <Text style={styles.paginacaoTexto}>
                {paginaAtual + 1} de {visits.length}
              </Text>
              <View style={styles.paginacaoPontos}>
                {visits.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => irParaPagina(index)}
                  >
                    <View
                      style={[
                        styles.ponto,
                        index === paginaAtual && styles.pontoAtivo
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.semDadosContainer}>
          <Text style={styles.semDados}>📭 Nenhuma visita cadastrada</Text>
        </View>
      )}

      {/* Modal de Edição (mantido igual) */}
      <Modal
        visible={!!editandoVisita}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>✏️ Editar Visita</Text>
            
            <Text style={styles.modalSubtitulo}>
              {editandoVisita?.pocoNome}
            </Text>

            <Text style={styles.inputLabel}>Situação:</Text>
            <View style={styles.statusOptions}>
              {['pendente', 'em_andamento', 'concluida', 'cancelada'].map(status => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusOption,
                    dadosEdicao.situacao === status && styles.statusOptionAtivo
                  ]}
                  onPress={() => setDadosEdicao(prev => ({ ...prev, situacao: status }))}
                >
                  <Text style={[
                    styles.statusOptionText,
                    dadosEdicao.situacao === status && styles.statusOptionTextAtivo
                  ]}>
                    {status}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Observações:</Text>
            <TextInput
              style={styles.textInput}
              value={dadosEdicao.observacoes}
              onChangeText={(text) => setDadosEdicao(prev => ({ ...prev, observacoes: text }))}
              placeholder="Observações da visita..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Resultados:</Text>
            <TextInput
              style={styles.textInput}
              value={dadosEdicao.resultado}
              onChangeText={(text) => setDadosEdicao(prev => ({ ...prev, resultado: text }))}
              placeholder="Resultados das análises..."
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.modalAcoes}>
              <TouchableOpacity 
                style={styles.modalBotaoCancelar}
                onPress={() => setEditandoVisita(null)}
              >
                <Text style={styles.modalBotaoTexto}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.modalBotaoSalvar}
                onPress={salvarEdicao}
              >
                <Text style={styles.modalBotaoTexto}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2685BF',
    textAlign: 'center',
  },
  ordenacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    flexWrap: 'wrap',
  },
  ordenacaoTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  ordenacaoBotao: {
    backgroundColor: '#f1f3f4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ordenacaoBotaoAtivo: {
    backgroundColor: '#2685BF',
  },
  ordenacaoBotaoTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  carouselContainer: {
    flex: 1,
    minHeight: 300,
  },
  carouselContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 0,
  },
  flatList: {
    flex: 1,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  pocoNome: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  data: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    textAlign: 'right',
  },
  cardContent: {
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 100,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    fontWeight: '500',
  },
  observacoesContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  observacoesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  observacoesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  cardAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  botaoEditar: {
    backgroundColor: '#FFA500',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoDeletar: {
    backgroundColor: '#FF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginacaoContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  paginacaoTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  paginacaoPontos: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  ponto: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
  },
  pontoAtivo: {
    backgroundColor: '#2685BF',
    width: 16,
  },
  semDadosContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  semDados: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2685BF',
  },
  modalSubtitulo: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  statusOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  statusOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f1f3f4',
  },
  statusOptionAtivo: {
    backgroundColor: '#2685BF',
  },
  statusOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusOptionTextAtivo: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  modalAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalBotaoCancelar: {
    flex: 1,
    backgroundColor: '#ccc',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotaoSalvar: {
    flex: 1,
    backgroundColor: '#2685BF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TabelaVisitasAdmin;