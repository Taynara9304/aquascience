// screens/CadastrarVisitaWhatsApp.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '../contexts/authContext';
import { atualizarStatusSolicitacao } from '../services/whatsappService';
import useVisitas from '../hooks/useTabelaVisitas';

const CadastrarVisitaWhatsApp = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, userData } = useAuth();
  const { addVisit } = useVisitas();
  
  const { solicitacao } = route.params;
  
  const [formData, setFormData] = useState({
    dataHora: new Date(solicitacao.dataHoraDesejada || new Date()),
    analista: null,
    observacoes: solicitacao.observacoes || '',
    resultado: '',
    recomendacoes: ''
  });
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    if (!formData.dataHora) {
      Alert.alert('Erro', 'Por favor, selecione a data e hora da visita');
      return;
    }

    setSalvando(true);

    try {
      // Criar dados da visita
      const visitData = {
        poco: {
          id: solicitacao.pocoId,
          nomeProprietario: solicitacao.pocoNome,
          localizacao: solicitacao.pocoLocalizacao,
          userId: solicitacao.userId
        },
        dataVisita: formData.dataHora.toISOString(),
        situacao: 'concluida',
        observacoes: formData.observacoes,
        resultado: formData.resultado,
        recomendacoes: formData.recomendacoes,
        tipo: 'visita_whatsapp',
        status: 'concluida',
        criadoPor: user.uid,
        tipoUsuario: userData?.tipoUsuario,
        userId: solicitacao.userId,
        // Link com a solicitação WhatsApp
        solicitacaoWhatsAppId: solicitacao.id
      };

      // Adicionar visita
      await addVisit(visitData);
      
      // Atualizar status da solicitação WhatsApp
      await atualizarStatusSolicitacao(solicitacao.id, 'concluida', {
        dataConclusao: new Date().toISOString(),
        visitaRegistrada: true
      });

      Alert.alert(
        '✅ Visita Cadastrada!',
        'A visita foi cadastrada com sucesso no sistema.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('❌ Erro ao cadastrar visita:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar a visita');
    } finally {
      setSalvando(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setMostrarDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dataHora: selectedDate }));
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Visita - WhatsApp</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 Informações da Solicitação:</Text>
        <Text style={styles.infoText}>
          <Text style={styles.infoLabel}>Proprietário:</Text> {solicitacao.proprietarioNome}{'\n'}
          <Text style={styles.infoLabel}>Poço:</Text> {solicitacao.pocoNome}{'\n'}
          <Text style={styles.infoLabel}>Localização:</Text> {solicitacao.pocoLocalizacao}{'\n'}
          <Text style={styles.infoLabel}>Observações Originais:</Text> {solicitacao.observacoes}
        </Text>
      </View>

      <View style={styles.form}>
        {/* Data e Hora Real da Visita */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data e Hora Real da Visita *</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setMostrarDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formData.dataHora.toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>
          
          {mostrarDatePicker && (
            <DateTimePicker
              value={formData.dataHora}
              mode="datetime"
              display="default"
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Observações Finais */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações Finais</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.observacoes}
            onChangeText={(text) => updateFormData('observacoes', text)}
            placeholder="Observações sobre a visita realizada..."
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Resultados */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Resultados e Análises</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.resultado}
            onChangeText={(text) => updateFormData('resultado', text)}
            placeholder="Resultados das análises, medições realizadas..."
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Recomendações */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Recomendações</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.recomendacoes}
            onChangeText={(text) => updateFormData('recomendacoes', text)}
            placeholder="Recomendações para o proprietário..."
            multiline={true}
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Botões */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity 
            style={[styles.botao, styles.botaoCancelar]}
            onPress={() => navigation.goBack()}
            disabled={salvando}
          >
            <Text style={styles.botaoTexto}>Cancelar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.botao, styles.botaoSalvar]}
            onPress={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.botaoTexto}>✅ Cadastrar Visita</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#2685BF',
    marginVertical: 16,
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  infoLabel: {
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  botoesContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  botao: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoCancelar: {
    backgroundColor: '#ccc',
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
  },
  botaoTexto: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CadastrarVisitaWhatsApp;