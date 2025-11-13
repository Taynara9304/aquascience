// componentes/DetalhesSolicitacaoVisita.js - NOVO COMPONENTE
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const DetalhesSolicitacaoVisita = ({ solicitacao }) => {
  if (!solicitacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoVazio}>Nenhuma solicitação selecionada</Text>
      </View>
    );
  }

  const { dadosVisita } = solicitacao;

  console.log('🔍 DetalhesSolicitacaoVisita - dadosVisita:', dadosVisita);

  // ✅ CORREÇÃO: Função para formatar data
  const formatarData = (data) => {
    if (!data) return 'Não informada';
    
    try {
      // Se for Timestamp do Firebase
      if (data.toDate) {
        return data.toDate().toLocaleString('pt-BR');
      }
      
      // Se for string ISO
      if (typeof data === 'string') {
        const date = new Date(data);
        if (!isNaN(date.getTime())) {
          return date.toLocaleString('pt-BR');
        }
      }
      
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro ao carregar data';
    }
  };

  // ✅ CORREÇÃO: Função para formatar valores
  const formatarValor = (valor) => {
    if (valor === '' || valor === null || valor === undefined) {
      return 'Não informado';
    }
    
    // Se for string vazia
    if (typeof valor === 'string' && valor.trim() === '') {
      return 'Não informado';
    }
    
    return valor.toString();
  };

  const renderCampo = (label, valor) => {
    const valorFormatado = formatarValor(valor);
    
    return (
      <View style={styles.campo}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.valor}>{valorFormatado}</Text>
      </View>
    );
  };

  const renderCampoData = (label, data) => {
    const dataFormatada = formatarData(data);
    
    return (
      <View style={styles.campo}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.valor}>{dataFormatada}</Text>
      </View>
    );
  };

  const renderCampoMultilinha = (label, valor) => {
    const valorFormatado = formatarValor(valor);
    
    return (
      <View style={styles.campoMultilinha}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.valorMultilinha}>{valorFormatado}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Detalhes da Solicitação de Visita</Text>
      
      {/* Informações da Visita */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>📋 Informações da Visita</Text>
        {renderCampo('Analista', dadosVisita?.analistaNome)}
        {renderCampo('Poço Visitado', dadosVisita?.pocoNome)}
        {renderCampo('Localização', dadosVisita?.pocoLocalizacao)}
        {renderCampoData('Data da Visita', dadosVisita?.dataVisita)}
        {renderCampo('Situação', dadosVisita?.situacao)}
        {renderCampo('Tipo de Usuário', dadosVisita?.tipoUsuario)}
      </View>

      {/* Observações da Visita */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>📝 Observações da Visita</Text>
        {renderCampoMultilinha('Observações', dadosVisita?.observacoes)}
      </View>

      {/* Resultados e Análises */}
      {dadosVisita?.resultado && (
        <View style={styles.secao}>
          <Text style={styles.subtitulo}>🔬 Resultados e Análises</Text>
          {renderCampoMultilinha('Resultados', dadosVisita?.resultado)}
        </View>
      )}

      {/* Recomendações */}
      {dadosVisita?.recomendacoes && (
        <View style={styles.secao}>
          <Text style={styles.subtitulo}>💡 Recomendações</Text>
          {renderCampoMultilinha('Recomendações', dadosVisita?.recomendacoes)}
        </View>
      )}

      {/* Informações Técnicas */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>⚙️ Informações Técnicas</Text>
        {renderCampo('ID do Analista', dadosVisita?.analistaId)}
        {renderCampo('ID do Poço', dadosVisita?.pocoId)}
        {renderCampo('Proprietário', dadosVisita?.proprietario)}
        {renderCampo('Status', dadosVisita?.status)}
        {renderCampoData('Data da Solicitação', dadosVisita?.dataSolicitacao)}
      </View>

      {/* Debug - Mostrar todos os dados disponíveis */}
      <View style={styles.debugSecao}>
        <Text style={styles.debugTitulo}>🔍 Dados Completos (Debug)</Text>
        {Object.entries(dadosVisita || {}).map(([key, value]) => (
          <View key={key} style={styles.debugCampo}>
            <Text style={styles.debugLabel}>{key}:</Text>
            <Text style={styles.debugValor}>
              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
  },
  textoVazio: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2685BF',
    textAlign: 'center',
  },
  secao: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  campo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingVertical: 4,
  },
  campoMultilinha: {
    marginBottom: 12,
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
  valorMultilinha: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginTop: 4,
    lineHeight: 20,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  debugSecao: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  debugTitulo: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#856404',
  },
  debugCampo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    paddingVertical: 2,
  },
  debugLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#856404',
    flex: 1,
  },
  debugValor: {
    fontSize: 10,
    color: '#856404',
    flex: 2,
    textAlign: 'right',
  },
});

export default DetalhesSolicitacaoVisita;