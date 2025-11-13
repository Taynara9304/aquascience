// componentes/AddVisitasAdmin.js - VERSÃO CORRIGIDA
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
import { useAuth } from '../contexts/authContext';
import DateTimePickerCompleto from './DateTimePickerCompleto';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddVisitasAdmin = ({ onAdicionarVisita }) => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    poco: null,
    analista: null,
    dataHora: new Date(),
    situacao: 'agendada',
    observacoes: ''
  });
  const [pocos, setPocos] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const [carregandoPocos, setCarregandoPocos] = useState(true);
  const [carregandoAnalistas, setCarregandoAnalistas] = useState(true);

  // Admin pode ver TODOS os poços
  useEffect(() => {
    console.log('📡 AddVisitasAdmin: Buscando TODOS os poços');
    
    const pocosCollection = collection(db, 'wells');
    const q = query(pocosCollection, orderBy('nomeProprietario'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const pocosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setPocos(pocosData);
        setCarregandoPocos(false);
      },
      (error) => {
        console.error('Erro ao carregar poços:', error);
        Alert.alert('Erro', 'Não foi possível carregar os poços');
        setCarregandoPocos(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Buscar apenas usuários do tipo "analista"
  useEffect(() => {
    console.log('AddVisitasAdmin: Buscando analistas cadastrados');
    
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection, 
      where('tipoUsuario', '==', 'analista'),
      orderBy('nome')
    );
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const analistasData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAnalistas(analistasData);
        setCarregandoAnalistas(false);
        console.log(`${analistasData.length} analistas carregados`);
      },
      (error) => {
        console.error('Erro ao carregar analistas:', error);
        // Se der erro de índice, busca sem filtro e filtra localmente
        const allUsersQuery = query(usersCollection, orderBy('nome'));
        onSnapshot(allUsersQuery, 
          (allUsersSnapshot) => {
            const allUsers = allUsersSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            const analistasFiltrados = allUsers.filter(user => 
              user.tipoUsuario === 'analista'
            );
            setAnalistas(analistasFiltrados);
            setCarregandoAnalistas(false);
            console.log(`${analistasFiltrados.length} analistas carregados (filtro local)`);
          },
          (err) => {
            console.error('Erro ao carregar todos os usuários:', err);
            Alert.alert('Aviso', 'Não foi possível carregar a lista de analistas');
            setCarregandoAnalistas(false);
          }
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSubmit = async () => {
    if (!formData.poco) {
      Alert.alert('Erro', 'Por favor, selecione um poço');
      return;
    }

    if (!formData.analista) {
      Alert.alert('Erro', 'Por favor, selecione um analista responsável');
      return;
    }

    try {
      const visitData = {
        ...formData,
        pocoId: formData.poco.id,
        pocoNome: formData.poco.nomeProprietario,
        pocoLocalizacao: formData.poco.localizacao,
        proprietario: formData.poco.nomeProprietario,
        
        analistaId: formData.analista.id,
        analistaNome: formData.analista.nome,
        analistaEmail: formData.analista.email,
        
        dataVisita: formData.dataHora.toISOString(),
        tipo: 'agendamento_admin',
        status: 'agendada',
        criadoPor: user.uid,
        tipoUsuario: userData?.tipoUsuario || 'administrador',
        userId: formData.poco.userId,
        dataSolicitacao: new Date().toISOString()
      };

      console.log('AddVisitasAdmin: Enviando visita:', visitData);
      await onAdicionarVisita(visitData);
      
      setFormData({
        poco: null,
        analista: null,
        dataHora: new Date(),
        situacao: 'agendada',
        observacoes: ''
      });

      Alert.alert(
        'Visita Agendada!', 
        `A visita foi agendada com sucesso para o analista ${formData.analista.nome}.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Erro ao agendar visita:', error);
      Alert.alert('Erro', 'Não foi possível agendar a visita');
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const opcoesPocos = pocos.map(poco => ({
    id: poco.id,
    nome: poco.nomeProprietario,
    nomeProprietario: poco.nomeProprietario,
    localizacao: poco.localizacao,
    proprietario: poco.nomeProprietario,
    userId: poco.userId,
    ...poco
  }));

  const opcoesAnalistas = analistas.map(analista => ({
    id: analista.id,
    nome: analista.nome,
    email: analista.email,
    tipoUsuario: analista.tipoUsuario,
    ...analista
  }));

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agendar Visita Técnica</Text>
      <Text style={styles.subtitle}>Administrador</Text>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Agendamento Direto</Text>
        
        {/* Seleção de Poço */}
        <View style={isDesktop ? styles.twoColumns : styles.oneColumn}>
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Poço *</Text>
              {carregandoPocos ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#2685BF" />
                  <Text style={styles.loadingText}>Carregando poços...</Text>
                </View>
              ) : (
                <SelecaoBuscaSeguro
                  value={formData.poco}
                  onSelect={(poco) => updateFormData('poco', poco)}
                  options={opcoesPocos}
                  placeholder="Selecione qualquer poço"
                  searchKeys={['nome', 'proprietario', 'localizacao']}
                  displayKey="nome"
                />
              )}
            </View>
          </View>
          
          <View style={styles.column}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Data e Hora Desejada *</Text>
              <DateTimePickerCompleto
                value={formData.dataHora}
                onChange={(dateTime) => updateFormData('dataHora', dateTime)}
                placeholder="Selecione data e hora"
              />
              <Text style={styles.dateInfo}>
                Selecionado: {formData.dataHora.toLocaleString('pt-BR')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.fullWidth}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Analista Responsável *</Text>
            {carregandoAnalistas ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#2685BF" />
                <Text style={styles.loadingText}>Carregando analistas...</Text>
              </View>
            ) : (
              <>
                <SelecaoBuscaSeguro
                  value={formData.analista}
                  onSelect={(analista) => updateFormData('analista', analista)}
                  options={opcoesAnalistas}
                  placeholder="Selecione um analista"
                  searchKeys={['nome', 'email']}
                  displayKey="nome"
                />
                {analistas.length === 0 && (
                  <Text style={styles.semAnalistasText}>
                    Nenhum analista cadastrado no sistema.
                  </Text>
                )}
              </>
            )}
          </View>
        </View>

        <View style={styles.fullWidth}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Observações</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observacoes}
              onChangeText={(text) => updateFormData('observacoes', text)}
              placeholder="Observações sobre o agendamento..."
              multiline={true}
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Fluxo do Administrador:</Text>
          <Text style={styles.infoText}>
            • Selecione QUALQUER poço do sistema{'\n'}
            • Escolha um ANALISTA cadastrado{'\n'}
            • Agende visitas diretamente{'\n'}
            • Não precisa de aprovação{'\n'}
            • Visita aparece como "agendada"
          </Text>
        </View>

        <View style={styles.fullWidth}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!formData.poco || !formData.analista) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!formData.poco || !formData.analista}
          >
            <Text style={styles.submitButtonText}>
              AGENDAR VISITA
            </Text>
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
  textArea: {
    minHeight: 100,
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
  semAnalistasText: {
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
});

export default AddVisitasAdmin;