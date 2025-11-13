// componentes/ProtectedRoute.js
import React from 'react';
import { useAuth } from '../contexts/authContext';
import Login from '../telas/Login';
import Loading from './Loading';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading message="Verificando acesso..." />;
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;