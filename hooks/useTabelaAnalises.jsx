// hooks/useTabelaAnalises.js - VERSÃO CORRIGIDA
import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  orderBy, 
  query,
  serverTimestamp,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';

const useTabelaAnalises = () => {
  const [analyses, setAnalyses] = useState([]);
  const [pocos, setPocos] = useState([]);
  const [analistas, setAnalistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('dataAnalise');
  const [sortDirection, setSortDirection] = useState('desc');

  const { user, userData } = useAuth();

  console.log('🔄 useTabelaAnalises: Hook inicializado');

  // Buscar análises em tempo real
  useEffect(() => {
    console.log('📡 useTabelaAnalises: Configurando listener do Firebase...');
    setLoading(true);
    setError(null);
    
    try {
      const analysesCollection = collection(db, 'analysis'); // ✅ Coleção correta: "analysis"
      console.log('📡 useTabelaAnalises: Coleção analysis referenciada');
      
      let q;
      
      // Filtros baseados no tipo de usuário
      if (userData?.tipoUsuario === 'proprietario') {
        // Proprietário vê apenas análises dos seus poços
        q = query(
          analysesCollection, 
          where('idProprietario', '==', user.uid), // ✅ Campo correto: idProprietario
          orderBy('dataAnalise', 'desc')
        );
        console.log('🔍 useTabelaAnalises: Filtro para proprietário');
      } else if (userData?.tipoUsuario === 'analista') {
        // Analista vê análises que ele criou
        q = query(
          analysesCollection,
          where('idAnalista', '==', user.uid), // ✅ Campo correto: idAnalista
          orderBy('dataAnalise', 'desc')
        );
        console.log('🔍 useTabelaAnalises: Filtro para analista');
      } else {
        // Admin vê todas as análises
        q = query(analysesCollection, orderBy('dataAnalise', 'desc'));
        console.log('🔍 useTabelaAnalises: Filtro para admin - todas análises');
      }
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📡 useTabelaAnalises: Snapshot recebido -', snapshot.docs.length, 'documentos');
          
          const analysesData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Converter Timestamp para Date se necessário
              dataAnalise: data.dataAnalise?.toDate?.() || data.dataAnalise,
            };
          });
          
          setAnalyses(analysesData);
          setLoading(false);
          console.log('✅ useTabelaAnalises: Estado atualizado com', analysesData.length, 'análises');
        },
        (error) => {
          console.error('❌ useTabelaAnalises: Erro no listener:', error);
          setError('Erro ao carregar análises: ' + error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('📡 useTabelaAnalises: Removendo listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ useTabelaAnalises: Erro ao configurar listener:', err);
      setError('Erro de configuração: ' + err.message);
      setLoading(false);
    }
  }, [user, userData]);

  // Buscar poços
  useEffect(() => {
    console.log('📡 useTabelaAnalises: Buscando poços...');
    
    const pocosCollection = collection(db, 'wells');
    let q;
    
    if (userData?.tipoUsuario === 'proprietario') {
      q = query(pocosCollection, where('userId', '==', user.uid), orderBy('nomeProprietario'));
    } else {
      q = query(pocosCollection, orderBy('nomeProprietario'));
    }
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const pocosData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPocos(pocosData);
        console.log('✅ useTabelaAnalises:', pocosData.length, 'poços carregados');
      },
      (error) => {
        console.error('❌ useTabelaAnalises: Erro ao carregar poços:', error);
      }
    );

    return () => unsubscribe();
  }, [user, userData]);

  // Buscar analistas - VERSÃO SIMPLIFICADA (sem filtro complexo)
  useEffect(() => {
    console.log('📡 useTabelaAnalises: Buscando analistas...');
    
    const usersCollection = collection(db, 'users');
    // Query simples sem filtro complexo para evitar erro de índice
    const q = query(usersCollection, orderBy('nome'));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const allUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filtrar localmente para obter apenas analistas e administradores
        const analistasData = allUsers.filter(user => 
          user.tipoUsuario === 'analista' || user.tipoUsuario === 'administrador'
        );
        
        setAnalistas(analistasData);
        console.log('✅ useTabelaAnalises:', analistasData.length, 'analistas carregados (filtro local)');
      },
      (error) => {
        console.error('❌ useTabelaAnalises: Erro ao carregar usuários:', error);
        setAnalistas([]); // Definir como array vazio em caso de erro
      }
    );

    return () => unsubscribe();
  }, []);

  // Adicionar análise - VERSÃO COMPATÍVEL COM SUA ESTRUTURA
  const addAnalysis = async (analysisData) => {
    try {
      console.log('➕ useTabelaAnalises: Iniciando cadastro...', analysisData);
      
      const analysesCollection = collection(db, 'analysis');
      
      // ✅ ESTRUTURA COMPATÍVEL COM SEUS CAMPOS EXISTENTES
      const analysisDocument = {
        // Dados básicos (compatíveis com sua estrutura)
        nomePoco: analysisData.pocoNome,
        nomeProprietario: analysisData.proprietario,
        idProprietario: analysisData.proprietarioId,
        nomeAnalista: analysisData.analistaNome,
        idAnalista: analysisData.analistaId,
        dataAnalise: analysisData.dataAnalise ? Timestamp.fromDate(new Date(analysisData.dataAnalise)) : serverTimestamp(),
        resultado: analysisData.resultado,
        localizacaoPoco: analysisData.pocoLocalizacao,
        
        // Parâmetros físico-químicos
        temperaturaAr: analysisData.temperaturaAr ? Number(analysisData.temperaturaAr) : 0,
        temperaturaAmostra: analysisData.temperaturaAmostra ? Number(analysisData.temperaturaAmostra) : 0,
        ph: analysisData.ph ? Number(analysisData.ph) : 0,
        alcalinidade: analysisData.alcalinidade ? Number(analysisData.alcalinidade) : 0,
        acidez: analysisData.acidez ? Number(analysisData.acidez) : 0,
        cor: analysisData.cor ? Number(analysisData.cor) : 0,
        turbidez: analysisData.turbidez ? Number(analysisData.turbidez) : 0,
        condutividadeEletrica: analysisData.condutividadeEletrica ? Number(analysisData.condutividadeEletrica) : 0,
        sdt: analysisData.sdt ? Number(analysisData.sdt) : 0,
        sst: analysisData.sst ? Number(analysisData.sst) : 0,
        
        // Parâmetros químicos e microbiológicos
        cloroTotal: analysisData.cloroTotal ? Number(analysisData.cloroTotal) : 0,
        cloroLivre: analysisData.cloroLivre ? Number(analysisData.cloroLivre) : 0,
        coliformesTotais: analysisData.coliformesTotais ? Number(analysisData.coliformesTotais) : 0,
        Ecoli: analysisData.ecoli ? Number(analysisData.ecoli) : 0, // ✅ Note: "Ecoli" com E maiúsculo
        
        // Metadados adicionais
        tipoCadastro: analysisData.tipoCadastro || 'direto_admin',
        status: analysisData.status || 'ativa',
        criadoPor: analysisData.criadoPor,
        dataCriacao: serverTimestamp()
      };

      console.log('➕ useTabelaAnalises: Enviando para Firebase...', analysisDocument);
      const docRef = await addDoc(analysesCollection, analysisDocument);
      console.log('✅ useTabelaAnalises: Análise cadastrada com sucesso! ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ useTabelaAnalises: Erro ao adicionar análise:', error);
      throw error;
    }
  };

  // ✅ CORRIGIDO: Função de editar análise (básica)
  const editAnalysis = async (analysisId, updatedData) => {
    try {
      console.log('✏️ useTabelaAnalises: Editando análise:', analysisId);
      const analysisDoc = doc(db, 'analysis', analysisId);
      await updateDoc(analysisDoc, {
        ...updatedData,
        atualizadoEm: serverTimestamp()
      });
      console.log('✅ useTabelaAnalises: Análise editada com sucesso!');
    } catch (error) {
      console.error('❌ useTabelaAnalises: Erro ao editar análise:', error);
      throw error;
    }
  };


  const deleteAnalysis = async (analysisId) => {
    try {
      console.log('🗑️ useTabelaAnalises: Deletando análise:', analysisId);
      const analysisDoc = doc(db, 'analysis', analysisId);
      await deleteDoc(analysisDoc);
      console.log('✅ useTabelaAnalises: Análise deletada com sucesso!');
    } catch (error) {
      console.error('❌ useTabelaAnalises: Erro ao deletar análise:', error);
      throw error;
    }
  };

  // ✅ CORRIGIDO: Função de aprovar análise
  const approveAnalysis = async (analysisId) => {
    try {
      console.log('✅ useTabelaAnalises: Aprovando análise:', analysisId);
      const analysisDoc = doc(db, 'analysis', analysisId);
      await updateDoc(analysisDoc, {
        status: 'ativa',
        resultado: 'Aprovada',
        dataAprovacao: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      console.log('✅ useTabelaAnalises: Análise aprovada com sucesso!');
    } catch (error) {
      console.error('❌ useTabelaAnalises: Erro ao aprovar análise:', error);
      throw error;
    }
  };

  // ✅ CORRIGIDO: Função de rejeitar análise
  const rejectAnalysis = async (analysisId, motivo) => {
    try {
      console.log('❌ useTabelaAnalises: Rejeitando análise:', analysisId);
      const analysisDoc = doc(db, 'analysis', analysisId);
      await updateDoc(analysisDoc, {
        status: 'rejeitada',
        resultado: 'Reprovada',
        motivoRejeicao: motivo,
        dataRejeicao: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      });
      console.log('✅ useTabelaAnalises: Análise rejeitada com sucesso!');
    } catch (error) {
      console.error('❌ useTabelaAnalises: Erro ao rejeitar análise:', error);
      throw error;
    }
  };

   const sortedAnalyses = useMemo(() => {
    if (!analyses.length) return [];

    const sorted = [...analyses].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Converter para Date se for campo de data
      if (sortField.includes('data')) {
        aValue = aValue?.toDate?.() || new Date(aValue);
        bValue = bValue?.toDate?.() || new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [analyses, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

return {
    analyses: sortedAnalyses,
    pocos,
    analistas,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    addAnalysis,
    editAnalysis, // ✅ Certifique-se que existe
    deleteAnalysis, // ✅ Certifique-se que existe
    approveAnalysis, // ✅ Certifique-se que existe
    rejectAnalysis, // ✅ Certifique-se que existe
  };
};

export default useTabelaAnalises;