// hooks/useTabelaPocos.jsx - VERSÃO FINAL COM ÍNDICES
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  orderBy, 
  query,
  where,
  serverTimestamp,
  GeoPoint
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';

const usePocos = () => {
  const [pocos, setPocos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('nomeProprietario');
  const [sortDirection, setSortDirection] = useState('asc');
  const { user, userData } = useAuth();

  console.log('🔄 usePocos: Hook inicializado - usuário:', user?.uid);

  // Buscar poços em tempo real - VERSÃO COMPLETA COM ÍNDICES
  useEffect(() => {
    if (!user) {
      setPocos([]);
      setLoading(false);
      return;
    }

    console.log('📡 usePocos: Configurando listener do Firebase...');
    setLoading(true);
    
    try {
      const wellsCollection = collection(db, 'wells');
      
      let q;
      
      // ✅ AGORA COM ÍNDICES, PODEMOS USAR QUERIES COMPOSTAS
      if (userData?.tipoUsuario === 'administrador') {
        // ADM vê TODOS os poços ordenados por nome
        q = query(wellsCollection, orderBy('nomeProprietario', 'asc'));
        console.log('🎯 ADM: Carregando TODOS os poços ordenados por nome');
      } else if (userData?.tipoUsuario === 'analista') {
        // Analista vê TODOS os poços ordenados por nome
        q = query(wellsCollection, orderBy('nomeProprietario', 'asc'));
        console.log('🎯 Analista: Carregando TODOS os poços ordenados por nome');
      } else {
        // ✅ PROPRIETÁRIO: Filtro por userId + ordenação por nome (AGORA FUNCIONA!)
        q = query(
          wellsCollection, 
          where('userId', '==', user.uid),
          orderBy('nomeProprietario', 'asc')
        );
        console.log('🎯 Proprietário: Carregando poços do usuário com ordenação:', user.uid);
      }

      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📡 usePocos: Snapshot recebido -', snapshot.docs.length, 'documentos');
          
          const wellsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              dataCadastro: data.dataCadastro?.toDate?.() || data.dataCadastro
            };
          });
          
          setPocos(wellsData);
          setLoading(false);
          console.log('✅ usePocos: Estado atualizado com', wellsData.length, 'poços');
        },
        (error) => {
          console.error('❌ usePocos: Erro no listener:', error);
          setError('Erro ao carregar poços: ' + error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('📡 usePocos: Removendo listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ usePocos: Erro ao configurar listener:', err);
      setError('Erro de configuração: ' + err.message);
      setLoading(false);
    }
  }, [user, userData]);

  // ✅ FUNÇÃO addPoco 
  const addPoco = async (wellData) => {
    try {
      console.log('➕ usePocos: Iniciando cadastro do poço...', wellData);
      
      if (!wellData.localizacao) {
        throw new Error('Localização não informada');
      }

      const wellsCollection = collection(db, 'wells');
      
      let localizacaoGeoPoint;
      if (wellData.localizacao instanceof GeoPoint) {
        localizacaoGeoPoint = wellData.localizacao;
      } else if (wellData.localizacao.latitude && wellData.localizacao.longitude) {
        localizacaoGeoPoint = new GeoPoint(
          wellData.localizacao.latitude,
          wellData.localizacao.longitude
        );
      } else {
        throw new Error('Localização inválida');
      }

      const wellDocument = {
        // Dados principais
        idProprietario: wellData.idProprietario || wellData.userId,
        nomeProprietario: wellData.nomeProprietario,
        localizacao: localizacaoGeoPoint,
        observacoes: wellData.observacoes || '',
        
        // Metadados e controle
        userId: wellData.userId,
        dataCadastro: serverTimestamp(),
        tipoCadastro: wellData.tipoCadastro || 'direto_proprietario',
        status: wellData.status || 'ativo',
        criadoPor: wellData.criadoPor
      };

      console.log('➕ usePocos: Enviando para Firebase...', wellDocument);
      
      const docRef = await addDoc(wellsCollection, wellDocument);
      console.log('✅ usePocos: Poço cadastrado com sucesso! ID:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ usePocos: Erro ao adicionar poço:', error);
      throw error;
    }
  };

  // Editar poço
  const editPoco = async (pocoId, updatedPoco) => {
    try {
      const pocoDoc = doc(db, 'wells', pocoId);
      await updateDoc(pocoDoc, {
        ...updatedPoco,
        atualizadoEm: serverTimestamp()
      });
      console.log('✅ usePocos: Poço editado:', pocoId);
    } catch (error) {
      console.error('❌ usePocos: Erro ao editar poço:', error);
      throw error;
    }
  };

  // Deletar poço
  const deletePoco = async (pocoId) => {
    try {
      const pocoDoc = doc(db, 'wells', pocoId);
      await deleteDoc(pocoDoc);
      console.log('✅ usePocos: Poço deletado:', pocoId);
    } catch (error) {
      console.error('❌ usePocos: Erro ao deletar poço:', error);
      throw error;
    }
  };

  // Ordenação client-side para campos adicionais
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Aplicar ordenação client-side (para campos não indexados)
  const pocosOrdenados = [...pocos].sort((a, b) => {
    if (!a[sortField] || !b[sortField]) return 0;
    
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (aValue.toDate && bValue.toDate) {
      aValue = aValue.toDate();
      bValue = bValue.toDate();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return {
    pocos: pocosOrdenados,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    addPoco,
    editPoco,
    deletePoco,
  };
};

export default usePocos;