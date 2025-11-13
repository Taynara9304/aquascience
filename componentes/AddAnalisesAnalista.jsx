// componentes/AddAnalisesAnalista.js - CORREÇÃO PARA CARREGAR POÇOS
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import SelecaoBuscaSeguro from './SelecaoBusca';
import { useAuth } from '../contexts/authContext';
import { AnalistaNotifications } from '../services/notificacaoService';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddAnalisesAnalista = ({ onAdicionarAnalise, pocos, analistas }) => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    poco: null,
    dataAnalise: new Date(),
    resultado: '',
    temperaturaAr: '',
    temperaturaAmostra: '',
    ph: '',
    alcalinidade: '',
    acidez: '',
    cor: '',
    turbidez: '',
    condutividadeEletrica: '',
    sdt: '',
    sst: '',
    cloroTotal: '',
    cloroLivre: '',
    coliformesTotais: '',
    ecoli: ''
  });
  const [enviando, setEnviando] = useState(false);
  const [carregandoPocos, setCarregandoPocos] = useState(true);

  console.log('🔍 AddAnalisesAnalista - Props recebidas:', {
    pocosCount: pocos?.length || 0,
    analistasCount: analistas?.length || 0,
    userData: userData?.nome
  });

  // Preencher automaticamente o analista logado
  useEffect(() => {
    if (userData?.nome) {
      console.log('👤 Preenchendo analista automaticamente:', userData.nome);
      setFormData(prev => ({
        ...prev,
        analista: {
          id: user.uid,
          nome: userData.nome,
          tipoUsuario: 'analista'
        }
      }));
    }
  }, [userData, user]);

  // Verificar quando os poços são carregados
  useEffect(() => {
    if (pocos && pocos.length > 0) {
      console.log('✅ Poços carregados no componente:', pocos.length);
      console.log('📋 Estrutura do primeiro poço:', pocos[0]);
      console.log('👤 idProprietario disponível:', pocos[0].idProprietario);
      setCarregandoPocos(false);
    } else if (pocos && pocos.length === 0) {
      console.log('⚠️ Nenhum poço carregado');
      setCarregandoPocos(false);
    }
  }, [pocos]);

  const handleSubmit = async () => {
    if (!formData.poco || !formData.resultado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    try {
      setEnviando(true);

      const pocoSelecionado = formData.poco;
      
      // Verificar se o poço tem idProprietario
      if (!pocoSelecionado.idProprietario) {
        console.warn('⚠️ Poço sem idProprietario:', pocoSelecionado);
        throw new Error('Poço selecionado não possui proprietário definido');
      }

      // Preparar dados para a notificação
      const dadosAnalise = {
        pocoId: pocoSelecionado.id,
        pocoNome: pocoSelecionado.nomeProprietario || pocoSelecionado.nome,
        pocoLocalizacao: pocoSelecionado.localizacao || {},
        proprietario: pocoSelecionado.nomeProprietario || 'Proprietário não informado',
        proprietarioId: pocoSelecionado.idProprietario,
        analistaId: user.uid,
        analistaNome: userData.nome,
        dataAnalise: formData.dataAnalise.toISOString(),
        resultado: formData.resultado,
        // Parâmetros da análise com valores padrão
        ph: formData.ph || '',
        turbidez: formData.turbidez || '',
        temperaturaAr: formData.temperaturaAr || '',
        temperaturaAmostra: formData.temperaturaAmostra || '',
        alcalinidade: formData.alcalinidade || '',
        acidez: formData.acidez || '',
        cor: formData.cor || '',
        condutividadeEletrica: formData.condutividadeEletrica || '',
        sdt: formData.sdt || '',
        sst: formData.sst || '',
        cloroTotal: formData.cloroTotal || '',
        cloroLivre: formData.cloroLivre || '',
        coliformesTotais: formData.coliformesTotais || '',
        ecoli: formData.ecoli || '',
        status: 'pendente_aprovacao',
        tipoCadastro: 'solicitacao_analista',
        dataSolicitacao: new Date().toISOString()
      };

      console.log('📤 Enviando solicitação de análise...', dadosAnalise);

      // Enviar solicitação via notificação
      const notificationId = await AnalistaNotifications.solicitarCadastroAnalise(
        user,
        dadosAnalise
      );

      console.log('✅ Solicitação de análise enviada com ID:', notificationId);

      // Reset do formulário
      setFormData({
        poco: null,
        dataAnalise: new Date(),
        resultado: '',
        temperaturaAr: '',
        temperaturaAmostra: '',
        ph: '',
        alcalinidade: '',
        acidez: '',
        cor: '',
        turbidez: '',
        condutividadeEletrica: '',
        sdt: '',
        sst: '',
        cloroTotal: '',
        cloroLivre: '',
        coliformesTotais: '',
        ecoli: ''
      });

      Alert.alert(
        '✅ Solicitação Enviada!', 
        'Sua análise foi enviada para aprovação do administrador.',
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('❌ Erro ao enviar solicitação:', error);
      Alert.alert(
        'Erro', 
        `Não foi possível enviar a solicitação: ${error.message}`,
        [{ text: 'OK' }]
      );
    } finally {
      setEnviando(false);
    }
  };

  const updateFormData = (key, value) => {
    console.log(`📝 Atualizando ${key}:`, value);
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const renderInput = (label, key, placeholder, keyboardType = 'default', required = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={formData[key]}
        onChangeText={(text) => updateFormData(key, text)}
        placeholder={placeholder}
        keyboardType={keyboardType}
      />
    </View>
  );

  // Preparar opções de poços
  const opcoesPocos = pocos?.map(poco => {
    const poçoFormatado = {
      id: poco.id,
      nome: poco.nomeProprietario || poco.nome || 'Poço sem nome',
      nomeProprietario: poco.nomeProprietario,
      localizacao: poco.localizacao,
      idProprietario: poco.idProprietario,
      ...poco
    };
    console.log('📝 Poço formatado:', poçoFormatado);
    return poçoFormatado;
  }) || [];

  console.log('📋 Opções de poços preparadas:', opcoesPocos.length);

  if (carregandoPocos) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando poços...</Text>
        <Text style={styles.loadingSubText}>
          {pocos?.length || 0} poços encontrados
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ℹ️ Fluxo do Analista:</Text>
          <Text style={styles.infoText}>
            • Preencha os dados da análise{'\n'}
            • Solicitação será enviada para aprovação do admin{'\n'}
            • Após aprovada, a análise aparecerá no sistema
          </Text>
        </View>

        {/* SEÇÃO INFORMAÇÕES BÁSICAS */}
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poço *</Text>
              {opcoesPocos.length > 0 ? (
                <SelecaoBuscaSeguro
                  value={formData.poco}
                  onSelect={(poco) => {
                    console.log('✅ Poço selecionado:', poco);
                    console.log('🔍 idProprietario do poço:', poco.idProprietario);
                    updateFormData('poco', poco);
                  }}
                  options={opcoesPocos}
                  placeholder="Selecione o poço"
                  searchKeys={['nome', 'nomeProprietario']}
                  displayKey="nome"
                />
              ) : (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    ❌ Nenhum poço disponível para seleção
                  </Text>
                  <Text style={styles.errorSubText}>
                    Verifique se existem poços cadastrados no sistema
                  </Text>
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Analista Responsável</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={userData?.nome || 'Carregando...'}
                placeholder="Você é o analista responsável"
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* DATA E RESULTADO */}
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data da Análise</Text>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateText}>
                  {formData.dataAnalise.toLocaleDateString('pt-BR')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Resultado *</Text>
              <View style={styles.radioGroup}>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.resultado === 'Aprovada' && styles.radioButtonSelected
                  ]}
                  onPress={() => updateFormData('resultado', 'Aprovada')}
                >
                  <Text style={[
                    styles.radioText,
                    formData.resultado === 'Aprovada' && styles.radioTextSelected
                  ]}>
                    Aprovada
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.radioButton,
                    formData.resultado === 'Reprovada' && styles.radioButtonSelected
                  ]}
                  onPress={() => updateFormData('resultado', 'Reprovada')}
                >
                  <Text style={[
                    styles.radioText,
                    formData.resultado === 'Reprovada' && styles.radioTextSelected
                  ]}>
                    Reprovada
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* SEÇÃO PARÂMETROS FÍSICOS */}
        <Text style={styles.sectionTitle}>Parâmetros Físico-Químicos</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Temperatura do Ar (°C)', 'temperaturaAr', 'Ex: 25.5', 'decimal-pad')}
            {renderInput('Temperatura da Amostra (°C)', 'temperaturaAmostra', 'Ex: 22.0', 'decimal-pad')}
            {renderInput('pH', 'ph', 'Ex: 7.0', 'decimal-pad')}
            {renderInput('Alcalinidade (mg/L)', 'alcalinidade', 'Ex: 120', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Acidez (mg/L)', 'acidez', 'Ex: 15', 'decimal-pad')}
            {renderInput('Cor (UPC)', 'cor', 'Ex: 5', 'decimal-pad')}
            {renderInput('Turbidez (NTU)', 'turbidez', 'Ex: 1.0', 'decimal-pad')}
            {renderInput('Condutividade Elétrica (µS/cm)', 'condutividadeEletrica', 'Ex: 250', 'decimal-pad')}
          </View>
        </View>

        {/* SEÇÃO PARÂMETROS QUÍMICOS */}
        <Text style={styles.sectionTitle}>Parâmetros Químicos</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('SDT (mg/L)', 'sdt', 'Ex: 350', 'decimal-pad')}
            {renderInput('SST (mg/L)', 'sst', 'Ex: 25', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Cloro Total (mg/L)', 'cloroTotal', 'Ex: 2.0', 'decimal-pad')}
            {renderInput('Cloro Livre (mg/L)', 'cloroLivre', 'Ex: 1.5', 'decimal-pad')}
          </View>
        </View>

        {/* SEÇÃO PARÂMETROS MICROBIOLÓGICOS */}
        <Text style={styles.sectionTitle}>Parâmetros Microbiológicos</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Coliformes Totais (UFC/100mL)', 'coliformesTotais', 'Ex: 0', 'number-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('E. coli (UFC/100mL)', 'ecoli', 'Ex: 0', 'number-pad')}
          </View>
        </View>

        {/* DEBUG INFO */}
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>
            DEBUG: {opcoesPocos.length} poços disponíveis | 
            Poço selecionado: {formData.poco ? 'Sim' : 'Não'} | 
            Resultado: {formData.resultado || 'Não selecionado'}
          </Text>
        </View>

        {/* BOTÃO SOLICITAR */}
        <View style={styles.fullWidth}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!formData.poco || !formData.resultado) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!formData.poco || !formData.resultado || enviando || opcoesPocos.length === 0}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {opcoesPocos.length === 0 ? '❌ NENHUM POÇO DISPONÍVEL' : '📤 SOLICITAR CADASTRO DE ANÁLISE'}
              </Text>
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingSubText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  form: {
    padding: 16,
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: '#2685BF',
    paddingBottom: 8,
  },
  oneColumn: {
    gap: 16,
  },
  twoColumns: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  inputGroup: {
    gap: 8,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  required: {
    color: '#FF3B30',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    minHeight: 50,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    minHeight: 50,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  radioButton: {
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  radioButtonSelected: {
    backgroundColor: '#2685BF',
    borderColor: '#2685BF',
  },
  radioText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: 'white',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
    marginBottom: 20,
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
  errorBox: {
    backgroundColor: '#ffeaa7',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#fdcb6e',
  },
  errorText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e17055',
  },
  errorSubText: {
    fontSize: 12,
    color: '#e17055',
    marginTop: 4,
  },
  debugContainer: {
    backgroundColor: '#dfe6e9',
    padding: 8,
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#2d3436',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2685BF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAnalisesAnalista;