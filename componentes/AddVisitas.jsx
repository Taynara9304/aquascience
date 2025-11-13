// componentes/AddVisitas.js - ATUALIZADO PARA FILTRAR POR USUÁRIO
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
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext'; // ← IMPORT DO AUTH

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddVisitas = ({ onAdicionarVisita }) => {
  const { user } = useAuth(); // ← PEGUE O USUÁRIO LOGADO
  const [formData, setFormData] = useState({
    poco: null,
    dataHora: new Date(),
    situacao: 'solicitada',
    observacoes: ''
  });
  const [pocos, setPocos] = useState([]);
  const [carregandoPocos, setCarregandoPocos] = useState(true);

  // Buscar poços APENAS do usuário logado
  useEffect(() => {
    if (!user) {
      setPocos([]);
      setCarregandoPocos(false);
      return;
    }

    console.log('📡 AddVisitas: Buscando poços do usuário:', user.uid);
    
    const pocosCollection = collection(db, 'wells');
    
    // FILTRAR POR USER ID
    const q = query(
      pocosCollection, 
      where('userId', '==', user.uid), // ← FILTRO CRÍTICO
      orderBy('nomeProprietario')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('✅ AddVisitas: Poços do usuário carregados -', snapshot.docs.length);
        
        const pocosData = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            nomeProprietario: data.nomeProprietario || `Poço ${doc.id}`,
            localizacao: data.localizacao || {},
            userId: data.userId, // ← Incluir userId nos dados
            ...data
          };
        });
        
        setPocos(pocosData);
        setCarregandoPocos(false);
        
        // Log para debug
        if (pocosData.length === 0) {
          console.log('ℹ️ AddVisitas: Usuário não tem poços cadastrados');
        }
      },
      (error) => {
        console.error('❌ AddVisitas: Erro ao carregar poços:', error);
        Alert.alert('Erro', 'Não foi possível carregar seus poços');
        setCarregandoPocos(false);
      }
    );

    return () => unsubscribe();
  }, [user]); // ← DEPENDÊNCIA NO USER

  const handleSubmit = async () => {
    if (!formData.poco) {
      Alert.alert('Erro', 'Por favor, selecione um poço');
      return;
    }

    if (!formData.observacoes.trim()) {
      Alert.alert('Erro', 'Por favor, informe as observações/justificativa');
      return;
    }

    try {
      console.log('🎯 AddVisitas: Enviando solicitação de visita...');
      
      const visitData = {
        ...formData,
        pocoId: formData.poco.id,
        pocoNome: formData.poco.nomeProprietario,
        pocoLocalizacao: formData.poco.localizacao,
        proprietario: formData.poco.nomeProprietario,
        dataVisita: formData.dataHora.toISOString(),
        tipo: 'solicitacao',
        status: 'pendente',
        criadoPor: user.uid, // ← USAR ID DO USUÁRIO LOGADO
        userId: user.uid, // ← ASSOCIAR VISITA AO USUÁRIO
        dataSolicitacao: new Date().toISOString()
      };

      await onAdicionarVisita(visitData);
      
      // Reset form
      setFormData({
        poco: null,
        dataHora: new Date(),
        situacao: 'solicitada',
        observacoes: ''
      });

      Alert.alert(
        'Solicitação Enviada!', 
        'Sua solicitação de visita foi enviada para análise do administrador.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ AddVisitas: Erro ao enviar solicitação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a solicitação de visita');
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Formatar opções para o SelectWithSearch
  const opcoesPocos = pocos.map(poco => ({
    id: poco.id,
    nome: poco.nomeProprietario,
    nomeProprietario: poco.nomeProprietario,
    localizacao: poco.localizacao,
    proprietario: poco.nomeProprietario,
    userId: poco.userId, // ← Manter userId
    ...poco
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Solicitar Visita Técnica</Text>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Informações da Solicitação</Text>
        
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Seus Poços *</Text>
              {carregandoPocos ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2685BF" />
                  <Text style={styles.loadingText}>Carregando seus poços...</Text>
                </View>
              ) : (
                <>
                  <SelecaoBuscaSeguro
                    value={formData.poco}
                    onSelect={(poco) => updateFormData('poco', poco)}
                    options={opcoesPocos}
                    placeholder="Selecione um dos seus poços"
                    searchKeys={['nome', 'proprietario']}
                    displayKey="nome"
                  />
                  {pocos.length === 0 && (
                    <Text style={styles.semPocosText}>
                      💡 Você ainda não tem poços cadastrados. 
                      Cadastre um poço primeiro para solicitar visitas.
                    </Text>
                  )}
                </>
              )}
              <Text style={styles.helpText}>
                Selecione um dos seus poços cadastrados
              </Text>
            </View>
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data e Hora Desejada</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => {
                  Alert.alert(
                    'Data da Visita',
                    'Data atual selecionada automaticamente.',
                    [{ text: 'OK' }]
                  );
                }}
              >
                <Text style={styles.dateText}>
                  {formData.dataHora.toLocaleString('pt-BR')}
                </Text>
              </TouchableOpacity>
              <Text style={styles.helpText}>
                Data e hora sugeridas para a visita
              </Text>
            </View>
          </View>
        </View>

        {/* ... resto do código mantido ... */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  semPocosText: {
    fontSize: 14,
    color: '#FF9800',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#2685BF',
    paddingTop: 8,
  },
  form: {
    padding: 16,
    gap: 16,
    paddingTop: 8,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  helpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
  statusContainer: {
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  statusSolicitada: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#856404',
  },
  statusHelpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
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
  validationText: {
    fontSize: 12,
    color: '#FF4444',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AddVisitas;