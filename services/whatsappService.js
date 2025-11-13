// services/whatsappService.js
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebaseConfig';
import { enviarNotificacaoSolicitacaoWhatsApp } from './notifications';

export const registrarSolicitacaoWhatsApp = async (solicitacaoData) => {
  try {
    console.log('📝 Registrando solicitação WhatsApp:', solicitacaoData);
    
    const whatsappRequestsCollection = collection(db, 'whatsapp_requests');
    
    const solicitacaoDoc = {
      // Dados do proprietário
      userId: solicitacaoData.userId,
      proprietarioNome: solicitacaoData.proprietarioNome,
      proprietarioTelefone: solicitacaoData.proprietarioTelefone,
      
      // Dados do poço
      pocoId: solicitacaoData.poco.id,
      pocoNome: solicitacaoData.poco.nomeProprietario,
      pocoLocalizacao: solicitacaoData.poco.localizacao,
      coordenadas: solicitacaoData.poco.coordenadas,
      
      // Dados da solicitação
      dataHoraDesejada: solicitacaoData.dataHoraDesejada,
      observacoes: solicitacaoData.observacoes,
      mensagemEnviada: solicitacaoData.mensagemEnviada,
      
      // Metadados
      status: 'pendente',
      canal: 'whatsapp',
      dataSolicitacao: serverTimestamp(),
      tipoUsuario: 'proprietario',
      
      // Controle
      notificacaoEnviada: false,
      visitado: false
    };

    const docRef = await addDoc(whatsappRequestsCollection, solicitacaoDoc);
    console.log('✅ Solicitação WhatsApp registrada com ID:', docRef.id);
    
    // Enviar notificação para ADM
    await enviarNotificacaoSolicitacaoWhatsApp({
      id: docRef.id,
      ...solicitacaoDoc
    });
    
    // Marcar como notificada
    await updateDoc(docRef, { notificacaoEnviada: true });
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Erro ao registrar solicitação WhatsApp:', error);
    throw error;
  }
};

export const atualizarStatusSolicitacao = async (solicitacaoId, novoStatus, dadosAdicionais = {}) => {
  try {
    const solicitacaoRef = doc(db, 'whatsapp_requests', solicitacaoId);
    await updateDoc(solicitacaoRef, {
      status: novoStatus,
      dataAtualizacao: serverTimestamp(),
      ...dadosAdicionais
    });
    
    console.log(`✅ Status da solicitação ${solicitacaoId} atualizado para: ${novoStatus}`);
  } catch (error) {
    console.error('❌ Erro ao atualizar status da solicitação:', error);
    throw error;
  }
};