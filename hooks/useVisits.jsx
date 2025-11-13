// hooks/useVisits.js - VERSÃO CORRIGIDA
import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const useVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    const q = query(
      collection(db, 'visits'),
      orderBy('dataVisita', 'desc'),
      limit(5)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const visitsData = [];
      snapshot.forEach((doc) => {
        visitsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      console.log('📋 Últimas 5 visitas carregadas:', visitsData.length);
      setVisits(visitsData);
      setLoading(false);
    }, (error) => {
      console.error('Erro ao buscar visitas:', error);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { visits, loading };
};