// hooks/useTabelaUsuarios.js - VERSÃO CORRIGIDA
import { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  onSnapshot, 
  orderBy, 
  query,
  doc,
  deleteDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../contexts/authContext';

const useTabelaUsuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState('asc');

  const { userData } = useAuth();

  console.log('🔄 useTabelaUsuarios: Hook inicializado');

  // Buscar usuários em tempo real do Firebase
  useEffect(() => {
    console.log('📡 useTabelaUsuarios: Configurando listener do Firebase...');
    setLoading(true);
    setError(null);

    try {
      const usersCollection = collection(db, 'users');
      console.log('📡 useTabelaUsuarios: Coleção users referenciada');

      // Query para buscar todos os usuários ordenados por nome
      const q = query(usersCollection, orderBy('nome', 'asc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          console.log('📡 useTabelaUsuarios: Snapshot recebido -', snapshot.docs.length, 'documentos');
          
          const usersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              nome: data.nome || '',
              sobrenome: data.sobrenome || '',
              telefone: data.telefone || '',
              email: data.email || '',
              endereco: data.endereco || '',
              tipoUsuario: data.tipoUsuario || 'proprietario',
              status: data.status || 'ativo',
              dataCriacao: data.dataCriacao?.toDate?.() || data.dataCriacao,
              dataAtualizacao: data.dataAtualizacao?.toDate?.() || data.dataAtualizacao,
            };
          });
          
          setUsers(usersData);
          setLoading(false);
          console.log('✅ useTabelaUsuarios: Estado atualizado com', usersData.length, 'usuários');
        },
        (error) => {
          console.error('❌ useTabelaUsuarios: Erro no listener:', error);
          setError('Erro ao carregar usuários: ' + error.message);
          setLoading(false);
        }
      );

      return () => {
        console.log('📡 useTabelaUsuarios: Removendo listener');
        unsubscribe();
      };
    } catch (err) {
      console.error('❌ useTabelaUsuarios: Erro ao configurar listener:', err);
      setError('Erro de configuração: ' + err.message);
      setLoading(false);
    }
  }, []);

  // Ordenação dos usuários
  const sortedUsers = useMemo(() => {
    if (!users.length) return [];

    const sorted = [...users].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Tratamento para campos que podem ser undefined
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Converter para string para comparação
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return sorted;
  }, [users, sortField, sortDirection]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // ✅ CORRIGIDO: Editar usuário
  const editUser = async (userId, updatedData) => {
    try {
      console.log('✏️ useTabelaUsuarios: Editando usuário:', userId, updatedData);
      
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }

      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        ...updatedData,
        dataAtualizacao: serverTimestamp()
      });
      
      console.log('✅ useTabelaUsuarios: Usuário editado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ useTabelaUsuarios: Erro ao editar usuário:', error);
      throw new Error(`Erro ao editar usuário: ${error.message}`);
    }
  };

  // ✅ CORRIGIDO: Deletar usuário
  const deleteUser = async (userId) => {
    try {
      console.log('🗑️ useTabelaUsuarios: Deletando usuário:', userId);
      
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }

      const userDoc = doc(db, 'users', userId);
      await deleteDoc(userDoc);
      
      console.log('✅ useTabelaUsuarios: Usuário deletado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ useTabelaUsuarios: Erro ao deletar usuário:', error);
      throw new Error(`Erro ao deletar usuário: ${error.message}`);
    }
  };

  // ✅ Adicionar usuário (para uso futuro)
  const addUser = async (userData) => {
    try {
      console.log('➕ useTabelaUsuarios: Adicionando usuário...', userData);
      // Implementar lógica de adicionar usuário ao Firebase se necessário
      throw new Error('Funcionalidade de adicionar usuário ainda não implementada');
    } catch (error) {
      console.error('❌ useTabelaUsuarios: Erro ao adicionar usuário:', error);
      throw error;
    }
  };

  // ✅ Buscar usuário por ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId);
  };

  // ✅ Filtrar usuários por tipo
  const getUsersByType = (tipoUsuario) => {
    return users.filter(user => user.tipoUsuario === tipoUsuario);
  };

  // ✅ Atualizar status do usuário
  const updateUserStatus = async (userId, novoStatus) => {
    try {
      console.log('🔄 useTabelaUsuarios: Atualizando status do usuário:', userId, novoStatus);
      
      if (!userId) {
        throw new Error('ID do usuário não fornecido');
      }

      const userDoc = doc(db, 'users', userId);
      await updateDoc(userDoc, {
        status: novoStatus,
        dataAtualizacao: serverTimestamp()
      });
      
      console.log('✅ useTabelaUsuarios: Status atualizado com sucesso!');
      return true;
    } catch (error) {
      console.error('❌ useTabelaUsuarios: Erro ao atualizar status:', error);
      throw error;
    }
  };

  // ✅ Contadores por tipo de usuário
  const userCounts = useMemo(() => {
    const counts = {
      total: users.length,
      administrador: users.filter(user => user.tipoUsuario === 'administrador').length,
      analista: users.filter(user => user.tipoUsuario === 'analista').length,
      proprietario: users.filter(user => user.tipoUsuario === 'proprietario').length,
      ativo: users.filter(user => user.status === 'ativo').length,
      inativo: users.filter(user => user.status === 'inativo').length,
      pendente: users.filter(user => user.status === 'pendente').length,
    };
    
    console.log('📊 useTabelaUsuarios: Contadores atualizados:', counts);
    return counts;
  }, [users]);

  return {
    users: sortedUsers,
    loading,
    error,
    sortField,
    sortDirection,
    handleSort,
    addUser,
    editUser,
    deleteUser,
    getUserById,
    getUsersByType,
    updateUserStatus,
    userCounts,
  };
};

export default useTabelaUsuarios;