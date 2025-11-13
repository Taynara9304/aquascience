// services/notifications.js
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from './firebaseConfig';

export const enviarNotificacaoSolicitacaoWhatsApp = async (solicitacaoData) => {
  try {
    console.log('📢 Enviando notificação para ADM:', solicitacaoData);
    
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      tipo: 'solicitacao_whatsapp',
      titulo: '📱 Nova solicitação via WhatsApp',
      mensagem: `${solicitacaoData.proprietarioNome} solicitou visita para o poço ${solicitacaoData.pocoNome}`,
      data: new Date(),
      lida: false,
      solicitacaoId: solicitacaoData.id,
      userId: 'admin', // Para todos os administradores
      prioridade: 'alta',
      dados: {
        pocoId: solicitacaoData.pocoId,
        proprietarioId: solicitacaoData.userId,
        dataHoraDesejada: solicitacaoData.dataHoraDesejada,
        observacoes: solicitacaoData.observacoes
      }
    });
    
    console.log('✅ Notificação enviada com ID:', notificationRef.id);
    return notificationRef.id;
  } catch (error) {
    console.error('❌ Erro ao enviar notificação:', error);
    throw error;
  }
};

export const marcarNotificacaoComoLida = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      lida: true,
      dataLeitura: new Date()
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
  }
};

export const observarNotificacoes = (callback) => {
  const q = query(
    collection(db, 'notifications'),
    where('lida', '==', false),
    orderBy('data', 'desc')
  );
  
  return onSnapshot(q, callback);
};