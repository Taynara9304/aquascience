// services/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // 1. ADICIONADO ESTE IMPORT

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDFrQLT0Sn_N3zdLFVGmRDa1c7DF2uHR9Q",
  authDomain: "hidrocascavel-fcccf.firebaseapp.com",
  projectId: "hidrocascavel-fcccf",
  storageBucket: "hidrocascavel-fcccf.firebasestorage.app",
  messagingSenderId: "83041242189",
  appId: "1:83041242189:web:2371745589a7140c772004",
  measurementId: "G-QFDWQGCTXP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

let auth;
try {
  // Tenta usar a persistência nativa se disponível
  if (typeof getReactNativePersistence !== 'undefined') {
    const { getReactNativePersistence } = require('firebase/auth');
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  } else {
    // Fallback para auth padrão
    auth = getAuth(app);
  }
} catch (error) {
  console.warn('Erro ao inicializar auth com persistência, usando auth padrão:', error);
  auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// 2. ADICIONADO: Initialize Storage
const storage = getStorage(app);

// 3. ADICIONADO 'storage' AO EXPORT
export { auth, db, storage };

export const USER_TYPES = {
  PROPRIETARIO: 'proprietario',
  ANALISTA: 'analista',
  ADMINISTRADOR: 'administrador'
};