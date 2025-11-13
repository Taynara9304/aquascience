// hooks/useWells.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const useWells = () => {
  const [wells, setWells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const q = collection(db, 'wells');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const wellsData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        wellsData.push({
          id: doc.id,
          ...data
        });
      });
      
      console.log('🗺️ Poços carregados:', wellsData.length);
      console.log('🗺️ Estrutura do primeiro poço:', wellsData[0] ? {
        id: wellsData[0].id,
        localizacao: wellsData[0].localizacao,
        nomeProprietario: wellsData[0].nomeProprietario,
        status: wellsData[0].status
      } : 'Nenhum poço');
      
      setWells(wellsData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar poços:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { wells, loading };
};