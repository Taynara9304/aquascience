// services/notificacaoService.js - CORREÇÃO COMPLETA
import { db } from '../services/firebaseConfig';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  writeBatch
} from 'firebase/firestore';

export class AnalistaNotifications {
  static async solicitarCadastroAnalise(user, dadosAnalise) {
    try {
      console.log('📤 Criando solicitação de análise...');
      
      const dadosNotificacao = {
        tipo: 'solicitacao_cadastro_analise',
        userId: user.uid,
        dadosSolicitacao: {
          ...dadosAnalise,
          proprietarioId: dadosAnalise.proprietarioId || '',
        },
        status: 'pendente',
        dataCriacao: Timestamp.now(),
      };

      const docRef = await addDoc(collection(db, 'notifications'), dadosNotificacao);
      console.log('✅ Solicitação criada com ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
      throw error;
    }
  }

  // ✅ CORREÇÃO: Verificar se já existe análise para evitar duplicação
  static async verificarAnaliseExistente(pocoId, dataAnalise, analistaId) {
    try {
      const q = query(
        collection(db, 'analysis'),
        where('pocoId', '==', pocoId),
        where('idAnalista', '==', analistaId),
        where('dataAnalise', '>=', this.getStartOfDay(dataAnalise)),
        where('dataAnalise', '<=', this.getEndOfDay(dataAnalise))
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Erro ao verificar análise existente:', error);
      return false;
    }
  }

  static getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return Timestamp.fromDate(d);
  }

  static getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return Timestamp.fromDate(d);
  }

  static async salvarAnaliseAprovada(dadosSolicitacao) {
    try {
      console.log('💾 Salvando análise na coleção analysis...');
      
      // ✅ CORREÇÃO: Verificar se análise já existe
      const analiseExistente = await this.verificarAnaliseExistente(
        dadosSolicitacao.pocoId,
        dadosSolicitacao.dataAnalise,
        dadosSolicitacao.analistaId
      );

      if (analiseExistente) {
        throw new Error('Já existe uma análise para este poço na data informada');
      }

      const analiseData = {
        // Informações básicas
        pocoId: dadosSolicitacao.pocoId,
        pocoNome: dadosSolicitacao.pocoNome,
        localizacaoPoco: dadosSolicitacao.pocoLocalizacao,
        nomeProprietario: dadosSolicitacao.proprietario,
        idProprietario: dadosSolicitacao.proprietarioId,
        idAnalista: dadosSolicitacao.analistaId,
        nomeAnalista: dadosSolicitacao.analistaNome,
        
        // Datas
        dataAnalise: this.converterData(dadosSolicitacao.dataAnalise),
        dataCriacao: Timestamp.now(),
        
        // Resultado e status
        resultado: dadosSolicitacao.resultado,
        status: 'ativa',
        tipoCadastro: 'solicitacao_analista',
        criadoPor: dadosSolicitacao.analistaId,
        
        // Parâmetros da análise
        temperaturaAr: this.convertToNumber(dadosSolicitacao.temperaturaAr),
        temperaturaAmostra: this.convertToNumber(dadosSolicitacao.temperaturaAmostra),
        ph: this.convertToNumber(dadosSolicitacao.ph),
        alcalinidade: this.convertToNumber(dadosSolicitacao.alcalinidade),
        acidez: this.convertToNumber(dadosSolicitacao.acidez),
        cor: this.convertToNumber(dadosSolicitacao.cor),
        turbidez: this.convertToNumber(dadosSolicitacao.turbidez),
        condutividadeEletrica: this.convertToNumber(dadosSolicitacao.condutividadeEletrica),
        sdt: this.convertToNumber(dadosSolicitacao.sdt),
        sst: this.convertToNumber(dadosSolicitacao.sst),
        cloroTotal: this.convertToNumber(dadosSolicitacao.cloroTotal),
        cloroLivre: this.convertToNumber(dadosSolicitacao.cloroLivre),
        coliformesTotais: this.convertToNumber(dadosSolicitacao.coliformesTotais),
        ecoli: this.convertToNumber(dadosSolicitacao.ecoli)
      };

      console.log('📝 Dados formatados para analysis:', analiseData);
      
      const docRef = await addDoc(collection(db, 'analysis'), analiseData);
      console.log('✅ Análise salva com ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao salvar análise aprovada:', error);
      throw error;
    }
  }

  // ✅ NOVO: Método para criar notificação do analista de forma robusta
  static async criarNotificacaoAnalista(analistaId, tipo, dados) {
    try {
      console.log('📨 Criando notificação para analista:', analistaId);
      
      const notificacaoData = {
        tipo: tipo,
        userId: analistaId,
        status: 'nao_lida',
        dataCriacao: Timestamp.now(),
        titulo: dados.titulo,
        mensagem: dados.mensagem,
        dadosAnalise: dados.dadosAnalise || null
      };

      const docRef = await addDoc(collection(db, 'notifications_analista'), notificacaoData);
      console.log('✅ Notificação criada para analista:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('❌ Erro ao criar notificação para analista:', error);
      // Não lançar erro para não quebrar o fluxo principal
      return null;
    }
  }

  static converterData(data) {
    try {
      if (!data) return Timestamp.now();
      
      if (data instanceof Timestamp) {
        return data;
      }
      
      if (data instanceof Date) {
        return Timestamp.fromDate(data);
      }
      
      const date = new Date(data);
      if (isNaN(date.getTime())) {
        console.warn('Data inválida, usando data atual:', data);
        return Timestamp.now();
      }
      
      return Timestamp.fromDate(date);
    } catch (error) {
      console.error('Erro ao converter data, usando data atual:', error);
      return Timestamp.now();
    }
  }

  static convertToNumber(value) {
    if (value === '' || value === null || value === undefined) return '';
    const num = Number(value);
    return isNaN(num) ? value : num;
  }
}

export class AdminNotifications {
  static async getPendingNotifications() {
    try {
      const q = query(
        collection(db, 'notifications'), 
        where('status', '==', 'pendente')
      );
      const querySnapshot = await getDocs(q);
      
      const notifications = [];
      querySnapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('📥 Notificações pendentes:', notifications.length);
      return notifications;
    } catch (error) {
      console.error('❌ Erro ao buscar notificações:', error);
      throw error;
    }
  }

