import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';
import FormAvaliacoes from '../componentes/FormAvaliacoes';
import { Ionicons } from '@expo/vector-icons';

const DeixarAvaliacao = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dadosCarregados, setDadosCarregados] = useState(false);

  // ✅ VERIFICAÇÃO ROBUSTA DOS PARÂMETROS
  const { notificationId, analiseId, pocoId } = route.params || {};

  useEffect(() => {
    console.log('🔍 Parâmetros recebidos na tela DeixarAvaliacao:', {
      notificationId,
      analiseId,
      pocoId,
      todosParams: route.params
    });

    // Verificar se todos os parâmetros necessários existem
    if (!notificationId || !analiseId || !pocoId) {
      console.error('❌ Parâmetros faltando:', { notificationId, analiseId, pocoId });
      Alert.alert(
        'Erro', 
        'Dados incompletos para avaliação. Volte para a tela anterior e tente novamente.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      return;
    }

    setDadosCarregados(true);
  }, [route.params]);

  const handleSubmit = async (data) => {
    const { comment, rating } = data;

    if (!user) {
      Alert.alert('Erro', 'Você precisa estar logado para avaliar.');
      return;
    }
    
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      console.log('📝 Salvando avaliação...', {
        comment,
        rating,
        userId: user.uid,
        analiseId,
        pocoId
      });

      // 1. Salva a nova avaliação na coleção 'avaliacoes'
      await addDoc(collection(db, 'avaliacoes'), {
        comment: comment,
        rating: rating,
        imageURL: null,
        userId: user.uid,
        userName: userData?.nome || 'Usuário Anônimo',
        createdAt: Timestamp.now(),
        analiseId: analiseId,
        pocoId: pocoId,
      });

      console.log('✅ Avaliação salva com sucesso');

      // 2. Atualiza a notificação
      const notifRef = doc(db, 'notifications', notificationId);
      await updateDoc(notifRef, {
        statusAvaliacao: 'concluida',
      });

      console.log('✅ Notificação atualizada');

      Alert.alert(
        'Obrigado!', 
        'Sua avaliação foi enviada com sucesso.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error) {
      console.error('❌ Erro ao salvar avaliação:', error);
      Alert.alert('Erro', 'Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Se os dados não foram carregados corretamente, mostrar loading
  if (!dadosCarregados) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#2685BF" />
          <Text style={styles.loadingText}>Carregando dados...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header com ícone */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="star" size={32} color="#2c84be" />
          </View>
          <Text style={styles.title}>Avaliar Serviço</Text>
          <Text style={styles.subtitle}>
            Conte-nos o que achou do serviço de análise do seu poço. Sua opinião é muito importante!
          </Text>
        </View>

        {/* Card do formulário */}
        <View style={styles.formCard}>
          <FormAvaliacoes 
            onSubmit={handleSubmit} 
            isSubmitting={isSubmitting} 
          />
        </View>
        
        {/* Botão de voltar */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
        >
          <Ionicons name="arrow-back" size={20} color="white" />
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f4fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#d4edff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c84be',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 24,
  },
  loadingCard: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  backButton: {
    backgroundColor: '#757575',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DeixarAvaliacao;