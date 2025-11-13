// hooks/useSolicitacoesWhatsApp.js
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';

const useSolicitacoesWhatsApp = (filtro = 'todas') => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, userData } = useAuth();

  useEffect(() => {
    if (!user) {
      setSolicitacoes([]);
      setLoading(false);
      return;
    }

    console.log('📡 useSolicitacoesWhatsApp: Configurando listener...');
    setLoading(true);
    
    try {
      const whatsappRequestsCollection = collection(db, 'whatsapp_requests');
      
      let q;
      if (userData?.tipoUsuario === 'administrador') {
        // ADM vê TODAS as solicitações
        q = query(whatsappRequestsCollection, orderBy('dataSolicitacao', 'desc'));
        console.log('🎯 ADM: Carregando TODAS as solicitações WhatsApp');
      } else {
        // Proprietário vê apenas suas solicitações
        q = query(
          whatsappRequestsCollection,
          where('userId', '==', user.uid),
          orderBy('dataSolicitacao', 'desc')
        );
        console.log('🎯 Proprietário: Carregando solicitações do usuário:', user.uid);
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const solicitacoesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Converter Timestamp para Date se necessário
              dataSolicitacao: data.dataSolicitacao?.toDate?.() || data.dataSolicitacao,
              dataHoraDesejada: data.dataHoraDesejada?.toDate?.() || data.dataHoraDesejada
            };
          });
          
          // Aplicar filtro se necessário
          let solicitacoesFiltradas = solicitacoesData;
          if (filtro !== 'todas') {
            solicitacoesFiltradas = solicitacoesData.filter(s => s.status === filtro);
          }
          
          setSolicitacoes(solicitacoesFiltradas);
          setLoading(false);
          console.log(`✅ ${solicitacoesFiltradas.length} solicitações WhatsApp carregadas`);
        },
        (error) => {
          console.error('❌ Erro ao carregar solicitações WhatsApp:', error);
          setError('Erro ao carregar solicitações: ' + error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('📡 useSolicitacoesWhatsApp: Removendo listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ Erro ao configurar listener:', err);
      setError('Erro de configuração: ' + err.message);
      setLoading(false);
    }
  }, [user, userData, filtro]);

  return {
    solicitacoes,
    loading,
    error
  };
};

export default useSolicitacoesWhatsApp;