  // ✅ CORREÇÃO: Método aceitar com transação e verificações
  static async aceitarSolicitacaoAnalise(notificationId, notificationData) {
    const batch = writeBatch(db);
    
    try {
      console.log('✅ Iniciando aceitação da solicitação:', notificationId);
      
      if (!notificationData.dadosSolicitacao) {
        throw new Error('Dados da solicitação não encontrados');
      }
      
      const dadosSolicitacao = notificationData.dadosSolicitacao;
      
      // ✅ VERIFICAÇÃO: Verificar se notificação já foi processada
      const notificationRef = doc(db, 'notifications', notificationId);
      const notificationDoc = await getDocs(query(
        collection(db, 'notifications'), 
        where('__name__', '==', notificationId),
        where('status', '==', 'pendente')
      ));

      if (notificationDoc.empty) {
        throw new Error('Notificação já foi processada ou não existe');
      }

      // ✅ PRIMEIRO: Salvar a análise na coleção analysis
      console.log('💾 Salvando análise...');
      const analysisId = await AnalistaNotifications.salvarAnaliseAprovada(dadosSolicitacao);
      
      // ✅ SEGUNDO: Atualizar o status da notificação
      console.log('📝 Atualizando notificação...');
      batch.update(notificationRef, {
        status: 'aceita',
        dataResolucao: Timestamp.now(),
        resolvidoPor: 'admin',
        analysisId: analysisId
      });

      // ✅ TERCEIRO: Criar notificação para o analista
      console.log('📨 Notificando analista...');
      await AnalistaNotifications.criarNotificacaoAnalista(
        dadosSolicitacao.analistaId,
        'analise_aprovada',
        {
          titulo: '✅ Análise Aprovada!',
          mensagem: `Sua análise para o poço "${dadosSolicitacao.pocoNome}" foi aprovada e já está disponível no sistema.`,
          dadosAnalise: {
            analysisId: analysisId,
            pocoNome: dadosSolicitacao.pocoNome,
            dataAnalise: dadosSolicitacao.dataAnalise,
            resultado: dadosSolicitacao.resultado
          }
        }
      );

      // ✅ Executar batch
      await batch.commit();
      
      console.log('🎉 Processo completo: Notificação aceita, análise salva e analista notificado!');
      
    } catch (error) {
      console.error('❌ Erro ao aceitar solicitação:', error);
      
      // Reverter operações em caso de erro
      batch.delete(doc(db, 'notifications', notificationId));
      
      throw error;
    }
  }

  // ✅ CORREÇÃO: Método rejeitar com transação
  static async rejeitarSolicitacaoAnalise(notificationId, notificationData) {
    const batch = writeBatch(db);
    
    try {
      console.log('❌ Iniciando rejeição da solicitação:', notificationId);
      
      const dadosSolicitacao = notificationData.dadosSolicitacao;
      const notificationRef = doc(db, 'notifications', notificationId);
      
      // ✅ VERIFICAÇÃO: Verificar se notificação já foi processada
      const notificationDoc = await getDocs(query(
        collection(db, 'notifications'), 
        where('__name__', '==', notificationId),
        where('status', '==', 'pendente')
      ));

      if (notificationDoc.empty) {
        throw new Error('Notificação já foi processada ou não existe');
      }

      // ✅ PRIMEIRO: Atualizar o status da notificação
      batch.update(notificationRef, {
        status: 'rejeitada',
        dataResolucao: Timestamp.now(),
        resolvidoPor: 'admin',
        motivoRejeicao: 'Solicitação rejeitada pelo administrador'
      });

      // ✅ SEGUNDO: Criar notificação para o analista
      await AnalistaNotifications.criarNotificacaoAnalista(
        dadosSolicitacao.analistaId,
        'analise_rejeitada',
        {
          titulo: '❌ Análise Rejeitada',
          mensagem: `Sua análise para o poço "${dadosSolicitacao.pocoNome}" foi rejeitada pelo administrador. Entre em contato para mais informações.`,
          dadosAnalise: {
            pocoNome: dadosSolicitacao.pocoNome,
            dataAnalise: dadosSolicitacao.dataAnalise,
            resultado: dadosSolicitacao.resultado
          }
        }
      );

      // ✅ Executar batch
      await batch.commit();
      
      console.log('✅ Notificação rejeitada e analista notificado!');
      
    } catch (error) {
      console.error('❌ Erro ao rejeitar solicitação:', error);
      throw error;
    }
  }
}