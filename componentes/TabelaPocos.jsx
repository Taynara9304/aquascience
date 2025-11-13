// componentes/TabelaPocos.js - VERSÃO COM FIX PARA WEB
import React, { useState, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Dimensions,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const CARD_WIDTH = screenWidth * (isMobile ? 0.8 : 0.25);
const CARD_MARGIN = 8;

const TabelaPocos = ({ 
  wells = [],
  onEdit, 
  onDelete, 
  sortField, 
  sortDirection, 
  onSort,
  loading = false
}) => {
  const [busca, setBusca] = useState('');
  const [filtroProprietario, setFiltroProprietario] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [editandoPoço, setEditandoPoço] = useState(null);
  const [observacoesEdit, setObservacoesEdit] = useState('');
  const [inputFocado, setInputFocado] = useState(false); // ✅ Novo estado para foco
  const flatListRef = useRef(null);
  const buscaInputRef = useRef(null); // ✅ Ref para o input

  const wellsSeguro = wells || [];

  const proprietariosUnicos = useMemo(() => {
    const proprietarios = wellsSeguro
      .map(well => well.nomeProprietario)
      .filter(Boolean);
    return [...new Set(proprietarios)];
  }, [wellsSeguro]);

  const poçosFiltrados = useMemo(() => {
    const filtrados = wellsSeguro.filter(well => {
      const nomeProprietario = well.nomeProprietario || '';
      const observacoes = well.observacoes || '';
      const idProprietario = well.idProprietario || '';
      
      const matchBusca = 
        nomeProprietario.toLowerCase().includes(busca.toLowerCase()) ||
        observacoes.toLowerCase().includes(busca.toLowerCase()) ||
        idProprietario.toString().toLowerCase().includes(busca.toLowerCase());
      
      const matchFiltro = 
        filtroProprietario === 'todos' || 
        well.nomeProprietario === filtroProprietario;
      
      return matchBusca && matchFiltro;
    });
    
    setPaginaAtual(0);
    return filtrados;
  }, [wellsSeguro, busca, filtroProprietario]);

  // ✅ Função para forçar foco no input (especialmente para web)
  const handleContainerPress = () => {
    if (Platform.OS === 'web' && !inputFocado) {
      buscaInputRef.current?.focus();
    }
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'Nunca';
    try {
      if (timestamp.toDate) {
        return timestamp.toDate().toLocaleDateString('pt-BR');
      }
      return new Date(timestamp).toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
    flatListRef.current?.scrollToIndex({ index: pagina, animated: true });
  };

  const handleEditar = (well) => {
    setEditandoPoço(well);
    setObservacoesEdit(well.observacoes || '');
  };

  const handleSalvarEdicao = async () => {
    if (!editandoPoço) return;

    try {
      await onEdit(editandoPoço.id, {
        observacoes: observacoesEdit
      });
      
      Alert.alert('Sucesso', 'Observações atualizadas com sucesso!');
      setEditandoPoço(null);
      setObservacoesEdit('');
    } catch (error) {
      console.error('Erro ao editar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar as observações');
    }
  };

  const renderItem = ({ item: well }) => (
    <View style={styles.card}>
      {/* ... (mantenha o mesmo código do card) ... */}
      <View style={styles.cardHeader}>
        <Text style={styles.proprietarioNome} numberOfLines={1}>
          {well.nomeProprietario || 'Sem nome'}
        </Text>
        <Text style={styles.data}>
          {formatarData(well.dataCadastro)}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.infoLabel}>📍</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {well.localizacao ? 
            `${well.localizacao.latitude?.toFixed(4) || 'N/A'}° S, ${well.localizacao.longitude?.toFixed(4) || 'N/A'}° W` 
            : 'Não informada'
          }
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.infoLabel}>👤</Text>
        <Text style={styles.infoValue} numberOfLines={1}>
          {well.idProprietario ? `ID: ${well.idProprietario}` : 'N/A'}
        </Text>
      </View>
      
      {well.observacoes && (
        <View style={styles.cardInfo}>
          <Text style={styles.infoLabel}>📝</Text>
          <Text style={styles.infoValue} numberOfLines={2}>
            {well.observacoes}
          </Text>
        </View>
      )}
      
      <View style={styles.cardAcoes}>
        <TouchableOpacity 
          style={styles.botaoEditar}
          onPress={() => handleEditar(well)}
        >
          <Text style={styles.botaoTexto}>✏️ Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoDeletar}
          onPress={() => onDelete(well.id)}
        >
          <Text style={styles.botaoTexto}>🗑️ Deletar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando poços...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          Poços ({poçosFiltrados.length})
        </Text>
        
        {/* ✅ Barra de Busca MELHORADA para Web */}
        <View style={styles.barraBuscaContainer}>
          <TouchableOpacity 
            style={styles.buscaInputContainer}
            activeOpacity={1}
            onPress={handleContainerPress}
          >
            <TextInput
              ref={buscaInputRef}
              style={[
                styles.buscaInput,
                inputFocado && styles.buscaInputFocado // ✅ Estilo quando focado
              ]}
              placeholder="🔍 Buscar..."
              value={busca}
              onChangeText={setBusca}
              onFocus={() => setInputFocado(true)} // ✅ Controla estado de foco
              onBlur={() => setInputFocado(false)} // ✅ Controla estado de foco
              // ✅ Propriedades específicas para Web
              selectTextOnFocus={Platform.OS === 'web'}
              autoFocus={Platform.OS === 'web' && false}
            />
            {busca.length > 0 && (
              <TouchableOpacity 
                style={styles.limparBusca}
                onPress={() => setBusca('')}
              >
                <Text style={styles.limparBuscaTexto}>×</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.botaoFiltros}
            onPress={() => setMostrarFiltros(true)}
          >
            <Text style={styles.botaoFiltrosTexto}>⚙️</Text>
            {filtroProprietario !== 'todos' && <View style={styles.filtroAtivo} />}
          </TouchableOpacity>
        </View>

        {/* ... (restante do código permanece igual) ... */}
        <View style={styles.ordenacaoContainer}>
          <Text style={styles.ordenacaoTitulo}>Ordenar:</Text>
          <TouchableOpacity 
            style={[
              styles.ordenacaoBotao,
              sortField === 'nomeProprietario' && styles.ordenacaoBotaoAtivo
            ]}
            onPress={() => onSort('nomeProprietario')}
          >
            <Text style={styles.ordenacaoBotaoTexto}>
              Proprietário {sortField === 'nomeProprietario' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.ordenacaoBotao,
              sortField === 'dataCadastro' && styles.ordenacaoBotaoAtivo
            ]}
            onPress={() => onSort('dataCadastro')}
          >
            <Text style={styles.ordenacaoBotaoTexto}>
              Data {sortField === 'dataCadastro' && (sortDirection === 'asc' ? '↑' : '↓')}
            </Text>
          </TouchableOpacity>
        </View>

        {poçosFiltrados.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={poçosFiltrados}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              horizontal
              pagingEnabled={false}
              showsHorizontalScrollIndicator={true}
              snapToInterval={null}
              snapToAlignment="center"
              decelerationRate="normal"
              onMomentumScrollEnd={(event) => {
                const newIndex = Math.round(
                  event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_MARGIN * 2)
                );
                if (newIndex >= 0 && newIndex < poçosFiltrados.length) {
                  setPaginaAtual(newIndex);
                }
              }}
              contentContainerStyle={styles.carouselContent}
            />
            
            {poçosFiltrados.length > 1 && (
              <View style={styles.paginacaoContainer}>
                <Text style={styles.paginacaoTexto}>
                  {paginaAtual + 1} de {poçosFiltrados.length}
                </Text>
                <View style={styles.paginacaoPontos}>
                  {poçosFiltrados.map((_, index) => (
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
            <Text style={styles.semDados}>
              {busca || filtroProprietario !== 'todos' ? '🔍 Nenhum poço encontrado' : '📭 Nenhum poço cadastrado'}
            </Text>
            {(busca || filtroProprietario !== 'todos') && (
              <TouchableOpacity 
                style={styles.limparFiltros}
                onPress={() => {
                  setBusca('');
                  setFiltroProprietario('todos');
                }}
              >
                <Text style={styles.limparFiltrosTexto}>Limpar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Modais (mantidos iguais) */}
        <Modal
          visible={!!editandoPoço}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>
                ✏️ Editar Poço
              </Text>
              
              <Text style={styles.modalSubtitulo}>
                {editandoPoço?.nomeProprietario}
              </Text>

              <Text style={styles.inputLabel}>Observações:</Text>
              <TextInput
                style={styles.textInput}
                value={observacoesEdit}
                onChangeText={setObservacoesEdit}
                placeholder="Digite as observações..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              <View style={styles.modalAcoes}>
                <TouchableOpacity 
                  style={styles.modalBotaoCancelar}
                  onPress={() => {
                    setEditandoPoço(null);
                    setObservacoesEdit('');
                  }}
                >
                  <Text style={styles.modalBotaoTexto}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.modalBotaoSalvar}
                  onPress={handleSalvarEdicao}
                >
                  <Text style={styles.modalBotaoTexto}>Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          visible={mostrarFiltros}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitulo}>Filtros</Text>
              
              <Text style={styles.filtroLabel}>Proprietário:</Text>
              <ScrollView style={styles.filtroLista}>
                <TouchableOpacity 
                  style={[
                    styles.filtroItem,
                    filtroProprietario === 'todos' && styles.filtroItemAtivo
                  ]}
                  onPress={() => setFiltroProprietario('todos')}
                >
                  <Text style={styles.filtroItemTexto}>Todos os proprietários</Text>
                </TouchableOpacity>
                
                {proprietariosUnicos.map(proprietario => (
                  <TouchableOpacity 
                    key={proprietario}
                    style={[
                      styles.filtroItem,
                      filtroProprietario === proprietario && styles.filtroItemAtivo
                    ]}
                    onPress={() => setFiltroProprietario(proprietario)}
                  >
                    <Text style={styles.filtroItemTexto}>{proprietario}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              
              <View style={styles.modalAcoes}>
                <TouchableOpacity 
                  style={styles.modalBotao}
                  onPress={() => setMostrarFiltros(false)}
                >
                  <Text style={styles.modalBotaoTexto}>Aplicar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
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
  barraBuscaContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  buscaInputContainer: {
    flex: 1,
    position: 'relative',
  },
  buscaInput: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buscaInputFocado: {
    borderColor: '#2685BF', // ✅ Borda azul quando focado
    shadowColor: '#2685BF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  limparBusca: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#ccc',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // ✅ Garante que fique acima do input
  },
  limparBuscaTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botaoFiltros: {
    backgroundColor: '#2685BF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 50,
  },
  botaoFiltrosTexto: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  filtroAtivo: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
  },
  // ... (mantenha o resto dos estilos iguais)
  ordenacaoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
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
  },
  carouselContent: {
    paddingHorizontal: CARD_MARGIN,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 12,
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
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  proprietarioNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  data: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    marginRight: 8,
    marginTop: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#555',
    flex: 1,
    lineHeight: 18,
  },
  cardAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  botaoEditar: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginRight: 6,
    alignItems: 'center',
  },
  botaoDeletar: {
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginLeft: 6,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  paginacaoContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  paginacaoTexto: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
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
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
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
  semDadosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  semDados: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  limparFiltros: {
    backgroundColor: '#2685BF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  limparFiltrosTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TabelaPocos;