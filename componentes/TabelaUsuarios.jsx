import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  FlatList,
  Dimensions,
  Modal
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const CARD_WIDTH = screenWidth * (isMobile ? 0.8 : 0.3);
const CARD_MARGIN = 12;

const TabelaUsuarios = ({
  users = [],
  onEdit,
  onDelete,
  sortField,
  sortDirection,
  onSort,
}) => {
  const [busca, setBusca] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
  const flatListRef = useRef(null);

  console.log('TabelaUsuarios: users recebido =', users.length);

  // CORREÇÃO: Handlers para gestos
  const handleScrollEndDrag = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN * 2));
    
    if (newIndex >= 0 && newIndex < usuariosFiltrados.length) {
      setPaginaAtual(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    // Marca que o scroll horizontal começou
  };

  const usuariosFiltrados = useMemo(() => {
    const filtrados = users.filter(user => {
      const matchBusca = 
        user.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        user.email?.toLowerCase().includes(busca.toLowerCase());
      
      const matchFiltro = 
        filtroTipo === 'todos' || 
        user.tipoUsuario === filtroTipo;
      
      return matchBusca && matchFiltro;
    });
    
    setPaginaAtual(0);
    return filtrados;
  }, [users, busca, filtroTipo]);

  const getTipoUsuarioColor = (tipo) => {
    switch (tipo) {
      case 'administrador': return '#2685BF';
      case 'analista': return '#28a745';
      case 'proprietario': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const getTipoUsuarioTexto = (tipo) => {
    switch (tipo) {
      case 'administrador': return 'Administrador';
      case 'analista': return 'Analista';
      case 'proprietario': return 'Proprietário';
      default: return tipo || 'Não definido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return '#28a745';
      case 'inativo': return '#dc3545';
      case 'pendente': return '#ffc107';
      default: return '#6c757d';
    }
  };

  const formatarData = (timestamp) => {
    if (!timestamp) return 'N/A';
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

  const abrirDetalhes = (user) => {
    setUsuarioSelecionado(user);
    setModalDetalhes(true);
  };

  const fecharDetalhes = () => {
    setModalDetalhes(false);
    setUsuarioSelecionado(null);
  };

  const handleDeletarUsuario = (user) => {
    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir o usuário "${user.nome || user.email}"?\n\nEsta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => onDelete(user)
        }
      ]
    );
  };

  const renderItem = ({ item: user }) => (
    <View style={styles.card}>
      {/* CABEÇALHO DO CARD */}
      <View style={styles.cardHeader}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user.nome ? user.nome.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {user.nome || 'Usuário sem nome'}
          </Text>
          <Text style={styles.userEmail} numberOfLines={1}>
            {user.email}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getTipoUsuarioColor(user.tipoUsuario) }
        ]}>
          <Text style={styles.statusTexto}>
            {getTipoUsuarioTexto(user.tipoUsuario)}
          </Text>
        </View>
      </View>

      {/* INFORMAÇÕES DO USUÁRIO */}
      <View style={styles.cardInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Telefone:</Text>
          <Text style={styles.infoValue}>
            {user.telefone || 'Não informado'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cadastro:</Text>
          <Text style={styles.infoValue}>
            {formatarData(user.dataCriacao)}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <View style={[
            styles.statusIndicator,
            { backgroundColor: getStatusColor(user.status) }
          ]}>
            <Text style={styles.statusIndicatorText}>
              {user.status || 'ativo'}
            </Text>
          </View>
        </View>
      </View>

      {/* AÇÕES */}
      <View style={styles.cardAcoes}>
        <TouchableOpacity 
          style={styles.botaoDetalhes}
          onPress={() => abrirDetalhes(user)}
        >
          <Text style={styles.botaoTexto}>Detalhes</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoEditar}
          onPress={() => onEdit(user)}
        >
          <Text style={styles.botaoTexto}>Editar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.botaoDeletar}
          onPress={() => handleDeletarUsuario(user)}
        >
          <Text style={styles.botaoTexto}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        Usuários do Sistema ({usuariosFiltrados.length})
      </Text>

      {/* BARRA DE BUSCA E FILTROS */}
      <View style={styles.barraBuscaContainer}>
        <View style={styles.buscaInputContainer}>
          <TextInput
            style={styles.buscaInput}
            placeholder="Buscar por nome ou email..."
            value={busca}
            onChangeText={setBusca}
          />
          {busca.length > 0 && (
            <TouchableOpacity 
              style={styles.limparBusca}
              onPress={() => setBusca('')}
            >
              <Text style={styles.limparBuscaTexto}>×</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.botaoFiltros}
          onPress={() => setMostrarFiltros(true)}
        >
          <Text style={styles.botaoFiltrosTexto}>⚙️</Text>
          {filtroTipo !== 'todos' && (
            <View style={styles.filtroAtivo} />
          )}
        </TouchableOpacity>
      </View>

      {/* ORDENAÇÃO */}
      <View style={styles.ordenacaoContainer}>
        <Text style={styles.ordenacaoTitulo}>Ordenar:</Text>
        <TouchableOpacity 
          style={[
            styles.ordenacaoBotao,
            sortField === 'nome' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('nome')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Nome {sortField === 'nome' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.ordenacaoBotao,
            sortField === 'tipoUsuario' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('tipoUsuario')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Tipo {sortField === 'tipoUsuario' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.ordenacaoBotao,
            sortField === 'dataCriacao' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('dataCriacao')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Data {sortField === 'dataCriacao' && (sortDirection === 'asc' ? '↑' : '↓')}
          </Text>
        </TouchableOpacity>
      </View>

      {usuariosFiltrados.length > 0 ? (
        <View style={styles.carouselContainer}>
          <FlatList
            ref={flatListRef}
            data={usuariosFiltrados}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            showsHorizontalScrollIndicator={true}
            snapToInterval={null}
            snapToAlignment="center"
            decelerationRate="normal"
            onScrollBeginDrag={handleScrollBeginDrag}
            onScrollEndDrag={handleScrollEndDrag}
            onMomentumScrollEnd={handleScrollEndDrag}
            scrollEventThrottle={16}
            directionalLockEnabled={true}
            alwaysBounceHorizontal={true}
            alwaysBounceVertical={false}
            bounces={true}
            overScrollMode="always"
            contentContainerStyle={styles.carouselContent}
            style={styles.flatList}
          />
          
          {usuariosFiltrados.length > 1 && (
            <View style={styles.paginacaoContainer}>
              <Text style={styles.paginacaoTexto}>
                {paginaAtual + 1} de {usuariosFiltrados.length}
              </Text>
              <View style={styles.paginacaoPontos}>
                {usuariosFiltrados.map((_, index) => (
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
            {busca || filtroTipo !== 'todos' 
              ? 'Nenhum usuário encontrado' 
              : 'Nenhum usuário cadastrado'
            }
          </Text>
          {(busca || filtroTipo !== 'todos') && (
            <TouchableOpacity 
              style={styles.limparFiltros}
              onPress={() => {
                setBusca('');
                setFiltroTipo('todos');
              }}
            >
              <Text style={styles.limparFiltrosTexto}>Limpar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* MODAL DE FILTROS */}
      <Modal
        visible={mostrarFiltros}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitulo}>Filtros de Usuários</Text>
            
            <Text style={styles.filtroLabel}>Tipo de Usuário:</Text>
            <ScrollView style={styles.filtroLista}>
              {['todos', 'administrador', 'analista', 'proprietario'].map(tipo => (
                <TouchableOpacity 
                  key={tipo}
                  style={[
                    styles.filtroItem,
                    filtroTipo === tipo && styles.filtroItemAtivo
                  ]}
                  onPress={() => {
                    setFiltroTipo(tipo);
                    setMostrarFiltros(false);
                  }}
                >
                  <Text style={styles.filtroItemTexto}>
                    {tipo === 'todos' ? 'Todos os usuários' : getTipoUsuarioTexto(tipo)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <View style={styles.modalAcoes}>
              <TouchableOpacity 
                style={styles.modalBotao}
                onPress={() => setMostrarFiltros(false)}
              >
                <Text style={styles.modalBotaoTexto}>Aplicar Filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL DE DETALHES */}
      <Modal
        visible={modalDetalhes}
        animationType="slide"
        transparent={true}
        onRequestClose={fecharDetalhes}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalDetalhesContent}>
            {usuarioSelecionado && (
              <>
                <View style={styles.detalhesHeader}>
                  <View style={styles.detalhesAvatar}>
                    <Text style={styles.detalhesAvatarText}>
                      {usuarioSelecionado.nome ? usuarioSelecionado.nome.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  </View>
                  <View style={styles.detalhesTitulo}>
                    <Text style={styles.detalhesNome}>
                      {usuarioSelecionado.nome || 'Usuário sem nome'}
                    </Text>
                    <Text style={styles.detalhesEmail}>
                      {usuarioSelecionado.email}
                    </Text>
                  </View>
                </View>

                <ScrollView style={styles.detalhesScroll}>
                  <View style={styles.detalhesSection}>
                    <Text style={styles.detalhesSectionTitle}>Informações Pessoais</Text>
                    
                    <View style={styles.detalhesInfo}>
                      <Text style={styles.detalhesLabel}>Telefone:</Text>
                      <Text style={styles.detalhesValue}>
                        {usuarioSelecionado.telefone || 'Não informado'}
                      </Text>
                    </View>

                    <View style={styles.detalhesInfo}>
                      <Text style={styles.detalhesLabel}>Tipo de Usuário:</Text>
                      <View style={[
                        styles.detalhesBadge,
                        { backgroundColor: getTipoUsuarioColor(usuarioSelecionado.tipoUsuario) }
                      ]}>
                        <Text style={styles.detalhesBadgeText}>
                          {getTipoUsuarioTexto(usuarioSelecionado.tipoUsuario)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detalhesInfo}>
                      <Text style={styles.detalhesLabel}>Status:</Text>
                      <View style={[
                        styles.detalhesBadge,
                        { backgroundColor: getStatusColor(usuarioSelecionado.status) }
                      ]}>
                        <Text style={styles.detalhesBadgeText}>
                          {usuarioSelecionado.status || 'ativo'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detalhesSection}>
                    <Text style={styles.detalhesSectionTitle}>Metadados</Text>
                    
                    <View style={styles.detalhesInfo}>
                      <Text style={styles.detalhesLabel}>Data de Cadastro:</Text>
                      <Text style={styles.detalhesValue}>
                        {formatarData(usuarioSelecionado.dataCriacao)}
                      </Text>
                    </View>

                    <View style={styles.detalhesInfo}>
                      <Text style={styles.detalhesLabel}>ID do Usuário:</Text>
                      <Text style={[styles.detalhesValue, styles.idText]}>
                        {usuarioSelecionado.id}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.detalhesAcoes}>
                  <TouchableOpacity 
                    style={styles.detalhesBotaoEditar}
                    onPress={() => {
                      fecharDetalhes();
                      onEdit(usuarioSelecionado);
                    }}
                  >
                    <Text style={styles.detalhesBotaoTexto}>✏️ Editar Usuário</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.detalhesBotaoFechar}
                    onPress={fecharDetalhes}
                  >
                    <Text style={styles.detalhesBotaoTexto}>Fechar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#2685BF',
    textAlign: 'center',
  },
  // BARRA DE BUSCA
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
  // ORDENAÇÃO
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
  // ✅ ESTILOS CORRIGIDOS PARA GESTOS
  carouselContainer: {
    flex: 1,
    minHeight: 300,
  },
  flatList: {
    flex: 1,
  },
  carouselContent: {
    paddingHorizontal: CARD_MARGIN,
    paddingVertical: 0,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: CARD_MARGIN,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  // CABEÇALHO DO CARD
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2685BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusTexto: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  // INFORMAÇÕES DO CARD
  cardInfo: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  // AÇÕES DO CARD
  cardAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  botaoDetalhes: {
    backgroundColor: '#17A2B8',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoEditar: {
    backgroundColor: '#FFC107',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoDeletar: {
    backgroundColor: '#DC3545',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  // PAGINAÇÃO
  paginacaoContainer: {
    alignItems: 'center',
    marginTop: 20,
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
  // ESTADOS VAZIOS
  semDadosContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
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
    fontWeight: 'bold',
    fontSize: 14,
  },
  // MODAL FILTROS
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
    maxHeight: '60%',
  },
  modalTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2685BF',
  },
  filtroLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  filtroLista: {
    maxHeight: 200,
    marginBottom: 16,
  },
  filtroItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtroItemAtivo: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  filtroItemTexto: {
    fontSize: 14,
    color: '#333',
  },
  modalAcoes: {
    marginTop: 20,
  },
  modalBotao: {
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
  // MODAL DETALHES
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
  },
  modalDetalhesContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '95%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  detalhesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detalhesAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2685BF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  detalhesAvatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  detalhesTitulo: {
    flex: 1,
  },
  detalhesNome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detalhesEmail: {
    fontSize: 14,
    color: '#666',
  },
  detalhesScroll: {
    maxHeight: 400,
    marginBottom: 16,
  },
  detalhesSection: {
    marginBottom: 24,
  },
  detalhesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detalhesInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detalhesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  detalhesValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  idText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  detalhesBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  detalhesBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  detalhesAcoes: {
    gap: 8,
  },
  detalhesBotaoEditar: {
    backgroundColor: '#2685BF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  detalhesBotaoFechar: {
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  detalhesBotaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TabelaUsuarios;