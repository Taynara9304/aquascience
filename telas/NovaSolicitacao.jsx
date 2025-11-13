// telas/NovaSolicitacao.js - VERSÃO ATUALIZADA
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert,
  ScrollView 
} from 'react-native';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import AddAnalisesAnalista from '../componentes/AddAnalisesAnalista';

const NovaSolicitacao = () => {
  const [pocos, setPocos] = useState([]);
  const [proprietarios, setProprietarios] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    // Carregar poços
    const unsubscribePocos = onSnapshot(collection(db, 'wells'), (snapshot) => {
      const pocosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPocos(pocosData);
    });

    // Carregar usuários (para proprietários e analistas)
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      const proprietariosData = usersData.filter(user => user.tipoUsuario === 'proprietario');
      const analistasData = usersData.filter(user => user.tipoUsuario === 'analista');
      
      setProprietarios(proprietariosData);
      setAnalistas(analistasData);
    });

    return () => {
      unsubscribePocos();
      unsubscribeUsers();
    };
  }, []);

  // ✅ CORREÇÃO: Função simplificada - apenas log pois a notificação é enviada pelo componente
  const handleAdicionarAnalise = async (analysisData) => {
    console.log('📋 NovaSolicitacao: Dados recebidos do formulário:', analysisData);
    // A notificação já foi enviada pelo componente AddAnalisesAnalista
    // Esta função pode ser usada para outras ações se necessário
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nova Solicitação</Text>
        <Text style={styles.subtitle}>Solicitar cadastro de análise para aprovação</Text>
      </View>

      <AddAnalisesAnalista
        onAdicionarAnalise={handleAdicionarAnalise}
        pocos={pocos}
        proprietarios={proprietarios}
        analistas={analistas}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default NovaSolicitacao;