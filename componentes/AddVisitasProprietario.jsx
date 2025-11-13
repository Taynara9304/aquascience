// componentes/AddVisitasProprietario.js - VERSÃO CORRIGIDA
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
  ActivityIndicator,
  Linking,
  Platform
} from 'react-native';
import SelecaoBuscaSeguro from './SelecaoBusca';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import DateTimePickerCompleto from './DateTimePickerCompleto';

const { width } = Dimensions.get('window');
const isDesktop = width >= 768;

const AddVisitasProprietario = ({ onAdicionarVisita }) => {
  const { user, userData } = useAuth();
  const [formData, setFormData] = useState({
    poco: null,
    dataHora: new Date(),
    situacao: 'solicitada',
    observacoes: ''
  });
  const [pocos, setPocos] = useState([]);
  const [carregandoPocos, setCarregandoPocos] = useState(true);
  const [enviando, setEnviando] = useState(false);

  // Buscar APENAS os poços do proprietário logado
  useEffect(() => {
    if (!user) {
      setPocos([]);
      setCarregandoPocos(false);
      return;
    }

    console.log('📡 AddVisitasProprietario: Buscando poços do proprietário:', user.uid);
    
    try {
      const pocosCollection = collection(db, 'wells');
      const q = query(
        pocosCollection, 
        where('userId', '==', user.uid),
        orderBy('nomeProprietario')
      );
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const pocosData = snapshot.docs.map(doc => {
            const data = doc.data();
            
            let localizacaoFormatada = null;
            if (data.localizacao) {
              if (data.localizacao._lat && data.localizacao._long) {
                localizacaoFormatada = {
                  latitude: data.localizacao._lat,
                  longitude: data.localizacao._long
                };
              } else if (data.localizacao.latitude && data.localizacao.longitude) {
                localizacaoFormatada = data.localizacao;
              }
            }
            
            return {
              id: doc.id,
              ...data,
              localizacao: localizacaoFormatada
            };
          });
          
          setPocos(pocosData);
          setCarregandoPocos(false);
          
          if (pocosData.length === 0) {
            console.log('ℹProprietário não tem poços cadastrados para visitas');
          } else {
            console.log(`${pocosData.length} poços carregados para seleção`);
          }
        },
        (error) => {
          console.error('Erro ao carregar poços:', error);
          Alert.alert('Erro', 'Não foi possível carregar seus poços');
          setCarregandoPocos(false);
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Erro na configuração da query:', error);
      setCarregandoPocos(false);
    }
  }, [user]);

  const gerarMensagemWhatsApp = () => {
    const nomeProprietario = userData?.nome || 'Proprietário';
    const telefoneProprietario = userData?.telefone || 'Número não cadastrado';
    
    // Gerar link do Google Maps
    let mapsLink = 'Localização não disponível';
    if (formData.poco?.localizacao) {
      const { latitude, longitude } = formData.poco.localizacao;
      mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
    }

    // Formatar data e hora
    const dataHoraFormatada = formData.dataHora.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // TRATAR OBSERVAÇÕES OPCIONAIS
    const observacoesTexto = formData.observacoes.trim() 
      ? `\nGostaria de observar que: ${formData.observacoes}`
      : '';

    return `Olá, eu sou ${nomeProprietario}!

Quero agendar uma visita na minha casa nesse endereço: ${mapsLink}

Gostaria que a visita seja ${dataHoraFormatada}

É possível nesse dia e horário?${observacoesTexto}`;
  };

  // FUNÇÃO CORRIGIDA PARA ABRIR WHATSAPP
  const abrirWhatsApp = async (mensagem) => {
    const TELEFONE_ADM = "5545999215446"; 
    
    try {
      // CORREÇÃO: Usar esquema específico para app nativo
      let url;
      if (Platform.OS === 'android') {
        // Android: usar intent
        url = `whatsapp://send?phone=${TELEFONE_ADM}&text=${encodeURIComponent(mensagem)}`;
      } else {
        // iOS: usar esquema universal
        url = `https://wa.me/${TELEFONE_ADM}?text=${encodeURIComponent(mensagem)}`;
      }
      
      console.log('Tentando abrir URL:', url);
      
      const canOpen = await Linking.canOpenURL(url);
      console.log('Pode abrir URL?', canOpen);
      
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        //FALLBACK: Tentar abrir WhatsApp Web
        const webUrl = `https://web.whatsapp.com/send?phone=${TELEFONE_ADM}&text=${encodeURIComponent(mensagem)}`;
        const canOpenWeb = await Linking.canOpenURL(webUrl);
        
        if (canOpenWeb) {
          await Linking.openURL(webUrl);
          return true;
        } else {
          Alert.alert(
            'WhatsApp Não Encontrado', 
            'Não foi possível abrir o WhatsApp. Instale o app ou use o WhatsApp Web manualmente.'
          );
          return false;
        }
      }
    } catch (error) {
      console.error('Erro ao abrir WhatsApp:', error);
      Alert.alert('Erro', 'Não foi possível abrir o WhatsApp: ' + error.message);
      return false;
    }
  };

  // FUNÇÃO CORRIGIDA PARA SALVAR NO FIREBASE PRIMEIRO
  const salvarSolicitacaoFirebase = async () => {
    try {
      console.log('Salvando solicitação no Firebase...');

      const visitData = {
        // Informações do poço
        pocoId: formData.poco.id,
        pocoNome: formData.poco.nomeProprietario,
        pocoLocalizacao: formData.poco.localizacao,
        
        // Informações da visita
        dataVisita: formData.dataHora.toISOString(),
        dataVisitaTimestamp: formData.dataHora.getTime(),
        situacao: 'solicitada_whatsapp',
        observacoes: formData.observacoes.trim(),
        
        // Informações do usuário
        proprietario: formData.poco.nomeProprietario,
        proprietarioNome: userData?.nome || 'Proprietário',
        proprietarioTelefone: userData?.telefone || 'Não informado',
        tipo: 'solicitacao_proprietario_whatsapp',
        status: 'pendente',
        criadoPor: user.uid,
        userId: user.uid,
        tipoUsuario: userData?.tipoUsuario || 'proprietario',
        dataSolicitacao: new Date().toISOString(),
        dataSolicitacaoTimestamp: new Date().getTime(),
        
        // Dados específicos para WhatsApp
        canal: 'whatsapp',
        mensagemWhatsApp: gerarMensagemWhatsApp(),
        notificacaoEnviada: false,
        whatsappEnviado: false // Novo campo para controle
      };

      console.log('Enviando dados para Firebase:', visitData);

      // SALVAR DIRETAMENTE NO FIREBASE PRIMEIRO
      const visitsCollection = collection(db, 'visits');
      const docRef = await addDoc(visitsCollection, {
        ...visitData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('Solicitação salva no Firebase com ID:', docRef.id);
      return { success: true, id: docRef.id, data: visitData };
      
    } catch (error) {
      console.error('Erro ao salvar no Firebase:', error);
      return { success: false, error: error.message };
    }
  };

  const handleSubmit = async () => {
    if (!formData.poco) {
      Alert.alert('Erro', 'Por favor, selecione um poço');
      return;
    }

    // VALIDAÇÃO DA DATA/HORA
    if (!formData.dataHora || !(formData.dataHora instanceof Date)) {
      Alert.alert('Erro', 'Data/hora inválida');
      return;
    }

    const agora = new Date();
    if (formData.dataHora <= agora) {
      Alert.alert('Erro', 'Selecione uma data e hora futuras');
      return;
    }

    setEnviando(true);

    try {
      // PRIMEIRO: Salvar no Firebase
      const resultadoFirebase = await salvarSolicitacaoFirebase();
      
      if (!resultadoFirebase.success) {
        throw new Error(resultadoFirebase.error);
      }

      // SEGUNDO: Gerar mensagem
      const mensagem = gerarMensagemWhatsApp();
      console.log('Mensagem gerada:', mensagem);

      // TERCEIRO: Abrir WhatsApp
      const whatsappAberto = await abrirWhatsApp(mensagem);
      
      if (whatsappAberto) {
        Alert.alert(
          'Solicitação Enviada!', 
          'Sua solicitação foi salva no sistema e o WhatsApp foi aberto. Envie a mensagem para o administrador.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          '⚠️ Solicitação Salva', 
          'Sua solicitação foi salva no sistema. Abra o WhatsApp manualmente para enviar a mensagem.',
          [{ text: 'OK' }]
        );
      }
      
      // Reset do formulário apenas se deu certo
      setFormData({
        poco: null,
        dataHora: new Date(new Date().setHours(new Date().getHours() + 1)),
        situacao: 'solicitada',
        observacoes: ''
      });

    } catch (error) {
      console.error('Erro no processo completo:', error);
      Alert.alert(
        'Erro', 
        `Não foi possível completar a solicitação: ${error.message}\n\nSua solicitação pode não ter sido salva. Tente novamente.`
      );
    } finally {
      setEnviando(false);
    }
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const opcoesPocos = pocos.map(poco => {
    let localizacaoSegura = null;
    if (poco.localizacao) {
      if (poco.localizacao._lat && poco.localizacao._long) {
        localizacaoSegura = {
          latitude: poco.localizacao._lat,
          longitude: poco.localizacao._long
        };
      } else {
        localizacaoSegura = poco.localizacao;
      }
    }
    
    return {
      id: poco.id,
      nome: poco.nomeProprietario,
      nomeProprietario: poco.nomeProprietario,
      localizacao: localizacaoSegura,
      proprietario: poco.nomeProprietario,
      userId: poco.userId,
      ...poco
    };
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Solicitar Visita Técnica</Text>
      <Text style={styles.subtitle}>Proprietário - Via WhatsApp</Text>
      
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Seus Poços</Text>
        
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
                      Você ainda não tem poços cadastrados. Cadastre um poço primeiro para solicitar visitas.
                    </Text>
                  )}
                </>
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
            <Text style={styles.label}>Observações (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.observacoes}
              onChangeText={(text) => updateFormData('observacoes', text)}
              placeholder="Ex: Moro em área rural, e para chegar aqui é necessário virar na segunda estrada de chão à direita... (opcional)"
              multiline={true}
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={styles.userInfoBox}>
          <Text style={styles.userInfoTitle}>👤 Seus Dados:</Text>
          <Text style={styles.userInfoText}>
            Nome: {userData?.nome || 'Não informado'}{'\n'}
            Telefone: {userData?.telefone || 'Não informado'}
          </Text>
          {!userData?.telefone && (
            <Text style={styles.warningText}>
              ⚠️ Seu telefone não está cadastrado. Atualize seu perfil.
            </Text>
          )}
        </View>

        {formData.poco && formData.observacoes && (
          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>📋 Prévia da Mensagem WhatsApp:</Text>
            <ScrollView style={styles.previewScroll}>
              <Text style={styles.previewText}>
                {gerarMensagemWhatsApp()}
              </Text>
            </ScrollView>
          </View>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>📱 Como Funciona:</Text>
          <Text style={styles.infoText}>
            1. Preencha os dados acima{'\n'}
            2. Clique no botão verde{'\n'}
            3. Sistema SALVA sua solicitação{'\n'}
            4. WhatsApp abre com mensagem pronta{'\n'}
            5. Envie a mensagem para o administrador
          </Text>
        </View>

        <View style={styles.fullWidth}>
          <TouchableOpacity 
            style={[
              styles.submitButton,
              (!formData.poco || enviando) && styles.submitButtonDisabled
            ]} 
            onPress={handleSubmit}
            disabled={!formData.poco || enviando}
          >
            {enviando ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>
                {enviando ? 'SALVANDO...' : 'SOLICITAR VIA WHATSAPP'}
              </Text>
            )}
          </TouchableOpacity>
          
          <Text style={styles.helpText}>
            💡 Dica: Se o WhatsApp não abrir, copie a mensagem acima e envie manualmente.
          </Text>
        </View>
      </View>
    </View>
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
  dateInfo: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic',
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
  userInfoBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
  },
  userInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 4,
  },
  userInfoText: {
    fontSize: 12,
    color: '#333',
    lineHeight: 16,
  },
  warningText: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 4,
    fontStyle: 'italic',
  },
  previewBox: {
    backgroundColor: '#F3F3F3',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 8,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  previewScroll: {
    maxHeight: 150,
  },
  previewText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: '#E8F5E8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
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
  submitButton: {
    backgroundColor: '#25D366', // Verde WhatsApp
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
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AddVisitasProprietario;