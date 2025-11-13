// componentes/AddAnalisesAdmin.js
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

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddAnalisesAdmin = ({ onAdicionarAnalise, pocos, analistas }) => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    poco: null,
    analista: null,
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

  useEffect(() => {
    if (userData?.tipoUsuario === 'administrador' && userData?.nome) {
      setFormData(prev => ({
        ...prev,
        analista: {
          id: user.uid,
          nome: userData.nome,
          tipoUsuario: 'administrador'
        }
      }));
    }
  }, [userData, user]);

  const handleSubmit = async () => {
    if (!formData.poco || !formData.analista || !formData.resultado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    try {
      setEnviando(true);

      const analysisData = {
        pocoId: formData.poco.id,
        pocoNome: formData.poco.nomeProprietario || formData.poco.nome,
        pocoLocalizacao: formData.poco.localizacao || { latitude: 0, longitude: 0 },
        proprietario: formData.poco.nomeProprietario || 'Proprietário não informado',
        proprietarioId: formData.poco.userId || 'unknown',
        analistaId: formData.analista.id,
        analistaNome: formData.analista.nome,
        dataAnalise: formData.dataAnalise.toISOString(),
        resultado: formData.resultado,
        
        temperaturaAr: formData.temperaturaAr || '0',
        temperaturaAmostra: formData.temperaturaAmostra || '0',
        ph: formData.ph || '0',
        alcalinidade: formData.alcalinidade || '0',
        acidez: formData.acidez || '0',
        cor: formData.cor || '0',
        turbidez: formData.turbidez || '0',
        condutividadeEletrica: formData.condutividadeEletrica || '0',
        sdt: formData.sdt || '0',
        sst: formData.sst || '0',
        cloroTotal: formData.cloroTotal || '0',
        cloroLivre: formData.cloroLivre || '0',
        coliformesTotais: formData.coliformesTotais || '0',
        ecoli: formData.ecoli || '0',
        
        tipoCadastro: 'direto_admin',
        status: 'ativa',
        criadoPor: user.uid
      };

      console.log('AddAnalisesAdmin: Enviando análise:', analysisData);
      await onAdicionarAnalise(analysisData);
      
      setFormData({
        poco: null,
        analista: {
          id: user.uid,
          nome: userData.nome,
          tipoUsuario: 'administrador'
        },
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

      Alert.alert('Sucesso', 'Análise cadastrada com sucesso!');
      
    } catch (error) {
      console.error('AddAnalisesAdmin: Erro no cadastro:', error);
      Alert.alert('Erro', `Não foi possível cadastrar a análise: ${error.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const updateFormData = (key, value) => {
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

  const opcoesPocos = pocos?.map(poco => ({
    id: poco.id,
    nome: poco.nomeProprietario || poco.nome,
    nomeProprietario: poco.nomeProprietario,
    localizacao: poco.localizacao,
    userId: poco.userId,
    ...poco
  })) || [];

  const opcoesAnalistas = analistas?.map(analista => ({
    id: analista.id,
    nome: analista.nome,
    tipoUsuario: analista.tipoUsuario,
    ...analista
  })) || [];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Análise</Text>
      <Text style={styles.subtitle}>Administrador</Text>
      
      <View style={styles.form}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Cadastro Direto:</Text>
          <Text style={styles.infoText}>
            • Cadastre análises diretamente{'\n'}
            • Não precisa de aprovação{'\n'}
            • Análise fica disponível imediatamente{'\n'}
            • Você é registrado como analista responsável
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poço *</Text>
              <SelecaoBuscaSeguro
                value={formData.poco}
                onSelect={(poco) => updateFormData('poco', poco)}
                options={opcoesPocos}
                placeholder="Selecione o poço"
                searchKeys={['nome', 'nomeProprietario']}
                displayKey="nome"
              />
            </View>
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Analista *</Text>
              <SelecaoBuscaSeguro
                value={formData.analista}
                onSelect={(analista) => updateFormData('analista', analista)}
                options={opcoesAnalistas}
                placeholder="Selecione o analista"
                searchKeys={['nome']}
                displayKey="nome"
              />
            </View>
          </View>
        </View>

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

        <Text style={styles.sectionTitle}>Parâmetros Físico-Químicos</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Temperatura do Ar (°C)', 'temperaturaAr', 'Ex: 25.5', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Temperatura da Amostra (°C)', 'temperaturaAmostra', 'Ex: 22.0', 'decimal-pad')}
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('pH', 'ph', 'Ex: 7.0', 'decimal-pad')}
          </View>

          <View style={styles.column}>
            {renderInput('Alcalinidade (mg/L)', 'alcalinidade', 'Ex: 120', 'decimal-pad')}
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Acidez (mg/L)', 'acidez', 'Ex: 15', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Cor (UPC)', 'cor', 'Ex: 5', 'decimal-pad')}
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Turbidez (NTU)', 'turbidez', 'Ex: 0.5', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Condutividade Elétrica (μS/cm)', 'condutividadeEletrica', 'Ex: 250', 'decimal-pad')}
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('SDT (mg/L)', 'sdt', 'Ex: 180', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('SST (mg/L)', 'sst', 'Ex: 20', 'decimal-pad')}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Parâmetros Químicos e Microbiológicos</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Cloro Total (mg/L)', 'cloroTotal', 'Ex: 0.8', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('Cloro Livre (mg/L)', 'cloroLivre', 'Ex: 0.5', 'decimal-pad')}
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            {renderInput('Coliformes Totais (UFC/100mL)', 'coliformesTotais', 'Ex: 0', 'decimal-pad')}
          </View>
          <View style={styles.column}>
            {renderInput('E. coli (UFC/100mL)', 'ecoli', 'Ex: 0', 'decimal-pad')}
          </View>
        </View>

        <View style={styles.fullWidth}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!formData.poco || !formData.analista || !formData.resultado) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!formData.poco || !formData.analista || !formData.resultado || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>CADASTRAR ANÁLISE</Text>
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
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#2685BF',
    paddingTop: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
    fontStyle: 'italic',
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

export default AddAnalisesAdmin;