// componentes/DetalhesSolicitacaoAnalise.js - VERSÃO CORRIGIDA
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

const DetalhesSolicitacaoAnalise = ({ solicitacao }) => {
  if (!solicitacao) {
    return (
      <View style={styles.container}>
        <Text style={styles.textoVazio}>Nenhuma solicitação selecionada</Text>
      </View>
    );
  }

  const { dadosSolicitacao } = solicitacao;

  // ✅ CORREÇÃO: Função para formatar GeoPoint
  const formatarLocalizacao = (localizacao) => {
    if (!localizacao) return 'Não informada';
    
    try {
      // Se for um objeto GeoPoint do Firebase
      if (localizacao._lat && localizacao._long) {
        return `${localizacao._lat.toFixed(6)}°, ${localizacao._long.toFixed(6)}°`;
      }
      
      // Se for um array [lat, long]
      if (Array.isArray(localizacao)) {
        return `${localizacao[0]}, ${localizacao[1]}`;
      }
      
      // Se for uma string
      if (typeof localizacao === 'string') {
        return localizacao;
      }
      
      return 'Formato não reconhecido';
    } catch (error) {
      console.error('Erro ao formatar localização:', error);
      return 'Erro ao carregar localização';
    }
  };

  // ✅ CORREÇÃO: Função para formatar data
  const formatarData = (data) => {
    if (!data) return 'Não informada';
    
    try {
      // Se for Timestamp do Firebase
      if (data.toDate) {
        return data.toDate().toLocaleDateString('pt-BR');
      }
      
      // Se for string ou Date
      const date = new Date(data);
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return date.toLocaleDateString('pt-BR');
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Erro ao carregar data';
    }
  };

  // ✅ CORREÇÃO: Função para formatar valores
  const formatarValor = (valor, unidade = '') => {
    if (valor === '' || valor === null || valor === undefined || valor === 'undefined') {
      return 'Não informado';
    }
    
    // Se for número, formata com 2 casas decimais
    if (typeof valor === 'number') {
      return `${valor} ${unidade}`.trim();
    }
    
    // Se for string, verifica se pode ser convertido para número
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

  const renderCampoLocalizacao = (label, localizacao) => {
    const localizacaoFormatada = formatarLocalizacao(localizacao);
    
    return (
      <View style={styles.campo}>
        <Text style={styles.label}>{label}:</Text>
        <Text style={styles.valor}>{localizacaoFormatada}</Text>
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.titulo}>Detalhes da Solicitação de Análise</Text>
      
      {/* Informações Básicas */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Informações Básicas</Text>
        {renderCampo('Poço', dadosSolicitacao?.pocoNome)}
        {renderCampoLocalizacao('Localização', dadosSolicitacao?.pocoLocalizacao)}
        {renderCampo('Proprietário', dadosSolicitacao?.proprietario)}
        {renderCampo('Analista', dadosSolicitacao?.analistaNome)}
        {renderCampoData('Data da Análise', dadosSolicitacao?.dataAnalise)}
        {renderCampo('Resultado', dadosSolicitacao?.resultado)}
      </View>

      {/* Parâmetros Físicos */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Parâmetros Físicos</Text>
        <View style={isDesktop ? styles.duasColunas : styles.umaColuna}>
          <View style={styles.coluna}>
            {renderCampo('Temperatura do Ar', dadosSolicitacao?.temperaturaAr, '°C')}
            {renderCampo('Temperatura da Amostra', dadosSolicitacao?.temperaturaAmostra, '°C')}
            {renderCampo('pH', dadosSolicitacao?.ph)}
            {renderCampo('Alcalinidade', dadosSolicitacao?.alcalinidade, 'mg/L')}
          </View>
          <View style={styles.coluna}>
            {renderCampo('Acidez', dadosSolicitacao?.acidez, 'mg/L')}
            {renderCampo('Cor', dadosSolicitacao?.cor, 'UC')}
            {renderCampo('Turbidez', dadosSolicitacao?.turbidez, 'NTU')}
            {renderCampo('Condutividade Elétrica', dadosSolicitacao?.condutividadeEletrica, 'µS/cm')}
          </View>
        </View>
      </View>

      {/* Parâmetros Químicos */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Parâmetros Químicos</Text>
        <View style={isDesktop ? styles.duasColunas : styles.umaColuna}>
          <View style={styles.coluna}>
            {renderCampo('SDT', dadosSolicitacao?.sdt, 'mg/L')}
            {renderCampo('SST', dadosSolicitacao?.sst, 'mg/L')}
          </View>
          <View style={styles.coluna}>
            {renderCampo('Cloro Total', dadosSolicitacao?.cloroTotal, 'mg/L')}
            {renderCampo('Cloro Livre', dadosSolicitacao?.cloroLivre, 'mg/L')}
          </View>
        </View>
      </View>

      {/* Parâmetros Microbiológicos */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Parâmetros Microbiológicos</Text>
        <View style={isDesktop ? styles.duasColunas : styles.umaColuna}>
          <View style={styles.coluna}>
            {renderCampo('Coliformes Totais', dadosSolicitacao?.coliformesTotais, 'UFC/100mL')}
          </View>
          <View style={styles.coluna}>
            {renderCampo('E. coli', dadosSolicitacao?.ecoli, 'UFC/100mL')}
          </View>
        </View>
      </View>

      {/* Informações Técnicas */}
      <View style={styles.secao}>
        <Text style={styles.subtitulo}>Informações Técnicas</Text>
        {renderCampo('ID do Analista', dadosSolicitacao?.analistaId)}
        {renderCampo('ID do Proprietário', dadosSolicitacao?.proprietarioId)}
        {renderCampo('ID do Poço', dadosSolicitacao?.pocoId)}
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
    marginBottom: 24,
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
  umaColuna: {
    gap: 12,
  },
  duasColunas: {
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
});

export default DetalhesSolicitacaoAnalise;