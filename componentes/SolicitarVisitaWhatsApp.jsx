// componentes/SolicitarVisitaWhatsApp.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../contexts/authContext';
import { registrarSolicitacaoWhatsApp } from '../services/whatsappService';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const SolicitarVisitaWhatsApp = ({ pocoSelecionado, onSuccess }) => {
  const { user, userData } = useAuth();
  const [dataHoraDesejada, setDataHoraDesejada] = useState(new Date());
  const [observacoes, setObservacoes] = useState('');
  const [mostrarDatePicker, setMostrarDatePicker] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const TELEFONE_ADM = "+5544999999999"; // Número do administrador

  const gerarMensagemWhatsApp = () => {
    const nomeProprietario = userData?.nome || 'Proprietário';
    const coordenadas = pocoSelecionado?.coordenadas;
    
    let mapsLink = 'Localização não disponível';
    if (coordenadas && coordenadas.latitude && coordenadas.longitude) {
      mapsLink = `https://maps.google.com/?q=${coordenadas.latitude},${coordenadas.longitude}`;
    } else if (pocoSelecionado?.localizacao) {
      mapsLink = `https://maps.google.com/?q=${encodeURIComponent(pocoSelecionado.localizacao)}`;
    }

    return `Olá, eu sou ${nomeProprietario}!

Quero agendar uma visita no meu poço: ${pocoSelecionado?.nomeProprietario}

📍 Localização: ${mapsLink}

📅 Data e Hora Desejada: ${dataHoraDesejada.toLocaleString('pt-BR')}

📝 Observações: ${observacoes}

É possível nesse dia e horário?`;
  };

  const abrirWhatsApp = async () => {
    if (!pocoSelecionado) {
      Alert.alert('Erro', 'Por favor, selecione um poço primeiro');
      return;
    }

    if (!observacoes.trim()) {
      Alert.alert('Erro', 'Por favor, informe as observações da visita');
      return;
    }

    setEnviando(true);

    try {
      const mensagem = gerarMensagemWhatsApp();
      
      // Registrar solicitação no Firebase primeiro
      await registrarSolicitacaoWhatsApp({
        userId: user.uid,
        proprietarioNome: userData?.nome || 'Proprietário',
        proprietarioTelefone: userData?.telefone || '',
        poco: pocoSelecionado,
        dataHoraDesejada: dataHoraDesejada.toISOString(),
        observacoes: observacoes.trim(),
        mensagemEnviada: mensagem
      });

      // Abrir WhatsApp
      const url = `whatsapp://send?phone=${TELEFONE_ADM}&text=${encodeURIComponent(mensagem)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        
        Alert.alert(
          '✅ Solicitação Enviada!',
          'Sua solicitação foi registrada e o WhatsApp foi aberto. Converse com o administrador para combinar os detalhes.',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onSuccess) onSuccess();
                // Reset form
                setObservacoes('');
                setDataHoraDesejada(new Date());
              }
            }
          ]
        );
      } else {
        Alert.alert(
          'WhatsApp Não Encontrado',
          'O WhatsApp não está instalado no seu dispositivo. Sua solicitação foi registrada e o administrador será notificado.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Erro no processo WhatsApp:', error);
      Alert.alert(
        'Erro',
        'Não foi possível completar a solicitação. Tente novamente.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setMostrarDatePicker(false);
    if (selectedDate) {
      setDataHoraDesejada(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Visita via WhatsApp</Text>
      
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📱 Como funciona:</Text>
        <Text style={styles.infoText}>
          1. Preencha os dados abaixo{'\n'}
          2. Clique em "Abrir WhatsApp"{'\n'}
          3. Mensagem será gerada automaticamente{'\n'}
          4. Converse diretamente com o administrador{'\n'}
          5. Combinação rápida e prática
        </Text>
      </View>

      <View style={styles.form}>
        {/* Poço Selecionado */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Poço Selecionado</Text>
          <View style={styles.pocoInfo}>
            <Text style={styles.pocoNome}>{pocoSelecionado?.nomeProprietario || 'Nenhum poço selecionado'}</Text>
            <Text style={styles.pocoLocalizacao}>
              {pocoSelecionado?.localizacao || 'Localização não informada'}
            </Text>
          </View>
        </View>

        {/* Data e Hora Desejada */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Data e Hora Desejada *</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setMostrarDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {dataHoraDesejada.toLocaleString('pt-BR')}
            </Text>
          </TouchableOpacity>
          
          {mostrarDatePicker && (
            <DateTimePicker
              value={dataHoraDesejada}
              mode="datetime"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}
        </View>

        {/* Observações */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Observações *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={observacoes}
            onChangeText={setObservacoes}
            placeholder="Descreva o motivo da visita, problemas identificados, instruções de acesso, etc..."
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {observacoes.length}/500 caracteres
          </Text>
        </View>

        {/* Preview da Mensagem */}
        {observacoes.length > 0 && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>📋 Prévia da Mensagem:</Text>
            <Text style={styles.previewText}>
              {gerarMensagemWhatsApp()}
            </Text>
          </View>
        )}

        {/* Botão Enviar */}
        <TouchableOpacity 
          style={[
            styles.submitButton,
            (!pocoSelecionado || !observacoes.trim() || enviando) && styles.submitButtonDisabled
          ]} 
          onPress={abrirWhatsApp}
          disabled={!pocoSelecionado || !observacoes.trim() || enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              📱 ABRIR WHATSAPP
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.observacao}>
          💡 Após enviar a mensagem, aguarde o contato do administrador para combinar os detalhes finais.
        </Text>
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
    backgroundColor: '#E8F5E8',
    padding: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
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
  pocoInfo: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  pocoNome: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pocoLocalizacao: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
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
  charCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  previewBox: {
    backgroundColor: '#F3F3F3',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: '#25D366',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  observacao: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default SolicitarVisitaWhatsApp;