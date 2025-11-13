// componentes/AddAnalises.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Dimensions,
} from 'react-native';
import SelectWithSearch from './SelecaoBusca';
import DatePicker from './DatePicker';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddAnalises = ({ onAdicionarAnalise, pocos, proprietarios, analistas }) => {
  const [formData, setFormData] = useState({
    poco: null,
    proprietario: null,
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

  const handleSubmit = () => {
    // Validação básica
    if (!formData.poco || !formData.analista || !formData.resultado) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const analysisData = {
      ...formData,
      pocoId: formData.poco.id,
      pocoNome: formData.poco.nome,
      proprietario: formData.proprietario?.nome || formData.poco.proprietario,
      analista: formData.analista.nome,
      dataAnalise: formData.dataAnalise.toISOString().split('T')[0],
    };

    onAdicionarAnalise(analysisData);
    
    // Reset form
    setFormData({
      poco: null,
      proprietario: null,
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

    Alert.alert('Sucesso', 'Análise cadastrada com sucesso!');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastrar Nova Análise</Text>
      
      <View style={styles.form}>
        {/* SEÇÃO INFORMAÇÕES BÁSICAS - LAYOUT CORRIGIDO */}
        <Text style={styles.sectionTitle}>Informações Básicas</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <SelectWithSearch
              label="Poço *"
              value={formData.poco}
              onSelect={(poco) => updateFormData('poco', poco)}
              options={pocos}
              placeholder="Selecione o poço"
            />
          </View>
          
          <View style={styles.column}>
            <SelectWithSearch
              label="Proprietário"
              value={formData.proprietario}
              onSelect={(proprietario) => updateFormData('proprietario', proprietario)}
              options={proprietarios}
              placeholder="Selecione o proprietário"
            />
          </View>
        </View>

        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <SelectWithSearch
              label="Analista *"
              value={formData.analista}
              onSelect={(analista) => updateFormData('analista', analista)}
              options={analistas}
              placeholder="Selecione o analista"
            />
          </View>
          
          <View style={styles.column}>
            <DatePicker
              label="Data da Análise"
              value={formData.dataAnalise}
              onChange={(date) => updateFormData('dataAnalise', date)}
            />
          </View>
        </View>

        {/* RESULTADO - OCUPA LARGURA TOTAL */}
        <View style={styles.fullWidth}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Resultado <Text style={styles.required}>*</Text></Text>
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

        {/* SEÇÃO PARÂMETROS FÍSICO-QUÍMICOS */}
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

        {/* SEÇÃO PARÂMETROS QUÍMICOS E MICROBIOLÓGICOS */}
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

        {/* BOTÃO CADASTRAR - LARGURA TOTAL */}
        <View style={styles.fullWidth}>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>CADASTRAR ANÁLISE</Text>
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
    marginHorizontal: 16, // Adicione esta linha
    marginBottom: 16, // Adicione esta linha
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
    paddingTop: 16,
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
  // Layout para uma coluna (mobile)
  oneColumn: {
    gap: 16,
  },
  // Layout para duas colunas (desktop)
  twoColumns: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'space-between',
  },
  // Cada coluna deve ocupar metade do espaço disponível
  column: {
    flex: 1,
  },
  // Para elementos que devem ocupar largura total
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
  submitButton: {
    backgroundColor: '#2685BF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    minHeight: 50,
    justifyContent: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddAnalises;