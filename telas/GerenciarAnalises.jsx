// telas/GerenciarAnalises.jsx - CORREÇÃO COMPLETA
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { collection, query, where, onSnapshot, orderBy, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import TabelaAnalises from '../componentes/TabelaAnalises';
import AddAnalisesAdmin from '../componentes/AddAnalisesAdmin';
import AddAnalisesAnalista from '../componentes/AddAnalisesAnalista';
import { AnalistaNotifications } from '../services/notificacaoService';

const GerenciarAnalises = ({ navigation }) => {
  const [analises, setAnalises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pocos, setPocos] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const { user, userType, userData } = useAuth();

  console.log('🔍 GerenciarAnalises - Estado do usuário:', {
    userId: user?.uid,
    userType,
    userData,
    loadingAuth: loading
  });

  useEffect(() => {
    console.log('🔄 useEffect disparado - user:', user?.uid, 'userType:', userType);
    
    if (user) {
      carregarAnalises();
      carregarDadosFormulario();
    }
  }, [user, userType]);

  const getTipoUsuarioReal = () => {
    let tipo = '';
    
    if (userType) {
      console.log('🎯 Usando userType do contexto:', userType);
      tipo = userType;
    } else if (userData?.tipoUsuario) {
      console.log('🎯 Usando userData.tipoUsuario:', userData.tipoUsuario);
      tipo = userData.tipoUsuario;
    } else {
      console.log('⚠️ Tipo de usuário não detectado, usando padrão: analista');
      tipo = 'analista';
    }
    
    if (tipo === 'administrador') {
      return 'admin';
    }
    if (tipo === 'analista') {
      return 'analista';
    }
    if (tipo === 'proprietario') {
      return 'proprietario';
    }
    
    return tipo;
  };

  const carregarAnalises = async () => {
    try {
      setLoading(true);
      
      const tipoUsuarioReal = getTipoUsuarioReal();
      
      console.log('📊 Iniciando carregamento de análises...', {
        uid: user?.uid,
        userType: tipoUsuarioReal,
        timestamp: new Date().toISOString()
      });

      if (!user) {
        console.log('❌ Usuário não autenticado - parando carregamento');
        setLoading(false);
        return;
      }

      let q;

      if (tipoUsuarioReal === 'proprietario') {
        q = query(
          collection(db, 'analysis'),
          where('idProprietario', '==', user.uid),
          orderBy('dataCriacao', 'desc')
        );
        console.log('👤 Consulta: análises do proprietário', user.uid);
      
      } else {
        q = query(
          collection(db, 'analysis'),
          orderBy('dataCriacao', 'desc')
        );
        console.log('👥 Consulta: TODAS as análises');
      }

      const unsubscribe = onSnapshot(q, 
        (querySnapshot) => {
          const analisesList = [];
          console.log('📦 Snapshot recebido - documentos:', querySnapshot.size);
          
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            analisesList.push({
              id: doc.id,
              ...data
            });
          });
          
          console.log('✅ Análises processadas:', analisesList.length);
          setAnalises(analisesList);
          setLoading(false);
          setRefreshing(false);
        }, 
        (error) => {
          console.error('❌ Erro no snapshot:', error);
          Alert.alert('Erro', 'Não foi possível carregar as análises: ' + error.message);
          setLoading(false);
          setRefreshing(false);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Erro ao carregar análises:', error);
      Alert.alert('Erro', 'Não foi possível carregar as análises');
      setLoading(false);
      setRefreshing(false);
    }
  };

  const carregarDadosFormulario = async () => {
    try {
      console.log('🔄 Carregando dados do formulário...');
      
      console.log('🔍 Tentando acessar coleção: wells');
      
      const pocosSnapshot = await getDocs(collection(db, 'wells'));
      const pocosList = pocosSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('✅ Poços carregados com SUCESSO:', pocosList.length);
      if (pocosList.length > 0) {
        console.log('📋 Primeiro poço:', pocosList[0]);
        console.log('👤 idProprietario do primeiro poço:', pocosList[0].idProprietario);
      }
      
      setPocos(pocosList);

      console.log('🔍 Tentando acessar coleção: users');
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const analistasList = usersSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.tipoUsuario === 'analista' || user.tipoUsuario === 'admin');
      
      console.log('Analistas carregados com SUCESSO:', analistasList.length);
      setAnalistas(analistasList);

    } catch (error) {
      console.error('Erro ao carregar dados do formulário:', error);
      console.error('Código do erro:', error.code);
      console.error('Mensagem do erro:', error.message);
      
      if (error.code === 'permission-denied') {
        Alert.alert(
          'Permissão Negada', 
          'Você não tem permissão para acessar os dados necessários. Entre em contato com o administrador.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', 'Não foi possível carregar os dados do formulário');
      }
    }
  };

  const handleCadastroDiretoAdmin = async (analysisData) => {
    try {
      console.log('Admin: Cadastrando análise diretamente...', analysisData);
      
      const docRef = await addDoc(collection(db, 'analysis'), {
        ...analysisData,
        status: 'ativa',
        tipoCadastro: 'direto_admin',
        dataCriacao: new Date().toISOString(),
        criadoPor: user.uid
      });

      console.log('Análise cadastrada com ID:', docRef.id);
      Alert.alert('Sucesso', 'Análise cadastrada diretamente no banco!');
      
      carregarAnalises();
      
    } catch (error) {
      console.error('Erro ao cadastrar análise:', error);
      Alert.alert('Erro', 'Não foi possível cadastrar a análise: ' + error.message);
    }
  };

  const handleSolicitacaoAnalista = async (analysisData) => {
    try {
      console.log('Analista: Enviando solicitação de análise...', analysisData);
      
      const notificationId = await AnalistaNotifications.solicitarCadastroAnalise(
        user,
        analysisData
      );

      console.log('Solicitação enviada com ID:', notificationId);
      Alert.alert(
        'Solicitação Enviada!', 
        'Sua análise foi enviada para aprovação do administrador.'
      );
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      Alert.alert('Erro', 'Não foi possível enviar a solicitação: ' + error.message);
    }
  };

  const onRefresh = () => {
    console.log('Refresh manual acionado');
    setRefreshing(true);
    carregarAnalises();
    carregarDadosFormulario();
  };

  const navegarParaNotificacoes = () => {
    navigation.navigate('NotificacoesAnalista');
  };

  const getTitulo = () => {
    const tipoUsuarioReal = getTipoUsuarioReal();
    switch (tipoUsuarioReal) {
      case 'proprietario':
        return 'Minhas Análises';
      case 'analista':
        return 'Todas as Análises';
      case 'admin':
        return 'Gerenciar Análises';
      default:
        return 'Análises';
    }
  };

  const getInfoText = () => {
    const tipoUsuarioReal = getTipoUsuarioReal();
    
    if (loading) {
      return 'Carregando informações...';
    }

    switch (tipoUsuarioReal) {
      case 'proprietario':
        return `• Aqui estão todas as análises dos seus poços\n• Total de ${analises.length} análise${analises.length !== 1 ? 's' : ''} encontrada${analises.length !== 1 ? 's' : ''}\n• As análises aprovadas aparecem automaticamente\n• Você não pode adicionar análises diretamente`;
      case 'analista':
        return `• Aqui estão todas as análises do sistema\n• Total de ${analises.length} análise${analises.length !== 1 ? 's' : ''} encontrada${analises.length !== 1 ? 's' : ''}\n• Você pode visualizar e editar todas as análises\n• Para cadastrar novas, solicite aprovação do administrador`;
      case 'admin':
        return `• Gerenciamento completo de todas as análises\n• Total de ${analises.length} análise${analises.length !== 1 ? 's' : ''} encontrada${analises.length !== 1 ? 's' : ''}\n• Você pode cadastrar análises diretamente no banco\n• Gerencie solicitações de analistas`;
      default:
        return `• Visualização de análises\n• Total de ${analises.length} análise${analises.length !== 1 ? 's' : ''} encontrada${analises.length !== 1 ? 's' : ''}`;
    }
  };

  // ✅ CORREÇÃO: Badge do tipo de usuário
  const getUserTypeBadge = () => {
    const tipoUsuarioReal = getTipoUsuarioReal();
    switch (tipoUsuarioReal) {
      case 'proprietario':
        return { text: 'Proprietário', color: '#28a745' };
      case 'analista':
        return { text: 'Analista', color: '#ffc107' };
      case 'admin':
        return { text: 'Administrador', color: '#dc3545' };
      default:
        return { text: 'Usuário', color: '#6c757d' };
    }
  };

  const deveMostrarFormulario = () => {
    const tipoUsuarioReal = getTipoUsuarioReal();
    return tipoUsuarioReal === 'admin' || tipoUsuarioReal === 'analista';
  };

  const renderFormulario = () => {
    const tipoUsuarioReal = getTipoUsuarioReal();
    
    console.log('Renderizando formulário para:', tipoUsuarioReal);
    
    if (tipoUsuarioReal === 'admin') {
      return (
        <View style={styles.formularioContainer}>
          <AddAnalisesAdmin 
            onAdicionarAnalise={handleCadastroDiretoAdmin}
            pocos={pocos}
            analistas={analistas}
          />
        </View>
      );
    } else if (tipoUsuarioReal === 'analista') {
      return (
        <View style={styles.formularioContainer}>
          <AddAnalisesAnalista 
            onAdicionarAnalise={handleSolicitacaoAnalista}
            pocos={pocos}
            analistas={analistas}
          />
        </View>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2685BF" />
        <Text style={styles.loadingText}>Carregando análises...</Text>
        <Text style={styles.loadingSubText}>
          Tipo de usuário: {getTipoUsuarioReal()}
        </Text>
      </View>
    );
  }

  const userBadge = getUserTypeBadge();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#2685BF']}
        />
      }
    >
      <Text style={styles.title}>{getTitulo()}</Text>
      
      <View style={[styles.userTypeBadge, { backgroundColor: userBadge.color + '20' }]}>
        <Text style={[styles.userTypeText, { color: userBadge.color }]}>
          {userBadge.text}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Informações</Text>
        <Text style={styles.infoText}>
          {getInfoText()}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{analises.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {analises.filter(a => 
              a.resultado === 'Aprovada' || a.resultado === 'aprovada'
            ).length}
          </Text>
          <Text style={styles.statLabel}>Aprovadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {analises.filter(a => 
              a.resultado === 'Reprovada' || a.resultado === 'reprovada'
            ).length}
          </Text>
          <Text style={styles.statLabel}>Reprovadas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {analises.filter(a => 
              !a.resultado || 
              (a.resultado !== 'Aprovada' && 
               a.resultado !== 'aprovada' && 
               a.resultado !== 'Reprovada' && 
               a.resultado !== 'reprovada')
            ).length}
          </Text>
          <Text style={styles.statLabel}>Pendentes</Text>
        </View>
      </View>

      {(getTipoUsuarioReal() === 'analista' || getTipoUsuarioReal() === 'admin') && (
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={navegarParaNotificacoes}
          >
            <Text style={styles.secondaryButtonText}>🔔 Notificações</Text>
          </TouchableOpacity>
        </View>
      )}

      {analises.length > 0 ? (
        <View style={styles.tabelaContainer}>
          <Text style={styles.tabelaTitle}>
            {getTipoUsuarioReal() === 'proprietario' ? '📊 Minhas Análises' : '📊 Todas as Análises'}
          </Text>
          <TabelaAnalises 
            analises={analises} 
            readOnly={getTipoUsuarioReal() === 'proprietario'}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {getTipoUsuarioReal() === 'proprietario' 
              ? 'Nenhuma análise dos seus poços encontrada' 
              : 'Nenhuma análise encontrada no sistema'
            }
          </Text>
          <Text style={styles.emptySubText}>
            {getTipoUsuarioReal() === 'proprietario'
              ? 'Suas análises aprovadas aparecerão aqui automaticamente'
              : 'As análises aparecerão aqui quando forem cadastradas no sistema'
            }
          </Text>
        </View>
      )}

      {deveMostrarFormulario() && renderFormulario()}

      <View style={styles.debugContainer}>
        <Text style={styles.debugText}>
          DEBUG: UserID: {user?.uid} | UserType: {getTipoUsuarioReal()} | Análises: {analises.length}
        </Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2685BF',
    textAlign: 'center',
  },
  userTypeBadge: {
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
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
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2685BF',
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2685BF',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tabelaContainer: {
    marginBottom: 30,
  },
  tabelaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 12,
    textAlign: 'center',
  },
  formularioContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#2685BF',
    marginBottom: 20,
  },
  formularioTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2685BF',
    marginBottom: 8,
    textAlign: 'center',
  },
  formularioSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  debugContainer: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 12,
  },
  debugText: {
    fontSize: 10,
    color: '#856404',
    fontFamily: 'monospace',
    textAlign: 'center',
  },
});

export default GerenciarAnalises;