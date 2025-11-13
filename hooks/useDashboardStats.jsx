// hooks/useDashboardStats.js (versão tempo real)
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalPocos: 0,
    totalAnalises: 0,
    totalVisitas: 0,
    totalUsuarios: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    
    // Usando os nomes corretos das coleções
    const unsubscribeWells = onSnapshot(collection(db, 'wells'), (snapshot) => {
      setStats(prev => ({ ...prev, totalPocos: snapshot.size }));
      setLoading(false);
    });

    const unsubscribeAnalysis = onSnapshot(collection(db, 'analysis'), (snapshot) => {
      setStats(prev => ({ ...prev, totalAnalises: snapshot.size }));
    });

    const unsubscribeVisits = onSnapshot(collection(db, 'visits'), (snapshot) => {
      setStats(prev => ({ ...prev, totalVisitas: snapshot.size }));
    });

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setStats(prev => ({ ...prev, totalUsuarios: snapshot.size }));
    });

    // Cleanup function
    return () => {
      unsubscribeWells();
      unsubscribeAnalysis();
      unsubscribeVisits();
      unsubscribeUsers();
    };
  }, []);

  return { stats, loading };
};