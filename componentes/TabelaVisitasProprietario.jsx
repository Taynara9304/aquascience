// componentes/TabelaVisitasProprietario.js - VERSÃO COM GESTOS CORRIGIDOS
import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const CARD_WIDTH = screenWidth * (isMobile ? 0.8 : 0.3);
const CARD_MARGIN = 12;

const TabelaVisitasProprietario = ({ 
  visits = [], 
  sortField, 
  sortDirection, 
  onSort,
  loading = false
}) => {
  const [paginaAtual, setPaginaAtual] = useState(0);
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

  const irParaPagina = (pagina) => {
    setPaginaAtual(pagina);
    flatListRef.current?.scrollToIndex({ index: pagina, animated: true });
  };

  const renderItem = ({ item: visit }) => (
    <View style={styles.card}>
      {/* Cabeçalho com Status */}
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.pocoNome} numberOfLines={1}>
            {visit.pocoNome || 'Meu Poço'}
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
          <Text style={styles.infoLabel}>📋 Status:</Text>
          <Text style={styles.infoValue}>
            {visit.situacao === 'pendente' ? '🕒 Aguardando aprovação' :
             visit.situacao === 'aprovada' ? '✅ Visita aprovada' :
             visit.situacao === 'concluida' ? '🎉 Visita concluída' :
             visit.situacao === 'cancelada' ? '❌ Visita cancelada' :
             '📋 Em análise'}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>📱 Canal:</Text>
          <Text style={styles.infoValue}>
            {visit.canal === 'whatsapp' ? '💬 Solicitação via WhatsApp' : '📋 Solicitação via Sistema'}
          </Text>
        </View>

        {visit.observacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>📝 Minhas Observações:</Text>
            <Text style={styles.observacoesText} numberOfLines={4}>
              {visit.observacoes}
            </Text>
          </View>
        )}

        {visit.resultado && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>🔍 Resultados da Visita:</Text>
            <Text style={styles.observacoesText} numberOfLines={4}>
              {visit.resultado}
            </Text>
          </View>
        )}

        {visit.recomendacoes && (
          <View style={styles.observacoesContainer}>
            <Text style={styles.observacoesLabel}>💡 Recomendações:</Text>
            <Text style={styles.observacoesText} numberOfLines={4}>
              {visit.recomendacoes}
            </Text>
          </View>
        )}

        {visit.situacao === 'pendente' && (
          <View style={styles.infoAguardando}>
            <Text style={styles.infoAguardandoText}>
              ⏳ Sua solicitação está em análise pelo administrador
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando minhas visitas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>
        🏠 Minhas Visitas ({visits.length})
      </Text>
      
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
            sortField === 'situacao' && styles.ordenacaoBotaoAtivo
          ]}
          onPress={() => onSort('situacao')}
        >
          <Text style={styles.ordenacaoBotaoTexto}>
            Status {sortField === 'situacao' && (sortDirection === 'asc' ? '↑' : '↓')}
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
          <Text style={styles.semDados}>📭 Nenhuma visita solicitada</Text>
          <Text style={styles.semDadosSubtexto}>
            Use o formulário abaixo para solicitar sua primeira visita técnica
          </Text>
        </View>
      )}
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
    width: 80,
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
  infoAguardando: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA000',
  },
  infoAguardandoText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '500',
    textAlign: 'center',
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
    marginBottom: 8,
  },
  semDadosSubtexto: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default TabelaVisitasProprietario;