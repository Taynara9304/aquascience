// componentes/TabelaAnalises.jsx - VERSÃO COM FIX PARA WEB
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  FlatList,
  Platform
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const CARD_WIDTH = screenWidth * (isMobile ? 0.8 : 0.3);
const CARD_MARGIN = 8;

const DetalhesSolicitacaoAnalise = ({ solicitacao, onClose }) => {
  if (!solicitacao) {
    return (
      <View style={styles.detalhesContainer}>
        <Text style={styles.textoVazio}>Nenhuma análise selecionada</Text>
      </View>
    );
  }

  const formatarLocalizacao = (localizacao) => {
    if (!localizacao) return 'Não informada';
    
    try {
      if (localizacao._lat && localizacao._long) {
        return `${localizacao._lat.toFixed(6)}°, ${localizacao._long.toFixed(6)}°`;
      }
      
      if (Array.isArray(localizacao)) {
        return `${localizacao[0]}, ${localizacao[1]}`;
      }
      
      if (typeof localizacao === 'string') {
        return localizacao;
      }
      
      return 'Formato não reconhecido';
    } catch (error) {
      return 'Erro ao carregar localização';
    }
  };

  const formatarData = (data) => {
    if (!data) return 'Não informada';
    
    try {
      if (data.toDate) {
        return data.toDate().toLocaleDateString('pt-BR');
      }
      
      const date = new Date(data);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Erro ao carregar data';
    }
  };

  const formatarValor = (valor, unidade = '') => {
    if (valor === '' || valor === null || valor === undefined || valor === 'undefined') {
      return 'Não informado';
    }
    
    if (typeof valor === 'number') {
      return `${valor} ${unidade}`.trim();
    }
    
    const num = parseFloat(valor);
    if (!isNaN(num)) {
      return `${num} ${unidade}`.trim();
    }
    
    return `${valor} ${unidade}`.trim();
  };

  const renderCampo = (label, valor, unidade = '') => {
    const valorFormatado = formatarValor(valor, unidade);
    
    return (
      <View style={styles.campo}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.valor}>{valorFormatado}</Text>
      </View>
    );
  };

  return (
    <View style={styles.detalhesContainer}>
      <View style={styles.detalhesHeader}>
        <Text style={styles.detalhesTitulo}>Detalhes da Análise</Text>
        <TouchableOpacity style={styles.fecharBotao} onPress={onClose}>
          <Text style={styles.fecharTexto}>×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.detalhesContent}>
        <View style={styles.secao}>
          <Text style={styles.subtitulo}>Informações Básicas</Text>
          {renderCampo('Poço', solicitacao.pocoNome)}
          {renderCampo('Proprietário', solicitacao.proprietario)}
          {renderCampo('Analista', solicitacao.analistaNome)}
          {renderCampo('Data da Análise', formatarData(solicitacao.dataAnalise))}
          {renderCampo('Resultado', solicitacao.resultado)}
          {renderCampo('Status', solicitacao.status)}
        </View>

        {/* Parâmetros Físico-Químicos */}
        <View style={styles.secao}>
          <Text style={styles.subtitulo}>Parâmetros Físico-Químicos</Text>
          <View style={styles.parametrosGrid}>
            <View style={styles.coluna}>
              {renderCampo('pH', solicitacao.ph)}
              {renderCampo('Turbidez', solicitacao.turbidez, 'NTU')}
              {renderCampo('Temperatura Ar', solicitacao.temperaturaAr, '°C')}
              {renderCampo('Temperatura Amostra', solicitacao.temperaturaAmostra, '°C')}
            </View>
            <View style={styles.coluna}>
              {renderCampo('Condutividade', solicitacao.condutividade, 'µS/cm')}
              {renderCampo('Oxigênio Dissolvido', solicitacao.oxigenioDissolvido, 'mg/L')}
              {renderCampo('DBO', solicitacao.dbo, 'mg/L')}
              {renderCampo('DQO', solicitacao.dqo, 'mg/L')}
            </View>
          </View>
        </View>

        {(solicitacao.aluminio || solicitacao.arsenio || solicitacao.chumbo || solicitacao.cromo || solicitacao.mercurio) && (
          <View style={styles.secao}>
            <Text style={styles.subtitulo}>⚠️ Metais Pesados (mg/L)</Text>
            <View style={styles.parametrosGrid}>
              <View style={styles.coluna}>
                {renderCampo('Alumínio', solicitacao.aluminio)}
                {renderCampo('Arsênio', solicitacao.arsenio)}
                {renderCampo('Chumbo', solicitacao.chumbo)}
              </View>
              <View style={styles.coluna}>
                {renderCampo('Cromo', solicitacao.cromo)}
                {renderCampo('Mercúrio', solicitacao.mercurio)}
              </View>
            </View>
          </View>
        )}

        {(solicitacao.coliformesTermotolerantes || solicitacao.escherichiaColi) && (
          <View style={styles.secao}>
            <Text style={styles.subtitulo}>Parâmetros Microbiológicos</Text>
            <View style={styles.parametrosGrid}>
              <View style={styles.coluna}>
                {renderCampo('Coliformes Termotolerantes', solicitacao.coliformesTermotolerantes, 'UFC/100mL')}
              </View>
              <View style={styles.coluna}>
                {renderCampo('E. coli', solicitacao.escherichiaColi, 'UFC/100mL')}
              </View>
            </View>
          </View>
        )}

        <View style={styles.secao}>
          <Text style={styles.subtitulo}>Outros Parâmetros</Text>
          <View style={styles.parametrosGrid}>
            <View style={styles.coluna}>
              {renderCampo('Nitrogênio', solicitacao.nitrogenio, 'mg/L')}
              {renderCampo('Fósforo', solicitacao.fosforo, 'mg/L')}
              {renderCampo('Sólidos Totais', solicitacao.solidosTotais, 'mg/L')}
            </View>
            <View style={styles.coluna}>
              {renderCampo('Cloro Residual', solicitacao.cloroResidual, 'mg/L')}
            </View>
          </View>
        </View>

        {solicitacao.observacoes && solicitacao.observacoes !== '-' && (
          <View style={styles.secao}>
            <Text style={styles.subtitulo}>📝 Observações</Text>
            <Text style={styles.observacoesTexto}>{solicitacao.observacoes}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const TabelaAnalises = ({ 
  analises, 
  readOnly = false, 
  onEdit, 
  onDelete,
  onDetails,
  loading = false 
}) => {
  const [analisesProcessadas, setAnalisesProcessadas] = useState([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroResultado, setFiltroResultado] = useState('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [detalhesAnalise, setDetalhesAnalise] = useState(null);
  const [inputFocado, setInputFocado] = useState(false); // ✅ Novo estado para foco
  const flatListRef = useRef(null);
  const buscaInputRef = useRef(null); // ✅ Ref para o input

  const handleScrollEndDrag = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / (CARD_WIDTH + CARD_MARGIN * 2));
    
    if (newIndex >= 0 && newIndex < analisesFiltradas.length) {
      setPaginaAtual(newIndex);
    }
  };

  const handleScrollBeginDrag = () => {
    // Marca que o scroll horizontal começou
  };

  // ✅ Função para forçar foco no input (especialmente para web)
  const handleContainerPress = () => {
    if (Platform.OS === 'web' && !inputFocado) {
      buscaInputRef.current?.focus();
    }
  };

  useEffect(() => {
    if (analises && analises.length > 0) {
      const processadas = analises.map(analise => {
        return {
          id: analise.id,
          pocoNome: converterParaString(analise.pocoNome || analise.nomePoco),
          dataAnalise: converterDataParaString(analise.dataAnalise),
          resultado: converterParaString(analise.resultado),
          ph: converterNumeroParaString(analise.ph),
          turbidez: converterNumeroParaString(analise.turbidez),
          temperaturaAr: converterNumeroParaString(analise.temperaturaAr),
          temperaturaAmostra: converterNumeroParaString(analise.temperaturaAmostra),
          condutividade: converterNumeroParaString(analise.condutividade),
          oxigenioDissolvido: converterNumeroParaString(analise.oxigenioDissolvido),
          dbo: converterNumeroParaString(analise.dbo),
          dqo: converterNumeroParaString(analise.dqo),
          nitrogenio: converterNumeroParaString(analise.nitrogenio),
          fosforo: converterNumeroParaString(analise.fosforo),
          coliformesTermotolerantes: converterNumeroParaString(analise.coliformesTermotolerantes),
          escherichiaColi: converterNumeroParaString(analise.escherichiaColi),
          solidosTotais: converterNumeroParaString(analise.solidosTotais),
          cloroResidual: converterNumeroParaString(analise.cloroResidual),
          aluminio: converterNumeroParaString(analise.aluminio),
          arsenio: converterNumeroParaString(analise.arsenio),
          chumbo: converterNumeroParaString(analise.chumbo),
          cromo: converterNumeroParaString(analise.cromo),
          mercurio: converterNumeroParaString(analise.mercurio),
          observacoes: converterParaString(analise.observacoes),
          status: converterParaString(analise.status),
          podeEditar: analise.status !== 'aprovada'
        };
      });
      
      setAnalisesProcessadas(processadas);
    } else {
      setAnalisesProcessadas([]);
    }
  }, [analises]);

  const converterParaString = (valor) => {
    if (valor === null || valor === undefined) return '-';
    if (typeof valor === 'string') return valor;
    if (typeof valor === 'number') return valor.toString();
    if (typeof valor === 'boolean') return valor ? 'Sim' : 'Não';
    if (valor && typeof valor === 'object') {
      if ('seconds' in valor && 'nanoseconds' in valor) {
        try {
          const date = new Date(valor.seconds * 1000);
          return date.toLocaleDateString('pt-BR');
        } catch (error) {
          return 'Data inválida';
        }
      }
      if (typeof valor.toDate === 'function') {
        try {
          const date = valor.toDate();
          return date.toLocaleDateString('pt-BR');
        } catch (error) {
          return 'Data inválida';
        }
      }
      return JSON.stringify(valor);
    }
    return String(valor);
  };

  const converterDataParaString = (data) => {
    if (!data) return 'Data não informada';
    try {
      if (data && typeof data === 'object') {
        if ('seconds' in data && 'nanoseconds' in data) {
          const date = new Date(data.seconds * 1000);
          return date.toLocaleDateString('pt-BR');
        }
        if (typeof data.toDate === 'function') {
          const date = data.toDate();
          return date.toLocaleDateString('pt-BR');
        }
      }
      const date = new Date(data);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('pt-BR');
      }
      return 'Data inválida';
    } catch (error) {
      return 'Erro na data';
    }
  };

  const converterNumeroParaString = (numero) => {
    if (numero === null || numero === undefined || numero === '') return '-';
    if (typeof numero === 'string') {
      const num = parseFloat(numero);
      return isNaN(num) ? numero : num.toFixed(2);
    }
    if (typeof numero === 'number') {
      return numero.toFixed(2);
    }
    return String(numero);
  };

  const analisesFiltradas = useMemo(() => {
    const filtradas = analisesProcessadas.filter(analise => {
      const matchBusca = 
        analise.pocoNome?.toLowerCase().includes(busca.toLowerCase()) ||
        analise.dataAnalise?.toLowerCase().includes(busca.toLowerCase()) ||
        analise.observacoes?.toLowerCase().includes(busca.toLowerCase());
      
      const matchFiltroStatus = 
        filtroStatus === 'todos' || 
        analise.status === filtroStatus;
      
      const matchFiltroResultado = 
        filtroResultado === 'todos' || 
        analise.resultado === filtroResultado;
      
      return matchBusca && matchFiltroStatus && matchFiltroResultado;
    });
    
    setPaginaAtual(0);
    return filtradas;
  }, [analisesProcessadas, busca, filtroStatus, filtroResultado]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprovada': return '#4CAF50';
      case 'reprovada': return '#F44336';
      case 'pendente': return '#FFA500';
      case 'ativa': return '#4CAF50';
      case 'inativa': return '#F44336';
      default: return '#757575';
    }
  };

  const getResultadoColor = (resultado) => {
    switch (resultado?.toLowerCase()) {
      case 'aprovada': return '#4CAF50';
      case 'reprovada': return '#F44336';
      case 'própria': return '#4CAF50';
      case 'imprópria': return '#F44336';
      default: return '#757575';
    }
  };

  const handleEdit = (analise) => {
    if (analise.podeEditar === false) {
      Alert.alert('Ação não permitida', 'Análises aprovadas não podem ser editadas.');
      return;
    }
    
    if (onEdit) {
      onEdit(analise);
    }
  };

  const handleDelete = (analise) => {
    if (analise.podeEditar === false) {
      Alert.alert('Ação não permitida', 'Análises aprovadas não podem ser excluídas.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      `Tem certeza que deseja excluir a análise do poço ${analise.pocoNome}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: () => {
            if (onDelete) {
              onDelete(analise.id);
            }
          }
        }
      ]
    );
  };

  const handleDetails = (analise) => {
    if (onDetails) {
      onDetails(analise);
    } else {
      setDetalhesAnalise(analise);
    }
  };

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
    flatListRef.current?.scrollToIndex({ index: pagina, animated: true });
  };

  const renderItem = ({ item: analise }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.pocoNome} numberOfLines={1}>
          {analise.pocoNome || 'Poço não informado'}
        </Text>
        <Text style={styles.data}>
          {analise.dataAnalise}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text 
          style={[
            styles.infoValue, 
            { color: getResultadoColor(analise.resultado) }
          ]}
          numberOfLines={1}
        >
          {analise.resultado}
        </Text>
      </View>

      <View style={styles.cardInfo}>
        <Text 
          style={[
            styles.infoValue, 
            { color: getStatusColor(analise.status) }
          ]}
          numberOfLines={1}
        >
          {analise.status}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.infoValue} numberOfLines={1}>
          pH: {analise.ph} | Turb: {analise.turbidez}
        </Text>
      </View>
      
      <View style={styles.cardInfo}>
        <Text style={styles.infoValue} numberOfLines={1}>
          Ar: {analise.temperaturaAr}°C | Amostra: {analise.temperaturaAmostra}°C
        </Text>
      </View>
      
      {analise.observacoes && analise.observacoes !== '-' && (
        <View style={styles.cardInfo}>
          <Text style={styles.infoValue} numberOfLines={2}>
            {analise.observacoes}
          </Text>
        </View>
      )}
      
      <View style={styles.cardAcoes}>
        <TouchableOpacity 
          style={styles.botaoDetalhes}
          onPress={() => handleDetails(analise)}
        >
          <Text style={styles.botaoTexto}>Detalhes</Text>
        </TouchableOpacity>
        
        {!readOnly && (
          <>
            <TouchableOpacity 
              style={[
                styles.botaoEditar,
                !analise.podeEditar && styles.botaoDesabilitado
              ]}
              onPress={() => handleEdit(analise)}
              disabled={!analise.podeEditar}
            >
              <Text style={styles.botaoTexto}>
                {analise.podeEditar ? 'Editar' : 'Bloqueado'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.botaoDeletar,
                !analise.podeEditar && styles.botaoDesabilitado
              ]}
              onPress={() => handleDelete(analise)}
              disabled={!analise.podeEditar}
            >
              <Text style={styles.botaoTexto}>
                {analise.podeEditar ? 'Excluir' : 'Bloqueado'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando análises...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.titulo}>
          Análises ({analisesFiltradas.length})
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
              placeholder="Buscar por poço, data ou observações..."
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
            {(filtroStatus !== 'todos' || filtroResultado !== 'todos') && (
              <View style={styles.filtroAtivo} />
            )}
          </TouchableOpacity>
        </View>

        {/* Resumo Rápido */}
        <View style={styles.resumoContainer}>
          <Text style={styles.resumoItem}>
            ✅ Aprovadas: {analisesFiltradas.filter(a => a.resultado === 'Aprovada').length}
          </Text>
          <Text style={styles.resumoItem}>
            ❌ Reprovadas: {analisesFiltradas.filter(a => a.resultado === 'Reprovada').length}
          </Text>
          <Text style={styles.resumoItem}>
            ⏳ Pendentes: {analisesFiltradas.filter(a => a.status === 'pendente').length}
          </Text>
        </View>

        {/* ✅ CORREÇÃO: Grid Horizontal com gestos otimizados */}
        {analisesFiltradas.length > 0 ? (
          <View style={styles.carouselContainer}>
            <FlatList
              ref={flatListRef}
              data={analisesFiltradas}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
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
            
            {/* Indicadores de Página */}
            {analisesFiltradas.length > 1 && (
              <View style={styles.paginacaoContainer}>
                <Text style={styles.paginacaoTexto}>
                  {paginaAtual + 1} de {analisesFiltradas.length}
                </Text>
                <View style={styles.paginacaoPontos}>
                  {analisesFiltradas.map((_, index) => (
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
              {busca || filtroStatus !== 'todos' || filtroResultado !== 'todos' 
                ? '🔍 Nenhuma análise encontrada' 
                : '📭 Nenhuma análise cadastrada'}
            </Text>
            {(busca || filtroStatus !== 'todos' || filtroResultado !== 'todos') && (
              <TouchableOpacity 
                style={styles.limparFiltros}
                onPress={() => {
                  setBusca('');
                  setFiltroStatus('todos');
                  setFiltroResultado('todos');
                }}
              >
                <Text style={styles.limparFiltrosTexto}>Limpar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ✅ Modal de Detalhes Integrado */}
        <Modal
          visible={!!detalhesAnalise}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <DetalhesSolicitacaoAnalise 
                solicitacao={detalhesAnalise}
                onClose={() => setDetalhesAnalise(null)}
              />
            </View>
          </View>
        </Modal>

        {/* Modal de Filtros */}
        <Modal
          visible={mostrarFiltros}
          animationType="slide"
          transparent={true}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitulo}>Filtros</Text>
                
                <Text style={styles.filtroLabel}>Status:</Text>
                <ScrollView style={styles.filtroLista}>
                  <TouchableOpacity 
                    style={[
                      styles.filtroItem,
                      filtroStatus === 'todos' && styles.filtroItemAtivo
                    ]}
                    onPress={() => setFiltroStatus('todos')}
                  >
                    <Text style={styles.filtroItemTexto}>Todos os status</Text>
                  </TouchableOpacity>
                  
                  {['pendente', 'aprovada', 'reprovada'].map(status => (
                    <TouchableOpacity 
                      key={status}
                      style={[
                        styles.filtroItem,
                        filtroStatus === status && styles.filtroItemAtivo
                      ]}
                      onPress={() => setFiltroStatus(status)}
                    >
                      <Text style={styles.filtroItemTexto}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.filtroLabel}>Resultado:</Text>
                <ScrollView style={styles.filtroLista}>
                  <TouchableOpacity 
                    style={[
                      styles.filtroItem,
                      filtroResultado === 'todos' && styles.filtroItemAtivo
                    ]}
                    onPress={() => setFiltroResultado('todos')}
                  >
                    <Text style={styles.filtroItemTexto}>Todos os resultados</Text>
                  </TouchableOpacity>
                  
                  {['Aprovada', 'Reprovada'].map(resultado => (
                    <TouchableOpacity 
                      key={resultado}
                      style={[
                        styles.filtroItem,
                        filtroResultado === resultado && styles.filtroItemAtivo
                      ]}
                      onPress={() => setFiltroResultado(resultado)}
                    >
                      <Text style={styles.filtroItemTexto}>{resultado}</Text>
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
  resumoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  resumoItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
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
  pocoNome: {
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
    fontWeight: '500',
  },
  cardAcoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 4,
  },
  botaoDetalhes: {
    backgroundColor: '#2685BF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoEditar: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoDeletar: {
    backgroundColor: '#FF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  botaoTexto: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Paginação
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
  // Modal Overlay
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  // Estilos do Componente de Detalhes (mantidos iguais)
  detalhesContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  detalhesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#2685BF',
  },
  detalhesTitulo: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  fecharBotao: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fecharTexto: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  detalhesContent: {
    flex: 1,
    padding: 16,
  },
  secao: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  parametrosGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  coluna: {
    flex: 1,
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    flex: 1,
  },
  valor: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
  observacoesTexto: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 6,
  },
  textoVazio: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    padding: 20,
  },
  // Estilos dos modais de filtro
  modalContent: {
    padding: 20,
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
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  filtroLista: {
    maxHeight: 150,
  },
  filtroItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filtroItemAtivo: {
    backgroundColor: '#e3f2fd',
  },
  filtroItemTexto: {
    fontSize: 16,
    color: '#333',
  },
  modalAcoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  modalBotao: {
    backgroundColor: '#2685BF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalBotaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Estados vazios
  semDadosContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  semDados: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  limparFiltros: {
    backgroundColor: '#2685BF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  limparFiltrosTexto: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default TabelaAnalises;