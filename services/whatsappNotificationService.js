// services/whatsappNotificationService.js
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const enviarNotificacaoWhatsAppSolicitacao = async (solicitacaoData) => {
  try {
    console.log('🔔 Enviando notificação WhatsApp para admin...');
    
    const notificacoesCollection = collection(db, 'notifications');
    
    const notificacao = {
      tipo: 'solicitacao_whatsapp',
      titulo: '📱 Nova Solicitação via WhatsApp',
      mensagem: `${solicitacaoData.proprietarioNome} solicitou visita para o poço: ${solicitacaoData.pocoNome}`,
      dados: {
        ...solicitacaoData,
        mensagemWhatsApp: solicitacaoData.mensagemWhatsApp
      },
      lida: false,
      destinatario: 'admin',
      prioridade: 'alta',
      canal: 'whatsapp',
      criadoEm: serverTimestamp()
    };

    const docRef = await addDoc(notificacoesCollection, notificacao);
    console.log('✅ Notificação WhatsApp enviada com ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação WhatsApp:', error);
    throw error;
  }
};

export const observarNotificacoesWhatsApp = (callback, userId = 'admin') => {
  const q = query(
    collection(db, 'notifications'),
    where('destinatario', '==', userId),
    where('canal', '==', 'whatsapp'),
    where('lida', '==', false)
  );
  
  return onSnapshot(q, callback);
};

export const marcarNotificacaoComoLida = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      lida: true,
      dataLeitura: serverTimestamp()
    });
    console.log('✅ Notificação marcada como lida:', notificationId);
  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    throw error;
  }
};